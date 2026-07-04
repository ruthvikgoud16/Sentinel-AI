import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { accountId, ruleScore } = await req.json();

    try {
      const response = await fetch('http://127.0.0.1:8000/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_id: accountId,
          rule_score: Number(ruleScore)
        })
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          anomaly_score: data.anomaly_score,
          mule_probability: data.mule_probability,
          combined_ml_score: data.combined_ml_score,
          isMock: false
        });
      }
    } catch (apiErr) {
      console.warn("FastAPI ML service offline. Using Next.js fallback scorer.", apiErr);
    }

    // Next.js Fallback Scorer (if FastAPI is offline/not running yet)
    // Correlates with the rule based score to provide realistic side-by-side figures
    const val = Number(ruleScore);
    const hash = accountId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    
    // Variance parameters
    const variance = (hash % 7) - 3; // range -3 to +3
    const anomaly_var = (hash % 11) - 6; // range -6 to +4
    const gnn_var = (hash % 5) - 2; // range -2 to +2
    
    const combined_ml_score = Math.max(0, Math.min(100, val + variance));
    const anomaly_score = Math.max(0, Math.min(100, val + anomaly_var));
    const mule_probability = Math.max(0, Math.min(100, val + gnn_var));

    return NextResponse.json({
      anomaly_score,
      mule_probability,
      combined_ml_score,
      isMock: true
    });
  } catch (error: any) {
    console.error("ML score route error:", error);
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }
}
