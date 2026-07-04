'use client';

import React, { useState } from 'react';
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

export default function Home() {
  // Stepper State (DEMO MODE REDESIGN)
  const [activeStep, setActiveStep] = useState<number>(1);

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
  } | null>(null);
  const [isLoadingMlScore, setIsLoadingMlScore] = useState<boolean>(false);

  const currentAlert = scenario.alert;
  const isFrozen = frozenAlerts[selectedAlertId];
  const chatMessages = chatHistories[selectedAlertId] || [];
  const currentSar = sarNarratives[selectedAlertId] || "";

  // Dynamic risk calculation
  const detectionResult = runDetectionEngine(
    currentAlert.targetAccountId,
    scenario.graph.nodes,
    scenario.graph.edges,
    scenario.timeline
  );

  React.useEffect(() => {
    const fetchMlScore = async () => {
      setIsLoadingMlScore(true);
      try {
        const response = await fetch('/api/ml-score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            accountId: currentAlert.targetAccountId,
            ruleScore: detectionResult.riskScore
          })
        });
        if (response.ok) {
          const data = await response.json();
          setMlScoreData(data);
        }
      } catch (err) {
        console.error("Error fetching ML score:", err);
      } finally {
        setIsLoadingMlScore(false);
      }
    };
    fetchMlScore();
  }, [selectedAlertId, currentAlert.targetAccountId, detectionResult.riskScore]);

  // Filter queue alerts
  const filteredAlerts = ALERTS_LIST.filter(alert => 
    alert.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.severity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Switch between alert cards
  const handleAlertSelect = (alertId: string) => {
    setSelectedAlertId(alertId);
    setSelectedNodeId(null);
    setScenario(SCENARIOS[alertId]);
    setSearchQuery('');
  };

  // Perform Resolution Freeze Action
  const handleFreeze = () => {
    setFrozenAlerts(prev => ({ ...prev, [selectedAlertId]: true }));
    
    // Auto-document in chat history
    const updatedHistory = [
      ...chatMessages,
      { role: 'user' as const, content: "Trigger mitigation freeze." },
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
    }, 800);
  };

  const handleReset = () => {
    setFrozenAlerts(prev => ({ ...prev, [selectedAlertId]: false }));
    setChatHistories(prev => ({ ...prev, [selectedAlertId]: [] }));
    setSarNarratives(prev => ({ ...prev, [selectedAlertId]: "" }));
    setSarSubmitted(prev => ({ ...prev, [selectedAlertId]: false }));
    setScenario(SCENARIOS[selectedAlertId]);
  };

  const handleSubmitSar = () => {
    setSarSubmitted(prev => ({ ...prev, [selectedAlertId]: true }));
  };

  // Simple Markdown Renderer
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let cleanLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      cleanLine = cleanLine.replace(boldRegex, '<strong>$1</strong>');

      if (cleanLine.startsWith('### ')) {
        const headerText = cleanLine.substring(4).replace(boldRegex, '$1');
        return (
          <h4 key={idx} className="text-[10px] font-bold text-[#00f2fe] mt-3 mb-1.5 font-mono uppercase tracking-wider border-b border-white/10 pb-0.5">
            {headerText}
          </h4>
        );
      }

      if (cleanLine.startsWith('## ')) {
        const headerText = cleanLine.substring(3).replace(boldRegex, '$1');
        return (
          <h3 key={idx} className="text-xs font-bold text-slate-100 mt-4 mb-2 border-b border-[#0075ff]/30 pb-1">
            {headerText}
          </h3>
        );
      }

      if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
        const bulletText = cleanLine.substring(2);
        return (
          <div key={idx} className="flex items-start space-x-1.5 ml-2 my-1 text-[#a0aec0]">
            <span className="text-[#0075ff] mt-0.5">•</span>
            <span dangerouslySetInnerHTML={{ __html: bulletText }} />
          </div>
        );
      }

      let lineClass = "my-1 leading-relaxed text-[#a0aec0]";
      if (cleanLine.includes('Mitigation Executed') || cleanLine.includes('FROZEN')) {
        lineClass += " text-red-400 font-mono";
      }

      if (cleanLine.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p 
          key={idx} 
          className={lineClass}
          dangerouslySetInnerHTML={{ __html: cleanLine }} 
        />
      );
    });
  };

  const steps = [
    { number: 1, name: 'Detect Signals' },
    { number: 2, name: 'Trace Network' },
    { number: 3, name: 'Gemini Forensics' },
    { number: 4, name: 'Lock Account' },
    { number: 5, name: 'File Case' }
  ];

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#060b26] text-white font-sans antialiased relative">
      {/* Vision UI Background Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#0075ff]/8 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#e100ff]/8 blur-[130px] pointer-events-none z-0" />

      {/* FinCEN Submission Success Toast (Filing resolution step) */}
      {sarSubmitted[selectedAlertId] && (
        <div className="absolute top-24 right-6 z-50 max-w-sm bg-slate-900/95 border border-emerald-500/30 text-slate-200 p-4 rounded-[20px] shadow-2xl flex items-start space-x-3 backdrop-blur-xl animate-in fade-in duration-300">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-white">Regulatory SAR Filed</h4>
            <p className="text-[10px] text-[#a0aec0] mt-1 leading-relaxed">FinCEN submission successful. Report ID: <strong>FinCEN-2026-{selectedAlertId.toUpperCase()}</strong> has been queued for federal auditing.</p>
            <button 
              onClick={() => setSarSubmitted(prev => ({ ...prev, [selectedAlertId]: false }))}
              className="text-[9px] font-bold text-emerald-450 hover:underline mt-2 cursor-pointer font-mono"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* 1. VISION UI GUIDED HEADER WITH STEPPER */}
      <div className="absolute top-4 left-4 right-4 h-16 bg-[#0a0e31]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[20px] flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0075ff] to-[#00f2fe] shadow-lg shadow-[#0075ff]/20">
            <Shield className="h-5 w-5 text-white" />
            <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
          </div>
          <div className="hidden lg:block">
            <span className="font-bold tracking-tight text-sm text-white">SENTINEL AI</span>
            <p className="text-[8px] text-[#a0aec0] tracking-widest font-mono">INVESTIGATION COPILOT</p>
          </div>
        </div>

        {/* GUIDED STEPTRAK */}
        <div className="flex items-center space-x-2 md:space-x-4 bg-[#060b26]/50 p-1.5 rounded-xl border border-white/5">
          {steps.map((s) => (
            <React.Fragment key={s.number}>
              <button
                onClick={() => {
                  setSelectedNodeId(null);
                  setActiveStep(s.number);
                }}
                className={`flex items-center space-x-1.5 text-[9px] font-bold font-mono tracking-wider transition-all px-2.5 py-1.5 rounded-lg cursor-pointer ${
                  activeStep === s.number
                    ? 'text-[#00f2fe] bg-[#0075ff]/20 border border-[#00f2fe]/30 shadow'
                    : s.number < activeStep
                      ? 'text-emerald-400 hover:text-emerald-300'
                      : 'text-[#a0aec0] hover:text-white'
                }`}
              >
                <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center text-[9px] ${
                  activeStep === s.number
                    ? 'bg-[#00f2fe] text-[#060b26]'
                    : s.number < activeStep
                      ? 'bg-emerald-500 text-[#060b26]'
                      : 'bg-slate-800 text-slate-400'
                }`}>
                  {s.number < activeStep ? '✓' : s.number}
                </span>
                <span className="hidden md:inline">{s.name}</span>
              </button>
              {s.number < 5 && <ChevronRight className="h-3 w-3 text-white/10" />}
            </React.Fragment>
          ))}
        </div>

        {/* PRIMARY STORY ACTION */}
        <div className="flex items-center space-x-2">
          {activeStep < 5 ? (
            <Button
              onClick={() => {
                setSelectedNodeId(null);
                setActiveStep(prev => prev + 1);
              }}
              className="bg-[#0075ff] hover:bg-[#0075ff]/80 text-white font-bold text-xs px-4 py-2 rounded-xl border-transparent cursor-pointer shadow-[0_0_12px_rgba(0,117,255,0.3)] flex items-center space-x-1 hover:scale-[1.02] transition-transform"
            >
              <span>Next Step</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                handleReset();
                setActiveStep(1);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl border-transparent cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-x-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Case</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex w-full h-full pt-24 z-0">
        
        {/* LEFT TRIAGE COLUMN: Only visible in Step 1 */}
        {activeStep === 1 && (
          <div className="w-80 h-full border-r border-white/10 bg-[#0a0e31]/30 backdrop-blur-xl flex flex-col p-4 space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#a0aec0] font-mono flex items-center space-x-2">
                <ListFilter className="h-3.5 w-3.5" />
                <span>Select Target Ring</span>
              </h2>
            </div>

            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search suspect accounts..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#060b26] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#0075ff] transition-all"
            />

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {filteredAlerts.map((alert) => {
                const alertFrozen = frozenAlerts[alert.id];
                return (
                  <div 
                    key={alert.id}
                    onClick={() => handleAlertSelect(alert.id)}
                    className={`p-3.5 rounded-[18px] border transition-all duration-300 cursor-pointer relative ${
                      selectedAlertId === alert.id 
                        ? alertFrozen
                          ? 'bg-[#0a0e31]/80 border-red-500/50 shadow-[0_4px_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30'
                          : 'bg-[#0a0e31]/80 border-[#0075ff] shadow-[0_4px_20px_rgba(0,117,255,0.25)] ring-1 ring-[#0075ff]/30' 
                        : 'bg-[#060b26]/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[9px] font-mono text-[#00f2fe] font-semibold tracking-wider">{alert.id.toUpperCase()}</span>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold font-mono tracking-wider ${
                        alertFrozen 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : 'bg-[#e100ff]/10 text-[#e100ff] border border-[#e100ff]/20 animate-pulse'
                      }`}>
                        {alertFrozen ? 'FROZEN' : alert.severity}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1 flex items-center justify-between">
                      <span>{alert.customerName}</span>
                      {!alertFrozen && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[#a0aec0] line-clamp-2 mb-2 leading-relaxed">{alert.description}</p>
                  </div>
                );
              })}
            </div>
            
            <div className="p-3 bg-[#0a0e31]/60 border border-white/10 rounded-[20px] flex items-center justify-between text-[10px] text-[#a0aec0] font-mono">
              <span>SANDBOX MOCK</span>
              <span className="text-[#00f2fe] flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00f2fe] animate-ping" />
                <span>ONLINE</span>
              </span>
            </div>
          </div>
        )}

        {/* PROGRESSIVE MIDDLE PANEL WORKSPACE */}
        <div className="flex-1 h-full flex flex-col bg-transparent overflow-hidden">
          
          {/* STEP 1: SIGNAL DETECTION INGEST BOARD */}
          {activeStep === 1 && (
            <div className="flex-1 p-6 flex flex-col justify-center items-center max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
              <div className="w-full bg-[#0a0e31]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#00f2fe] font-mono uppercase tracking-widest">Active Scan Target</span>
                  <h2 className="text-2xl font-bold text-white">{currentAlert.customerName}</h2>
                  <p className="text-xs text-[#a0aec0] max-w-md">{currentAlert.description}</p>
                  <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400 mt-4">
                    <span>ID: acc-{currentAlert.targetAccountId}</span>
                    <span>•</span>
                    <span>Created: {new Date(currentAlert.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-stretch space-x-3">
                  {/* Score 1: Rule-Based */}
                  <div className="bg-[#060b26]/80 border border-white/10 rounded-[20px] p-4 flex flex-col items-center justify-center text-center shadow-2xl min-w-[140px]">
                    <span className="text-[9px] font-bold text-[#a0aec0] font-mono uppercase tracking-wider">Rule-Based Score</span>
                    <span className="text-3xl font-extrabold text-indigo-400 mt-2">{detectionResult.riskScore}%</span>
                    <span className="text-[8px] text-[#a0aec0] font-mono mt-1">Deterministic Rules</span>
                  </div>

                  {/* Score 2: ML Model */}
                  <div className="bg-[#0a0e31]/95 border border-indigo-500/30 rounded-[20px] p-4 flex flex-col items-center justify-center text-center shadow-2xl min-w-[170px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#0075ff]/20 px-2 py-0.5 text-[7px] text-[#00f2fe] font-bold rounded-bl-lg border-l border-b border-[#00f2fe]/20">ML ENGINE</div>
                    <span className="text-[9px] font-bold text-[#00f2fe] font-mono uppercase tracking-wider">ML Model Score</span>
                    {isLoadingMlScore ? (
                      <div className="h-9 flex items-center justify-center mt-2">
                        <div className="h-4.5 w-4.5 rounded-full border border-[#00f2fe] border-t-transparent animate-spin" />
                      </div>
                    ) : (
                      <>
                        <span className="text-3xl font-extrabold text-emerald-400 mt-2">
                          {mlScoreData ? mlScoreData.combined_ml_score : detectionResult.riskScore}%
                        </span>
                        <span className="text-[7px] text-[#a0aec0] font-mono mt-1.5 leading-tight">
                          GraphSAGE + Isolation Forest
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Rules Checklist */}
              <div className="w-full bg-[#0a0e31]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] rounded-[24px] p-6 flex flex-col">
                <span className="text-xs font-bold text-[#00f2fe] font-mono uppercase tracking-wider mb-4 flex items-center space-x-2 border-b border-white/10 pb-2.5">
                  <Activity className="h-4 w-4 text-[#00f2fe] animate-pulse" />
                  <span>Sentinel Explainable Rules Engine Diagnosis</span>
                </span>
                
                {isScanning ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <div className="h-8 w-8 rounded-full border-2 border-[#00f2fe] border-t-transparent animate-spin" />
                    <span className="text-xs text-[#00f2fe] font-mono animate-pulse">Running telemetry matching rules...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detectionResult.triggeredSignals.map((sig) => (
                      <div key={sig.id} className="p-3.5 rounded-[18px] bg-[#060b26]/50 border border-white/5 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{sig.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold font-mono tracking-wider ${
                            sig.triggered 
                              ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' 
                              : 'bg-[#060b26] text-slate-500 border border-white/5'
                          }`}>
                            {sig.triggered ? 'TRIGGERED' : 'SAFE'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#a0aec0] mt-2 leading-relaxed">
                          {sig.evidence}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                {!isScanning && (
                  <Button
                    onClick={handleRunScan}
                    className="w-full mt-6 bg-[#0075ff] hover:bg-[#0075ff]/80 text-white rounded-xl py-5 font-bold cursor-pointer border-transparent"
                  >
                    <span>Re-run Threat Telemetry Scan</span>
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-[11px] text-[#a0aec0]">
                <span>Proceed to Step 2 to map money layering flows.</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#00f2fe] animate-bounce-horizontal" />
              </div>
            </div>
          )}

          {/* STEP 2: MONEY FLOW GRAPH HERO CANVAS */}
          {activeStep === 2 && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
              <div className="h-10 border-b border-white/10 bg-[#0a0e31]/20 flex items-center justify-between px-6">
                <span className="text-[10px] font-mono text-[#a0aec0] uppercase tracking-wider flex items-center space-x-1.5">
                  <Play className="h-3.5 w-3.5 text-[#0075ff]" />
                  <span>STEP 2: Trace suspicious transfer links and shared nodes</span>
                </span>
                <span className="text-[10px] text-[#00f2fe] font-mono">Select entities to inspect KYC fingerprint details</span>
              </div>
              
              <div className="flex-1 relative bg-slate-950/70">
                <MoneyFlowGraph 
                  nodes={scenario.graph.nodes}
                  edges={scenario.graph.edges}
                  isFrozen={isFrozen}
                  onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                />

                {/* Left overlay stats */}
                <div className="absolute top-4 left-4 z-10 bg-[#0a0e31]/90 border border-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-2xl">
                  <span className="block text-[9px] font-mono text-[#a0aec0] uppercase font-bold tracking-wider">Target Ring Depth</span>
                  <span className="text-base font-bold text-white">3 Layer Hops</span>
                </div>

                {/* Entity Inspector */}
                {(() => {
                  const selectedNode = scenario.graph.nodes.find(n => n.id === selectedNodeId);
                  if (!selectedNode) return null;
                  return (
                    <div className="absolute bottom-4 left-4 z-10 w-64 bg-[#0a0e31]/95 border border-white/10 backdrop-blur-md p-4 rounded-[20px] shadow-2xl flex flex-col animate-in fade-in duration-250">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                        <span className="text-[9px] font-bold text-[#00f2fe] font-mono uppercase tracking-wider flex items-center space-x-1">
                          <User className="h-3.5 w-3.5" />
                          <span>Entity Inspector</span>
                        </span>
                        <button 
                          onClick={() => setSelectedNodeId(null)}
                          className="text-slate-400 hover:text-slate-200 text-sm font-bold font-mono cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-white">{selectedNode.label}</h4>
                      <p className="text-[9px] text-[#a0aec0] font-mono mt-0.5">ID: {selectedNode.id}</p>
                      
                      <div className="mt-3 space-y-1.5 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-[#a0aec0]">Status:</span>
                          <span className={`font-mono font-bold ${selectedNode.status === 'FROZEN' || isFrozen ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                            {isFrozen ? 'FROZEN' : selectedNode.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a0aec0]">Device ID:</span>
                          <span className="text-slate-200 font-mono">{selectedNode.deviceFingerprint}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a0aec0]">IP Address:</span>
                          <span className="text-slate-200 font-mono">{selectedNode.ipAddress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a0aec0]">Role Type:</span>
                          <span className="text-[#00f2fe] capitalize font-mono">{selectedNode.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Legend panel */}
                <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-4 bg-[#0a0e31]/95 border border-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-2xl text-[9px] font-mono">
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-[#a0aec0]">Victim</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                    <span className="text-[#a0aec0]">Intermediary</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                    <span className="text-[#a0aec0]">Target Hub</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    <span className="text-[#a0aec0]">Cashout</span>
                  </div>
                </div>
              </div>

              {/* Bottom Timeline Ledger */}
              <div className="h-44 bg-[#0a0e31]/40 border-t border-white/10 flex flex-col">
                <div className="h-8 border-b border-white/5 bg-[#0a0e31]/20 flex items-center justify-between px-4">
                  <span className="text-[9px] font-mono text-[#a0aec0] uppercase tracking-wider font-semibold">Chronological Event Logs</span>
                </div>
                <div className="flex-1 overflow-x-auto p-3 relative flex items-stretch space-x-3.5 scrollbar-thin">
                  <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-white/5 -translate-y-1/2 pointer-events-none z-0" />
                  {scenario.timeline.map((event) => {
                    let borderTheme = 'border-white/5 bg-[#060b26]/30';
                    if (event.type === 'transaction') borderTheme = 'border-[#0075ff]/20 bg-[#0075ff]/5';
                    else if (event.type === 'device_swap') borderTheme = 'border-[#e100ff]/20 bg-[#e100ff]/5';
                    else if (event.type === 'cyber_tip') borderTheme = 'border-red-500/20 bg-red-500/5';

                    return (
                      <div key={event.id} className={`w-64 flex-shrink-0 p-2.5 rounded-[15px] border flex flex-col justify-between z-10 backdrop-blur-sm ${borderTheme} text-[10px]`}>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[#a0aec0] font-mono">{event.type}</span>
                            <span className="text-[8px] text-[#a0aec0] font-mono" suppressHydrationWarning>
                              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h4 className="text-[11px] font-semibold text-white line-clamp-1">{event.title}</h4>
                          <p className="text-[9px] text-[#a0aec0] mt-0.5 line-clamp-2 leading-tight">{event.description}</p>
                        </div>
                        {event.amount && (
                          <div className="text-right mt-1.5 font-bold font-mono text-[#00f2fe]">${event.amount.toLocaleString()}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SPLIT MONEY FLOW GRAPH & COPILOT CHAT PANEL */}
          {activeStep === 3 && (
            <div className="flex-1 flex overflow-hidden animate-in fade-in duration-300">
              
              {/* Left Graph Panel */}
              <div className="flex-1 h-full relative border-r border-white/10 bg-slate-950/60">
                <MoneyFlowGraph 
                  nodes={scenario.graph.nodes}
                  edges={scenario.graph.edges}
                  isFrozen={isFrozen}
                  onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                />
                
                {/* Floating legend */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-3 bg-[#0a0e31]/95 border border-white/10 backdrop-blur-md px-3 py-2 rounded-xl shadow-2xl text-[8px] font-mono">
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                    <span className="text-[#a0aec0]">Target Hub</span>
                  </div>
                </div>
              </div>

              {/* Right Copilot Chat Panel */}
              <div className="w-[420px] h-full flex flex-col bg-[#0a0e31]/25 backdrop-blur-xl">
                <div className="p-4 border-b border-white/10 bg-[#0a0e31]/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-[#0075ff] animate-pulse" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">Gemini Forensic Copilot</h2>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scrollbar-thin">
                  {chatMessages.length === 0 && !isAnalyzing ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                      <div className="h-10 w-10 rounded-2xl bg-[#0075ff]/10 border border-[#0075ff]/20 flex items-center justify-center mb-3 text-[#00f2fe] shadow-[0_0_15px_rgba(0,117,255,0.2)]">
                        <Cpu className="h-5 w-5" />
                      </div>
                      <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider mb-1">Instant Risk Explanation</h3>
                      <p className="text-[11px] text-[#a0aec0] mb-5 leading-relaxed">Let Gemini analyze this suspicious chain and auto-draft your regulatory filing narratives.</p>
                      
                      <div className="flex flex-col space-y-2 w-full max-w-xs">
                        <Button 
                          onClick={() => callChatApi("Analyze this critical alert and highlight the main risk factors.")}
                          className="w-full font-semibold flex items-center justify-center space-x-2 bg-[#0075ff] hover:bg-[#0075ff]/80 text-white rounded-xl py-4.5 cursor-pointer shadow-[0_0_12px_rgba(0,117,255,0.3)] border-transparent"
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>Analyze Alert with Gemini</span>
                        </Button>
                        
                        <Button 
                          onClick={() => callChatApi("Draft a formal regulatory Suspicious Activity Report (SAR) narrative for this transaction ring.")}
                          className="w-full font-semibold flex items-center justify-center space-x-2 bg-transparent hover:bg-white/5 text-white rounded-xl py-4.5 border-white/10 cursor-pointer"
                        >
                          <Shield className="h-3.5 w-3.5 text-[#00f2fe]" />
                          <span>Draft SAR Narrative</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1">
                      {chatMessages.map((msg, index) => (
                        <div 
                          key={index} 
                          className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[9px] font-mono text-[#a0aec0] mb-1 px-1">
                            {msg.role === 'user' ? 'Investigator' : 'Gemini Copilot'}
                          </span>
                          <div 
                            className={`p-3.5 rounded-[18px] max-w-[95%] text-xs font-sans leading-relaxed ${
                              msg.role === 'user' 
                                ? 'bg-[#0075ff] text-white rounded-tr-none whitespace-pre-wrap' 
                                : 'bg-[#0a0e31]/80 border border-white/10 text-slate-200 rounded-tl-none shadow-xl'
                            }`}
                          >
                            {msg.role === 'user' ? msg.content : renderMarkdown(msg.content)}
                          </div>
                        </div>
                      ))}
                      
                      {isAnalyzing && (
                        <div className="flex flex-col items-start">
                          <span className="text-[9px] font-mono text-[#a0aec0] mb-1 px-1">Gemini Copilot</span>
                          <div className="p-3.5 rounded-2xl bg-[#0a0e31]/80 border border-white/10 rounded-tl-none w-5/6 flex flex-col space-y-2 shadow-2xl">
                            <div className="h-3 bg-[#060b26] rounded animate-pulse w-full" />
                            <div className="h-3 bg-[#060b26] rounded animate-pulse w-5/6" />
                            <div className="h-3 bg-[#060b26] rounded animate-pulse w-4/6" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Prompt bar with suggest chips */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    callChatApi(chatInput);
                  }}
                  className="p-4 border-t border-white/10 bg-[#0a0e31]/40 flex flex-col space-y-3"
                >
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => callChatApi("Analyze this critical alert and highlight the main risk factors.")}
                      className="text-[9px] px-2 py-1 bg-[#060b26] border border-white/5 text-[#a0aec0] hover:bg-[#0075ff]/20 hover:text-white transition-all rounded-lg cursor-pointer font-mono"
                      disabled={isAnalyzing}
                    >
                      🔍 Analyze Risk
                    </button>
                    <button
                      type="button"
                      onClick={() => callChatApi("Draft a formal regulatory Suspicious Activity Report (SAR) narrative for this transaction ring.")}
                      className="text-[9px] px-2 py-1 bg-[#060b26] border border-white/5 text-[#a0aec0] hover:bg-[#0075ff]/20 hover:text-white transition-all rounded-lg cursor-pointer font-mono"
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
                      className="flex-1 text-xs px-3 py-2 rounded-xl bg-[#060b26] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#0075ff] transition-all"
                      disabled={isAnalyzing}
                    />
                    <Button 
                      type="submit"
                      disabled={isAnalyzing || !chatInput.trim()}
                      className="cursor-pointer font-semibold bg-[#0075ff] hover:bg-[#0075ff]/80 text-white rounded-xl shadow-[0_0_12px_rgba(0,117,255,0.3)] border-transparent"
                    >
                      Send
                    </Button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* STEP 4: ISOLATE & MITIGATE VIEW */}
          {activeStep === 4 && (
            <div className="flex-1 flex overflow-hidden animate-in fade-in duration-300">
              {/* Left Graph visual */}
              <div className="flex-1 h-full relative border-r border-white/10 bg-slate-950/60">
                <MoneyFlowGraph 
                  nodes={scenario.graph.nodes}
                  edges={scenario.graph.edges}
                  isFrozen={isFrozen}
                  onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                />
              </div>

              {/* Right Lock Action panel */}
              <div className="w-[420px] h-full p-6 flex flex-col justify-between bg-[#0a0e31]/25 backdrop-blur-xl">
                <div className="space-y-6">
                  <span className="text-[10px] font-bold text-red-400 font-mono uppercase tracking-widest flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Compliance Isolation Protocol</span>
                  </span>
                  
                  <div className="bg-[#060b26]/50 border border-white/5 rounded-2xl p-4 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-[#00f2fe]" />
                      <span>Security Actions Active</span>
                    </h3>
                    <p className="text-xs text-[#a0aec0] leading-relaxed">
                      Executing the lock isolates the suspect hub, freezing all outbound channels (Zelle, ACH, Wire) and flagging adjacent nodes in the compliance database.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] text-[#a0aec0] font-mono uppercase font-bold tracking-wider">Target Node details</span>
                    <div className="border border-white/10 bg-[#060b26]/40 p-3.5 rounded-xl space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-[#a0aec0]">Subject Name:</span>
                        <span className="text-white font-bold">{currentAlert.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0aec0]">Account ID:</span>
                        <span className="text-slate-200">acc-{currentAlert.targetAccountId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a0aec0]">Risk Status:</span>
                        <span className={`font-bold ${isFrozen ? 'text-red-400' : 'text-rose-500 animate-pulse'}`}>
                          {isFrozen ? 'MITIGATION ACTIVE' : 'PENDING FREEZE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6 space-y-4">
                  {isFrozen ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-start space-x-2 font-mono animate-in fade-in duration-300">
                      <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                      <span>Mule hub frozen successfully. Outbound channels disabled. Ledger logs updated. Proceed to Step 5 to file report.</span>
                    </div>
                  ) : (
                    <Button
                      onClick={handleFreeze}
                      className="w-full py-6 text-sm font-bold uppercase bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.4)] border-transparent cursor-pointer hover:scale-[1.02] transition-transform animate-pulse"
                    >
                      <Lock className="h-4.5 w-4.5 mr-2" />
                      <span>Execute Freeze Protocol</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: FINCEN REPORT & RESOLVED DASHBOARD */}
          {activeStep === 5 && (
            <div className="flex-1 p-6 flex flex-col justify-center items-center max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
              
              <div className="w-full bg-[#0a0e31]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] rounded-[24px] p-6 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <FileCheck2 className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-emerald-400 font-mono uppercase tracking-widest">Case Resolution Status</span>
                    <h3 className="text-xl font-bold text-white">Resolved, Lock Confirmed & SAR Drafted</h3>
                    <p className="text-xs text-[#a0aec0] mt-0.5">Final regulatory compliance filing ready for federal FinCEN databases.</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#a0aec0] font-mono block">FILING STATUS</span>
                  <span className={`text-xs font-bold font-mono ${sarSubmitted[selectedAlertId] ? 'text-emerald-400' : 'text-amber-450'}`}>
                    {sarSubmitted[selectedAlertId] ? 'SUBMITTED' : 'PENDING SUBMISSION'}
                  </span>
                </div>
              </div>

              {/* Regulatory Form */}
              <div className="w-full bg-[#0a0e31]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] rounded-[24px] p-6 flex flex-col justify-between flex-1 max-h-[500px]">
                <div className="space-y-4 flex flex-col flex-1 overflow-hidden">
                  
                  {/* Preloaded Fields */}
                  <div className="border border-white/10 bg-[#060b26]/50 rounded-xl p-3.5 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 block">Filing Entity:</span>
                      <span className="text-slate-200">Sentinel Security Inc</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Target Subject:</span>
                      <span className="text-slate-200">{currentAlert.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Identified Risk Score:</span>
                      <span className="text-rose-500 font-bold">{currentAlert.riskScore}/100</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Resolution Action:</span>
                      <span className="text-red-400 font-bold">Freezing Isolation</span>
                    </div>
                  </div>

                  {/* Narrative text field */}
                  <div className="space-y-2 flex-1 flex flex-col overflow-hidden">
                    <label className="text-[10px] uppercase font-bold tracking-wider font-mono text-[#a0aec0]">Sec. V: Narrative Description (Editable)</label>
                    {currentSar ? (
                      <textarea 
                        value={currentSar}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSarNarratives(prev => ({ ...prev, [selectedAlertId]: val }));
                        }}
                        className="w-full flex-1 p-3 text-xs rounded-xl bg-[#060b26] border border-white/10 text-slate-355 focus:outline-none focus:border-[#0075ff] leading-relaxed font-sans scrollbar-thin overflow-y-auto"
                      />
                    ) : (
                      <div className="flex-1 border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-[#0a0e31]/10">
                        <FileText className="h-8 w-8 text-slate-600 mb-2" />
                        <p className="text-xs text-[#a0aec0] max-w-xs">No SAR narrative drafted in Step 3. Proceed back or type a narrative manually.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Submit Trigger */}
                <div className="border-t border-white/10 pt-4 mt-4">
                  {sarSubmitted[selectedAlertId] ? (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center space-x-2 text-xs text-emerald-450 font-mono shadow-[0_0_12px_rgba(16,185,129,0.15)] animate-in fade-in duration-300">
                      <CheckCircle className="h-4.5 w-4.5" />
                      <span>Filing successfully uploaded. FinCEN token: FinCEN-2026-{selectedAlertId.replace('alert-', '')}. Case marked CLOSED.</span>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleSubmitSar}
                      disabled={!currentSar}
                      className="w-full py-3.5 font-bold uppercase bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)] border-transparent"
                    >
                      Submit Regulatory Filing to FinCEN Gateway
                    </Button>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </main>
  );
}
