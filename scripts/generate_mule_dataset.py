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
            'type': 'normal',
            'ring_idx': -1
        })
        
    nodes_df = pd.DataFrame(nodes_data).set_index('account_id')
    
    # Introduce family units sharing a device fingerprint (legitimate noise)
    num_family_groups = 300
    for fg in range(num_family_groups):
        shared_dev = f"dev-legit-family-{fg:03d}"
        sampled_accs = nodes_df[nodes_df['is_mule'] == 0].sample(n=random.randint(2, 6)).index
        nodes_df.loc[sampled_accs, 'device_fingerprint'] = shared_dev

    # Introduce shared IP subnets for corporate environments (legitimate noise)
    num_office_ips = 100
    for oi in range(num_office_ips):
        shared_ip = f"10.150.90.{random.randint(1, 254)}"
        sampled_accs = nodes_df[nodes_df['is_mule'] == 0].sample(n=random.randint(15, 30)).index
        nodes_df.loc[sampled_accs, 'ip_address'] = shared_ip
        
    # Track which accounts are mules
    mule_accounts = set()
    
    # 2. Build Mule Rings (Victim -> Intermediary 1 -> Intermediary 2 -> Hub -> Cash-out)
    mule_node_counter = 1
    for ring_idx in range(num_mule_rings):
        ring_size = random.randint(4, 6)
        ring_nodes = []
        
        # Select fresh accounts to assign as mules
        for _ in range(ring_size):
            node_idx = num_nodes - mule_node_counter
            acc_id = make_acc_id(node_idx)
            ring_nodes.append(acc_id)
            mule_accounts.add(acc_id)
            mule_node_counter += 1
            
        # Designate roles and associate ring index
        nodes_df.loc[ring_nodes, 'ring_idx'] = ring_idx
        
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
        # 15% of rings are OPACIFIED (each node has clean unique VPN metadata)
        is_opacified = (random.random() < 0.15)
        if not is_opacified:
            shared_device = f"dev-shared-{ring_idx:03d}"
            shared_ip = f"10.50.{ring_idx}.{random.randint(10, 99)}"
            for node in ring_nodes[1 : ring_size - 1]:
                nodes_df.loc[node, 'device_fingerprint'] = shared_device
                nodes_df.loc[node, 'ip_address'] = shared_ip
        else:
            for idx, node in enumerate(ring_nodes[1 : ring_size - 1]):
                nodes_df.loc[node, 'device_fingerprint'] = f"dev-clean-vpn-{ring_idx:03d}-{idx}"
                nodes_df.loc[node, 'ip_address'] = f"10.200.{ring_idx}.{10 + idx}"
            
        # Create transactions along the ring path
        # 45% of rings act as "patient money mules" with longer delays and partial routing splits
        is_patient_mule = (random.random() < 0.45)
        
        base_time = datetime(2026, 7, 4, random.randint(0, 12), random.randint(0, 59))
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
        
        # Layering transfers
        current_time = base_time
        current_amount = amount
        for i in range(1, ring_size - 2):
            if is_patient_mule:
                # 2 to 18 hours delay
                delay_sec = random.randint(7200, 64800)
                pass_fraction = random.uniform(0.60, 0.85)
            else:
                # 15 seconds to 3 minutes delay
                delay_sec = random.randint(15, 180)
                pass_fraction = random.uniform(0.98, 0.995)
                
            current_time += timedelta(seconds=delay_sec)
            current_amount = int(current_amount * pass_fraction)
            
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
        if is_patient_mule:
            delay_sec = random.randint(7200, 64800)
            pass_fraction = random.uniform(0.60, 0.85)
        else:
            delay_sec = random.randint(15, 180)
            pass_fraction = random.uniform(0.98, 0.995)
            
        current_time += timedelta(seconds=delay_sec)
        current_amount = int(current_amount * pass_fraction)
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
        if is_patient_mule:
            delay_sec = random.randint(7200, 64800)
            pass_fraction = random.uniform(0.60, 0.85)
        else:
            delay_sec = random.randint(15, 180)
            pass_fraction = random.uniform(0.98, 0.995)
            
        current_time += timedelta(seconds=delay_sec)
        current_amount = int(current_amount * pass_fraction)
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
    normal_accounts = list(nodes_df[nodes_df['is_mule'] == 0].index)
    
    # Designate about 2% of normal accounts as "merchants" (high incoming degree)
    num_merchants = int(len(normal_accounts) * 0.02)
    merchants = random.sample(normal_accounts, num_merchants)
    for m in merchants:
        nodes_df.loc[m, 'type'] = 'merchant'
        
    # Pre-select fast routers from normal accounts (noise mimics)
    num_fast_routers = 600
    fast_routers = random.sample(normal_accounts, num_fast_routers)
    for fr in fast_routers:
        nodes_df.loc[fr, 'type'] = 'fast_router'
        
    start_date = datetime(2026, 7, 1)
    
    # --- LEGITIMATE MULTI-HOP CHAINS (topological hard negatives for GNN) ---
    # These mimic the chain structure of mule rings but are entirely legitimate.
    # Without these, the GNN can trivially learn "any multi-hop linear chain = mule".
    legit_chain_types = [
        ('payroll',    3, 5, (2000, 8000),  (3600, 86400)),   # Employer→Processor→Employee→Landlord
        ('supply',     3, 5, (5000, 25000), (7200, 172800)),  # Buyer→Escrow→Supplier→Shipper
        ('remittance', 3, 4, (500, 3000),   (1800, 43200)),   # Sender→Exchange→Correspondent→Beneficiary
    ]
    num_legit_chains = 200  # Total chains across all types
    legit_chain_pool = [acc for acc in normal_accounts if nodes_df.loc[acc, 'type'] == 'normal']
    
    chains_per_type = num_legit_chains // len(legit_chain_types)
    for chain_type, min_hops, max_hops, amt_range, delay_range in legit_chain_types:
        for ch_idx in range(chains_per_type):
            chain_len = random.randint(min_hops, max_hops)
            if len(legit_chain_pool) < chain_len:
                break
            chain_nodes = random.sample(legit_chain_pool, chain_len)
            
            # Tag these nodes with a descriptive type but keep is_mule=0
            for cn in chain_nodes:
                nodes_df.loc[cn, 'type'] = f'legit_{chain_type}'
            
            # Build the chain edges with realistic timing
            chain_base_time = start_date + timedelta(
                days=random.uniform(0, 3), hours=random.uniform(0, 24)
            )
            chain_amount = random.randint(*amt_range)
            
            for hop in range(len(chain_nodes) - 1):
                hop_delay = random.randint(*delay_range)
                # Legitimate chains retain 95-100% of funds (fees are small)
                hop_amount = int(chain_amount * random.uniform(0.95, 1.0))
                chain_base_time += timedelta(seconds=hop_delay)
                
                tx_id = len(edges_data) + 1
                edges_data.append({
                    'edge_id': f"tx-{tx_id}",
                    'from_account': chain_nodes[hop],
                    'to_account': chain_nodes[hop + 1],
                    'amount': hop_amount,
                    'channel': random.choice(['ACH', 'WIRE']),
                    'timestamp': chain_base_time.isoformat()
                })
    
    print(f"Injecting background noise: {len(normal_accounts)} normal nodes with {num_merchants} merchants, {num_fast_routers} fast routers, and {num_legit_chains} legitimate multi-hop chains...")
    
    needed_txs = 20000 - len(edges_data)
    tx_idx = 0
    while tx_idx < needed_txs:
        # Choose random normal sender/receiver
        from_acc = random.choice(normal_accounts)
        to_acc = random.choice(normal_accounts)
        while to_acc == from_acc:
            to_acc = random.choice(normal_accounts)
            
        tx_time = start_date + timedelta(days=random.uniform(0, 3), hours=random.uniform(0, 24))
        amount = random.randint(50, 4000)
        
        # Write base transaction
        tx_id = len(edges_data) + 1
        edges_data.append({
            'edge_id': f"tx-{tx_id}",
            'from_account': from_acc,
            'to_account': to_acc,
            'amount': amount,
            'channel': random.choice(['ZELLE', 'ACH', 'WIRE']),
            'timestamp': tx_time.isoformat()
        })
        tx_idx += 1
        
        # If receiver is a fast router, simulate an immediate forward loop within 1 to 10 minutes
        if to_acc in fast_routers and tx_idx < needed_txs:
            forward_to = random.choice(normal_accounts)
            while forward_to == to_acc or forward_to == from_acc:
                forward_to = random.choice(normal_accounts)
                
            forward_time = tx_time + timedelta(seconds=random.randint(60, 600))
            forward_amount = int(amount * random.uniform(0.97, 0.995))
            
            tx_id = len(edges_data) + 1
            edges_data.append({
                'edge_id': f"tx-{tx_id}",
                'from_account': to_acc,
                'to_account': forward_to,
                'amount': forward_amount,
                'channel': 'ZELLE',
                'timestamp': forward_time.isoformat()
            })
            tx_idx += 1
        
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
        G.add_node(r['account_id'], 
                   is_mule=int(r['is_mule']), 
                   device_fingerprint=r['device_fingerprint'], 
                   ip_address=r['ip_address'], 
                   type=r['type'],
                   ring_idx=int(r['ring_idx']))
        
    for _, r in edges_df.iterrows():
        G.add_edge(r['from_account'], r['to_account'], amount=float(r['amount']), channel=r['channel'], timestamp=r['timestamp'])
        
    with open('data/graph.pkl', 'wb') as f:
        pickle.dump(G, f)
    print("NetworkX pickle saved at data/graph.pkl")

if __name__ == '__main__':
    main()
