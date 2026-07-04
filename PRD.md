# Product Requirements Document (PRD) - Hackathon Edition

## Sentinel AI: Mule Account Intelligence & Fraud Investigation Copilot

---

## 1. Executive Summary

**Sentinel AI** is an AI-powered Mule Account Intelligence and Fraud Investigation Copilot designed to prevent the circulation of fraudulent proceeds through money mule networks. Designed specifically for a high-impact, 3-minute hackathon demo, the platform acts as an interactive workspace that enables investigators to visualize suspicious multi-hop transfers, use Gemini to automatically identify layering patterns, and instantly generate regulatory Suspicious Activity Reports (SARs).

---

## 2. Target Users & Problem

* **User:** Fraud Investigator / AML Analyst at a Bank or FinTech.
* **Problem:** Drowning in siloed alerts and wasting hours tracing money trails through multi-hop accounts to write mandatory regulatory reports.
* **Solution:** A unified visual canvas paired with a Gemini copilot that explains complex money networks and writes reports instantly.

---

## 3. The Redefined "Golden Path" Demo Flow (3-Minute Script)

* **0:00 - 0:45: The High-Prioritization Dashboard**
  * Present a premium, dark-themed dashboard showing a list of alerts.
  * Highlight **Alert #1042 - Suspected Mule Hub (Risk Score: 94/100)**.
  * Point out the correlated risk flags: *Government Cyber Fraud Ticket* matches a *Velocity Spike*.
* **0:45 - 1:30: The Interactive Graph Visualization**
  * Click into the alert. Immediately render a stunning, animated transaction flow graph showing:
    * **Node A (Victim)** transfers $9,500 to **Node B (Intermediary 1)**.
    * **Node B** splits it, sending $4,750 to **Node C (Intermediary 2)** and $4,750 to **Node D (Mule Target)**.
    * **Node C and D** reconsolidate the funds into **Node E (Crypto Cash-out)**.
* **1:30 - 2:30: Gemini Risk Analysis & Explainer (Wow Moment)**
  * Click **"Analyze with Gemini"**.
  * The Gemini Copilot drawer opens and streams a markdown breakdown highlighting *evidence of structural layering* and *shared device fingerprints*.
  * Click **"Generate SAR Narrative"**. Gemini instantly drafts a professional narrative matching regulatory submission standards.
* **2:30 - 3:00: Immediate Resolution**
  * Click **"Freeze Account & Network"**.
  * The graph nodes immediately turn red (signifying frozen status) and a success toast alerts the user.

---

## 4. Redefined P0 Features (Minimum Viable Demo)

* **Prioritized Alert Sidebar/Queue:** Sleek panel showing the single critical alert (`alert-1042`).
* **Interactive Money Flow Graph:** A visual network mapping the 5-node romance scam ring with animated directed edges.
* **Alert Activity Timeline:** A vertical feed listing the 3 transactions and 1 government cyber fraud ticket.
* **Gemini Copilot Panel:**
  * **"Analyze Risk" Button:** Triggers Gemini to summarize the graph's ledger anomalies.
  * **"Generate SAR Narrative" Button:** Triggers Gemini to draft regulatory compliance text.
  * **Interactive Chat Input:** Allowing the user to ask questions about the nodes.
* **Action Center:** A single, high-fidelity *"Freeze Account"* button that updates the client UI state instantly.

---

## 5. Eliminated Features (Nice-to-Have / Out of Scope)

* **Rule Builder UI:** Removed.
* **Mock Ingestion Pipeline UI:** Removed.
* **PDF Exporter:** Removed (waste of time, replaced with screen copy/mock toast).
* **Search / Filter Logic:** Removed (UI is static/mocked for the demo alert).
* **Multi-investigator Collaboration:** Removed.
