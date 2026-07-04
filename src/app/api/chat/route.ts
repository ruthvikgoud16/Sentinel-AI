import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const mockReply = generateMockAiResponse(prompt, context);
      return NextResponse.json({ response: mockReply });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format the network context for the LLM
    const contextString = `
You are a highly skilled AML (Anti-Money Laundering) Fraud Investigator and forensic analyst.
Below is the structured context of a suspected Money Mule Network case under investigation:

Target Subject: ${context.targetAccount}

Graph Nodes (Entities):
${JSON.stringify(context.graphNodes, null, 2)}

Transaction Timeline Ledger (Chronological Events):
${JSON.stringify(context.timelineEvents, null, 2)}
`;

    const systemInstruction = `
Use the context provided above to answer the investigator's question.
If the investigator asks to "Analyze Case" or "Analyze Alert", examine the ledger timeline and graph structure to highlight:
1. **Flow Velocity & Layering:** Analyze if money comes in and is immediately layered out to other nodes.
2. **Correlation Flags:** Look for shared device IDs or IPs between nodes.
3. **External Signals:** Cross-reference official NCIB/government cybercrime notices.
Provide clear evidence, highlight risk factors, and make a decision recommendation (e.g., Freeze).

If the investigator asks to "Draft SAR Narrative", generate a formal regulatory Suspicious Activity Report (SAR) narrative detailing:
- The Subject's details
- Chronological flow of funds (amounts, channels, dates)
- The suspicious anomalies (velocity, device matches, cyber alerts)
- Summary recommendation.

Keep all responses in clean, structured markdown with bullet points. Be concise and professional.
`;

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: contextString + "\n\nInvestigator Prompt: " + prompt + "\n\nInstructions: " + systemInstruction }] }
      ]
    });

    const responseText = result.response.text();
    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { response: `Error generating content: ${error.message || error}` },
      { status: 550 }
    );
  }
}

function generateMockAiResponse(prompt: string, context: any): string {
  const isSar = prompt.toLowerCase().includes('sar') || prompt.toLowerCase().includes('suspicious activity report') || prompt.toLowerCase().includes('draft');
  const target = context.targetAccount || "";

  if (target.includes("Robert Chen")) {
    if (isSar) {
      return `### Suspicious Activity Report (SAR) Narrative
- **Filer:** Sentinel Security Inc.
- **Subject:** Robert Chen (Mule Hub, Account: acc-9981)
- **Activity Summary:** High-speed layering ring matching romance scam profiles.
- **Chronology of Fund Flows:**
  * Alice Smith (Victim) transferred **$9,500** via Zelle to Intermediary 1.
  * Intermediary 1 transferred **$9,450** via ACH to Robert Chen.
  * Robert Chen wired **$9,400** to CryptoExchange LLC.
- **Identified Anomalies:**
  * *Rapid Outbound Velocity:* Funds held for under 2 minutes at each step.
  * *Device Fingerprint Match:* Intermediary 1 and Robert Chen shared device ID \`dev-android-82\`.
  * *Government Alert:* Victim Alice Smith reported a Romance Scam to NCIB.
- **Filing Recommendation:** Freeze Robert Chen's account and report to FinCEN.`;
    }
    return `### AI Case Analysis: Robert Chen (Mule Hub)
- **Threat Vector:** Romance Scam Money Mule Ring
- **Key Findings:**
  * **Fund Layering Velocity:** Alice Smith's Zelle deposit of $9,500 was layered through Intermediary 1 and wired to CryptoExchange LLC within **3 minutes**.
  * **Shared Device Overlap:** Intermediary 1 and Robert Chen accessed mobile banking from identical device: \`dev-android-82\`.
  * **Cyber Tip Alert:** Matches NCIB report ticket filed by Alice Smith's bank.
- **Decision Recommendation:** **CRITICAL RISK.** Recommend immediate account freeze and network suspension.`;
  }

  if (target.includes("Sarah Jenkins")) {
    if (isSar) {
      return `### Suspicious Activity Report (SAR) Narrative
- **Filer:** Sentinel Security Inc.
- **Subject:** Sarah Jenkins (Target, Account: acc-2088)
- **Activity Summary:** High-frequency Zelle layering.
- **Chronology of Fund Flows:**
  * Mark Davis (Victim) sent **$4,800** Zelle deposit to Sarah Jenkins.
  * Sarah Jenkins sent **$4,750** ACH to Carlos Martinez.
  * Carlos Martinez wired **$4,700** to Venmo Cashout Portal.
- **Identified Anomalies:**
  * *Immediate Holding Clearance:* Turnaround time under 90 seconds.
- **Filing Recommendation:** Alert filed; account flagged.`;
    }
    return `### AI Case Analysis: Sarah Jenkins
- **Threat Vector:** High-Velocity Zelle Layering
- **Key Findings:**
  * **Rapid Turnaround:** Mark Davis sent $4,800 Zelle deposit, which was cleared out via ACH to Carlos Martinez in **90 seconds**.
  * **Layering Sequence:** Carlos Martinez wired $4,700 to Venmo Cashout Portal shortly after.
- **Decision Recommendation:** **HIGH RISK.** Recommend freezing target account Sarah Jenkins.`;
  }

  if (target.includes("David Cho")) {
    if (isSar) {
      return `### Suspicious Activity Report (SAR) Narrative
- **Filer:** Sentinel Security Inc.
- **Subject:** David Cho (Target, Account: acc-3012)
- **Activity Summary:** Device Collision Fraud Ring.
- **Chronology of Fund Flows:**
  * Amy Wu transferred **$3,200** Zelle to David Cho.
  * Frank Lin transferred **$3,400** Zelle to David Cho.
  * David Cho wired **$6,500** consolidated funds to Binance Wallet.
- **Identified Anomalies:**
  * *Device Collision:* David Cho, Amy Wu, and Frank Lin shared mobile hardware binding \`dev-xiaomi-77\`.
- **Filing Recommendation:** Account reported.`;
    }
    return `### AI Case Analysis: David Cho
- **Threat Vector:** Device Collision Ring
- **Key Findings:**
  * **Mobile Hardware Overlap:** David Cho, Frank Lin, and Amy Wu accessed the bank app using device ID \`dev-xiaomi-77\`.
  * **Consolidation Trace:** David Cho merged inbound Zelle transfers of $3,200 and $3,400 into a single $6,500 wire cashout to Binance.
- **Decision Recommendation:** **HIGH RISK.** Suspend target account and request secondary verification on hardware bindings.`;
  }

  return `### AI Case Analysis
- **Case Subject:** ${target}
- **Anomalies Identified:** Multiple velocity spikes.
- **Recommendation:** Please investigate node links.`;
}
