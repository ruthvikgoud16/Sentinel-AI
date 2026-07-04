import os
import random
import pickle
import pandas as pd
import numpy as np
import networkx as nx
from datetime import datetime, timedelta

def main():
    print("Generating synthetic mule account dataset...")
    
    # Setup directories
    os.makedirs('data', exist_ok=True)
    
    num_nodes = 5000
    num_mule_rings = 80  # Each ring will have about 5-8 nodes
    
    # Initialize containers
    nodes_data = []
    edges_data = []
    
    # Helper to generate IDs
    def make_acc_id(num):
        return f"acc-{num:04d}"
    
    # 1. Create all node IDs and basic features
    # Set default values for normal accounts
    for i in range(1, num_nodes + 1):
        acc_id = make_acc_id(i)
        nodes_data.append({
            'account_id': acc_id,
            'is_mule': 0,
            'device_fingerprint': f"dev-{random.randint(10000, 99999)}",
            'ip_address': f"192.168.{random.randint(1, 254)}.{random.randint(1, 254)}",
            'type': 'normal'
        })
        
    nodes_df = pd.DataFrame(nodes_data).set_index('account_id')
    
    # Track which accounts are mules
    mule_accounts = set()
    
    # 2. Build Mule Rings (Victim -> Intermediary 1 -> Intermediary 2 -> Hub -> Cash-out)
    mule_node_counter = 1
    for ring_idx in range(num_mule_rings):
        # We take a few nodes from the end of the node list to turn them into a mule ring
        # This keeps the nodes list simple.
        ring_size = random.randint(4, 6)
        ring_nodes = []
        
        # Select fresh accounts to assign as mules
        for _ in range(ring_size):
            # Pick a node index
            node_idx = num_nodes - mule_node_counter
            acc_id = make_acc_id(node_idx)
            ring_nodes.append(acc_id)
            mule_accounts.add(acc_id)
            mule_node_counter += 1
            
        # Designate roles in the ring
        # Node 0: Victim
        # Node 1 to ring_size-3: Intermediaries
        # Node ring_size-2: Hub (Target)
        # Node ring_size-1: Cash-out
        
        nodes_df.loc[ring_nodes[0], 'type'] = 'victim'
        for i in range(1, ring_size - 2):
            nodes_df.loc[ring_nodes[i], 'type'] = 'intermediary'
            nodes_df.loc[ring_nodes[i], 'is_mule'] = 1
        
        hub_node = ring_nodes[ring_size - 2]
        cashout_node = ring_nodes[ring_size - 1]
        
        nodes_df.loc[hub_node, 'type'] = 'hub'
        nodes_df.loc[hub_node, 'is_mule'] = 1
        nodes_df.loc[cashout_node, 'type'] = 'cash_out'
        
        # Inject shared device/IP among the intermediaries and hub in this ring
        shared_device = f"dev-shared-{ring_idx:03d}"
        shared_ip = f"10.50.{ring_idx}.{random.randint(10, 99)}"
        
        # Shared devices between intermediaries and hub
        for node in ring_nodes[1 : ring_size - 1]:
            nodes_df.loc[node, 'device_fingerprint'] = shared_device
            nodes_df.loc[node, 'ip_address'] = shared_ip
            
        # Create transactions along the ring path
        # Time starts at a base date
        base_time = datetime(2026, 7, 4, random.randint(0, 18), random.randint(0, 59))
        amount = random.randint(3000, 12000)
        
        # Transfer from victim to first intermediary
        tx_id = len(edges_data) + 1
        edges_data.append({
            'edge_id': f"tx-{tx_id}",
            'from_account': ring_nodes[0],
            'to_account': ring_nodes[1],
            'amount': amount,
            'channel': random.choice(['ZELLE', 'ACH']),
            'timestamp': base_time.isoformat()
        })
        
        # Layering transfers: short latency (15 seconds to 3 minutes)
        current_time = base_time
        current_amount = amount
        for i in range(1, ring_size - 2):
            current_time += timedelta(seconds=random.randint(15, 180))
            # Subtract small processing fee/cut (0.5% - 2%)
            current_amount = int(current_amount * (1 - random.uniform(0.005, 0.02)))
            tx_id = len(edges_data) + 1
            edges_data.append({
                'edge_id': f"tx-{tx_id}",
                'from_account': ring_nodes[i],
                'to_account': ring_nodes[i+1],
                'amount': current_amount,
                'channel': random.choice(['ZELLE', 'ACH', 'WIRE']),
                'timestamp': current_time.isoformat()
            })
            
        # Transfer from last intermediary to hub
        current_time += timedelta(seconds=random.randint(15, 180))
        current_amount = int(current_amount * (1 - random.uniform(0.005, 0.02)))
        tx_id = len(edges_data) + 1
        edges_data.append({
            'edge_id': f"tx-{tx_id}",
            'from_account': ring_nodes[ring_size - 3],
            'to_account': hub_node,
            'amount': current_amount,
            'channel': 'ACH',
            'timestamp': current_time.isoformat()
        })
        
        # Transfer from hub to cashout
        current_time += timedelta(seconds=random.randint(15, 180))
        current_amount = int(current_amount * (1 - random.uniform(0.005, 0.02)))
        tx_id = len(edges_data) + 1
        edges_data.append({
            'edge_id': f"tx-{tx_id}",
            'from_account': hub_node,
            'to_account': cashout_node,
            'amount': current_amount,
            'channel': 'WIRE',
            'timestamp': current_time.isoformat()
        })

    # 3. Generate Normal Background Noise
    # We need to fill up the transaction list to at least 20,000 transactions.
    # Normal accounts will perform random transactions with each other.
    normal_accounts = [make_acc_id(i) for i in range(1, num_nodes - mule_node_counter)]
    
    print(f"Injecting background noise: {len(normal_accounts)} normal nodes...")
    
    # Keep track of timestamps for normal nodes to make them spread out
    start_date = datetime(2026, 7, 1)
    
    # We generate about 20,000 transactions total
    needed_txs = 20000 - len(edges_data)
    for _ in range(needed_txs):
        from_acc = random.choice(normal_accounts)
        to_acc = random.choice(normal_accounts)
        while to_acc == from_acc:
            to_acc = random.choice(normal_accounts)
            
        tx_time = start_date + timedelta(days=random.uniform(0, 4), hours=random.uniform(0, 24))
        amount = random.randint(10, 5000)
        
        tx_id = len(edges_data) + 1
        edges_data.append({
            'edge_id': f"tx-{tx_id}",
            'from_account': from_acc,
            'to_account': to_acc,
            'amount': amount,
            'channel': random.choice(['ZELLE', 'ACH', 'WIRE']),
            'timestamp': tx_time.isoformat()
        })
        
    # Compile dataframes
    edges_df = pd.DataFrame(edges_data)
    nodes_df = nodes_df.reset_index()
    
    # Save CSVs
    nodes_df.to_csv('data/nodes.csv', index=False)
    edges_df.to_csv('data/edges.csv', index=False)
    print(f"CSVs saved: {len(nodes_df)} nodes, {len(edges_df)} edges.")
    
    # 4. Build NetworkX Graph and Save Pickle
    G = nx.DiGraph()
    for _, r in nodes_df.iterrows():
        G.add_node(r['account_id'], is_mule=int(r['is_mule']), device_fingerprint=r['device_fingerprint'], ip_address=r['ip_address'], type=r['type'])
        
    for _, r in edges_df.iterrows():
        G.add_edge(r['from_account'], r['to_account'], amount=float(r['amount']), channel=r['channel'], timestamp=r['timestamp'])
        
    with open('data/graph.pkl', 'wb') as f:
        pickle.dump(G, f)
    print("NetworkX pickle saved at data/graph.pkl")

if __name__ == '__main__':
    main()
