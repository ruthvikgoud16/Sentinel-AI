'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Play, 
  Lock, 
  CheckCircle, 
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Cpu,
  User,
  Smartphone,
  Globe,
  Database,
  FileText,
  MessageSquare,
  Clock,
  Radio,
  FileCheck2,
  ListFilter,
  ArrowRight,
  Unlock,
  RotateCcw
} from 'lucide-react';
import { SCENARIOS, ALERTS_LIST, DemoScenario, Alert, ROMANCE_SCAM_SCENARIO } from '@/lib/mockData';
import MoneyFlowGraph from '@/components/MoneyFlowGraph';
import { runDetectionEngine } from '@/lib/detectionEngine';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const CountUp = ({ end, duration = 800, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrame: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return <>{count}{suffix}</>;
};

export default function Dashboard() {
  const router = useRouter();
  // Stepper State
  const [activeStep, setActiveStep] = useState<number>(1);
  
  // Auth User State
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getSessionUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Failed to get session:', err);
      }
    };
    getSessionUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Current Triage State
  const [selectedAlertId, setSelectedAlertId] = useState<string>("alert-1042");
  const [scenario, setScenario] = useState<DemoScenario>(ROMANCE_SCAM_SCENARIO);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Per-Alert states to allow independent sandbox flows
  const [frozenAlerts, setFrozenAlerts] = useState<Record<string, boolean>>({
    "alert-1042": false,
    "alert-2088": false,
    "alert-3012": false
  });
  
  const [chatHistories, setChatHistories] = useState<Record<string, Array<{ role: 'user' | 'model'; content: string }>>>({
    "alert-1042": [],
    "alert-2088": [],
    "alert-3012": []
  });

  const [sarNarratives, setSarNarratives] = useState<Record<string, string>>({
    "alert-1042": "",
    "alert-2088": "",
    "alert-3012": ""
  });

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [sarSubmitted, setSarSubmitted] = useState<Record<string, boolean>>({
    "alert-1042": false,
    "alert-2088": false,
    "alert-3012": false
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  const [mlScoreData, setMlScoreData] = useState<{
    anomaly_score: number;
    mule_probability: number;
    combined_ml_score: number;
    isMock?: boolean;
  } | null>(null);
  const [isLoadingMlScore, setIsLoadingMlScore] = useState<boolean>(false);
  const [mlLoadingStage, setMlLoadingStage] = useState<string>('');

  // ----------------------------------------------------
  // AUTO-PLAY DEMO ENGINE (3-Minute Judging Sequence)
  // ----------------------------------------------------
  const [isAutoDemo, setIsAutoDemo] = useState<boolean>(false);
  const [autoDemoIndex, setAutoDemoIndex] = useState<number>(0);
  const [autoDemoTimer, setAutoDemoTimer] = useState<NodeJS.Timeout | null>(null);

  const AUTO_DEMO_STEPS = [
    {
      step: 1,
      alertId: "alert-1042",
      log: "Loading Suspected Mule Hub Alert #1042...",
      action: () => {}
    },
    {
      step: 1,
      alertId: "alert-1042",
      log: "Running GraphSAGE GNN ML model inference...",
      action: async () => {
        // Trigger ML Score fetching
        await fetchMlScores("alert-1042", 94);
      }
    },
    {
      step: 2,
      alertId: "alert-1042",
      log: "Transitioning to Step 2: Visualizing Money Flow topology graph...",
      action: () => {
        setActiveStep(2);
      }
    },
    {
      step: 2,
      alertId: "alert-1042",
      log: "Inspecting Target Node 'Robert Chen' fingerprint signals...",
      action: () => {
        setSelectedNodeId("node-robert-chen");
      }
    },
    {
      step: 3,
      alertId: "alert-1042",
      log: "Transitioning to Step 3: Triggering Gemini Forensic Copilot...",
      action: () => {
        setActiveStep(3);
        setSelectedNodeId(null);
      }
    },
    {
      step: 3,
      alertId: "alert-1042",
      log: "Gemini: Analyzing multi-hop fund flows & layering structures...",
      action: () => {
        callChatApi("Analyze this critical alert and highlight the main risk factors.");
      }
    },
    {
      step: 4,
      alertId: "alert-1042",
      log: "Transitioning to Step 4: Compliance Mitigation Panel...",
      action: () => {
        setActiveStep(4);
      }
    },
    {
      step: 4,
      alertId: "alert-1042",
      log: "Executing Freeze isolation script across the mule network...",
      action: () => {
        handleFreeze();
      }
    },
    {
      step: 5,
      alertId: "alert-1042",
      log: "Transitioning to Step 5: Preparing Suspicious Activity Report (SAR)...",
      action: () => {
        setActiveStep(5);
      }
    },
    {
      step: 5,
      alertId: "alert-1042",
      log: "Auto-generating FinCEN Form 111 narrative using Gemini analysis...",
      action: () => {
        // Prepopulate narrative
        setSarNarratives(prev => ({
          ...prev,
          "alert-1042": `### Suspicious Activity Report (SAR) Narrative
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
- **Filing Recommendation:** Freeze Robert Chen's account and report to FinCEN.`
        }));
      }
    },
    {
      step: 5,
      alertId: "alert-1042",
      log: "Filing SAR directly to FinCEN Gateway...",
      action: () => {
        handleSubmitSar();
      }
    }
  ];

  const handleStartAutoDemo = () => {
    setIsAutoDemo(true);
    setAutoDemoIndex(0);
    executeDemoStep(0);
  };

  const handleNextAutoDemo = () => {
    if (autoDemoTimer) clearTimeout(autoDemoTimer);
    const nextIdx = autoDemoIndex + 1;
    if (nextIdx < AUTO_DEMO_STEPS.length) {
      setAutoDemoIndex(nextIdx);
      executeDemoStep(nextIdx);
    } else {
      handleExitAutoDemo();
    }
  };

  const handleExitAutoDemo = () => {
    setIsAutoDemo(false);
    if (autoDemoTimer) clearTimeout(autoDemoTimer);
    setAutoDemoTimer(null);
  };

  const executeDemoStep = (index: number) => {
    const actionStep = AUTO_DEMO_STEPS[index];
    if (!actionStep) return;

    if (actionStep.alertId !== selectedAlertId) {
      handleAlertSelect(actionStep.alertId);
    }

    actionStep.action();

    // Auto-progress timer (8 seconds per stage)
    const timer = setTimeout(() => {
      const nextIdx = index + 1;
      if (nextIdx < AUTO_DEMO_STEPS.length) {
        setAutoDemoIndex(nextIdx);
        executeDemoStep(nextIdx);
      } else {
        handleExitAutoDemo();
      }
    }, 8500);

    setAutoDemoTimer(timer);
  };

  useEffect(() => {
    return () => {
      if (autoDemoTimer) clearTimeout(autoDemoTimer);
    };
  }, [autoDemoTimer]);

  // Current scenario metrics
  const currentAlert = ALERTS_LIST.find(a => a.id === selectedAlertId) || ALERTS_LIST[0];
  const detectionResult = runDetectionEngine(scenario.alert.targetAccountId, scenario.graph.nodes, scenario.graph.edges, scenario.timeline);
  const isFrozen = frozenAlerts[selectedAlertId];
  const chatMessages = chatHistories[selectedAlertId];
  const sarNarrativeValue = sarNarratives[selectedAlertId];

  // Fetch ML Score from Next API Route
  const fetchMlScores = async (alertId: string, ruleScore: number) => {
    setIsLoadingMlScore(true);
    setMlLoadingStage('Inference...');
    try {
      const res = await fetch('/api/ml-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: alertId, ruleScore })
      });
      const data = await res.json();
      setMlScoreData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMlScore(false);
      setMlLoadingStage('');
    }
  };

  // Trigger telemetry scoring when alert changes
  useEffect(() => {
    if (currentAlert) {
      fetchMlScores(currentAlert.id, currentAlert.riskScore);
    }
  }, [selectedAlertId]);

  // Handles alert selection
  const handleAlertSelect = (id: string) => {
    setSelectedAlertId(id);
    setSelectedNodeId(null);
    
    // Load related mock dataset
    const matchedScenario = SCENARIOS[id];
    if (matchedScenario) {
      setScenario(JSON.parse(JSON.stringify(matchedScenario)));
    }
  };

  // Execute Freeze mitigation Action
  const handleFreeze = () => {
    setFrozenAlerts(prev => ({ ...prev, [selectedAlertId]: true }));
    
    // Inject mitigation event into chat log
    const updatedHistory = [
      ...chatMessages,
      { role: 'model' as const, content: `### Mitigation Executed\n- **Target Account (${currentAlert.customerName}):** Frozen\n- **Flag Status:** Reported to NCIB database\n- **Graph Visuals:** Suspended entities highlighted in crimson.` }
    ];
    setChatHistories(prev => ({ ...prev, [selectedAlertId]: updatedHistory }));

    // Inject event card into timeline
    const freezeEvent = {
      id: `t-freeze-${selectedAlertId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'cyber_tip' as const,
      title: "Mitigation Active: Account Frozen",
      description: `Compliance action executed by investigator. Target account ${currentAlert.customerName} isolated.`
    };
    
    setScenario(prev => ({
      ...prev,
      timeline: [...prev.timeline, freezeEvent]
    }));
  };

  // Call Gemini API Route
  const callChatApi = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;
    setIsAnalyzing(true);
    
    const updatedHistory = [...chatMessages, { role: 'user' as const, content: userPrompt }];
    setChatHistories(prev => ({ ...prev, [selectedAlertId]: updatedHistory }));
    setChatInput('');

    try {
      const context = {
        targetAccount: `${scenario.alert.customerName} (acc-${scenario.alert.targetAccountId})`,
        graphNodes: scenario.graph.nodes.map(n => ({ id: n.id, label: n.label, type: n.type, ip: n.ipAddress, device: n.deviceFingerprint })),
        timelineEvents: scenario.timeline.map(t => `${t.timestamp}: ${t.title} - ${t.description}`)
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: userPrompt,
          context: context
        })
      });

      const data = await response.json();
      const reply = data.response || "No response received.";
      
      setChatHistories(prev => ({
        ...prev,
        [selectedAlertId]: [...updatedHistory, { role: 'model', content: reply }]
      }));

      // If the investigator requested a SAR, auto-populate the SAR Narrative form
      if (userPrompt.toLowerCase().includes('sar') || userPrompt.toLowerCase().includes('suspicious activity report')) {
        setSarNarratives(prev => ({ ...prev, [selectedAlertId]: reply }));
      }
    } catch (err: any) {
      console.error(err);
      setChatHistories(prev => ({
        ...prev,
        [selectedAlertId]: [...updatedHistory, { role: 'model', content: `Error communicating with Gemini: ${err.message || err}` }]
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  const handleSubmitSar = () => {
    setSarSubmitted(prev => ({ ...prev, [selectedAlertId]: true }));
  };

  const handleReset = () => {
    setFrozenAlerts(prev => ({ ...prev, [selectedAlertId]: false }));
    setSarSubmitted(prev => ({ ...prev, [selectedAlertId]: false }));
    setSarNarratives(prev => ({ ...prev, [selectedAlertId]: "" }));
    setChatHistories(prev => ({ ...prev, [selectedAlertId]: [] }));
    
    const originalScenario = SCENARIOS[selectedAlertId];
    if (originalScenario) {
      setScenario(JSON.parse(JSON.stringify(originalScenario)));
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 90) return { 
      text: '#EF4444', 
      bg: 'rgba(239, 68, 68, 0.15)', 
      border: 'rgba(239, 68, 68, 0.3)',
      textTailwind: 'text-red-500',
      label: 'CRITICAL' 
    };
    if (score >= 70) return { 
      text: '#F59E0B', 
      bg: 'rgba(245, 158, 11, 0.15)', 
      border: 'rgba(245, 158, 11, 0.3)',
      textTailwind: 'text-amber-500',
      label: 'HIGH RISK' 
    };
    return { 
      text: '#3B82F6', 
      bg: 'rgba(59, 130, 246, 0.15)', 
      border: 'rgba(59, 130, 246, 0.3)',
      textTailwind: 'text-blue-500',
      label: 'EVALUATION' 
    };
  };

  const filteredAlerts = ALERTS_LIST.filter(alert => 
    alert.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const steps = [
    { number: 1, name: 'Triage Alerts' },
    { number: 2, name: 'Trace Network' },
    { number: 3, name: 'Gemini Forensics' },
    { number: 4, name: 'Isolate & Lock' },
    { number: 5, name: 'File Case' }
  ];

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#09090B] text-white font-sans antialiased relative dark-grid-bg">
      {/* Background Neon Blobs */}
      <div className="radial-blob bg-[#7C3AED]/20 top-[-100px] left-[-100px]" />
      <div className="radial-blob bg-[#3B82F6]/15 bottom-[-150px] right-[-150px]" />

      {/* FinCEN Submission Success Toast */}
      <AnimatePresence>
        {sarSubmitted[selectedAlertId] && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-24 right-6 z-50 max-w-sm glass-panel border-l-4 border-l-[#10B981] p-4 rounded-xl flex items-start space-x-3"
          >
            <CheckCircle className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Filing Status: ARCHIVED</h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                Regulatory submission successful. Report ID: <strong>FinCEN-2026-{selectedAlertId.toUpperCase()}</strong> has been submitted.
              </p>
              <button 
                onClick={() => setSarSubmitted(prev => ({ ...prev, [selectedAlertId]: false }))}
                className="text-[9px] font-bold text-[#3B82F6] hover:text-[#3b82f6]/80 mt-2 cursor-pointer transition-colors"
              >
                Dismiss Log
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HEADER */}
      <div className="absolute top-4 left-4 right-4 h-16 glass-panel rounded-2xl flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[#7C3AED] rounded-xl flex items-center justify-center">
            <Shield className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <span className="font-bold tracking-tight text-xs text-white uppercase">SENTINEL AI</span>
              <a 
                href="/showcase" 
                className="text-[8px] bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider transition-all border border-white/10"
              >
                Model Validation
              </a>
              {isAutoDemo ? (
                <div className="flex items-center space-x-2">
                  <span className="text-[8px] bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/35 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                    Auto-Play Active
                  </span>
                  <button 
                    onClick={handleExitAutoDemo}
                    className="text-[8px] bg-white/5 hover:bg-white/10 text-white px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider transition-all border border-white/15 cursor-pointer"
                  >
                    Exit
                  </button>
                  <button 
                    onClick={handleNextAutoDemo}
                    className="text-[8px] bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/35 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <span>Next ▶</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleStartAutoDemo}
                  className="text-[8px] bg-[#7C3AED] text-white hover:bg-[#7C3AED]/90 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider transition-all cursor-pointer hover:shadow-[0_0_10px_rgba(124,58,237,0.4)]"
                >
                  Start Demo Walkthrough
                </button>
              )}
            </div>
            <p className="text-[9px] text-gray-400 tracking-wider uppercase mt-0.5 font-mono">DOSSIER ID: SC-{currentAlert.targetAccountId}</p>
          </div>
        </div>

        {/* STEP DIVIDER TABS */}
        <div className="flex items-center space-x-1 p-1 bg-white/5 border border-white/10 rounded-xl">
          {steps.map((s) => (
            <React.Fragment key={s.number}>
              <button
                onClick={() => {
                  setSelectedNodeId(null);
                  setActiveStep(s.number);
                }}
                className={`flex items-center space-x-1.5 text-[10px] font-semibold tracking-wider transition-all px-3 py-1.5 rounded-lg cursor-pointer ${
                  activeStep === s.number
                    ? 'text-white bg-[#7C3AED] shadow-md shadow-[#7C3AED]/20 border border-white/10'
                    : s.number < activeStep
                      ? 'text-[#10B981] hover:text-[#10B981]/80'
                      : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className={`h-4.5 w-4.5 rounded-md flex items-center justify-center text-[9px] font-bold ${
                  activeStep === s.number
                    ? 'bg-white text-[#7C3AED]'
                    : s.number < activeStep
                      ? 'bg-[#10B981]/20 text-[#10B981]'
                      : 'bg-white/10 text-gray-400'
                }`}>
                  {s.number < activeStep ? '✓' : s.number}
                </span>
                <span className="hidden xl:inline">{s.name}</span>
              </button>
              {s.number < 5 && <ChevronRight className="h-3 w-3 text-white/20" />}
            </React.Fragment>
          ))}
        </div>

        {/* PRIMARY STORY ACTION */}
        <div className="flex items-center space-x-2">
          {activeStep < 5 ? (
            <button
              onClick={() => {
                setSelectedNodeId(null);
                setActiveStep(prev => prev + 1);
              }}
              className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold text-xs px-4 py-2 rounded-xl border border-white/10 cursor-pointer shadow-md shadow-[#7C3AED]/10 hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all flex items-center space-x-1 hover:scale-[1.02]"
            >
              <span>Next Step</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                handleReset();
                setActiveStep(1);
              }}
              className="bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] border border-[#EF4444]/35 font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center space-x-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Case</span>
            </button>
          )}

          {user && (
            <div className="flex items-center space-x-3 ml-2 border-l border-white/10 pl-3">
              {user.user_metadata?.avatar_url && (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar" 
                  className="w-7 h-7 rounded-full border border-[#7C3AED]/35 object-cover"
                />
              )}
              <div className="hidden lg:block text-left">
                <p className="text-[10px] font-bold text-white leading-none">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-[8px] text-gray-400 font-mono mt-0.5 leading-none">
                  {user.email}
                </p>
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                className="bg-white/5 hover:bg-white/10 text-white font-semibold text-[9px] px-2.5 py-1.5 rounded-lg border border-white/10 cursor-pointer transition-all uppercase tracking-wider"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
        
        {isAutoDemo && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
            <div 
              className="bg-[#7C3AED] h-full transition-all duration-300"
              style={{ width: `${((autoDemoIndex + 1) / AUTO_DEMO_STEPS.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex w-full h-full pt-24 z-0">
        
        {/* LEFT TRIAGE COLUMN: Step 1 Only */}
        <AnimatePresence mode="wait">
          {activeStep === 1 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-80 h-full border-r border-white/5 bg-[#09090B]/40 flex flex-col p-4 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2">
                  <ListFilter className="h-3.5 w-3.5 text-[#7C3AED]" />
                  <span>suspect queue</span>
                </h2>
              </div>

              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search suspect accounts..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400/60 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
              />

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                {filteredAlerts.map((alert) => {
                  const alertFrozen = frozenAlerts[alert.id];
                  const isSelected = selectedAlertId === alert.id;
                  return (
                    <div 
                      key={alert.id}
                      onClick={() => handleAlertSelect(alert.id)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                        isSelected 
                          ? alertFrozen
                            ? 'bg-[#EF4444]/10 border-[#EF4444]/60 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                            : 'bg-[#7C3AED]/10 border-[#7C3AED]/60 shadow-[0_0_15px_rgba(124,58,237,0.25)]' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Alert Queue Pulse for romance scam alert */}
                      {alert.id === 'alert-1042' && !alertFrozen && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                        </span>
                      )}

                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[9px] font-mono text-gray-400 font-bold uppercase">{alert.id}</span>
                        {alertFrozen ? (
                          <span className="text-[8px] px-2 py-0.5 rounded-full font-bold tracking-wider border bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/35">
                            FROZEN
                          </span>
                        ) : (
                          <span 
                            className="text-[8px] px-2 py-0.5 rounded-full font-bold tracking-wider border"
                            style={{
                              color: getRiskColor(alert.riskScore).text,
                              backgroundColor: getRiskColor(alert.riskScore).bg,
                              borderColor: getRiskColor(alert.riskScore).border
                            }}
                          >
                            {getRiskColor(alert.riskScore).label}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs font-bold text-white">{alert.customerName}</h3>
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 leading-relaxed">{alert.description}</p>
                      
                      <div className="flex items-center justify-between text-[8px] font-mono text-gray-400 mt-3 border-t border-white/5 pt-2">
                        <span>ACC: {alert.targetAccountId}</span>
                        <span className="font-bold" style={{ color: getRiskColor(alert.riskScore).text }}>
                          {alert.riskScore}% RISK
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t border-white/5 pt-3 text-[8px] font-mono text-gray-400 uppercase tracking-widest text-center">
                <span>SENTINEL SECURITY GATEWAY v2.1</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. STEP CONTENT WORKSPACES */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* STEP 1: SIGNAL DETECTION INGEST BOARD */}
          {activeStep === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 p-6 flex flex-col justify-center items-center max-w-4xl mx-auto w-full space-y-6 overflow-y-auto"
            >
              <div className="w-full glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-[#7C3AED] font-mono uppercase tracking-widest">[ suspect dossier profile ]</span>
                  <h2 className="text-xl font-bold text-white tracking-tight">{currentAlert.customerName}</h2>
                  <p className="text-xs text-gray-400 max-w-md leading-relaxed">{currentAlert.description}</p>
                  <div className="flex items-center space-x-3 text-[9px] font-mono text-gray-400 mt-4">
                    <span>RECORD ID: acc-{currentAlert.targetAccountId}</span>
                    <span>•</span>
                    <span>LOAD DATE: {new Date(currentAlert.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-stretch space-x-3">
                  {/* Score 1: Rule-Based */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center min-w-[130px] shadow-lg">
                    <span className="text-[8px] font-bold text-gray-400 font-mono uppercase tracking-wider">Rule-Based Score</span>
                    <span className={`text-3xl font-extrabold mt-2 font-mono ${getRiskColor(detectionResult.riskScore).textTailwind}`}>
                      <CountUp end={detectionResult.riskScore} suffix="%" />
                    </span>
                    <span className="text-[7px] text-gray-400 font-mono mt-1 uppercase tracking-wider">Ledger Signals</span>
                  </div>

                  {/* Score 2: ML Model Stamped slanted */}
                  {(() => {
                    const mlScore = mlScoreData ? mlScoreData.combined_ml_score : detectionResult.riskScore;
                    const mlColor = getRiskColor(mlScore);
                    return (
                      <div 
                        className={`bg-[#7C3AED]/5 border-2 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg min-w-[160px] relative overflow-hidden transform -rotate-1 select-none border-dashed`}
                        style={{ borderColor: mlColor.text, color: mlColor.text }}
                      >
                        <div 
                          className="absolute top-0 right-0 px-1.5 py-0.5 text-[6px] font-bold rounded-bl font-mono uppercase tracking-wider"
                          style={{ backgroundColor: mlColor.text + '22', color: mlColor.text }}
                        >
                          inference engine
                        </div>
                        <span className="text-[8px] font-bold font-mono uppercase tracking-wider">GNN ML Model Score</span>
                        {isLoadingMlScore ? (
                          <div className="h-10 flex flex-col items-center justify-center mt-1.5 space-y-1">
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: mlColor.text }} />
                            <span className="text-[7px] font-mono tracking-tight animate-pulse" style={{ color: mlColor.text }}>
                              {mlLoadingStage}
                            </span>
                          </div>
                        ) : (
                          <>
                            <span className="text-3xl font-extrabold mt-1 font-mono">
                              <CountUp end={mlScore} suffix="%" />
                            </span>
                            <span className="text-[7px] font-mono mt-1 uppercase tracking-tight font-bold">
                              GraphSAGE Node2Vec
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Rules Checklist */}
              <div className="w-full glass-panel rounded-2xl p-6 flex flex-col">
                <span className="text-xs font-bold text-white font-sans uppercase tracking-wider mb-4 flex items-center space-x-2 border-b border-white/5 pb-3">
                  <Activity className="h-4 w-4 text-[#7C3AED]" />
                  <span>Rule Engine Telemetry Audit</span>
                </span>
                
                {isScanning ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <div className="h-6 w-6 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
                    <span className="text-xs text-[#7C3AED] font-mono animate-pulse">Running telemetry verification rules...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detectionResult.triggeredSignals.map((sig) => (
                      <div key={sig.id} className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between hover:bg-white/10 hover:border-white/15 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-gray-400 font-bold uppercase">{sig.id}</span>
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold tracking-wider border ${
                            sig.triggered 
                              ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/35' 
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35'
                          }`}>
                            {sig.triggered ? 'TRIGGERED' : 'CLEARED'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-2">{sig.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{sig.description}</p>
                        <div className="flex items-center justify-between mt-3 text-[9px] font-mono text-gray-400 border-t border-white/5 pt-2">
                          <span>Rule Weight</span>
                          <span className="font-bold text-white">{sig.triggered ? `+${sig.weight}%` : '0%'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center">
                  <div className="text-[9px] font-mono text-gray-400">
                    <span>AUDIT GATE: scan completed successfully.</span>
                  </div>
                  <button 
                    onClick={handleRunScan}
                    disabled={isScanning}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 cursor-pointer transition-all uppercase tracking-wider"
                  >
                    {isScanning ? "Re-scanning..." : "Run Telemetry Scan"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: MONEY FLOW GRAPH HERO CANVAS */}
          {activeStep === 2 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="h-10 border-b border-white/5 bg-white/5 flex items-center justify-between px-6">
                <span className="text-[10px] text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Play className="h-3.5 w-3.5 text-[#7C3AED]" />
                  <span>STEP 2: Network Hop Flow Analysis</span>
                </span>
                <span className="text-[9px] text-[#7C3AED] font-bold uppercase tracking-wider">Select a node to view attributes</span>
              </div>
              
              <div className="flex-1 relative">
                {/* Visualizer Graph Canvas */}
                <MoneyFlowGraph 
                  nodes={scenario.graph.nodes}
                  edges={scenario.graph.edges}
                  isFrozen={isFrozen}
                  onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                />

                {/* Left overlay stats */}
                <div className="absolute top-4 left-4 z-10 glass-panel border border-white/10 p-4 rounded-2xl shadow-xl">
                  <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider font-mono">ring depth</span>
                  <span className="text-xs font-bold text-white mt-1 block">3-Hop Flow Layers</span>
                </div>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 right-4 z-10 glass-panel border border-white/10 p-4 rounded-2xl shadow-xl font-mono text-[9px] space-y-2">
                  <span className="block font-bold text-gray-300 border-b border-white/5 pb-1 uppercase tracking-wider text-[8px]">Legend</span>
                  <div className="flex items-center space-x-2"><div className="h-2.5 w-2.5 rounded-full bg-[#10B981]" /> <span>Victim</span></div>
                  <div className="flex items-center space-x-2"><div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" /> <span>Intermediary</span></div>
                  <div className="flex items-center space-x-2"><div className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" /> <span>Target Hub</span></div>
                  <div className="flex items-center space-x-2"><div className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" /> <span>Crypto cash-out</span></div>
                </div>

                {/* Entity Inspector index card */}
                <AnimatePresence>
                  {(() => {
                    const selectedNode = scenario.graph.nodes.find(n => n.id === selectedNodeId);
                    if (!selectedNode) return null;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute bottom-4 left-4 z-10 w-72 glass-panel border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col font-mono text-[10px]"
                      >
                        <div className="border-b border-white/5 pb-2 mb-2 flex items-center justify-between">
                          <span className="font-bold text-[#7C3AED] uppercase text-[9px]">node profile</span>
                          <button onClick={() => setSelectedNodeId(null)} className="text-gray-400 hover:text-white font-bold">[ X ]</button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Account Name:</span>
                            <span className="font-bold text-white">{selectedNode.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Account ID:</span>
                            <span className="font-bold text-white">{selectedNode.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Type:</span>
                            <span className="font-bold uppercase text-[#EF4444]">{selectedNode.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Device binding:</span>
                            <span className="font-bold text-[9px] bg-white/5 px-1 border border-white/10 text-white rounded">{selectedNode.deviceFingerprint}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">IP Location:</span>
                            <span className="font-bold text-white">{selectedNode.ipAddress}</span>
                          </div>
                          
                          <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1">
                            <span className="text-gray-400">Tax ID:</span>
                            <span className="redacted font-bold px-1.5 rounded bg-white text-black">[ CONFIDENTIAL ]</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>

              {/* Bottom Timeline Ledger */}
              <div className="h-44 bg-[#09090B] border-t border-white/5 flex flex-col">
                <div className="h-8 border-b border-white/5 bg-white/5 flex items-center justify-between px-4 font-mono">
                  <span className="text-[8px] text-gray-400 uppercase tracking-widest font-semibold">chronological event timeline</span>
                </div>
                <div className="flex-1 overflow-x-auto p-3 relative flex items-stretch space-x-3.5 scrollbar-thin">
                  <div className="absolute top-1/2 left-6 right-6 h-[1px] bg-white/5 -translate-y-1/2 pointer-events-none z-0" />
                  {scenario.timeline.map((event) => {
                    let borderTheme = 'border-white/10 bg-white/5';
                    if (event.type === 'transaction') borderTheme = 'border-[#3B82F6]/30 bg-[#3B82F6]/5';
                    else if (event.type === 'device_swap') borderTheme = 'border-[#F59E0B]/30 bg-[#F59E0B]/5';
                    else if (event.type === 'cyber_tip') borderTheme = 'border-[#EF4444]/30 bg-[#EF4444]/5';

                    return (
                      <div key={event.id} className={`w-64 flex-shrink-0 p-3 rounded-xl border flex flex-col justify-between z-10 backdrop-blur-sm ${borderTheme} text-[10px] text-white font-mono shadow-md`}>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">{event.type}</span>
                            <span className="text-[8px] text-gray-400">
                              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h4 className="text-[10px] font-bold text-white line-clamp-1">{event.title}</h4>
                          <p className="text-[9px] text-gray-400 mt-0.5 line-clamp-2 leading-snug">{event.description}</p>
                        </div>
                        {event.amount && (
                          <div className="text-right mt-1.5 font-bold text-[#3B82F6]">${event.amount.toLocaleString()}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SPLIT MONEY FLOW GRAPH & COPILOT CHAT PANEL */}
          {activeStep === 3 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex overflow-hidden"
            >
              {/* Left Graph Panel */}
              <div className="flex-1 h-full relative border-r border-white/5">
                <MoneyFlowGraph 
                  nodes={scenario.graph.nodes}
                  edges={scenario.graph.edges}
                  isFrozen={isFrozen}
                  onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                />
                
                {/* Floating legend */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-3 glass-panel border border-white/10 px-3 py-2 rounded-xl text-[8px] font-mono">
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 rounded-full bg-[#EF4444]" />
                    <span className="text-gray-300 font-bold uppercase">Mule Hub</span>
                  </div>
                </div>
              </div>

              {/* Right Copilot Chat Panel */}
              <div className="w-[420px] h-full flex flex-col bg-[#121214]/60 backdrop-blur-md border-l border-white/5">
                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-[#7C3AED]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-white">Gemini Forensic Copilot</h2>
                  </div>
                  <span className="text-[8px] text-[#10B981] font-bold uppercase bg-[#10B981]/15 border border-[#10B981]/30 px-2 py-0.5 rounded-full">online</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scrollbar-thin">
                  {chatMessages.length === 0 && !isAnalyzing ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4">
                      <div className="h-12 w-12 bg-[#7C3AED]/20 border border-[#7C3AED]/35 text-[#7C3AED] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7C3AED]/10 animate-bounce">
                        <Cpu className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 font-mono">AI Forensic Analyzer</h3>
                        <p className="text-[10px] text-gray-400 leading-relaxed max-w-xs">
                          Let Gemini analyze this suspicious transaction sub-graph and auto-generate compliance narratives.
                        </p>
                      </div>
                      
                      <div className="flex flex-col space-y-2 w-full max-w-xs font-mono">
                        <button 
                          onClick={() => callChatApi("Analyze this critical alert and highlight the main risk factors.")}
                          className="w-full font-bold flex items-center justify-center space-x-2 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white rounded-xl py-2.5 cursor-pointer border border-white/10 text-[9px] uppercase transition-all shadow-md shadow-[#7C3AED]/10 hover:shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>Analyze Alert with Gemini</span>
                        </button>
                        
                        <button 
                          onClick={() => callChatApi("Draft a formal regulatory Suspicious Activity Report (SAR) narrative for this transaction ring.")}
                          className="w-full font-bold flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white rounded-xl py-2.5 border border-white/10 cursor-pointer text-[9px] uppercase transition-all"
                        >
                          <Shield className="h-3.5 w-3.5 text-[#EF4444]" />
                          <span>Draft SAR Narrative</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1">
                      {chatMessages.map((msg, index) => (
                        <div 
                          key={index} 
                          className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[8px] font-mono text-gray-400 mb-1 px-1 font-bold">
                            {msg.role === 'user' ? 'Investigator' : 'Gemini Agent'}
                          </span>
                          <div 
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed border shadow-md font-mono ${
                              msg.role === 'user' 
                                ? 'bg-[#7C3AED]/20 border-[#7C3AED]/40 text-white max-w-[85%] rounded-tr-none' 
                                : 'bg-white/5 border-white/10 text-gray-200 rounded-tl-none max-w-full text-[10px]'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      
                      {isAnalyzing && (
                        <div className="flex flex-col items-start animate-pulse">
                          <span className="text-[8px] font-mono text-gray-400 mb-1 px-1 font-bold">Gemini Agent</span>
                          <div className="p-3.5 rounded-2xl border border-white/10 bg-white/5 rounded-tl-none w-5/6 flex flex-col space-y-2 shadow-md shimmer-effect">
                            <div className="h-3 bg-white/10 rounded-full w-full" />
                            <div className="h-3 bg-white/10 rounded-full w-5/6" />
                            <div className="h-3 bg-white/10 rounded-full w-4/6" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Prompt bar */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!chatInput.trim()) return;
                    callChatApi(chatInput);
                  }}
                  className="p-4 border-t border-white/5 bg-[#121214] flex flex-col space-y-3"
                >
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => callChatApi("Analyze this critical alert and highlight the main risk factors.")}
                      className="text-[9px] px-2.5 py-1 bg-white/5 border border-white/10 text-white hover:bg-[#7C3AED] hover:border-transparent transition-all rounded-lg font-mono cursor-pointer font-bold uppercase"
                      disabled={isAnalyzing}
                    >
                      🔍 Analyze Risk
                    </button>
                    <button
                      type="button"
                      onClick={() => callChatApi("Draft a formal regulatory Suspicious Activity Report (SAR) narrative for this transaction ring.")}
                      className="text-[9px] px-2.5 py-1 bg-white/5 border border-white/10 text-white hover:bg-[#7C3AED] hover:border-transparent transition-all rounded-lg font-mono cursor-pointer font-bold uppercase"
                      disabled={isAnalyzing}
                    >
                      ✍️ Draft SAR
                    </button>
                  </div>

                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask Gemini about this network..." 
                      className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-450 focus:outline-none focus:border-[#7C3AED] transition-all font-mono"
                      disabled={isAnalyzing}
                    />
                    <button 
                      type="submit"
                      disabled={isAnalyzing || !chatInput.trim()}
                      className="px-4 bg-[#7C3AED] text-white rounded-xl hover:bg-[#7C3AED]/90 transition-all disabled:opacity-50 cursor-pointer text-xs font-semibold uppercase tracking-wider border border-white/10 hover:shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* STEP 4: ISOLATE & MITIGATE VIEW */}
          {activeStep === 4 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex overflow-hidden"
            >
              {/* Left Graph Panel */}
              <div className="flex-1 h-full relative">
                <MoneyFlowGraph 
                  nodes={scenario.graph.nodes}
                  edges={scenario.graph.edges}
                  isFrozen={isFrozen}
                  onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                />
              </div>

              {/* Right Lock Action panel */}
              <div className="w-[420px] h-full p-6 flex flex-col justify-between bg-[#121214]/60 backdrop-blur-md border-l border-white/5">
                <div className="space-y-6">
                  <span className="text-[10px] font-bold text-[#EF4444] font-mono uppercase tracking-widest flex items-center space-x-2 border-b border-white/5 pb-3">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Compliance Isolation Console</span>
                  </span>
                  
                  <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-white flex items-center space-x-2 font-mono uppercase">
                      <Lock className="h-4 w-4 text-[#EF4444]" />
                      <span>Security Action Pending</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                      Executing the lock isolates the suspect mule hub, freezing all outbound transaction routes (Zelle, ACH, Wire) and flagging entities in the compliance database.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] text-gray-400 font-mono uppercase font-bold tracking-wider">Target Entity Details</span>
                    <div className="border border-white/10 bg-white/5 p-4 rounded-2xl space-y-2.5 text-xs font-mono text-white shadow-md">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Subject Name:</span>
                        <span className="font-bold">{currentAlert.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Account ID:</span>
                        <span className="font-bold">acc-{currentAlert.targetAccountId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk Status:</span>
                        <span className={`font-bold uppercase ${isFrozen ? 'text-[#10B981]' : 'text-[#EF4444] animate-pulse'}`}>
                          {isFrozen ? 'MITIGATION ACTIVE' : 'PENDING ACTION'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6 space-y-4">
                  {isFrozen ? (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-start space-x-2"
                    >
                      <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
                      <span>Mule hub frozen successfully. Outbound channels disabled. Ledger logs updated. Proceed to Step 5 to file report.</span>
                    </motion.div>
                  ) : (
                    <button
                      onClick={handleFreeze}
                      className="w-full py-4 text-xs font-bold uppercase bg-[#EF4444] hover:bg-[#EF4444]/90 text-white rounded-xl cursor-pointer shadow-lg shadow-[#EF4444]/15 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center space-x-2 hover:scale-[1.01]"
                    >
                      <Lock className="h-4.5 w-4.5" />
                      <span>Execute Freeze Protocol</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: REGULATORY SAR FILE COMPLETION */}
          {activeStep === 5 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full space-y-6"
            >
              <div className="w-full glass-panel border border-white/10 p-8 rounded-2xl shadow-2xl flex flex-col space-y-6 font-mono text-xs text-white relative">
                
                {/* Large tilted Stamp overlays when frozen */}
                {isFrozen && !sarSubmitted[selectedAlertId] && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-dashed border-[#EF4444] px-8 py-3 text-4xl font-extrabold text-[#EF4444] opacity-25 font-mono select-none pointer-events-none uppercase tracking-widest z-10 animate-stamp">
                    ISOLATED / SECURED
                  </div>
                )}

                {/* Large tilted Stamp overlay when submitted/filed */}
                {sarSubmitted[selectedAlertId] && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-double border-[#10B981] bg-[#121214] px-10 py-5 text-4xl font-black text-[#10B981] shadow-xl font-mono select-none pointer-events-none uppercase tracking-widest z-20 animate-stamp">
                    SUBMITTED / FILED
                  </div>
                )}

                {/* Real document style top header */}
                <div className="border-b-2 border-white/20 pb-4 flex items-center justify-between">
                  <div>
                    <h1 className="text-sm font-extrabold uppercase">DEPARTMENT OF THE TREASURY - FINCEN</h1>
                    <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">SUSPICIOUS ACTIVITY REPORT (SAR) - FORM 111</h2>
                  </div>
                  <div className="text-right text-[9px]">
                    <div>OMB No. 1506-0065</div>
                    <div className="font-bold text-[#7C3AED] uppercase border border-[#7C3AED]/35 px-2 py-0.5 rounded mt-1">E-FILING INTERFACE</div>
                  </div>
                </div>

                {/* Part 1: Filing Institution */}
                <div className="space-y-3">
                  <h3 className="font-bold uppercase border-b border-white/10 pb-1 text-gray-300">Part I: Filing Institution Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[9px] text-gray-400 block">1. Filing Institution Name</span>
                      <span className="font-bold text-white">Sentinel Security Bank Corp</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block">2. Type of Institution</span>
                      <span className="font-bold text-white">Depository Institution</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block">3. Primary Regulatory Agency</span>
                      <span className="font-bold text-white">FDIC / FinCEN</span>
                    </div>
                  </div>
                </div>

                {/* Part 2: Subject Details */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold uppercase border-b border-white/10 pb-1 text-gray-300">Part II: Subject Information (Suspected Money Mule)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[9px] text-gray-400 block">4. Legal Name</span>
                      <span className="font-bold text-white">{currentAlert.customerName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block">5. Account ID</span>
                      <span className="font-bold text-white">acc-{currentAlert.targetAccountId}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block">6. Status Indicators</span>
                      <span className="font-bold text-[#EF4444] uppercase">{isFrozen ? 'FROZEN / EXCLUDED' : 'ACTIVE THREAT'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block">7. Risk Score</span>
                      <span className="font-bold text-[#EF4444]">{currentAlert.riskScore}% CRITICAL</span>
                    </div>
                  </div>
                </div>

                {/* Part 3: Narrative Text Block */}
                <div className="space-y-3 pt-2 flex-1 flex flex-col">
                  <h3 className="font-bold uppercase border-b border-white/10 pb-1 text-gray-300">Part III: Suspicious Activity Narrative</h3>
                  <p className="text-[9.5px] text-gray-400 leading-relaxed italic">
                    The narrative below summarizes the ledger hop velocity, shared device overlap mappings, and government alerts. Click the Gemini button in Step 3 to auto-generate this text if empty.
                  </p>
                  
                  <textarea
                    value={sarNarrativeValue}
                    onChange={(e) => {
                      const textVal = e.target.value;
                      setSarNarratives(prev => ({ ...prev, [selectedAlertId]: textVal }));
                    }}
                    placeholder="Enter compliance narrative statement..."
                    className="w-full h-64 p-4 text-[11px] font-mono leading-relaxed bg-white/5 border border-white/10 text-white rounded-xl placeholder-gray-400/50 focus:outline-none focus:border-[#7C3AED] transition-all resize-none"
                    disabled={sarSubmitted[selectedAlertId]}
                  />
                </div>

                {/* Submit Regulatory form buttons */}
                <div className="border-t border-white/10 pt-6 flex justify-between items-center">
                  <div className="text-[9px] text-gray-450">
                    <span>SECURITY HASH: MD5-{selectedAlertId.toUpperCase()}-SECURED</span>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setActiveStep(3)}
                      className="px-4 py-2 border border-white/10 text-white bg-white/5 rounded-xl hover:bg-white/10 font-bold transition-colors cursor-pointer text-xs uppercase"
                    >
                      Back to Copilot
                    </button>
                    <button 
                      onClick={handleSubmitSar}
                      disabled={sarSubmitted[selectedAlertId] || !sarNarrativeValue}
                      className="px-6 py-2 bg-[#10B981] hover:bg-[#10B981]/90 text-white rounded-xl font-bold cursor-pointer transition-all border border-white/10 disabled:opacity-50 text-xs uppercase hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    >
                      {sarSubmitted[selectedAlertId] ? "Report Submitted" : "Submit SAR to FinCEN Gateway"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </main>
  );
}
