import os
import pickle
import json
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv

# GraphSAGE Model Definition (same as in ml_service/main.py)
class GraphSAGE(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super(GraphSAGE, self).__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = self.conv2(x, edge_index)
        return x

def main():
    print("Pre-computing ML scores for Vercel/Next.js offline deployment...")
    
    # 1. Load tabular models
    with open('models/scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    with open('models/isolation_forest.pkl', 'rb') as f:
        iso_forest = pickle.load(f)
        
    # 2. Load graph data
    with open('data/graph.pkl', 'rb') as f:
        G = pickle.load(f)
    df_features = pd.read_csv('data/node_features.csv')
    
    # 3. Load GNN
    nodes = list(G.nodes)
    num_nodes = len(nodes)
    node_to_idx = {node: i for i, node in enumerate(nodes)}
    
    X = df_features[['in_degree', 'out_degree', 'velocity', 'holding_time_var', 
                      'device_reuse_count', 'shared_ip_count', 'amount_concentration']].values
    X_scaled = scaler.transform(X)
    
    # Convert G edges to undirected edge_index list
    edge_index_list = []
    for u, v in G.edges():
        edge_index_list.append([node_to_idx[u], node_to_idx[v]])
        edge_index_list.append([node_to_idx[v], node_to_idx[u]])
    edge_index = torch.tensor(edge_index_list, dtype=torch.long).t().contiguous()
    
    x_tensor = torch.tensor(X_scaled, dtype=torch.float)
    
    # Initialize and evaluate GraphSAGE
    gnn = GraphSAGE(in_channels=7, hidden_channels=16, out_channels=2)
    gnn.load_state_dict(torch.load('models/graphsage_weights.pt'))
    gnn.eval()
    
    with torch.no_grad():
        logits = gnn(x_tensor, edge_index)
        gnn_probs = F.softmax(logits, dim=-1)[:, 1].numpy()
        
    # 4. Evaluate Isolation Forest anomaly scores
    raw_scores = iso_forest.decision_function(X_scaled)
    min_score, max_score = raw_scores.min(), raw_scores.max()
    iso_scores = (max_score - raw_scores) / (max_score - min_score + 1e-9)
    
    # 5. Populate cache
    scores_dict = {}
    for idx, node in enumerate(nodes):
        mule_prob = float(gnn_probs[idx])
        anomaly_score = float(iso_scores[idx])
        combined_score = mule_prob
        
        scores_dict[node] = {
            'anomaly_score': round(anomaly_score * 100, 1),
            'mule_probability': round(mule_prob * 100, 1),
            'combined_ml_score': round(combined_score * 100, 1)
        }
        
    # Write to JSON file
    os.makedirs('data', exist_ok=True)
    out_path = 'data/precomputed_scores.json'
    with open(out_path, 'w') as f:
        json.dump(scores_dict, f, indent=2)
    
    # Also write to src/lib for Vercel offline compilation support
    os.makedirs('src/lib', exist_ok=True)
    lib_path = 'src/lib/precomputed_scores.json'
    with open(lib_path, 'w') as f:
        json.dump(scores_dict, f, indent=2)
        
    print(f"Success! Exported scores for {len(scores_dict)} accounts to {out_path} and {lib_path}.")

if __name__ == '__main__':
    main()

