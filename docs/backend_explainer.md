# 🧠 Backend & Machine Learning Explainer

Here is a clear, step-by-step breakdown of how the **Sentinel AI backend** works. It is written in simple English but uses professional technical terms to ensure you sound authoritative during the judge Q&A.

---

## 1. The Core Backend Architecture

The backend consists of two main components:
1.  **FastAPI ML Inference Service** (`ml_service/main.py`): A Python microservice that preloads the trained machine learning models, handles data feature preparation, and serves real-time inference scores over HTTP.
2.  **Next.js API Layer** (`src/app/api/`): Acts as a secure gateway proxy between the frontend UI, the Python ML service, and the external Google Gemini API.

---

## 2. How the ML Model Works (The Pipeline)

### Step A: Feature Engineering & Ingestion
For every account (node) in the system, we construct a feature vector representing both **tabular attributes** and **network structure**:
*   **Local attributes:** transaction velocity (volume per hour), holding time variance, device sharing count, and shared IP count.
*   **Graph attributes:** In-degree (number of senders) and Out-degree (number of receivers).

### Step B: The GraphSAGE Neural Network (GNN)
We use a **PyTorch Geometric GraphSAGE** model (composed of 2 inductive `SAGEConv` layers):
1.  **Neighbor Aggregation:** Unlike traditional neural networks that treat data points as isolated, GraphSAGE inspects each node's local neighborhood. It aggregates features from neighboring nodes (e.g., looking at who transfers money to whom).
2.  **Inductive Learning:** By learning how to aggregate neighbor characteristics rather than memorizing a static graph, GraphSAGE can evaluate **unseen accounts** in real-time without needing to retrain the entire model.
3.  **Output:** It outputs a **Mule Probability** (a classification score between 0% and 100%) indicating how likely the node is part of a laundering ring.

### Step C: The Isolation Forest Model
We run a parallel **Isolation Forest** (from `scikit-learn`):
*   This model isolates anomalies instead of profiling normal patterns. It partitions features recursively; anomalies are isolated much closer to the root of the decision trees.
*   It outputs a **Tabular Anomaly Score** indicating if the account's transaction size or velocity is statistically abnormal.

---

## 3. How the Gemini Copilot Works

When you click **"Ask Gemini"** or **"Generate SAR"**:
1.  The Next.js backend fetches the account's graph structure (all nodes and transactions) and the Rule Telemetry status.
2.  It serializes this data into a structured JSON string.
3.  It passes this string as context to the **Gemini 2.5 Flash API** using a strict system prompt instructing Gemini to act as a Senior AML Forensic investigator.
4.  Gemini evaluates the data and streams back the compliance analysis.

---

## 🎤 Quick-Answer Cheat Sheet for Judges

### Q1: *"How does the GNN model process transaction data?"*
> **Answer (Simple & Technical):**
> *"At startup, our FastAPI backend loads the transaction ledger as a network graph using NetworkX. We map accounts as nodes and transfers as edges. We pass this graph into our trained **PyTorch GraphSAGE GNN** model. GraphSAGE uses **SAGEConv** layers to aggregate the features of neighboring accounts, capturing multi-hop transaction flows. This outputs a classification probability showing if the account behaves like a money mule."*

### Q2: *"Why did you combine GraphSAGE with an Isolation Forest?"*
> **Answer (Simple & Technical):**
> *"We use a **hybrid model approach** to cover two different types of fraud patterns:*
> * *The **GraphSAGE GNN** is spatial: it detects topological routing anomalies, like layering chains and mule rings.*
> * *The **Isolation Forest** is tabular: it flags statistical outliers in transaction velocity or value.*
> * *Combining them gives the investigator a complete risk profile: structural fraud and tabular anomalies."*

### Q3: *"Is the model running live during the demo?"*
> **Answer (Simple & Technical):**
> *"Yes, locally. We run a **FastAPI backend microservice** on port 8000. When you click 'Run Telemetry Scan' on the dashboard, the Next.js app queries the FastAPI endpoint. FastAPI runs active PyTorch inference on the selected account's subgraph and returns the real GNN probability. For our public Vercel link, we fall back to a client-side scorer since Vercel doesn't support Python runtimes."*
