# 🎯 Problem Statement Alignment Guide

Here is how **Sentinel AI** directly maps to and answers every single requirement of the official hackathon problem statement.

---

## 📋 Problem Statement Breakdown & Mapping

| Requirement from Problem Statement | How Sentinel AI Implements It | Demo Visuals / Code Hook |
|:---|:---|:---|
| **"...detecting suspicious transactions and mule accounts..."** | • **PyTorch Geometric GraphSAGE Model** trained on transactional graphs to classify accounts based on flow topology.<br/>• **6-Signal Telemetry Engine** evaluating mule indicators (e.g. rapid fund movement, layered chains). | • Alert severity badges (`CRITICAL`, `HIGH RISK`).<br/>• Redesigned UI highlighting Mule Targets vs. Senders. |
| **"...by ingesting financial transactions..."** | • Visualizing money flow paths through multi-hop accounts.<br/>• Ingesting Zelle, ACH, and Wire transaction metadata. | • Force-directed Vis.js graph canvas showing transfer paths with edge amounts and channels.<br/>• Detailed timeline ledger. |
| **"...and/or fraud monitoring solution alerts..."** | • Interactive Alert Queue containing pre-prioritized suspect cases (e.g., Romance Scam Ring, Rapid Layering). | • Suspect Sidebar queue mapping account IDs, risk scores, and alert types. |
| **"...and/or Transaction monitoring system alerts..."** | • Core dashboard lists triggered system alerts with severity and transaction details. | • `ALERT-1042` Romance Scam Mule dossier. |
| **"...and govt cyber fraud alerts/tickets..."** | • **NCIB (National Cyber Investigations Branch) Cyber Fraud Ticket Integration**.<br/>• The telemetry rule engine scans for matches between govt tickets and transaction nodes. | • Telemetry card: `GOVERNMENT_ALERT` (NCIB ticket link matched on timeline).<br/>• Step 1 & Step 2 UI timelines. |
| **"...and preventing circulation of fraudulent proceeds through mule accounts."** | • **Execute Freeze Protocol** mitigation action.<br/>• Triggering an automated, real-time lock across all compromised nodes in the identified network. | • Step 4 in guided demo: click "Execute Freeze Protocol" to instantly turn nodes red (FROZEN) in the active graph. |
| **"...consume real-time regulatory inputs/ feeds..."** | • Live ingestion of regulatory NCIB scam warnings matched onto transaction timelines in real-time. | • Cyber Tip events (`cyber_tip` type) mapped dynamically onto the incident dossier. |
| **"...and cross-channel bank data."** | • Consolidates transaction channels: **Zelle** (peer-to-peer), **ACH** (low velocity clearing), and **Wire** (high-value cashout).<br/>• Maps metadata: IP addresses and hardware device fingerprints. | • Vis.js graph edge labels showing transfer methods (e.g. Zelle, ACH, Wire).<br/>• Telemetry card: `SHARED_DEVICE` (detects device swap patterns). |

---

## 💡 How to Pitch This to the Judges

When presenting, walk the judges through the dashboard using this specific narrative hook:

1. **"We didn't just build a transaction filter; we built an integrated defense system that consumes cross-channel bank data (Zelle, ACH, Wire) and matches it against real-time regulatory inputs like NCIB cyber fraud tickets."**
2. **"Look at Alert #1042 — Robert Chen. Our system has automatically correlated a traditional transaction alert with a government cyber fraud ticket filed 15 minutes ago, combined with a shared device fingerprint."**
3. **"By visualizing the transaction graph, we can trace exactly how the funds flow from the victim, through intermediaries, into the mule hub, and out to the crypto exchange."**
4. **"To prevent the circulation of these proceeds, we execute the Freeze Protocol, locking the entire path instantly."**
5. **"Finally, Gemini synthesizes the cross-channel data and regulatory feeds to auto-draft the Suspicious Activity Report (SAR) narrative."**
