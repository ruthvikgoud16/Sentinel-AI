# Sentinel AI: Anti-Money Laundering Forensic Investigator Dossier

Sentinel AI is a compliance investigator triage platform that maps financial ledgers as graph neural networks and evaluates transactional subgraphs in real time. It identifies multi-hop money-laundering schemes (layering, mule hubs, shared-device fraud rings) and integrates generative compliance reports (SARs) utilizing Gemini.

---

## 🚀 Getting Started (Local Development Stack)

To run the full Sentinel AI stack with live GraphSAGE GNN model inference and Gemini narrative drafting:

### 1. Prerequisites
*   **Node.js**: `v20` or higher (tested on Node `v22.11.0`)
*   **Python**: `v3.10` to `v3.12`

### 2. Install Dependencies
```bash
# 1. Clone & install Node packages
npm install

# 2. Create Python virtual environment and install packages
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment Variables Setup
Copy the example environment template and add your Gemini API Key:
```bash
cp .env.example .env.local
```
Edit `.env.local` and configure:
```text
GEMINI_API_KEY=your_actual_gemini_api_key
```

### 4. Running the Stack
Run the unified startup script which launches both the Python FastAPI ML service and the Next.js development server:
```bash
npm run dev:all
```
*(This triggers `./start.sh` which checks ports, polls backend endpoints until ready, and then spins up the Next.js frontend).*

**Expected Console Output:**
```text
==========================================================
      Sentinel AI - Unified Dev Stack Startup Runner     
==========================================================
[1/3] Starting FastAPI ML service in background...
[2/3] Waiting for FastAPI ML service to be ready...
  -> FastAPI ready on http://127.0.0.1:8000 :8000
[3/3] Starting Next.js dev server...
  -> Next.js ready on http://localhost:3000 :3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application dossier.

---

## 📊 Model Training & Reproducible Metrics

Sentinel AI utilizes a PyTorch Geometric GraphSAGE model trained on transactional networks.

*   **Offline Validation Story**: Details on how we caught an initial 100% AUC data leakage error, corrected it with disjoint component splitting, and validated it on real benchmark data is available at: [docs/synthetic_vs_amlsim_validation.md](file:///Users/ruthvikgoud/Music/hackathon-project/docs/synthetic_vs_amlsim_validation.md).
*   **Locked Reproducible Results**: Performance metrics are frozen and verified across three independent deterministic runs, located in: [results/model_metrics_amlsim_v2.json](file:///Users/ruthvikgoud/Music/hackathon-project/results/model_metrics_amlsim_v2.json).
*   **Project Pitch Context**: For the comprehensive project narrative and pitch script, see: [docs/pitch_narrative.md](file:///Users/ruthvikgoud/Music/hackathon-project/docs/pitch_narrative.md).

---

## 🌐 Public Vercel Deployment Note

> [!WARNING]
> The public Vercel deployment (hosted at [https://hackathon-project-wheat-alpha.vercel.app](https://hackathon-project-wheat-alpha.vercel.app)) runs **frontend-only** with a client-side JavaScript mock scoring fallback. Since no Python virtual environment or GNN model registry is running on Vercel, you must run the stack **locally** (per the steps above) to see real GraphSAGE PyTorch inference.
