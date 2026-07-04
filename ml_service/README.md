# Sentinel AI - ML Mule Detection Layer Service

This service provides a real, trained Machine Learning detection layer utilizing two distinct models:
1. **Unsupervised Anomaly Detection:** An Isolation Forest model trained on engineered tabular features.
2. **Semi-Supervised Graph Learning:** A GraphSAGE Graph Neural Network (GNN) model trained using PyTorch Geometric on graph topology and node features.

---

## 🛠️ Step 1: Environment Setup

If you haven't initialized the virtual environment, run:
```bash
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install torch torch-geometric pandas numpy scikit-learn networkx fastapi uvicorn
```

---

## 📊 Step 2: Synthetic Data Generation

Generate a synthetic transaction dataset (5,000 accounts, 20,000 transactions) with realistic money mule rings:
```bash
.venv/bin/python scripts/generate_mule_dataset.py
```
This saves data to:
- `data/nodes.csv`
- `data/edges.csv`
- `data/graph.pkl` (NetworkX pickle file)

---

## 🧠 Step 3: Model Feature Engineering & Training

Run the feature engineering pipeline and train both models (Isolation Forest + GraphSAGE):
```bash
.venv/bin/python scripts/train.py
```
This generates:
- Engineered features: `data/node_features.csv`
- Scaler: `models/scaler.pkl`
- Isolation Forest weights: `models/isolation_forest.pkl`
- GraphSAGE weights: `models/graphsage_weights.pt`
- Training metrics JSON: `results/model_metrics.json`

---

## 🚀 Step 4: Serve predictions via FastAPI

Start the local FastAPI service on port 8000:
```bash
.venv/bin/uvicorn ml_service.main:app --host 127.0.0.1 --port 8000 --reload
```

### API Endpoint: `POST /score`
Accepts account ID and current deterministic rule scores, returning real ML predictions (falling back to a dynamic pseudorandom model score if the account lies outside the synthetic pre-trained node set).

#### Request Example:
```json
{
  "account_id": "acc-9981",
  "rule_score": 94.0
}
```

#### Response Example:
```json
{
  "account_id": "acc-9981",
  "anomaly_score": 93.5,
  "mule_probability": 91.2,
  "combined_ml_score": 91.9
}
```
