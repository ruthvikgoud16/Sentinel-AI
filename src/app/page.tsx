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

const CountUp = ({ end, duration = 800, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  React.useEffect(() => {
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
  const [mlLoadingStage, setMlLoadingStage] = useState<string>('');

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

  // Helper to color-code risk tiers
  const getRiskColor = (score: number) => {
    if (score < 40) return { text: '#166534', bg: '#f0fdf4', border: '#bbf7d0', borderTailwind: 'border-[#166534]', textTailwind: 'text-[#166534]', label: 'LOW' };
    if (score < 75) return { text: '#b45309', bg: '#fef3c7', border: '#fde68a', borderTailwind: 'border-[#b45309]', textTailwind: 'text-[#b45309]', label: 'MEDIUM' };
    return { text: '#991B1B', bg: '#fef2f2', border: '#fca5a5', borderTailwind: 'border-[#991B1B]', textTailwind: 'text-[#991B1B]', label: 'CRITICAL' };
  };

  React.useEffect(() => {
    const fetchMlScore = async () => {
      setIsLoadingMlScore(true);
      setMlLoadingStage("Analyzing transaction graph...");
      await new Promise(r => setTimeout(r, 900));
      setMlLoadingStage("Consulting GraphSAGE GNN...");
      await new Promise(r => setTimeout(r, 900));
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
        setMlLoadingStage("");
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
    <main className="flex h-screen w-screen overflow-hidden bg-[#F4EFE6] text-[#1C1E1E] font-mono antialiased relative bg-paper-grain bg-watermark">
      {/* FinCEN Submission Success Toast (Filing resolution step) */}
      {sarSubmitted[selectedAlertId] && (
        <div className="absolute top-24 right-6 z-50 max-w-sm bg-[#FDFBF7] border-2 border-[#166534] text-[#1C1E1E] p-4 rounded shadow-lg flex items-start space-x-3 backdrop-blur-xl animate-in fade-in duration-300">
          <CheckCircle className="h-5 w-5 text-[#166534] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-[#1C1E1E] font-mono">Filing Status: ARCHIVED</h4>
            <p className="text-[10px] text-[#666258] mt-1 leading-relaxed font-mono">Regulatory submission successful. Report ID: <strong>FinCEN-2026-{selectedAlertId.toUpperCase()}</strong> has been stamped and filed.</p>
            <button 
              onClick={() => setSarSubmitted(prev => ({ ...prev, [selectedAlertId]: false }))}
              className="text-[9px] font-bold text-[#1D4ED8] hover:underline mt-2 cursor-pointer font-mono"
            >
              [ DISMISS LOG ]
            </button>
          </div>
        </div>
      )}

      {/* 1. INVESTIGATION FILE HEADER WITH STEPPER TAB DIVIDERS */}
      <div className="absolute top-4 left-4 right-4 h-16 bg-[#FDFBF7] border border-[#D2C9B9] shadow-sm rounded flex items-center justify-between px-6 z-10 font-mono">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 border-2 border-[#991B1B] text-[#991B1B] rounded flex items-center justify-center bg-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <span className="font-bold tracking-tight text-xs text-[#1C1E1E] uppercase font-mono">SENTINEL FORENSIC AUDIT</span>
              <a href="/showcase" className="text-[7px] bg-[#E8E2D5] text-[#666258] hover:bg-[#D2C9B9] hover:text-[#1C1E1E] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider transition-colors border border-[#D2C9B9]">
                Model Validation
              </a>
            </div>
            <p className="text-[8px] text-[#666258] tracking-widest uppercase">CASE DOSSIER: SC-{currentAlert.targetAccountId}</p>
          </div>
        </div>

        {/* FILE STEP DIVIDER TABS */}
        <div className="flex items-center space-x-1 p-1 bg-[#E8E2D5] rounded border border-[#D2C9B9]">
          {steps.map((s) => (
            <React.Fragment key={s.number}>
              <button
                onClick={() => {
                  setSelectedNodeId(null);
                  setActiveStep(s.number);
                }}
                className={`flex items-center space-x-1.5 text-[9px] font-bold font-mono tracking-wider transition-all px-2.5 py-1 rounded cursor-pointer ${
                  activeStep === s.number
                    ? 'text-[#991B1B] bg-[#FDFBF7] border border-[#991B1B]/40 shadow-sm'
                    : s.number < activeStep
                      ? 'text-[#166534] hover:text-[#14532d]'
                      : 'text-[#666258] hover:text-[#1c1e1e]'
                }`}
              >
                <span className={`h-4.5 w-4.5 rounded flex items-center justify-center text-[9px] ${
                  activeStep === s.number
                    ? 'bg-[#991B1B] text-white'
                    : s.number < activeStep
                      ? 'bg-[#166534]/15 text-[#166534]'
                      : 'bg-[#D2C9B9] text-[#666258]'
                }`}>
                  {s.number < activeStep ? '✓' : s.number}
                </span>
                <span className="hidden lg:inline">{s.name}</span>
              </button>
              {s.number < 5 && <ChevronRight className="h-3 w-3 text-[#D2C9B9]" />}
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
              className="bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-bold text-xs px-3.5 py-1.5 rounded border border-[#1d4ed8] cursor-pointer shadow-sm flex items-center space-x-1 hover:scale-[1.01] transition-transform font-mono"
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
              className="bg-[#991B1B] hover:bg-[#7f1d1d] text-white font-bold text-xs px-3.5 py-1.5 rounded border border-[#991B1B] cursor-pointer shadow-sm flex items-center space-x-1.5 font-mono"
            >
              <RotateCcw className="h-3.5 w-3.5 animate-spin-hover" />
              <span>Reset Case</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex w-full h-full pt-24 z-0">
        
        {/* LEFT TRIAGE COLUMN: Only visible in Step 1 */}
        {activeStep === 1 && (
          <div className="w-80 h-full border-r border-[#D2C9B9] bg-[#FDFBF7]/40 flex flex-col p-4 space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex items-center justify-between border-b border-[#D2C9B9] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#666258] font-mono flex items-center space-x-2">
                <ListFilter className="h-3.5 w-3.5" />
                <span>Select Case Target</span>
              </h2>
            </div>

            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search suspect accounts..."
              className="w-full text-xs px-3.5 py-2 rounded bg-white border border-[#D2C9B9] text-[#1C1E1E] placeholder-[#666258]/60 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-all font-mono"
            />

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {filteredAlerts.map((alert) => {
                const alertFrozen = frozenAlerts[alert.id];
                return (
                  <div 
                    key={alert.id}
                    onClick={() => handleAlertSelect(alert.id)}
                    className={`p-3.5 rounded border transition-all duration-200 cursor-pointer relative ${
                      selectedAlertId === alert.id 
                        ? alertFrozen
                          ? 'bg-white border-2 border-[#991B1B] shadow-sm'
                          : 'bg-white border-2 border-[#1D4ED8] shadow-sm' 
                        : 'bg-white/70 border-[#D2C9B9] hover:bg-white hover:border-[#666258]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[9px] font-mono text-[#1D4ED8] font-bold tracking-wider">{alert.id.toUpperCase()}</span>
                      {alertFrozen ? (
                        <span className="text-[8px] px-2 py-0.5 rounded font-bold font-mono tracking-wider border bg-[#991B1B]/15 text-[#991B1B] border-[#991B1B]/20">
                          FROZEN
                        </span>
                      ) : (
                        <span 
                          className="text-[8px] px-2 py-0.5 rounded font-bold font-mono tracking-wider border"
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

                    <h3 className="text-xs font-bold text-[#1C1E1E] font-sans">{alert.customerName}</h3>
                    <p className="text-[10px] text-[#666258] mt-1 line-clamp-1">{alert.description}</p>
                    
                    <div className="flex items-center justify-between text-[8px] font-mono text-[#666258] mt-3 border-t border-[#D2C9B9]/40 pt-2">
                      <span>Acc: {alert.targetAccountId}</span>
                      <span className="font-bold font-mono" style={{ color: getRiskColor(alert.riskScore).text }}>
                        {alert.riskScore}% RISK
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-[#D2C9B9] pt-3 text-[8px] font-mono text-[#666258] uppercase">
              <span>Sentinel Security Audit Gateway v2.1</span>
            </div>
          </div>
        )}

        {/* 3. STEP CONTENT WORKSPACES */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* STEP 1: SIGNAL DETECTION INGEST BOARD */}
          {activeStep === 1 && (
            <div className="flex-1 p-6 flex flex-col justify-center items-center max-w-4xl mx-auto w-full space-y-6 overflow-y-auto animate-in fade-in duration-300">
              <div className="w-full bg-[#FDFBF7] border border-[#D2C9B9] shadow-sm rounded p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative bg-paper-grain hover:-translate-y-[2px] transition-all duration-300 hover:shadow-md cursor-default">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-[#1D4ED8] font-mono uppercase tracking-widest">[ EVIDENCE DOSSIER INTAKE ]</span>
                  <h2 className="text-xl font-bold text-[#1C1E1E] font-mono">{currentAlert.customerName}</h2>
                  <p className="text-xs text-[#666258] max-w-md">{currentAlert.description}</p>
                  <div className="flex items-center space-x-3 text-[9px] font-mono text-[#666258] mt-4">
                    <span>RECORD ID: acc-{currentAlert.targetAccountId}</span>
                    <span>•</span>
                    <span suppressHydrationWarning>LOAD DATE: {new Date(currentAlert.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-stretch space-x-3">
                  {/* Score 1: Rule-Based */}
                  <div className="bg-[#FDFBF7] border border-[#D2C9B9] rounded p-4 flex flex-col items-center justify-center text-center shadow-sm min-w-[130px]">
                    <span className="text-[8px] font-bold text-[#666258] font-mono uppercase tracking-wider">Rule-Based Score</span>
                    <span className={`text-3xl font-extrabold mt-2 font-mono ${getRiskColor(detectionResult.riskScore).textTailwind}`}>
                      <CountUp end={detectionResult.riskScore} suffix="%" />
                    </span>
                    <span className="text-[7px] text-[#666258] font-mono mt-1 uppercase">Ledger Telemetry</span>
                  </div>

                  {/* Score 2: ML Model Stamped slanted */}
                  {(() => {
                    const mlScore = mlScoreData ? mlScoreData.combined_ml_score : detectionResult.riskScore;
                    const mlColor = getRiskColor(mlScore);
                    return (
                      <div 
                        className={`bg-[#FDFBF7] border-2 border-dashed rounded p-4 flex flex-col items-center justify-center text-center shadow-sm min-w-[160px] relative overflow-hidden transform -rotate-2 select-none`}
                        style={{ borderColor: mlColor.text, color: mlColor.text }}
                      >
                        <div 
                          className="absolute top-0 right-0 px-1.5 py-0.5 text-[6px] font-bold rounded-bl font-mono"
                          style={{ backgroundColor: mlColor.text + '22', color: mlColor.text }}
                        >
                          ML STAMP
                        </div>
                        <span className="text-[8px] font-bold font-mono uppercase tracking-wider">ML Model Score</span>
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
                              GraphSAGE GNN
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Rules Checklist */}
              <div className="w-full bg-[#FDFBF7] border border-[#D2C9B9] shadow-sm rounded p-6 flex flex-col bg-paper-grain">
                <span className="text-xs font-bold text-[#1C1E1E] font-mono uppercase tracking-wider mb-4 flex items-center space-x-2 border-b border-[#D2C9B9] pb-2.5">
                  <Activity className="h-4 w-4 text-[#991B1B]" />
                  <span>Sentinel Forensic Rules Engine Checklist</span>
                </span>
                
                {isScanning ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <div className="h-6 w-6 rounded-full border-2 border-[#1D4ED8] border-t-transparent animate-spin" />
                    <span className="text-xs text-[#1D4ED8] font-mono animate-pulse">Running telemetry verification rules...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detectionResult.triggeredSignals.map((sig) => (
                      <div key={sig.id} className="p-3.5 rounded border border-[#D2C9B9] bg-white flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-[#666258] font-bold">RULE: {sig.id}</span>
                          <span className={`text-[8px] px-2 py-0.5 rounded font-bold font-mono tracking-wider border ${
                            sig.triggered 
                              ? 'bg-[#991B1B]/10 text-[#991B1B] border-[#991B1B]/20' 
                              : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                          }`}>
                            {sig.triggered ? 'TRIGGERED' : 'CLEARED'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#1C1E1E] mt-2 font-mono">{sig.name}</h4>
                        <p className="text-[10px] text-[#666258] mt-1 leading-relaxed">{sig.description}</p>
                        <div className="flex items-center justify-between mt-3 text-[9px] font-mono text-[#666258] border-t border-[#D2C9B9]/30 pt-2">
                          <span>Risk Weight: {sig.weight}%</span>
                          <span className="font-bold">{sig.triggered ? `+${sig.weight}%` : '0%'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-[#D2C9B9] pt-4 mt-6 flex justify-between items-center">
                  <div className="text-[9px] font-mono text-[#666258]">
                    <span>STATUS: scan completed successfully.</span>
                  </div>
                  <button 
                    onClick={handleRunScan}
                    disabled={isScanning}
                    className="px-4 py-2 bg-[#E8E2D5] hover:bg-[#D2C9B9] text-[#1C1E1E] font-bold text-xs rounded border border-[#D2C9B9] cursor-pointer transition-colors font-mono"
                  >
                    {isScanning ? "Verifying..." : "Re-run Threat Telemetry Scan"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MONEY FLOW GRAPH HERO CANVAS */}
          {activeStep === 2 && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
              <div className="h-10 border-b border-[#D2C9B9] bg-[#E8E2D5]/30 flex items-center justify-between px-6 font-mono">
                <span className="text-[10px] text-[#666258] uppercase tracking-wider flex items-center space-x-1.5">
                  <Play className="h-3.5 w-3.5 text-[#1D4ED8]" />
                  <span>STEP 2: money flow graph chain of custody tracing</span>
                </span>
                <span className="text-[9px] text-[#1D4ED8] font-bold">[ CLICK NODE TO PIN INDEX CARD ]</span>
              </div>
              
              <div className="flex-1 relative bg-[#FDFBF7]">
                {/* Ledger paper grid lines in background */}
                <div className="absolute inset-0 ledger-grid opacity-75 pointer-events-none" />
                
                <MoneyFlowGraph 
                  nodes={scenario.graph.nodes}
                  edges={scenario.graph.edges}
                  isFrozen={isFrozen}
                  onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                />

                {/* Left overlay stats */}
                <div className="absolute top-4 left-4 z-10 bg-white border border-[#D2C9B9] p-3 rounded shadow-sm font-mono text-[10px]">
                  <span className="block text-[#666258] uppercase font-bold tracking-wider">TARGET RING HOP LEVEL</span>
                  <span className="text-sm font-bold text-[#1C1E1E]">3-Tier Layering Depth</span>
                </div>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 right-4 z-10 bg-white border border-[#D2C9B9] p-3 rounded shadow-sm font-mono text-[9px] space-y-1.5">
                  <span className="block font-bold text-[#666258] border-b border-[#D2C9B9] pb-1 uppercase">Legend</span>
                  <div className="flex items-center space-x-2"><div className="h-2.5 w-2.5 rounded-full bg-[#166534]" /> <span>Victim</span></div>
                  <div className="flex items-center space-x-2"><div className="h-2.5 w-2.5 rounded-full bg-[#a16207]" /> <span>Intermediary</span></div>
                  <div className="flex items-center space-x-2"><div className="h-2.5 w-2.5 rounded-full bg-[#991B1B]" /> <span>Target Hub</span></div>
                  <div className="flex items-center space-x-2"><div className="h-2.5 w-2.5 rounded-full bg-[#1d4ed8]" /> <span>Crypto Out</span></div>
                </div>

                {/* Entity Inspector styled as an Index Card */}
                {(() => {
                  const selectedNode = scenario.graph.nodes.find(n => n.id === selectedNodeId);
                  if (!selectedNode) return null;
                  return (
                    <div className="absolute bottom-4 left-4 z-10 w-72 bg-[#FDFBF7] border-2 border-[#1C1E1E] p-4 rounded shadow-lg flex flex-col font-mono text-[10px] text-[#1C1E1E] animate-in fade-in duration-200">
                      <div className="border-b border-[#D2C9B9] pb-2 mb-2 flex items-center justify-between">
                        <span className="font-bold text-[#1D4ED8] uppercase">Entity Profile Card</span>
                        <button onClick={() => setSelectedNodeId(null)} className="text-[#666258] hover:text-black font-bold text-xs">[ X ]</button>
                      </div>
                      
                      <div className="space-y-1.5 leading-relaxed">
                        <div className="flex justify-between">
                          <span className="text-[#666258]">Account Name:</span>
                          <span className="font-bold text-right">{selectedNode.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#666258]">Account ID:</span>
                          <span className="font-bold">{selectedNode.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#666258]">Category:</span>
                          <span className="font-bold uppercase text-[#991B1B]">{selectedNode.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#666258]">Device Fingerprint:</span>
                          <span className="font-bold text-[9px] bg-yellow-100/50 px-1 border border-yellow-250/50">{selectedNode.deviceFingerprint}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#666258]">IP Address:</span>
                          <span className="font-bold">{selectedNode.ipAddress}</span>
                        </div>
                        
                        {/* Redacted element for mock ledger card authenticity */}
                        <div className="flex justify-between border-t border-[#D2C9B9]/30 pt-1.5 mt-1">
                          <span className="text-[#666258]">Tax Payer ID:</span>
                          <span className="redacted font-bold px-1.5">[ REDACTED ]</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Bottom Timeline Ledger */}
              <div className="h-44 bg-[#E8E2D5]/20 border-t border-[#D2C9B9] flex flex-col">
                <div className="h-8 border-b border-[#D2C9B9] bg-[#E8E2D5]/30 flex items-center justify-between px-4 font-mono">
                  <span className="text-[9px] text-[#666258] uppercase tracking-wider font-semibold">Chronological Event Logs (Chain of Custody)</span>
                </div>
                <div className="flex-1 overflow-x-auto p-3 relative flex items-stretch space-x-3.5 scrollbar-thin">
                  <div className="absolute top-1/2 left-6 right-6 h-px bg-[#D2C9B9] -translate-y-1/2 pointer-events-none z-0" />
                  {scenario.timeline.map((event) => {
                    let borderTheme = 'border-[#D2C9B9] bg-white';
                    if (event.type === 'transaction') borderTheme = 'border-[#1D4ED8]/30 bg-blue-50/50';
                    else if (event.type === 'device_swap') borderTheme = 'border-amber-500/30 bg-amber-50/50';
                    else if (event.type === 'cyber_tip') borderTheme = 'border-[#991B1B]/30 bg-red-50/50';

                    return (
                      <div key={event.id} className={`w-64 flex-shrink-0 p-2.5 rounded border flex flex-col justify-between z-10 backdrop-blur-sm ${borderTheme} text-[10px] text-[#1C1E1E] font-mono shadow-sm`}>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[#666258]">{event.type}</span>
                            <span className="text-[8px] text-[#666258]" suppressHydrationWarning>
                              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h4 className="text-[10px] font-bold line-clamp-1">{event.title}</h4>
                          <p className="text-[9px] text-[#666258] mt-0.5 line-clamp-2 leading-tight">{event.description}</p>
                        </div>
                        {event.amount && (
                          <div className="text-right mt-1.5 font-bold text-[#1D4ED8]">${event.amount.toLocaleString()}</div>
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
              <div className="flex-1 h-full relative border-r border-[#D2C9B9] bg-[#FDFBF7]">
                <div className="absolute inset-0 ledger-grid opacity-60 pointer-events-none" />
                <MoneyFlowGraph 
                  nodes={scenario.graph.nodes}
                  edges={scenario.graph.edges}
                  isFrozen={isFrozen}
                  onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                />
                
                {/* Floating legend */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-3 bg-white border border-[#D2C9B9] px-3 py-2 rounded shadow-sm text-[8px] font-mono">
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 rounded-full bg-[#991B1B]" />
                    <span className="text-[#666258] font-bold">Target Hub</span>
                  </div>
                </div>
              </div>

              {/* Right Copilot Chat Panel */}
              <div className="w-[420px] h-full flex flex-col bg-[#FDFBF7] border-l border-[#D2C9B9]">
                <div className="p-4 border-b border-[#D2C9B9] bg-[#E8E2D5]/30 flex items-center justify-between font-mono">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-[#991B1B]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#1C1E1E]">Gemini Forensic Copilot</h2>
                  </div>
                  <span className="text-[8px] text-[#166534] font-bold">[ ONLINE ]</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scrollbar-thin">
                  {chatMessages.length === 0 && !isAnalyzing ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4">
                      <div className="h-10 w-10 border-2 border-[#D2C9B9] text-[#666258] rounded flex items-center justify-center bg-white shadow-sm">
                        <Cpu className="h-5 w-5" />
                      </div>
                      <h3 className="text-xs font-bold text-[#1C1E1E] uppercase font-mono tracking-wider mb-1">Instant Forensic Report</h3>
                      <p className="text-[10px] text-[#666258] mb-5 leading-relaxed max-w-xs">Let Gemini analyze this suspicious chain and auto-draft your regulatory filing narratives.</p>
                      
                      <div className="flex flex-col space-y-2 w-full max-w-xs font-mono">
                        <button 
                          onClick={() => callChatApi("Analyze this critical alert and highlight the main risk factors.")}
                          className="w-full font-bold flex items-center justify-center space-x-2 bg-[#E8E2D5] hover:bg-[#D2C9B9] text-[#1C1E1E] rounded py-2 cursor-pointer border border-[#D2C9B9] text-[9px] uppercase transition-colors"
                        >
                          <TrendingUp className="h-3.5 w-3.5 text-[#1D4ED8]" />
                          <span>Analyze Alert with Gemini</span>
                        </button>
                        
                        <button 
                          onClick={() => callChatApi("Draft a formal regulatory Suspicious Activity Report (SAR) narrative for this transaction ring.")}
                          className="w-full font-bold flex items-center justify-center space-x-2 bg-transparent hover:bg-stone-50 text-[#1C1E1E] rounded py-2 border border-[#D2C9B9] cursor-pointer text-[9px] uppercase transition-colors"
                        >
                          <Shield className="h-3.5 w-3.5 text-[#991B1B]" />
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
                          <span className="text-[8px] font-mono text-[#666258] mb-1 px-1 font-bold">
                            {msg.role === 'user' ? 'Investigator' : 'Gemini Audit Agent'}
                          </span>
                          <div 
                            className={`p-3.5 rounded text-xs font-mono leading-relaxed border shadow-sm ${
                              msg.role === 'user' 
                                ? 'bg-blue-50/50 border-[#1D4ED8]/30 text-[#1c1e1e] max-w-[85%] rounded-tr-none' 
                                : 'bg-white border-[#D2C9B9] text-[#1c1e1e] rounded-tl-none max-w-full font-mono text-[10px]'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      
                      {isAnalyzing && (
                        <div className="flex flex-col items-start animate-pulse">
                          <span className="text-[8px] font-mono text-[#666258] mb-1 px-1 font-bold">Gemini Audit Agent</span>
                          <div className="p-3.5 rounded border border-[#D2C9B9] bg-white rounded-tl-none w-5/6 flex flex-col space-y-2 shadow-sm">
                            <div className="h-3 bg-[#E8E2D5] rounded animate-pulse w-full" />
                            <div className="h-3 bg-[#E8E2D5] rounded animate-pulse w-5/6" />
                            <div className="h-3 bg-[#E8E2D5] rounded animate-pulse w-4/6" />
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
                    if (!chatInput.trim()) return;
                    callChatApi(chatInput);
                  }}
                  className="p-4 border-t border-[#D2C9B9] bg-white flex flex-col space-y-3"
                >
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => callChatApi("Analyze this critical alert and highlight the main risk factors.")}
                      className="text-[9px] px-2 py-1 bg-[#E8E2D5] border border-[#D2C9B9] text-[#1C1E1E] hover:bg-[#1D4ED8] hover:text-white transition-all rounded font-mono cursor-pointer font-bold uppercase"
                      disabled={isAnalyzing}
                    >
                      🔍 Analyze Risk
                    </button>
                    <button
                      type="button"
                      onClick={() => callChatApi("Draft a formal regulatory Suspicious Activity Report (SAR) narrative for this transaction ring.")}
                      className="text-[9px] px-2 py-1 bg-[#E8E2D5] border border-[#D2C9B9] text-[#1C1E1E] hover:bg-[#1D4ED8] hover:text-white transition-all rounded font-mono cursor-pointer font-bold uppercase"
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
                      className="flex-1 text-xs px-3 py-2 rounded bg-white border border-[#D2C9B9] text-[#1C1E1E] placeholder-[#666258]/60 focus:outline-none focus:border-[#1D4ED8] transition-all font-mono"
                      disabled={isAnalyzing}
                    />
                    <button 
                      type="submit"
                      disabled={isAnalyzing || !chatInput.trim()}
                      className="px-4 bg-[#1C1E1E] text-white rounded hover:bg-[#1C1E1E]/80 transition-colors disabled:opacity-50 cursor-pointer font-mono text-xs font-bold"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* STEP 4: ISOLATE & MITIGATE VIEW */}
          {activeStep === 4 && (
            <div className="flex-1 flex overflow-hidden animate-in fade-in duration-300">
              {/* Left Graph Panel */}
              <div className="flex-1 h-full relative border-r border-[#D2C9B9] bg-[#FDFBF7]">
                <div className="absolute inset-0 ledger-grid opacity-60 pointer-events-none" />
                <MoneyFlowGraph 
                  nodes={scenario.graph.nodes}
                  edges={scenario.graph.edges}
                  isFrozen={isFrozen}
                  onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                />
              </div>

              {/* Right Lock Action panel */}
              <div className="w-[420px] h-full p-6 flex flex-col justify-between bg-[#FDFBF7] border-l border-[#D2C9B9]">
                <div className="space-y-6">
                  <span className="text-[10px] font-bold text-[#991B1B] font-mono uppercase tracking-widest flex items-center space-x-2 border-b border-[#D2C9B9] pb-3">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Compliance Isolation Protocol</span>
                  </span>
                  
                  <div className="bg-[#FDFBF7] border border-[#D2C9B9] rounded p-4 space-y-3 shadow-sm">
                    <h3 className="text-xs font-bold text-[#1C1E1E] flex items-center space-x-2 font-mono uppercase">
                      <Lock className="h-4 w-4 text-[#991B1B]" />
                      <span>Security Action Pending</span>
                    </h3>
                    <p className="text-[11px] text-[#666258] leading-relaxed">
                      Executing the lock isolates the suspect hub, freezing all outbound channels (Zelle, ACH, Wire) and flagging adjacent nodes in the compliance ledger database.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] text-[#666258] font-mono uppercase font-bold tracking-wider">Target Node Telemetry</span>
                    <div className="border border-[#D2C9B9] bg-white p-3.5 rounded space-y-2 text-xs font-mono text-[#1C1E1E] shadow-sm">
                      <div className="flex justify-between">
                        <span className="text-[#666258]">Subject Name:</span>
                        <span className="font-bold">{currentAlert.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666258]">Account ID:</span>
                        <span className="font-bold">acc-{currentAlert.targetAccountId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666258]">Risk Status:</span>
                        <span className={`font-bold uppercase ${isFrozen ? 'text-[#166534]' : 'text-[#991B1B] animate-pulse'}`}>
                          {isFrozen ? 'MITIGATION ACTIVE' : 'PENDING FREEZE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#D2C9B9] pt-6 space-y-4 font-mono">
                  {isFrozen ? (
                    <div className="p-4 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-2 animate-in fade-in duration-300">
                      <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                      <span>Mule hub frozen successfully. Outbound channels disabled. Ledger logs updated. Proceed to Step 5 to file report.</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleFreeze}
                      className="w-full py-4 text-xs font-bold uppercase bg-[#991B1B] hover:bg-[#7f1d1d] text-white rounded cursor-pointer shadow-sm border-transparent hover:scale-[1.01] transition-transform flex items-center justify-center space-x-2"
                    >
                      <Lock className="h-4.5 w-4.5" />
                      <span>Execute Freeze Protocol</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REGULATORY SAR FILE COMPLETION */}
          {activeStep === 5 && (
            <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
              
              <div className="w-full bg-white border-2 border-[#1C1E1E] p-8 rounded shadow-md flex flex-col space-y-6 font-mono text-xs text-[#1C1E1E] relative torn-edge">
                
                {/* Large tilted Stamp overlays when frozen */}
                {isFrozen && !sarSubmitted[selectedAlertId] && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-dashed border-[#991B1B] px-8 py-3 text-4xl font-extrabold text-[#991B1B] opacity-25 font-mono select-none pointer-events-none uppercase tracking-widest z-10 animate-stamp">
                    ISOLATED / SECURED
                  </div>
                )}

                {/* Large tilted Stamp overlay when submitted/filed */}
                {sarSubmitted[selectedAlertId] && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-double border-[#166534] bg-white/95 px-10 py-5 text-4xl font-black text-[#166534] shadow-xl font-mono select-none pointer-events-none uppercase tracking-widest z-20 animate-stamp">
                    SUBMITTED / FILED
                  </div>
                )}

                {/* Real document style top header */}
                <div className="border-b-4 border-[#1C1E1E] pb-4 flex items-center justify-between">
                  <div>
                    <h1 className="text-sm font-extrabold uppercase">DEPARTMENT OF THE TREASURY - FINCEN</h1>
                    <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#666258]">SUSPICIOUS ACTIVITY REPORT (SAR) - FORM 111</h2>
                  </div>
                  <div className="text-right text-[9px]">
                    <div>OMB No. 1506-0065</div>
                    <div className="font-bold text-[#991B1B] uppercase border border-[#991B1B] px-1.5 py-0.5 rounded mt-1">E-FILING GATEWAY</div>
                  </div>
                </div>

                {/* Part 1: Filing Institution */}
                <div className="space-y-3">
                  <h3 className="font-bold uppercase border-b border-[#1C1E1E] pb-1">Part I: Filing Institution Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[9px] text-[#666258] block">1. Filing Institution Name</span>
                      <span className="font-bold">Sentinel Security Bank Corp</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#666258] block">2. Type of Institution</span>
                      <span className="font-bold">Depository Institution</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#666258] block">3. Primary Regulatory Agency</span>
                      <span className="font-bold">FDIC / FinCEN</span>
                    </div>
                  </div>
                </div>

                {/* Part 2: Subject Details */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold uppercase border-b border-[#1C1E1E] pb-1">Part II: Subject Information (Suspected Money Mule)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[9px] text-[#666258] block">4. Legal Name</span>
                      <span className="font-bold">{currentAlert.customerName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#666258] block">5. Account ID</span>
                      <span className="font-bold">acc-{currentAlert.targetAccountId}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#666258] block">6. Status Indicators</span>
                      <span className="font-bold text-[#991B1B] uppercase">{isFrozen ? 'FROZEN / EXCLUDED' : 'ACTIVE THREAT'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#666258] block">7. Risk Score</span>
                      <span className="font-bold text-[#991B1B]">{currentAlert.riskScore}% CRITICAL</span>
                    </div>
                  </div>
                </div>

                {/* Part 3: Narrative Text Block */}
                <div className="space-y-3 pt-2 flex-1 flex flex-col">
                  <h3 className="font-bold uppercase border-b border-[#1C1E1E] pb-1 flex items-center justify-between">
                    <span>Part III: Detailed Suspicious Activity Narrative Description</span>
                    <span className="text-[8px] text-[#666258] font-normal lowercase">(autosaved via Gemini AI Forensic Analysis)</span>
                  </h3>
                  
                  <div className="flex-1 min-h-[260px] flex flex-col">
                    {currentSar ? (
                      <textarea
                        value={currentSar}
                        onChange={(e) => setSarNarratives(prev => ({ ...prev, [selectedAlertId]: e.target.value }))}
                        className="w-full flex-1 p-4 rounded bg-[#fdfbf7] border border-[#D2C9B9] text-xs font-mono text-[#1C1E1E] leading-relaxed shadow-inner focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] min-h-[260px] scrollbar-thin overflow-y-auto"
                      />
                    ) : (
                      <div className="flex-1 border border-dashed border-[#D2C9B9] rounded p-6 flex flex-col items-center justify-center text-center bg-stone-50">
                        <FileText className="h-8 w-8 text-[#666258] mb-2 opacity-50" />
                        <p className="text-xs text-[#666258] max-w-xs font-mono">No SAR narrative drafted in Step 3. Please return to Step 3 and click &apos;Draft SAR Narrative&apos;, or type a description manually here.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Submit Trigger */}
                <div className="border-t-2 border-[#1C1E1E] pt-4 mt-4">
                  {sarSubmitted[selectedAlertId] ? (
                    <div className="p-3.5 rounded bg-emerald-50 border border-emerald-250 flex items-center justify-center space-x-2 text-xs text-emerald-800 font-mono shadow-sm animate-in fade-in duration-300">
                      <CheckCircle className="h-4.5 w-4.5" />
                      <span>Filing successfully uploaded. FinCEN token: FinCEN-2026-{selectedAlertId.replace('alert-', '')}. Case marked CLOSED.</span>
                    </div>
                  ) : (
                    <button 
                      onClick={handleSubmitSar}
                      disabled={!currentSar}
                      className="w-full py-3.5 font-bold uppercase bg-[#166534] hover:bg-[#14532d] text-white rounded cursor-pointer shadow-sm border-transparent transition-colors font-mono disabled:opacity-50"
                    >
                      Submit Regulatory Filing to FinCEN Gateway
                    </button>
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
