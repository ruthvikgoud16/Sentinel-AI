import os
import pickle
import json
import numpy as np
import pandas as pd
import networkx as nx
from datetime import datetime

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.data import Data
from torch_geometric.nn import SAGEConv

from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_recall_fscore_support, roc_auc_score
from sklearn.preprocessing import StandardScaler

# Define GraphSAGE Model structure
class GraphSAGE(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super(GraphSAGE, self).__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.2, training=self.training)
        x = self.conv2(x, edge_index)
        return x

def main():
    print("Loading synthetic graph...")
    with open('data/graph.pkl', 'rb') as f:
        G = pickle.load(f)
        
    nodes = list(G.nodes)
    num_nodes = len(nodes)
    print(f"Loaded graph with {num_nodes} nodes and {G.number_of_edges()} edges.")
    
    # 1. Feature Engineering
    print("Engineering features...")
    df_nodes = pd.DataFrame([
        {
            'account_id': node,
            'is_mule': G.nodes[node]['is_mule'],
            'device_fingerprint': G.nodes[node]['device_fingerprint'],
            'ip_address': G.nodes[node]['ip_address'],
            'type': G.nodes[node]['type'],
            'ring_idx': G.nodes[node].get('ring_idx', -1)
        } for node in nodes
    ])
    
    # Calculate device and IP reuse counts
    device_counts = df_nodes['device_fingerprint'].value_counts()
    ip_counts = df_nodes['ip_address'].value_counts()
    
    df_nodes['device_reuse_count'] = df_nodes['device_fingerprint'].map(device_counts) - 1
    df_nodes['shared_ip_count'] = df_nodes['ip_address'].map(ip_counts) - 1
    
    # Pre-calculate node index mappings for GNN
    node_to_idx = {node: i for i, node in enumerate(nodes)}
    
    features = []
    for node in nodes:
        in_degree = G.in_degree(node)
        out_degree = G.out_degree(node)
        
        # Calculate velocity (avg time between in and out transfers)
        in_txs = sorted([datetime.fromisoformat(d['timestamp']) for _, _, d in G.in_edges(node, data=True)])
        out_txs = sorted([datetime.fromisoformat(d['timestamp']) for _, _, d in G.out_edges(node, data=True)])
        
        holding_times = []
        for out_t in out_txs:
            # find closest preceding in transfer
            preceding_ins = [in_t for in_t in in_txs if in_t < out_t]
            if preceding_ins:
                diff = (out_t - preceding_ins[-1]).total_seconds()
                holding_times.append(diff)
                
        if holding_times:
            velocity = np.mean(holding_times)
            holding_time_var = np.var(holding_times) if len(holding_times) > 1 else 0.0
        else:
            velocity = 86400.0  # Default 24 hours
            holding_time_var = 0.0
            
        # Amount concentration (sum out / sum in)
        in_sum = sum([d['amount'] for _, _, d in G.in_edges(node, data=True)])
        out_sum = sum([d['amount'] for _, _, d in G.out_edges(node, data=True)])
        amount_concentration = out_sum / in_sum if in_sum > 0 else 0.0
        
        # Match node in df
        node_df = df_nodes.loc[df_nodes['account_id'] == node].iloc[0]
        
        features.append({
            'in_degree': in_degree,
            'out_degree': out_degree,
            'velocity': velocity,
            'holding_time_var': holding_time_var,
            'device_reuse_count': node_df['device_reuse_count'],
            'shared_ip_count': node_df['shared_ip_count'],
            'amount_concentration': amount_concentration
        })
        
    df_features = pd.DataFrame(features)
    X = df_features.values
    y = df_nodes['is_mule'].values
    
    # Save features df for quick lookup/serving
    df_features['account_id'] = nodes
    df_features['is_mule'] = y
    df_features.to_csv('data/node_features.csv', index=False)
    print("Features saved to data/node_features.csv")
    
    # Train/Test Split (80% Train, 20% Test)
    # We group rings so that all nodes in a given ring index are placed in the same split.
    # Rings 0..63 go to train. Rings 64..79 go to test.
    # Normal background nodes (ring_idx == -1) are split 80/20 randomly.
    import random as py_random
    rng = py_random.Random(42)
    
    train_indices = []
    test_indices = []
    
    for idx, node in enumerate(nodes):
        node_ring = df_nodes.iloc[idx]['ring_idx']
        if node_ring != -1:
            if node_ring < 64:
                train_indices.append(idx)
            else:
                test_indices.append(idx)
        else:
            # Background noise: split 80% train, 20% test
            if rng.random() < 0.8:
                train_indices.append(idx)
            else:
                test_indices.append(idx)
                
    train_idx = np.array(train_indices)
    test_idx = np.array(test_indices)
    
    print(f"Ring-Based Data split - Train nodes: {len(train_idx)}, Test nodes: {len(test_idx)}")
    
    # Standardize features (prevent training leakage in scaling)
    scaler = StandardScaler()
    scaler.fit(X[train_idx])
    X_scaled = scaler.transform(X)
    
    # Save scaler for serving
    os.makedirs('models', exist_ok=True)
    with open('models/scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
        
    # --- MODEL A: ISOLATION FOREST ---
    print("Training Isolation Forest...")
    # Isolation Forest is trained on normal data as anomaly detector
    iso_forest = IsolationForest(contamination=0.1, random_state=42)
    iso_forest.fit(X_scaled[train_idx])
    
    # Get anomaly scores (decision_function).
    # sklearn returns negative values for anomalies. We invert and scale so higher means anomalous.
    raw_scores = iso_forest.decision_function(X_scaled)
    # Scale score to [0, 1] range: 0 is normal, 1 is anomalous
    min_score, max_score = raw_scores.min(), raw_scores.max()
    anomaly_scores = (max_score - raw_scores) / (max_score - min_score + 1e-9)
    
    # Save Isolation Forest model
    with open('models/isolation_forest.pkl', 'wb') as f:
        pickle.dump(iso_forest, f)
        
    # Evaluate Isolation Forest (using contamination threshold from train set)
    threshold = np.percentile(anomaly_scores[train_idx], 90)
    iso_preds = (anomaly_scores > threshold).astype(int)
    iso_p, iso_r, iso_f1, _ = precision_recall_fscore_support(y[test_idx], iso_preds[test_idx], average='binary')
    iso_auc = roc_auc_score(y[test_idx], anomaly_scores[test_idx])
    print(f"Isolation Forest Test metrics (threshold={threshold:.4f}) - AUC: {iso_auc:.4f}, F1: {iso_f1:.4f}")
    
    # --- MODEL B: GRAPHSAGE (PyG) ---
    print("Preparing GraphSAGE training...")
    # Convert edge lists to index tensor
    edge_index_list = []
    for u, v in G.edges():
        u_idx = node_to_idx[u]
        v_idx = node_to_idx[v]
        # Undirected edge modeling
        edge_index_list.append([u_idx, v_idx])
        edge_index_list.append([v_idx, u_idx])
        
    edge_index = torch.tensor(edge_index_list, dtype=torch.long).t().contiguous()
    
    # Create PyG Data object
    x_tensor = torch.tensor(X_scaled, dtype=torch.float)
    y_tensor = torch.tensor(y, dtype=torch.long)
    
    data = Data(x=x_tensor, edge_index=edge_index, y=y_tensor)
    
    # Define masks
    train_mask = torch.zeros(num_nodes, dtype=torch.bool)
    test_mask = torch.zeros(num_nodes, dtype=torch.bool)
    train_mask[train_idx] = True
    test_mask[test_idx] = True
    
    data.train_mask = train_mask
    data.test_mask = test_mask
    
    # Model config
    in_channels = X.shape[1]
    hidden_channels = 16
    out_channels = 2  # Binary cross entropy classification (0: normal, 1: mule)
    
    model = GraphSAGE(in_channels, hidden_channels, out_channels)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)
    criterion = nn.CrossEntropyLoss()
    
    # Train GNN
    model.train()
    for epoch in range(1, 101):
        optimizer.zero_grad()
        out = model(data.x, data.edge_index)
        loss = criterion(out[data.train_mask], data.y[data.train_mask])
        loss.backward()
        optimizer.step()
        
        if epoch % 20 == 0:
            model.eval()
            with torch.no_grad():
                pred = model(data.x, data.edge_index).argmax(dim=-1)
                train_acc = (pred[data.train_mask] == data.y[data.train_mask]).sum().item() / data.train_mask.sum().item()
                test_acc = (pred[data.test_mask] == data.y[data.test_mask]).sum().item() / data.test_mask.sum().item()
                print(f"Epoch {epoch:03d} | Loss: {loss.item():.4f} | Train Acc: {train_acc:.4f} | Test Acc: {test_acc:.4f}")
            model.train()
            
    # Save GraphSAGE model weights
    torch.save(model.state_dict(), 'models/graphsage_weights.pt')
    
    # Evaluate GraphSAGE Model on test set
    model.eval()
    with torch.no_grad():
        logits = model(data.x, data.edge_index)
        probs = F.softmax(logits, dim=-1)[:, 1].numpy()
        preds = logits.argmax(dim=-1).numpy()
        
    sage_p, sage_r, sage_f1, _ = precision_recall_fscore_support(y[test_idx], preds[test_idx], average='binary')
    sage_auc = roc_auc_score(y[test_idx], probs[test_idx])
    print(f"GraphSAGE Test metrics - AUC: {sage_auc:.4f}, F1: {sage_f1:.4f}")
    
    # --- EDGE-MASKING ROBUSTNESS EVALUATION (35% drop) ---
    # Simulates incomplete network visibility: what if we only observe 65% of the
    # real transaction graph? This is a realistic scenario in production where the
    # bank may not have full cross-institutional visibility.
    print("\n--- Edge-Masking Robustness Test (35% edges dropped) ---")
    torch.manual_seed(99)  # Fixed seed for reproducibility
    num_edges_total = edge_index.shape[1]
    keep_ratio = 0.65
    num_keep = int(num_edges_total * keep_ratio)
    perm = torch.randperm(num_edges_total)[:num_keep]
    masked_edge_index = edge_index[:, perm]
    
    model.eval()
    with torch.no_grad():
        masked_logits = model(data.x, masked_edge_index)
        masked_probs = F.softmax(masked_logits, dim=-1)[:, 1].numpy()
        masked_preds = masked_logits.argmax(dim=-1).numpy()
    
    masked_p, masked_r, masked_f1, _ = precision_recall_fscore_support(
        y[test_idx], masked_preds[test_idx], average='binary')
    masked_auc = roc_auc_score(y[test_idx], masked_probs[test_idx])
    print(f"GraphSAGE (35% edge-masked) Test metrics - AUC: {masked_auc:.4f}, "
          f"Precision: {masked_p:.4f}, Recall: {masked_r:.4f}, F1: {masked_f1:.4f}")
    
    # Save metrics JSON
    os.makedirs('results', exist_ok=True)
    metrics = {
        'isolation_forest': {
            'auc': float(iso_auc),
            'precision': float(iso_p),
            'recall': float(iso_r),
            'f1_score': float(iso_f1)
        },
        'graphsage': {
            'auc': float(sage_auc),
            'precision': float(sage_p),
            'recall': float(sage_r),
            'f1_score': float(sage_f1)
        },
        'graphsage_edge_masked_35pct': {
            'auc': float(masked_auc),
            'precision': float(masked_p),
            'recall': float(masked_r),
            'f1_score': float(masked_f1),
            'edges_dropped_pct': 35.0,
            'edges_kept': int(num_keep),
            'edges_total': int(num_edges_total)
        }
    }
    
    with open('results/model_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=4)
    print("Metrics written to results/model_metrics.json")
    
if __name__ == '__main__':
    main()
