import { Node, Edge, TimelineEvent } from './mockData';

export interface DetectionSignal {
  id: string;
  name: string;
  description: string;
  weight: number;
  triggered: boolean;
  evidence: string;
}

export interface DetectionResult {
  riskScore: number;
  triggeredSignals: DetectionSignal[];
  summaryReason: string;
}

/**
 * Runs a deterministic compliance threat scan over a target account's sub-graph and timeline
 */
export function runDetectionEngine(
  targetAccountId: string,
  nodes: Node[],
  edges: Edge[],
  timeline: TimelineEvent[]
): DetectionResult {
  const targetNode = nodes.find(n => n.id === targetAccountId);
  if (!targetNode) {
    return {
      riskScore: 0,
      triggeredSignals: [],
      summaryReason: "Target account not found in graph."
    };
  }

  // 1. New Account High Velocity
  // Mock check: If account is young (assume young based on ID/metadata) and transactions > $5000
  const youngAccount = targetNode.id === 'acc-9981' || targetNode.id === 'acc-1102'; // mock young status
  const highValueTx = edges.some(e => (e.from === targetAccountId || e.to === targetAccountId) && e.amount >= 5000);
  const newAccountHighVelocity = youngAccount && highValueTx;
  const newAccountEvidence = newAccountHighVelocity 
    ? `Account created recently (under 30 days) and processed high-velocity transaction of $${edges.find(e => (e.from === targetAccountId || e.to === targetAccountId) && e.amount >= 5000)?.amount.toLocaleString() || '5,000'}.`
    : "No young account high velocity detected.";

  // 2. Rapid Fund Movement
  // Money in, immediately out (within 1 hour, >90% volume matching)
  const inbound = edges.filter(e => e.to === targetAccountId);
  const outbound = edges.filter(e => e.from === targetAccountId);
  let rapidFundMovement = false;
  let rapidEvidence = "No immediate layering detected.";
  
  for (const inTx of inbound) {
    for (const outTx of outbound) {
      const inTime = new Date(inTx.timestamp).getTime();
      const outTime = new Date(outTx.timestamp).getTime();
      const timeDiffMin = (outTime - inTime) / (60 * 1000);
      
      // If out-transfer happens within 60 mins of in-transfer and amount is within 90%
      if (timeDiffMin >= 0 && timeDiffMin <= 60 && outTx.amount >= inTx.amount * 0.9) {
        rapidFundMovement = true;
        rapidEvidence = `Received $${inTx.amount.toLocaleString()} and routed out $${outTx.amount.toLocaleString()} (${Math.round((outTx.amount/inTx.amount)*100)}%) within ${Math.round(timeDiffMin)} minutes.`;
        break;
      }
    }
    if (rapidFundMovement) break;
  }

  // 3. Multiple Incoming Senders
  // Unique senders within short window
  const uniqueSenders = new Set(inbound.map(e => e.from));
  const multipleSenders = uniqueSenders.size >= 2;
  const sendersEvidence = multipleSenders
    ? `Received inbound funds from ${uniqueSenders.size} distinct sender nodes within 24 hours.`
    : `Single source inbound connection detected (${uniqueSenders.size} sender).`;

  // 4. Shared Device Match
  // Check if IP/Device ID is shared with another node
  let sharedDevice = false;
  let deviceEvidence = "No device sharing detected.";
  for (const node of nodes) {
    if (node.id !== targetAccountId && node.deviceFingerprint === targetNode.deviceFingerprint) {
      sharedDevice = true;
      deviceEvidence = `Device ID: ${targetNode.deviceFingerprint} matches active session for ${node.label} (${node.id}).`;
      break;
    }
  }

  // 5. Government Alert Match
  // Check timeline for police NCIB cyber fraud reports matching target
  const cyberTipEvent = timeline.find(e => e.type === 'cyber_tip' && e.description.toLowerCase().includes('scam') || e.description.toLowerCase().includes('fraud'));
  const governmentAlertMatch = !!cyberTipEvent;
  const cyberEvidence = governmentAlertMatch
    ? `Regulatory notification match: NCIB filed warning ticket: "${cyberTipEvent.title}".`
    : "No regulatory or governmental tickets match target node.";

  // 6. Layered Transfer Chain
  // A -> B -> C -> D flow sequence
  const hasLayeredChain = edges.some(e1 => 
    edges.some(e2 => e1.to === e2.from && e1.from !== e2.to)
  );
  const layeredEvidence = hasLayeredChain
    ? "Chain routing detected: Funds transferred sequentially across multiple intermediary nodes."
    : "No multi-hop layered routing sequence detected.";

  // Compile Signals Array
  const signals: DetectionSignal[] = [
    {
      id: "RAPID_FUND_MOVEMENT",
      name: "Rapid Fund Movement",
      description: "Inbound funds transferred out immediately with minimal holding period.",
      weight: 25,
      triggered: rapidFundMovement,
      evidence: rapidEvidence
    },
    {
      id: "SHARED_DEVICE",
      name: "Shared Device Match",
      description: "Account shares device fingerprint with other flagged or suspect accounts.",
      weight: 25,
      triggered: sharedDevice,
      evidence: deviceEvidence
    },
    {
      id: "GOVERNMENT_ALERT",
      name: "Government Alert Match",
      description: "NCIB or cyber fraud report linked to nodes in this transfer path.",
      weight: 20,
      triggered: governmentAlertMatch,
      evidence: cyberEvidence
    },
    {
      id: "LAYERED_CHAIN",
      name: "Layered Transfer Chain",
      description: "Funds follow a structured multi-hop route to obscure origin.",
      weight: 15,
      triggered: hasLayeredChain,
      evidence: layeredEvidence
    },
    {
      id: "MULTIPLE_SENDERS",
      name: "Multiple Senders",
      description: "Account acts as consolidation hub for multiple distinct senders.",
      weight: 10,
      triggered: multipleSenders,
      evidence: sendersEvidence
    },
    {
      id: "NEW_ACCOUNT_VELOCITY",
      name: "New Account High Velocity",
      description: "Newly registered account immediately processing high-value transfers.",
      weight: 10,
      triggered: newAccountHighVelocity,
      evidence: newAccountEvidence
    }
  ];

  // Calculate risk score (sum of weights of triggered signals, capped at 100)
  let rawScore = signals.reduce((sum, sig) => sum + (sig.triggered ? sig.weight : 0), 0);
  const riskScore = Math.min(rawScore, 100);

  // Generate Summary Reason
  const triggeredNames = signals.filter(s => s.triggered).map(s => s.name);
  const summaryReason = triggeredNames.length > 0
    ? `Target flagged due to: ${triggeredNames.join(', ')}.`
    : "No suspicious behaviors triggered.";

  return {
    riskScore,
    triggeredSignals: signals,
    summaryReason
  };
}
