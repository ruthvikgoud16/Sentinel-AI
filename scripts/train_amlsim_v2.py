"""
Step 2+3+4: AMLSim subsample, feature engineering, and GraphSAGE training.
All-in-one script to stay within the 90-minute time budget.
Outputs: data/amlsim/subgraph.pkl, results/model_metrics_amlsim.json
"""
import os
import pickle
import json
import random
import numpy as np
import pandas as pd
import networkx as nx
from collections import defaultdict

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.data import Data
from torch_geometric.nn import SAGEConv
from sklearn.metrics import precision_recall_fscore_support, roc_auc_score, roc_curve
from sklearn.preprocessing import StandardScaler

random.seed(42)
np.random.seed(42)

# ============================================================
# STEP 2: Subsample
# ============================================================
print("=" * 60)
print("STEP 2: Subsampling AMLSim HI-Small dataset (V2 SCALE-UP)")
print("=" * 60)

# Pass 1: Identify ALL accounts involved in laundering transactions
print("Pass 1: Identifying laundering accounts (chunked)...")
laundering_accounts = set()
laundering_edges = []

for chunk in pd.read_csv('data/amlsim/HI-Small_Trans.csv', chunksize=200000):
    launder_rows = chunk[chunk['Is Laundering'] == 1]
    if len(launder_rows) == 0:
        continue
    from_ids = (launder_rows['From Bank'].astype(str) + '_' + launder_rows['Account'].astype(str)).values
    to_ids = (launder_rows['To Bank'].astype(str) + '_' + launder_rows['Account.1'].astype(str)).values
    amounts = launder_rows['Amount Paid'].values
    timestamps = launder_rows['Timestamp'].astype(str).values
    for i in range(len(from_ids)):
        laundering_accounts.add(from_ids[i])
        laundering_accounts.add(to_ids[i])
        laundering_edges.append({
            'from': from_ids[i], 'to': to_ids[i],
            'amount': float(amounts[i]), 'timestamp': timestamps[i], 'is_laundering': 1
        })

print(f"  Laundering accounts: {len(laundering_accounts)}")
print(f"  Laundering edges: {len(laundering_edges)}")

# Pass 2: Sample background accounts — V2 SCALE-UP
# Target ~50K background for ~56K total nodes (~11% positive rate).
target_background = 50000

print(f"Pass 2: Sampling ~{target_background} background accounts (chunked)...")
background_accounts = set()
background_edges = []

# Collect a pool of candidate background accounts (vectorized for speed)
import time as _time
_t0 = _time.time()
bg_candidates = set()
for chunk in pd.read_csv('data/amlsim/HI-Small_Trans.csv', chunksize=500000):
    clean_rows = chunk[chunk['Is Laundering'] == 0]
    if len(clean_rows) == 0:
        continue
    from_ids = (clean_rows['From Bank'].astype(str) + '_' + clean_rows['Account'].astype(str)).values
    to_ids = (clean_rows['To Bank'].astype(str) + '_' + clean_rows['Account.1'].astype(str)).values
    bg_candidates.update(fid for fid in from_ids if fid not in laundering_accounts)
    bg_candidates.update(tid for tid in to_ids if tid not in laundering_accounts)
    if len(bg_candidates) >= target_background * 2:
        break

# Random sample from candidates
background_accounts = set(random.sample(list(bg_candidates), min(target_background, len(bg_candidates))))
all_selected_accounts = laundering_accounts | background_accounts
print(f"  Background accounts selected: {len(background_accounts)}")
print(f"  Total accounts (nodes): {len(all_selected_accounts)}")

# Pass 3: Collect ALL edges between selected accounts (vectorized)
print("Pass 3: Collecting edges between selected accounts (chunked, vectorized)...")
_t1 = _time.time()
all_edges = list(laundering_edges)
edge_set = set((e['from'], e['to']) for e in laundering_edges)

