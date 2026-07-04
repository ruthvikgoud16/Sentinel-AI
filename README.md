<div align="center">

# 🛡️ Sentinel AI

### Mule Account Intelligence Powered by Graph Neural Networks

**Real-time money mule detection • Gemini-powered forensic copilot • Instant SAR generation**

🚀 **Live Vercel Demo:** [sentinel-ai-detect.vercel.app](https://sentinel-ai-detect.vercel.app)  
⚡ **Live Replit Backend:** [956695f9-d156-4ce4-aeba-31e18e21cf66-00-1n30fcqnxnw8v.sisko.replit.dev](https://956695f9-d156-4ce4-aeba-31e18e21cf66-00-1n30fcqnxnw8v.sisko.replit.dev/)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Gemini](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![PyTorch](https://img.shields.io/badge/PyTorch_Geometric-GraphSAGE-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch-geometric.readthedocs.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<br/>

🏆 **Google Developers Group Vizag 2026 Hackathon**

</div>

---

## 🎯 The Problem

> **$2 Trillion** in illicit funds are laundered annually. Legacy AML systems produce **95% false positive rates**, drowning compliance teams in noise while sophisticated multi-hop laundering networks slip through completely undetected.

Most detection systems analyze transactions **in isolation** — missing the structural flow patterns that define money laundering. Rule-based alerts flag individual anomalies but cannot trace how funds flow across interconnected mule networks.

## 💡 Our Solution

**Sentinel AI** treats financial ledgers as **graphs, not spreadsheets**. Using a PyTorch Geometric **GraphSAGE** model, we evaluate the **topological structure** of transaction networks — identifying mule hubs, layering chains, and cash-out points that flat-file analysis completely misses.

The platform gives compliance officers a **forensic investigation copilot** powered by **Gemini 2.5 Flash** that can:

- 🔍 **Trace** multi-hop money flows through interactive network visualizations
- 🧠 **Explain** why a cluster is suspicious with AI-generated risk analysis
- 📝 **Draft** regulatory Suspicious Activity Reports (SARs) instantly
- 🔒 **Freeze** compromised accounts with one-click mitigation

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **🕸️ Graph Neural Network Scoring** | GraphSAGE model trained on IBM AMLSim benchmark data evaluates transaction subgraph topology — not just individual transfers |
| **🤖 Gemini Forensic Copilot** | Interactive AI assistant that explains graph anomalies, answers investigator questions, and generates compliance narratives in real-time |
| **📊 Interactive Network Visualization** | Vis.js-powered force-directed graph canvas showing money flow paths with animated edges and color-coded risk nodes |
| **⚡ Rule Engine Telemetry** | 6-signal deterministic detection engine (Rapid Fund Movement, Shared Device, Government Alert, Layered Chain, Multiple Senders, New Account Velocity) |
| **📋 One-Click SAR Generation** | Gemini drafts regulatory-compliant Suspicious Activity Report narratives from graph context in seconds |
| **🔒 Freeze Protocol** | Instant account isolation with visual confirmation across the entire suspect network |
| **🎬 Guided Demo Walkthrough** | 5-step interactive tour: Triage → Trace → Gemini Forensics → Isolate & Lock → File Case |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SENTINEL AI STACK                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │  Next.js 16  │◄──►│  API Routes  │◄──►│   Gemini 2.5     │  │
│  │  React 19    │    │  /api/chat   │    │   Flash API      │  │
│  │  Framer Motion│   │  /api/ml-score│   │   (Streaming)    │  │
│  └──────┬───────┘    └──────┬───────┘    └───────────────────┘  │
│         │                   │                                    │
│         ▼                   ▼                                    │
│  ┌─────────────┐    ┌──────────────┐                            │
│  │  Vis.js      │    │  FastAPI ML  │                            │
│  │  Graph Canvas│    │  Service     │                            │
│  │  (vis-network)│   │  :8000       │                            │
│  └─────────────┘    └──────┬───────┘                            │
│                            │                                     │
│                     ┌──────▼───────┐                            │
│                     │  PyTorch     │                             │
│                     │  GraphSAGE   │                             │
│                     │  + Isolation │                             │
│                     │    Forest    │                             │
│                     └──────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|:---|:---|
| Node.js | `v20+` (tested on `v22.11.0`) |
| Python | `v3.10` – `v3.12` |

### 1. Install Dependencies

```bash
# Clone the repository
git clone <repo-url> && cd sentinel-ai

# Install Node.js packages
npm install

# Create Python virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Launch the Full Stack

```bash
npm run dev:all
```

This runs `start.sh` which:
1. ⚡ Starts the **FastAPI ML service** (GraphSAGE + Isolation Forest inference) on `:8000`
2. 🏥 Polls the `/health` endpoint until the ML backend is ready
3. 🌐 Starts the **Next.js dev server** on `:3000`

```
==========================================================
      Sentinel AI - Unified Dev Stack Startup Runner     
==========================================================
[1/3] Starting FastAPI ML service in background...
[2/3] Waiting for FastAPI ML service to be ready...
  -> FastAPI ready on http://127.0.0.1:8000
[3/3] Starting Next.js dev server...
  -> Next.js ready on http://localhost:3000
```

> **Frontend-only mode:** If you skip the Python setup, the Next.js app still works with a client-side mock scoring fallback.

---

## 🎬 Demo Flow (3-Minute Pitch Script)

The guided demo walkthrough follows this flow — each step maps to the interactive stepper in the dashboard UI:

### Step 1: Triage Alerts (0:00 – 0:45)

> Open the dashboard. Three suspect dossiers are queued. Select **Alert #1042 — Robert Chen** (Risk Score: 94, CRITICAL). The Rule Engine Telemetry shows 5 out of 6 detection signals triggered — including Shared Device Match and Government Alert Match.

### Step 2: Trace Network (0:45 – 1:30)

> Click **"Next Step"** to reveal the interactive money flow graph. Watch as the 4-node romance scam ring renders: **Victim → Intermediary → Mule Hub → Crypto Cash-out**. Funds move $9,500 → $9,450 → $9,400 across 3 hops in under 3 minutes. Click any node to inspect device fingerprints and IP addresses.

### Step 3: Gemini Forensics (1:30 – 2:15)

> Click **"Ask Gemini"**. The AI copilot streams a structured forensic analysis of the graph topology. Ask follow-up questions: *"Why is Robert Chen the hub?"* or *"What regulatory filing is needed?"*. Then click **"Generate SAR Narrative"** — Gemini drafts a complete regulatory-compliant narrative.

### Step 4: Isolate & Lock (2:15 – 2:40)

> Click **"Execute Freeze Protocol"**. The target account status updates to FROZEN. The graph nodes pulse red to confirm the network lockdown.

### Step 5: File Case (2:40 – 3:00)

> The auto-generated SAR narrative is ready. Click **"Submit SAR Filing"** to complete the investigation. The case is closed.

---

## 📊 Model Validation & Integrity

We take engineering integrity seriously. Here's our honest story:

### 🐛 Data Leakage Discovery & Fix

During development, our model hit a suspicious **100% AUC**. Instead of shipping it, we audited the pipeline and found **structural data leakage** — connected components were split across train/test sets. We fixed this using **component-level disjoint splitting**, ensuring zero information leakage between graph partitions.

### 📈 Validated Results (IBM AMLSim Benchmark)

| Metric | GraphSAGE (Full) | GraphSAGE (35% Edge-Masked) |
|:---|:---:|:---:|
| **AUC** | 85.49% | 84.13% |
| **Recall** (Youden) | 99.06% | 91.43% |
| **F1 Score** (Optimized) | 30.74% | 29.12% |

- **Dataset**: IBM AMLSim HI-Small — 56,357 nodes, 70,319 edges
- **Edge-Masking Test**: Proves model robustness when 35% of transaction edges are missing (simulating incomplete real-world data)
- **Reproducibility**: Metrics frozen across 3 independent deterministic runs → [`results/model_metrics_amlsim_v2.json`](results/model_metrics_amlsim_v2.json)

### ⚠️ Honest Limitations

- The F1 score on real benchmark data is **30.74%** — this means human-in-the-loop investigation remains essential
- The Vercel deployment serves **pre-computed GraphSAGE ML scores** (served instantly from an embedded JSON database to bypass PyTorch serverless package constraints)
- The GCP production architecture is **documented but not deployed**

> Full validation story: [`docs/synthetic_vs_amlsim_validation.md`](docs/synthetic_vs_amlsim_validation.md)

---

## 🗂️ Project Structure

```
sentinel-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page (premium dark theme)
│   │   ├── dashboard/page.tsx    # Forensic investigation copilot
│   │   ├── login/page.tsx        # Authentication UI
│   │   ├── signup/page.tsx       # Registration UI
│   │   ├── globals.css           # Design system & animations
│   │   └── api/
│   │       ├── chat/route.ts     # Gemini streaming chat endpoint
│   │       └── ml-score/route.ts # ML model inference proxy
│   ├── components/
│   │   └── MoneyFlowGraph.tsx    # Vis.js network graph component
│   └── lib/
│       ├── detectionEngine.ts    # 6-signal rule engine
│       └── mockData.ts           # 3 demo scenarios (Romance Scam, Rapid Layering, Device Collision)
├── ml_service/
│   └── main.py                   # FastAPI server (GraphSAGE + Isolation Forest inference)
├── scripts/
│   ├── train.py                  # Model training pipeline
│   ├── train_amlsim_v2.py       # AMLSim benchmark training with disjoint splits
│   └── generate_mule_dataset.py  # Synthetic dataset generator
├── docs/
│   ├── pitch_script.md           # 2-minute spoken pitch script
│   ├── pitch_narrative.md        # Extended pitch narrative
│   ├── pitch_one_page.md         # One-page pitch summary
│   ├── gcp_architecture.md       # Production GCP architecture design
│   └── synthetic_vs_amlsim_validation.md  # Model validation deep-dive
├── results/
│   └── model_metrics_amlsim_v2.json  # Frozen reproducible metrics
├── start.sh                      # Unified stack launcher
├── PRD.md                        # Product Requirements Document
├── ARCHITECTURE.md               # Technical architecture
└── README.md                     # ← You are here
```

---

## 🔧 Tech Stack

| Layer | Technology | Why |
|:---|:---|:---|
| **Frontend** | Next.js 16, React 19, TypeScript | App Router with streaming, server components |
| **Styling** | Tailwind CSS 4, CSS Variables, Framer Motion | Premium dark theme with glassmorphism & micro-animations |
| **Graph Viz** | vis-network | Client-side force-directed canvas with custom node styling |
| **AI** | Google Gemini 2.5 Flash (`@google/genai`) | Streaming forensic analysis & SAR narrative generation |
| **ML Backend** | FastAPI, PyTorch Geometric, scikit-learn | GraphSAGE GNN + Isolation Forest anomaly scoring |
| **Icons** | Lucide React | Clean, consistent iconography |

---

## 📚 Documentation Index

| Document | Purpose |
|:---|:---|
| [`docs/pitch_script.md`](docs/pitch_script.md) | 2-minute spoken pitch script (271 words, ~2:05 at moderate pace) |
| [`docs/pitch_narrative.md`](docs/pitch_narrative.md) | Extended narrative with technical depth for Q&A |
| [`docs/pitch_one_page.md`](docs/pitch_one_page.md) | One-page executive summary |
| [`docs/gcp_architecture.md`](docs/gcp_architecture.md) | Production GCP architecture (BigQuery, Vertex AI, Cloud Run) |
| [`docs/synthetic_vs_amlsim_validation.md`](docs/synthetic_vs_amlsim_validation.md) | Full model validation story with data leakage discovery |
| [`PRD.md`](PRD.md) | Product Requirements Document |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Technical architecture overview |
| [`ml_service/README.md`](ml_service/README.md) | ML service API documentation |

---

## 🎤 Judge Q&A Cheat Sheet

<details>
<summary><strong>❓ "What makes this different from existing AML tools?"</strong></summary>

Traditional AML systems use **rule-based thresholds** on individual transactions (e.g., flag anything over $10K). Sentinel AI uses **Graph Neural Networks** that analyze the **structural topology** of transaction networks — detecting layering patterns, mule hubs, and shared-device fraud rings that flat-file analysis completely misses. It's the difference between looking at one road vs. seeing the entire highway system.
</details>

<details>
<summary><strong>❓ "Why GraphSAGE specifically?"</strong></summary>

GraphSAGE is an **inductive** GNN — it generalizes to unseen nodes by sampling and aggregating neighbor features. This is critical for AML because new accounts appear constantly, and we need to score them without retraining the entire model. Traditional GCN or GAT models are transductive and require the full graph at inference time.
</details>

<details>
<summary><strong>❓ "How did you catch the data leakage?"</strong></summary>

Our model initially hit 100% AUC, which was a red flag. We audited the data split and discovered that connected components (transaction chains involving the same laundering ring) were being split across train and test sets — so the model was essentially seeing answers during training. We fixed this using **component-level disjoint splitting**: entire connected components go exclusively into either train or test, never both.
</details>

<details>
<summary><strong>❓ "Your F1 score is 30.74% — isn't that bad?"</strong></summary>

On the IBM AMLSim benchmark with only 5 basic features (no device fingerprints, no IP data, no velocity metrics), achieving 85.49% AUC with 99% recall at the Youden threshold is actually strong. The low F1 reflects the **extreme class imbalance** (11.28% positive rate). In practice, AML is a **recall-first domain** — it's better to flag 100 accounts and have 70 be false positives than to miss 30 actual money laundering networks. This is why the system is designed as a **copilot** for human investigators, not a fully autonomous system.
</details>

<details>
<summary><strong>❓ "Is the Gemini integration real?"</strong></summary>

Yes. The `/api/chat` endpoint streams real Gemini 2.5 Flash responses. We inject the structured graph context (node metadata, edge amounts, timeline events, detection signals) as a system prompt, and Gemini generates forensic analysis and SAR narratives in real-time. You can ask it follow-up questions — it's a real conversational AI, not a canned response.
</details>

<details>
<summary><strong>❓ "What would production look like?"</strong></summary>

We've documented a full GCP production architecture in [`docs/gcp_architecture.md`](docs/gcp_architecture.md) — BigQuery for transaction storage, Vertex AI for model serving, Cloud Run for the API layer, and Pub/Sub for real-time alert ingestion. The demo uses in-memory mock data to keep the focus on the investigation UX, but the architecture is designed to scale.
</details>

<details>
<summary><strong>❓ "Is the ML model running live in the demo?"</strong></summary>

**Locally:** Yes. The `start.sh` script launches a FastAPI ML service that runs real PyTorch GraphSAGE inference and Isolation Forest anomaly scoring on port 8000.

**On Vercel:** No — Vercel doesn't support Python runtimes, so the deployed version uses a client-side JavaScript mock scoring fallback. We're transparent about this trade-off.
</details>

---

## ⚠️ Deployment Notes

> [!WARNING]
> The public Vercel deployment runs **frontend-only** with client-side mock scoring. Run the full stack **locally** (via `npm run dev:all`) to see real GraphSAGE PyTorch inference.

---

<div align="center">

**Built with 🧠 intelligence and ☕ caffeine**

*Sentinel AI — Because money laundering is a graph problem, not a spreadsheet problem.*

</div>
