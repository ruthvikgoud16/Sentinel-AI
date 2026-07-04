import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { response: "Error: Gemini API Key is missing. Please add GEMINI_API_KEY to your `.env.local` file to enable AI Copilot features." },
        { status: 500 }
      );
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
      { status: 500 }
    );
  }
}