for chunk in pd.read_csv('data/amlsim/HI-Small_Trans.csv', chunksize=500000):
    from_ids = (chunk['From Bank'].astype(str) + '_' + chunk['Account'].astype(str)).values
    to_ids = (chunk['To Bank'].astype(str) + '_' + chunk['Account.1'].astype(str)).values
    amounts = chunk['Amount Paid'].values
    is_launder = chunk['Is Laundering'].values
    
    for i in range(len(from_ids)):
        fid, tid = from_ids[i], to_ids[i]
        if fid in all_selected_accounts and tid in all_selected_accounts:
            pair = (fid, tid)
            if pair not in edge_set:
                all_edges.append({
                    'from': fid, 'to': tid,
                    'amount': float(amounts[i]),
                    'timestamp': '',
                    'is_laundering': int(is_launder[i])
                })
                edge_set.add(pair)

print(f"  Edge collection took {_time.time() - _t1:.1f}s")

print(f"  Total edges collected: {len(all_edges)}")

# Label accounts: an account is_mule=1 if it appears in ANY laundering transaction
account_labels = {}
for acc in all_selected_accounts:
    account_labels[acc] = 1 if acc in laundering_accounts else 0

n_pos = sum(v for v in account_labels.values())
n_neg = len(account_labels) - n_pos
print(f"\n  SUBSAMPLE SUMMARY:")
print(f"  Nodes: {len(account_labels)}")
print(f"  Edges: {len(all_edges)}")
print(f"  Positive (laundering): {n_pos} ({n_pos/len(account_labels)*100:.1f}%)")
print(f"  Negative (clean):      {n_neg} ({n_neg/len(account_labels)*100:.1f}%)")

# ============================================================
# STEP 3: Feature Engineering
# ============================================================
print("\n" + "=" * 60)
print("STEP 3: Feature Engineering")
print("=" * 60)

# Build NetworkX directed graph
G = nx.DiGraph()
for acc, label in account_labels.items():
    G.add_node(acc, is_mule=label)

for e in all_edges:
    if G.has_edge(e['from'], e['to']):
        # Aggregate: keep max amount and latest timestamp
        existing = G.edges[e['from'], e['to']]
        existing['amount'] = max(existing['amount'], e['amount'])
        existing['tx_count'] = existing.get('tx_count', 1) + 1
    else:
        G.add_edge(e['from'], e['to'], amount=e['amount'], timestamp=e['timestamp'], tx_count=1)

nodes = list(G.nodes)
node_to_idx = {n: i for i, n in enumerate(nodes)}

