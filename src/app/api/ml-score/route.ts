import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

let precomputedScores: Record<string, { anomaly_score: number; mule_probability: number; combined_ml_score: number }> | null = null;

function getPrecomputedScores(): Record<string, { anomaly_score: number; mule_probability: number; combined_ml_score: number }> | null {
  if (precomputedScores) {
    return precomputedScores;
  }
  try {
    const filePath = path.join(process.cwd(), 'src/lib/precomputed_scores.json');
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      precomputedScores = JSON.parse(fileContent);
    }
  } catch (err) {
    console.error("Failed to read precomputed scores:", err);
  }
  return precomputedScores;
}

export async function POST(req: Request) {
  try {
    const { accountId, ruleScore } = await req.json();

    // 1. Try FastAPI ML Service (Local Development)
    try {
      const response = await fetch('http://127.0.0.1:8000/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_id: accountId,
          rule_score: Number(ruleScore)
        }),
        signal: AbortSignal.timeout(150) // Fast timeout for Vercel production
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
      // Local FastAPI service offline (expected on Vercel deployment)
    }

    // 2. Try Pre-computed Scores from the GraphSAGE / Isolation Forest run
    const scores = getPrecomputedScores();
    if (scores && scores[accountId]) {
      const data = scores[accountId];
      return NextResponse.json({
        anomaly_score: data.anomaly_score,
        mule_probability: data.mule_probability,
        combined_ml_score: data.combined_ml_score,
        isMock: false // These are actual real ML model scores generated during training!
      });
    }

    // 3. Next.js Fallback Scorer (dynamic cases/new user inputs not in dataset)
    const val = Number(ruleScore);
    const hash = accountId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    
    const variance = (hash % 7) - 3; // range -3 to +3
    const anomaly_var = (hash % 11) - 6; // range -6 to +4
    const gnn_var = (hash % 5) - 2; // range -2 to +2
    
    const mule_probability = Math.max(0, Math.min(100, val + gnn_var));
    const combined_ml_score = mule_probability;
    const anomaly_score = Math.max(0, Math.min(100, val + anomaly_var));

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

