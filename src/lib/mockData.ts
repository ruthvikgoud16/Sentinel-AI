export interface Alert {
  id: string;
  targetAccountId: string;
  customerName: string;
  riskScore: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED_FROZEN';
  description: string;
  createdAt: string;
}

export interface Node {
  id: string;
  label: string;
  type: 'victim' | 'intermediary' | 'target' | 'cash_out';
  status: 'ACTIVE' | 'FROZEN';
  deviceFingerprint: string;
  ipAddress: string;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  label: string;
  amount: number;
  channel: 'ZELLE' | 'ACH' | 'WIRE';
  timestamp: string;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'transaction' | 'cyber_tip' | 'device_swap';
  title: string;
  description: string;
  amount?: number;
}

export interface DemoScenario {
  alert: Alert;
  graph: GraphData;
  timeline: TimelineEvent[];
}

export const ROMANCE_SCAM_SCENARIO: DemoScenario = {
  alert: {
    id: "alert-1042",
    targetAccountId: "acc-9981",
    customerName: "Robert Chen",
    riskScore: 94,
    severity: "CRITICAL",
    type: "MULE_NETWORK_DETECTION",
    status: "OPEN",
    description: "Account accessed from same device fingerprint as 3 other accounts flagged for rapid outbound transactions.",
    createdAt: "2026-07-04T12:00:00Z"
  },
  graph: {
    nodes: [
      { id: "acc-5541", label: "Alice Smith (Victim)", type: "victim", status: "ACTIVE", deviceFingerprint: "dev-iphone-99", ipAddress: "172.56.21.9" },
      { id: "acc-1102", label: "Intermediary 1 (Mule)", type: "intermediary", status: "ACTIVE", deviceFingerprint: "dev-android-82", ipAddress: "198.51.100.12" },
      { id: "acc-9981", label: "Robert Chen (Mule Hub)", type: "target", status: "ACTIVE", deviceFingerprint: "dev-android-82", ipAddress: "198.51.100.15" },
      { id: "acc-7712", label: "CryptoExchange LLC", type: "cash_out", status: "ACTIVE", deviceFingerprint: "dev-web-server", ipAddress: "203.0.113.88" }
    ],
    edges: [
      { id: "tx-1", from: "acc-5541", to: "acc-1102", label: "$9,500", amount: 9500, channel: "ZELLE", timestamp: "2026-07-04T11:45:00Z" },
      { id: "tx-2", from: "acc-1102", to: "acc-9981", label: "$9,450", amount: 9450, channel: "ACH", timestamp: "2026-07-04T11:46:00Z" },
      { id: "tx-3", from: "acc-9981", to: "acc-7712", label: "$9,400", amount: 9400, channel: "WIRE", timestamp: "2026-07-04T11:48:00Z" }
    ]
  },
  timeline: [
    { id: "t-1", timestamp: "2026-07-04T11:45:00Z", type: "transaction", title: "Inbound Zelle Transfer", description: "Alice Smith sent $9,500 to Intermediary 1", amount: 9500 },
    { id: "t-2", timestamp: "2026-07-04T11:45:45Z", type: "device_swap", title: "Device IP Correlation", description: "Intermediary 1 and Mule Hub both accessed from device ID: dev-android-82" },
    { id: "t-3", timestamp: "2026-07-04T11:46:00Z", type: "transaction", title: "Immediate ACH Layering", description: "Intermediary 1 sent $9,450 to Robert Chen", amount: 9450 },
    { id: "t-4", timestamp: "2026-07-04T11:47:15Z", type: "cyber_tip", title: "Government Fraud Notification", description: "NCIB cyber fraud ticket filed: Victim reported scam Zelle transfer tx-1" },
    { id: "t-5", timestamp: "2026-07-04T11:48:00Z", type: "transaction", title: "Crypto Outbound Cash-out", description: "Robert Chen wired $9,400 to CryptoExchange LLC", amount: 9400 }
  ]
};