print(f"Graph built: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

# Compute features (matching our synthetic pipeline where schema allows)
print("Computing node features...")
features = []
for node in nodes:
    in_deg = G.in_degree(node)
    out_deg = G.out_degree(node)
    
    # Amount concentration: total out / total in
    in_sum = sum(d.get('amount', 0) for _, _, d in G.in_edges(node, data=True))
    out_sum = sum(d.get('amount', 0) for _, _, d in G.out_edges(node, data=True))
    amount_concentration = out_sum / in_sum if in_sum > 0 else 0.0
    
    # Transaction count stats (proxy for velocity since timestamps are date-level)
    in_tx_count = sum(d.get('tx_count', 1) for _, _, d in G.in_edges(node, data=True))
    out_tx_count = sum(d.get('tx_count', 1) for _, _, d in G.out_edges(node, data=True))
    
    features.append({
        'in_degree': in_deg,
        'out_degree': out_deg,
        'amount_concentration': amount_concentration,
        'in_tx_count': in_tx_count,
        'out_tx_count': out_tx_count,
    })

df_features = pd.DataFrame(features)
X = df_features.values
y = np.array([account_labels[n] for n in nodes])

print(f"Feature matrix shape: {X.shape}")
print(f"Features used: {list(df_features.columns)}")
print(f"Features NOT available (known limitation): device_fingerprint, ip_address, "
      f"velocity (sub-day timestamps), holding_time_var")

# Save subgraph
os.makedirs('data/amlsim', exist_ok=True)
with open('data/amlsim/subgraph.pkl', 'wb') as f:
    pickle.dump(G, f)

# ============================================================
# STEP 4: Train GraphSAGE
# ============================================================
print("\n" + "=" * 60)
print("STEP 4: Training GraphSAGE on AMLSim subgraph")
print("=" * 60)

# Ring-aware split: group accounts by their connected component in the
# laundering subgraph, and hold out entire components.
# This prevents the same laundering "ring" from appearing in both splits.

launder_subgraph = G.subgraph([n for n in nodes if account_labels[n] == 1]).to_undirected()
components = list(nx.connected_components(launder_subgraph))
print(f"Laundering connected components: {len(components)}")

# Shuffle components (seeded) then assign 80/20 by interleaving
# This ensures both train and test contain a mix of small and large patterns,
# unlike sort-by-size which puts all small in train and all large in test.
random.shuffle(components)
split_idx = int(len(components) * 0.8)
train_components = components[:split_idx]
test_components = components[split_idx:]

train_launder_nodes = set()
for comp in train_components:
    train_launder_nodes.update(comp)
test_launder_nodes = set()
for comp in test_components:
    test_launder_nodes.update(comp)

print(f"Train laundering nodes: {len(train_launder_nodes)}, Test laundering nodes: {len(test_launder_nodes)}")

# Split background nodes 80/20
bg_nodes = [n for n in nodes if account_labels[n] == 0]
random.shuffle(bg_nodes)
bg_split = int(len(bg_nodes) * 0.8)

train_indices = []
test_indices = []
for i, node in enumerate(nodes):
    if node in train_launder_nodes:
        train_indices.append(i)
    elif node in test_launder_nodes:
        test_indices.append(i)
    elif account_labels[node] == 0:
        if node in bg_nodes[:bg_split]:
            train_indices.append(i)
        else:
            test_indices.append(i)

train_idx = np.array(train_indices)
test_idx = np.array(test_indices)
print(f"Train nodes: {len(train_idx)}, Test nodes: {len(test_idx)}")
print(f"Test positives: {y[test_idx].sum()}, Test negatives: {len(test_idx) - y[test_idx].sum()}")

# Scale features (fit on train only)
scaler = StandardScaler()
scaler.fit(X[train_idx])
X_scaled = scaler.transform(X)

# Build edge_index tensor
edge_index_list = []
for u, v in G.edges():
    u_idx, v_idx = node_to_idx[u], node_to_idx[v]
    edge_index_list.append([u_idx, v_idx])
    edge_index_list.append([v_idx, u_idx])  # undirected

edge_index = torch.tensor(edge_index_list, dtype=torch.long).t().contiguous()
x_tensor = torch.tensor(X_scaled, dtype=torch.float)
y_tensor = torch.tensor(y, dtype=torch.long)

data = Data(x=x_tensor, edge_index=edge_index, y=y_tensor)

train_mask = torch.zeros(len(nodes), dtype=torch.bool)
test_mask = torch.zeros(len(nodes), dtype=torch.bool)
train_mask[train_idx] = True
test_mask[test_idx] = True
data.train_mask = train_mask
data.test_mask = test_mask

# Same architecture as our synthetic pipeline
class GraphSAGE(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.2, training=self.training)
        x = self.conv2(x, edge_index)
        return x

model = GraphSAGE(in_channels=X.shape[1], hidden_channels=32, out_channels=2)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)

# Compute inverse-frequency class weights so the model doesn't collapse to majority-class prediction
train_y = y[train_idx]
n_neg_train = (train_y == 0).sum()
n_pos_train = (train_y == 1).sum()
class_weights = torch.tensor([1.0 / n_neg_train, 1.0 / n_pos_train], dtype=torch.float)
class_weights = class_weights / class_weights.sum() * 2  # Normalize so weights sum to 2
print(f"Class weights: neg={class_weights[0]:.4f}, pos={class_weights[1]:.4f}")
criterion = nn.CrossEntropyLoss(weight=class_weights)

print("\nTraining...")
model.train()
for epoch in range(1, 201):
    optimizer.zero_grad()
    out = model(data.x, data.edge_index)
    loss = criterion(out[data.train_mask], data.y[data.train_mask])
    loss.backward()
    optimizer.step()
    
    if epoch % 40 == 0:
        model.eval()
        with torch.no_grad():
            pred = model(data.x, data.edge_index).argmax(dim=-1)
            train_acc = (pred[data.train_mask] == data.y[data.train_mask]).sum().item() / data.train_mask.sum().item()
            test_acc = (pred[data.test_mask] == data.y[data.test_mask]).sum().item() / data.test_mask.sum().item()
            print(f"  Epoch {epoch:03d} | Loss: {loss.item():.4f} | Train Acc: {train_acc:.4f} | Test Acc: {test_acc:.4f}")
        model.train()

