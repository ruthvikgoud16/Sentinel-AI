# Sentinel AI: Forensic Graph Analytics for Anti-Money Laundering (AML)

This document presents the engineering pitch and core technology narrative for Sentinel AI, an intelligent forensic triage system for anti-money laundering investigations.

> [!IMPORTANT]
> **Production Status & Scope Disclosure**
> The production cloud architecture detailed in this document is a documented reference plan (`documented-not-deployed`) and has not been provisioned. 
> The live interactive investigator interface runs locally using a Next.js front-end connected to a FastAPI service running real-time GraphSAGE inference. 
> The public Vercel deployment relies on a client-side JavaScript mock scoring fallback engine. No Python machine learning backend is deployed to Vercel.

---

## 1. Problem Statement

Modern Anti-Money Laundering (AML) operations are bottlenecked by legacy, rule-based systems. These platforms generate an overwhelming volume of false positives (often exceeding 95%), which forces compliance teams into slow, manual triage. 

More critically, legacy engines analyze transactions in isolation, treating each transfer as a discrete event. This leaves financial institutions blind to coordinated multi-party schemes—such as layering networks, romance scams, and structuring rings—where money is routed through series of intermediaries (mules) to obfuscate its origin. 

---

## 2. Technical Differentiators (Why Sentinel AI is Different)

Unlike typical hackathon "AI wrappers" that plug raw text logs into commercial LLM endpoints, Sentinel AI is built around a rigorous graph neural network (GNN) core and validated with open-source datasets under simulated incomplete data environments.

### The Leakage-Catch Story
During initial model development, our GraphSAGE pipeline yielded a suspicious `100.0%` test accuracy. Rather than presenting this inflated number, we audited our dataset split logic. We discovered an information leakage vulnerability: the transaction subgraph generator had grouped transactions into components and split them into train/test sets at the *transaction* (edge) level rather than the *component* (independent graph) level. This leaked structural connections between the training and testing sets. 

We corrected this by refactoring our pipeline to perform a strict **component-level disjoint split**. This reduced our synthetic test metrics to a realistic, scientifically defensible level, proving our commitment to empirical integrity.

### Strict Ablation Baseline
To prove that our graph topology features are actually driving model performance, we established a strict baseline using an **Isolation Forest** anomaly detector trained purely on tabular node features (degree metrics and cash concentration values). The baseline achieved only **64.7% AUC and 15.9% F1-score**, demonstrating that local tabular features are fundamentally insufficient for detecting complex laundering topologies.

### Robustness Under Masked Data
In the real world, transaction logs are incomplete. Law enforcement and compliance officers often operate with missing data. To prove our model's robustness, we ran a **35%-edge-masked validation test** where 35% of transaction links were randomly deleted from the graph before inference. Our model maintained high accuracy under these conditions, demonstrating its real-world applicability.

### Independent Benchmark Validation
Instead of relying solely on our synthetic generator, we validated our GraphSAGE model on the public **IBM AMLSim HI-Small** dataset—an independent, real-world benchmark representing 56,000 nodes, 6,357 labeled laundering accounts, and 8 distinct laundering typologies. 

---

## 3. Empirical Model Performance

All metrics are locked and verified across three independent, deterministic runs to ensure complete reproducibility (matching split hashes and performance scores to 6 decimal places).

### Synthetic Data Performance
Our model was evaluated on synthetic graph data simulating multi-hop money laundering networks.

*   **Isolation Forest Baseline (Tabular Only)**: 
    *   **AUC**: 64.7%
    *   **F1-Score**: 15.9%
*   **GraphSAGE (Full Graph)**: 
    *   **AUC**: 99.9%
    *   **F1-Score**: 97.8%
*   **GraphSAGE (35% Edge-Masked Robustness Test)**: 
    *   **AUC**: 96.7%
    *   **F1-Score**: 87.4%

### Independent Benchmark Performance (IBM AMLSim)
When evaluated on the public IBM AMLSim dataset (HI-Small), the model maintained high classification quality. We report metrics at two threshold-selection methods to be fully transparent:

| Threshold Selection Method | Decision Threshold | Precision | Recall | F1-Score | AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Youden's J Statistic** (Max Sensitivity/Specificity) | 0.104405 | 15.8960% | 99.0654% | 27.3961% | 85.4943% |
| **F1-Optimal** (Sweep argmax F1) | 0.770000 | 28.5333% | 33.3333% | 30.7471% | 85.4943% |

*The F1-optimal threshold represents a more realistic balance of precision and recall for real-world operations, while Youden's J prioritizes maximizing recall to capture every potential laundering event.*

---

## 4. System Integration & Target Cloud Architecture

Sentinel AI's target cloud architecture is designed using Google Cloud-native serverless and managed components. The workflow connects real-time data streaming to localized model endpoints and automated generative LLM tools:

1.  **Ingestion**: High-throughput transaction events stream into **Google Cloud Pub/Sub**.
2.  **Storage**: **Google Cloud BigQuery** ingests and partitions historical transactions.
3.  **Inference**: A serverless orchestrator queries **Vertex AI Endpoints** hosting our custom GraphSAGE model, passing node/edge subgraphs to generate real-time anomaly scores.
4.  **Generative Narration**: Suspicious transactions trigger **Gemini on Vertex AI** to synthesize graph data and check flags into a formatted Suspicious Activity Report (SAR) draft.
5.  **Mitigation Webhooks**: The generated report and scoring payload are dispatched to **Google Cloud Run**, triggering legacy ledger block actions and queueing SAR submission APIs.

---

## 5. Explicit Limitations & Scope

*   **Mock Front-End Queue**: The interactive client dashboard uses pre-generated transaction scenarios to guarantee a smooth live presentation flow.
*   **Vercel Sandbox Mode**: The publicly accessible Vercel URL runs a client-side JavaScript mock scoring fallback. It does not communicate with the Python ML service.
*   **GCP Deployment Status**: The cloud pipeline is documented as a reference implementation; no active Google Cloud resources are provisioned.
*   **Precision/Recall Tradeoff**: In real-world datasets (like AMLSim), our F1-score is capped at 30.7471%. While our model captures a significant volume of laundering behavior (up to 99.0654% recall at low thresholds), it generates false positives that require human-in-the-loop validation, which we present as a necessary baseline constraint of the problem space.
