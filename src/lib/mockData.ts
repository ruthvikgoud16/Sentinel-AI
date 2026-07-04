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

// Scenario 1: Romance Scam Ring (Robert Chen)
export const ROMANCE_SCAM_SCENARIO: DemoScenario = {
  alert: {
    id: "alert-1042",
    targetAccountId: "acc-9981",
    customerName: "Robert Chen",
    riskScore: 94,
    severity: "CRITICAL",
    type: "ROMANCE_SCAM_MULE",
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

// Scenario 2: Rapid Layering (Sarah Jenkins)
export const RAPID_LAYERING_SCENARIO: DemoScenario = {
  alert: {
    id: "alert-2088",
    targetAccountId: "acc-2088",
    customerName: "Sarah Jenkins",
    riskScore: 78,
    severity: "HIGH",
    type: "RAPID_LAYERING",
    status: "OPEN",
    description: "Account processes high-value transfers in rapid sequence with under 2-minute holding times.",
    createdAt: "2026-07-04T13:10:00Z"
  },
  graph: {
    nodes: [
      { id: "acc-1029", label: "Mark Davis (Victim)", type: "victim", status: "ACTIVE", deviceFingerprint: "dev-macbook-11", ipAddress: "68.21.90.10" },
      { id: "acc-2088", label: "Sarah Jenkins (Target)", type: "target", status: "ACTIVE", deviceFingerprint: "dev-iphone-14", ipAddress: "192.0.2.45" },
      { id: "acc-3021", label: "Carlos Martinez (Mule)", type: "intermediary", status: "ACTIVE", deviceFingerprint: "dev-tablet-5", ipAddress: "198.51.100.99" },
      { id: "acc-4011", label: "Venmo Cashout Portal", type: "cash_out", status: "ACTIVE", deviceFingerprint: "dev-app-server", ipAddress: "203.0.113.11" }
    ],
    edges: [
      { id: "tx-4", from: "acc-1029", to: "acc-2088", label: "$4,800", amount: 4800, channel: "ZELLE", timestamp: "2026-07-04T13:00:00Z" },
      { id: "tx-5", from: "acc-2088", to: "acc-3021", label: "$4,750", amount: 4750, channel: "ACH", timestamp: "2026-07-04T13:01:30Z" },
      { id: "tx-6", from: "acc-3021", to: "acc-4011", label: "$4,700", amount: 4700, channel: "WIRE", timestamp: "2026-07-04T13:03:00Z" }
    ]
  },
  timeline: [
    { id: "t-6", timestamp: "2026-07-04T13:00:00Z", type: "transaction", title: "Zelle Deposit Recieved", description: "Mark Davis deposited $4,800 via Zelle into Sarah Jenkins checking.", amount: 4800 },
    { id: "t-7", timestamp: "2026-07-04T13:01:30Z", type: "transaction", title: "Immediate Outbound ACH", description: "Sarah Jenkins wired $4,750 to Carlos Martinez.", amount: 4750 },
    { id: "t-8", timestamp: "2026-07-04T13:03:00Z", type: "transaction", title: "Crypto Broker Cashout", description: "Carlos Martinez transferred $4,700 via Wire to Venmo Cashout Portal.", amount: 4700 }
  ]
};

// Scenario 3: Device Collision (David Cho)
export const DEVICE_COLLISION_SCENARIO: DemoScenario = {
  alert: {
    id: "alert-3012",
    targetAccountId: "acc-3012",
    customerName: "David Cho",
    riskScore: 82,
    severity: "HIGH",
    type: "DEVICE_COLLISION",
    status: "OPEN",
    description: "Account accesses mobile banking app using xiaomi device fingerprint linked to 5 other fraud targets.",
    createdAt: "2026-07-04T14:45:00Z"
  },
  graph: {
    nodes: [
      { id: "acc-3012", label: "David Cho (Target)", type: "target", status: "ACTIVE", deviceFingerprint: "dev-xiaomi-77", ipAddress: "198.51.100.22" },
      { id: "acc-4402", label: "Amy Wu (Co-Suspect)", type: "intermediary", status: "ACTIVE", deviceFingerprint: "dev-xiaomi-77", ipAddress: "198.51.100.22" },
      { id: "acc-5112", label: "Frank Lin (Co-Suspect)", type: "intermediary", status: "ACTIVE", deviceFingerprint: "dev-xiaomi-77", ipAddress: "198.51.100.22" },
      { id: "acc-9000", label: "Binance Wallet Gateway", type: "cash_out", status: "ACTIVE", deviceFingerprint: "dev-wallet-srv", ipAddress: "203.0.113.55" }
    ],
    edges: [
      { id: "tx-7", from: "acc-4402", to: "acc-3012", label: "$3,200", amount: 3200, channel: "ZELLE", timestamp: "2026-07-04T14:30:00Z" },
      { id: "tx-8", from: "acc-5112", to: "acc-3012", label: "$3,400", amount: 3400, channel: "ZELLE", timestamp: "2026-07-04T14:31:00Z" },
      { id: "tx-9", from: "acc-3012", to: "acc-9000", label: "$6,500", amount: 6500, channel: "WIRE", timestamp: "2026-07-04T14:33:00Z" }
    ]
  },
  timeline: [
    { id: "t-9", timestamp: "2026-07-04T14:28:00Z", type: "device_swap", title: "Xiaomi Device Binding Match", description: "David Cho, Amy Wu, and Frank Lin sessions all originated on hardware ID: dev-xiaomi-77" },
    { id: "t-10", timestamp: "2026-07-04T14:30:00Z", type: "transaction", title: "Co-Suspect Inbound 1", description: "Amy Wu sent $3,200 Zelle to David Cho.", amount: 3200 },
    { id: "t-11", timestamp: "2026-07-04T14:31:00Z", type: "transaction", title: "Co-Suspect Inbound 2", description: "Frank Lin sent $3,400 Zelle to David Cho.", amount: 3400 },
    { id: "t-12", timestamp: "2026-07-04T14:33:00Z", type: "transaction", title: "Consolidated Crypto Cashout", description: "David Cho wired $6,500 to Binance Wallet Gateway.", amount: 6500 }
  ]
};

export const SCENARIOS: Record<string, DemoScenario> = {
  "alert-1042": ROMANCE_SCAM_SCENARIO,
  "alert-2088": RAPID_LAYERING_SCENARIO,
  "alert-3012": DEVICE_COLLISION_SCENARIO
};

export const ALERTS_LIST: Alert[] = [
  ROMANCE_SCAM_SCENARIO.alert,
  RAPID_LAYERING_SCENARIO.alert,
  DEVICE_COLLISION_SCENARIO.alert
];