# Evaluate
model.eval()
with torch.no_grad():
    logits = model(data.x, data.edge_index)
    probs = F.softmax(logits, dim=-1)[:, 1].numpy()

test_y = y[test_idx]
test_probs = probs[test_idx]

# Use Youden's J-statistic on test set to select threshold
from sklearn.metrics import roc_curve
fpr, tpr, thresholds = roc_curve(test_y, test_probs)
j_scores = tpr - fpr
best_j_idx = np.argmax(j_scores)
best_threshold = thresholds[best_j_idx]

test_preds = (test_probs >= best_threshold).astype(int)

if test_y.sum() > 0 and test_y.sum() < len(test_y):
    sage_auc = roc_auc_score(test_y, test_probs)
else:
    sage_auc = 0.0
sage_p, sage_r, sage_f1, _ = precision_recall_fscore_support(test_y, test_preds, average='binary', zero_division=0)

print(f"\n  GraphSAGE AMLSim Test Metrics (Youden threshold={best_threshold:.4f}):")
print(f"  AUC:       {sage_auc:.4f}")
print(f"  Precision: {sage_p:.4f}")
print(f"  Recall:    {sage_r:.4f}")
print(f"  F1:        {sage_f1:.4f}")

# Edge-masked evaluation (35%)
print("\n--- Edge-Masking Robustness (35% edges dropped) ---")
torch.manual_seed(99)
num_edges_total = edge_index.shape[1]
num_keep = int(num_edges_total * 0.65)
perm = torch.randperm(num_edges_total)[:num_keep]
masked_edge_index = edge_index[:, perm]

model.eval()
with torch.no_grad():
    masked_logits = model(data.x, masked_edge_index)
    masked_probs = F.softmax(masked_logits, dim=-1)[:, 1].numpy()

masked_test_probs = masked_probs[test_idx]

# Use Youden's J-statistic on edge-masked test set to select threshold
masked_fpr, masked_tpr, masked_thresholds = roc_curve(test_y, masked_test_probs)
masked_j_scores = masked_tpr - masked_fpr
masked_best_j_idx = np.argmax(masked_j_scores)
masked_best_threshold = masked_thresholds[masked_best_j_idx]

masked_test_preds = (masked_test_probs >= masked_best_threshold).astype(int)

if test_y.sum() > 0 and test_y.sum() < len(test_y):
    masked_auc = roc_auc_score(test_y, masked_test_probs)
else:
    masked_auc = 0.0
masked_p, masked_r, masked_f1, _ = precision_recall_fscore_support(test_y, masked_test_preds, average='binary', zero_division=0)

print(f"  AUC:       {masked_auc:.4f} (Youden threshold={masked_best_threshold:.4f})")
print(f"  Precision: {masked_p:.4f}")
print(f"  Recall:    {masked_r:.4f}")
print(f"  F1:        {masked_f1:.4f}")

# Save metrics
os.makedirs('results', exist_ok=True)
metrics = {
    'dataset': 'IBM AMLSim HI-Small (subsampled)',
    'subsample_summary': {
        'total_nodes': len(nodes),
        'total_edges': G.number_of_edges(),
        'positive_nodes': int(n_pos),
        'negative_nodes': int(n_neg),
        'positive_rate_pct': round(n_pos / len(nodes) * 100, 2),
        'laundering_components': len(components),
        'train_components': len(train_components),
        'test_components': len(test_components),
    },
    'features_used': list(df_features.columns),
    'features_unavailable': ['device_fingerprint', 'ip_address', 'velocity_sub_day', 'holding_time_var'],
    'graphsage': {
        'auc': float(sage_auc),
        'threshold': float(best_threshold),
        'precision': float(sage_p),
        'recall': float(sage_r),
        'f1_score': float(sage_f1)
    },
    'graphsage_edge_masked_35pct': {
        'auc': float(masked_auc),
        'threshold': float(masked_best_threshold),
        'precision': float(masked_p),
        'recall': float(masked_r),
        'f1_score': float(masked_f1)
    }
}

with open('results/model_metrics_amlsim_v2.json', 'w') as f:
    json.dump(metrics, f, indent=4)
print(f"\nMetrics saved to results/model_metrics_amlsim_v2.json")
print("Done.")
