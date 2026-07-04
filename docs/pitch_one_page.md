# Sentinel AI: One-Page Pitch Sheet

**Triage Time Reduction for Financial Crime Compliance**

---

### 1. The Problem
Legacy Anti-Money Laundering (AML) monitoring is broken. Traditional rule-based engines generate over **95% false positives**, burying investigators in manual review. More critically, they analyze transactions as isolated events, leaving banks completely blind to multi-hop laundering networks (mule rings, romance scams, layering) where illicit funds flow through series of intermediate accounts.

### 2. Our Approach
Sentinel AI leverages **Graph Neural Networks (GraphSAGE)** to classify transactional subgraphs in real time. By analyzing the *relationships* and flow topology of accounts rather than just static transactional sizes, Sentinel AI detects coordinated laundering patterns. The system combines graph classification with automated narrative synthesis via **Gemini on Vertex AI** to draft compliance-ready Suspicious Activity Reports (SAR), shrinking investigator triage times from hours to seconds.

---

### 3. Core Defensible Claims

#### Claim 1: Caught and Corrected Information Leakage
During training, we identified information leakage where edge-level splits shared structural data between train and test subgraphs (yielding an artificial 100% accuracy). We corrected this by refactoring to a strict **disjoint component-level split**, proving the integrity and reproducibility of our model.

#### Claim 2: High Robustness Under Incomplete Data
In real-world operations, transaction histories are often incomplete. On synthetic graphs, our model was subjected to a **35%-edge-masked robustness test** where 35% of all connections were deleted prior to evaluation. The GNN maintained an **AUC of 96.7% and an F1-score of 87.4%** (compared to a tabular Isolation Forest baseline of 64.7% AUC / 15.9% F1).

#### Claim 3: Independently Validated on IBM AMLSim Benchmark
We validated our model on the public **IBM AMLSim HI-Small** benchmark (56,000 nodes, 6,357 laundering accounts, 8 typologies). Under deterministic, 3-run locked conditions, the GraphSAGE model achieved an **AUC of 85.4943%** and an **F1-score of 30.7471%** (F1-optimal decision threshold of 0.77).

---

### 4. System & Live Demo Details
*   **Local Demo**: The interactive interface runs on local Next.js + FastAPI services, performing real-time GraphSAGE inferences.
*   **Vercel Build**: The public web deployment uses client-side JavaScript mock scoring fallbacks (no Python backend is deployed to Vercel).
*   **GCP Architecture**: The Google Cloud Pub/Sub → BigQuery → Vertex AI → Cloud Run pipeline is a documented architectural plan and is not provisioned.

> [!NOTE]
> **Honest Limitation**: In real-world environments like AMLSim, our model operates at a maximum F1-score of 30.7471%. While it catches a high percentage of fraud (99.0654% recall at a Youden's threshold of 0.104), human-in-the-loop validation remains necessary to resolve false positives.
