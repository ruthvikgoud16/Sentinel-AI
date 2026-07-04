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
  ListFilter
} from 'lucide-react';
import { SCENARIOS, ALERTS_LIST, DemoScenario, Alert, ROMANCE_SCAM_SCENARIO } from '@/lib/mockData';
import MoneyFlowGraph from '@/components/MoneyFlowGraph';
import { runDetectionEngine } from '@/lib/detectionEngine';
import { Button } from '@/components/ui/button';

export default function Home() {
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
  const [activeTab, setActiveTab] = useState<'chat' | 'sar'>('chat');
  const [sarSubmitted, setSarSubmitted] = useState<Record<string, boolean>>({
    "alert-1042": false,
    "alert-2088": false,
    "alert-3012": false
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const filteredAlerts = ALERTS_LIST.filter(alert => 
    alert.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.severity.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Switch between alert cards
  const handleAlertSelect = (alertId: string) => {
    setSelectedAlertId(alertId);
    setSelectedNodeId(null);
    setScenario(SCENARIOS[alertId]);
    setActiveTab('chat');
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
        setActiveTab('sar'); // Seamless UX transition
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
    }, 1000);
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
          <h4 key={idx} className="text-[10px] font-bold text-[#00f2fe] mt-3 mb-1.5 font-mono uppercase tracking-wider border-b border-[#ffffff]/10 pb-0.5">
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

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#060b26] text-white font-sans antialiased relative">
      {/* FinCEN Submission Success Toast */}
      {sarSubmitted[selectedAlertId] && (
        <div className="absolute top-20 right-4 z-50 max-w-sm bg-slate-900/95 border border-emerald-500/30 text-slate-200 p-4 rounded-[20px] shadow-2xl flex items-start space-x-3 backdrop-blur-xl animate-in fade-in duration-300">
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

      {/* Vision UI Background Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#0075ff]/8 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#e100ff]/8 blur-[130px] pointer-events-none z-0" />

      {/* 1. VISION UI FLOATING HEADER */}
      <div className="absolute top-4 left-4 right-4 h-16 bg-[#0a0e31]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[20px] flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0075ff] to-[#00f2fe] shadow-lg shadow-[#0075ff]/20">
            <Shield className="h-5 w-5 text-white" />
            <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-base text-white">SENTINEL</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0075ff]/20 text-[#00f2fe] border border-[#00f2fe]/20">AI</span>
            </div>
            <p className="text-[9px] text-[#a0aec0] tracking-widest font-mono">MULE INTEL & INVESTIGATION COPILOT</p>
          </div>
        </div>

        {/* Breadcrumb details */}
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[9px] text-[#a0aec0] font-mono tracking-widest uppercase">Pages / Dashboard</span>
            <span className="text-xs font-semibold text-white">Sentinel Mule Intelligence</span>
          </div>
          <div className="h-5 w-[1px] bg-white/10" />
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#e100ff]/10 border border-[#e100ff]/20">
            <AlertTriangle className="h-4 w-4 text-[#e100ff] animate-pulse" />
            <span className="text-[11px] font-bold text-white font-mono uppercase tracking-wider">
              {Object.values(frozenAlerts).filter(v => !v).length} Active Chains
            </span>
          </div>
        </div>
      </div>

      {/* 2. BODY SPLIT */}
      <div className="flex w-full h-full pt-24 z-0">
        
        {/* LEFT COLUMN: Sidebar Alert Queue (Triage Feed) */}
        <div className="w-80 h-full border-r border-white/10 bg-[#0a0e31]/30 backdrop-blur-xl flex flex-col p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#a0aec0] font-mono flex items-center space-x-2">
              <ListFilter className="h-3.5 w-3.5" />
              <span>Triage Queue</span>
            </h2>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#0075ff]/20 border border-[#0075ff]/30 text-white font-mono">3 alerts</span>
          </div>

          {/* Functional Search Filter Input */}
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
                  <p className="text-xs text-[#a0aec0] line-clamp-2 mb-3 leading-relaxed">{alert.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-white/5 pt-2">
                    <div className="flex items-center space-x-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${alertFrozen ? 'bg-red-500' : 'bg-[#e100ff]'}`} />
                      <span className="text-[9px] text-[#a0aec0] font-mono font-bold">MULE RISK: {alert.riskScore}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-[#0a0e31]/60 border border-white/10 rounded-[20px] flex flex-col space-y-2">
            <div className="flex items-center justify-between text-[10px] text-[#a0aec0] font-mono">
              <span>SANDBOX ACTIVE</span>
              <span className="text-[#00f2fe] flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00f2fe] animate-ping" />
                <span>ONLINE</span>
              </span>
            </div>
            <Button 
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold flex items-center justify-center space-x-2 bg-[#060b26]/50 border-white/10 text-white hover:bg-[#060b26]/80 rounded-xl"
              onClick={handleReset}
            >
              <Database className="h-3.5 w-3.5 text-[#00f2fe]" />
              <span>Reset Scenario State</span>
            </Button>
          </div>
        </div>

        {/* WORKSPACE MIDDLE: Top KPI Metrics, Graph + Timeline */}
        <div className="flex-1 h-full flex flex-col overflow-y-auto bg-transparent">
          
          {/* Top KPI Metrics Row (Creative Tim "Vision UI" Dashboard Grid) */}
          <div className="grid grid-cols-4 gap-4 p-4 pb-2">
            
            {/* KPI 1 */}
            <div className="bg-[#0a0e31]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[20px] p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-[#a0aec0] uppercase tracking-wider font-mono font-bold block">Inspected Volume</span>
                <span className="text-base font-bold text-white block mt-0.5">$142,500</span>
                <span className="text-[10px] text-emerald-450 font-semibold font-mono flex items-center mt-0.5">
                  +5.4% <span className="text-[9px] text-[#a0aec0] ml-1">vs yesterday</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0075ff] to-[#00f2fe] flex items-center justify-center text-white shadow-[0_0_12px_rgba(0,117,255,0.4)]">
                <Globe className="h-5 w-5" />
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-[#0a0e31]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[20px] p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-[#a0aec0] uppercase tracking-wider font-mono font-bold block">Suspect Chains</span>
                <span className="text-base font-bold text-white block mt-0.5">3 Target Rings</span>
                <span className="text-[10px] text-emerald-450 font-semibold font-mono flex items-center mt-0.5">
                  +12.1% <span className="text-[9px] text-[#a0aec0] ml-1">vs week ago</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#e100ff] to-[#8a3ffc] flex items-center justify-center text-white shadow-[0_0_12px_rgba(225,0,255,0.4)]">
                <Lock className="h-5 w-5" />
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-[#0a0e31]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[20px] p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-[#a0aec0] uppercase tracking-wider font-mono font-bold block">AI Scan Velocity</span>
                <span className="text-base font-bold text-white block mt-0.5">180s Engine</span>
                <span className="text-[10px] text-emerald-450 font-semibold font-mono flex items-center mt-0.5">
                  -18% <span className="text-[9px] text-[#a0aec0] ml-1">latency drop</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#00f2fe] to-[#0075ff] flex items-center justify-center text-white shadow-[0_0_12px_rgba(0,242,254,0.4)]">
                <Clock className="h-5 w-5" />
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-[#0a0e31]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[20px] p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-[#a0aec0] uppercase tracking-wider font-mono font-bold block">SAR Filing Ratio</span>
                <span className="text-base font-bold text-white block mt-0.5">94.2% Auto</span>
                <span className="text-[10px] text-emerald-450 font-semibold font-mono flex items-center mt-0.5">
                  +8% <span className="text-[9px] text-[#a0aec0] ml-1">audit match</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#00f2fe] to-[#e100ff] flex items-center justify-center text-white shadow-[0_0_12px_rgba(225,0,255,0.4)]">
                <FileText className="h-5 w-5" />
              </div>
            </div>

          </div>

          {/* Mitigation notification banner */}
          {isFrozen && (
            <div className="mx-4 mt-2 bg-red-500/10 border border-red-500/20 px-6 py-2.5 rounded-[15px] flex items-center justify-between z-10 backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-red-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-red-400 font-mono">MITIGATION ACTIVE: Suspect accounts frozen and reported to FinCEN gateway.</span>
              </div>
              <button 
                onClick={() => setFrozenAlerts(prev => ({ ...prev, [selectedAlertId]: false }))}
                className="text-[10px] text-red-450 hover:text-red-300 font-bold underline font-mono cursor-pointer"
              >
                RESET
              </button>
            </div>
          )}

          {/* Main Triage Workspace Canvas Container */}
          <div className="flex-1 m-4 rounded-[24px] border border-white/10 bg-[#0a0e31]/40 backdrop-blur-xl overflow-hidden flex flex-col relative">
            
            {/* Header bar within the canvas */}
            <div className="h-14 border-b border-white/10 bg-[#0a0e31]/20 flex items-center justify-between px-6">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-mono text-[#a0aec0] uppercase tracking-wider">Alert Target:</span>
                <h2 className="text-sm font-semibold text-white">{currentAlert.customerName} (Account #{currentAlert.targetAccountId})</h2>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={handleFreeze}
                  disabled={isFrozen}
                  variant={isFrozen ? "outline" : "destructive"}
                  size="sm"
                  className={`font-semibold cursor-pointer border rounded-xl px-4 py-2 flex items-center space-x-1.5 ${
                    isFrozen ? 'bg-transparent border-red-500/20 text-red-400' : 'bg-[#e100ff] hover:bg-[#8a3ffc] border-transparent text-white shadow-[0_0_12px_rgba(225,0,255,0.4)]'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>{isFrozen ? 'Account Frozen' : 'Freeze Account & Network'}</span>
                </Button>
              </div>
            </div>

            {/* Interactive Graph Canvas area */}
            <div className="flex-1 w-full relative flex flex-col min-h-[300px]">
              
              {/* Floating Info Panels - Left */}
              <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
                <div className="bg-[#0a0e31]/90 border border-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-2xl">
                  <span className="block text-[9px] font-mono text-[#a0aec0] uppercase font-bold tracking-wider">Mule Risk Factor</span>
                  <span className="text-base font-bold text-rose-500">{detectionResult.riskScore}/100 ({detectionResult.riskScore >= 70 ? 'CRITICAL RISK' : 'LOW RISK'})</span>
                </div>
                <div className="bg-[#0a0e31]/90 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-2xl flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-[#00f2fe] animate-ping" />
                  <span className="text-[10px] text-white font-mono">Interactive Network Loaded</span>
                </div>
              </div>

              {/* Threat Diagnostics Scan Overlay - Right */}
              <div className="absolute top-4 right-4 z-10 w-72 bg-[#0a0e31]/95 border border-white/10 backdrop-blur-md p-4 rounded-[20px] shadow-2xl flex flex-col max-h-[85%] overflow-y-auto scrollbar-thin">
                <span className="text-[10px] font-bold text-[#00f2fe] font-mono uppercase tracking-wider mb-2.5 flex items-center space-x-1.5 border-b border-white/10 pb-2">
                  <Activity className="h-3.5 w-3.5 text-[#00f2fe] animate-pulse" />
                  <span>Threat Diagnostic Scan</span>
                </span>
                <div className="space-y-2.5">
                  {isScanning ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-3">
                      <div className="h-7 w-7 rounded-full border-2 border-[#00f2fe] border-t-transparent animate-spin" />
                      <span className="text-[10px] text-[#00f2fe] font-mono animate-pulse">Evaluating ledger rules...</span>
                    </div>
                  ) : (
                    <>
                      {detectionResult.triggeredSignals.map((sig) => (
                        <div key={sig.id} className="flex flex-col text-[11px] border-b border-white/5 pb-2.5 last:border-b-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-200 font-medium">{sig.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono ${
                              sig.triggered 
                                ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' 
                                : 'bg-[#060b26] text-slate-500 border border-white/5'
                            }`}>
                              {sig.triggered ? 'TRIGGERED' : 'SAFE'}
                            </span>
                          </div>
                          {sig.triggered && (
                            <p className="text-[9px] text-[#a0aec0] mt-1.5 leading-relaxed bg-[#060b26]/50 p-2 rounded-xl border border-white/5 font-mono">
                              {sig.evidence}
                            </p>
                          )}
                        </div>
                      ))}
                      <button 
                        onClick={handleRunScan}
                        disabled={isScanning}
                        className="w-full mt-2 text-[9px] py-2 px-2.5 bg-[#0075ff]/10 hover:bg-[#0075ff]/20 border border-[#0075ff]/20 text-[#00f2fe] font-bold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer text-center"
                      >
                        Re-run Threat Scan
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Vis-network container */}
              <div className="flex-1 w-full relative">
                <MoneyFlowGraph 
                  nodes={scenario.graph.nodes}
                  edges={scenario.graph.edges}
                  isFrozen={isFrozen}
                  onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                />

                {/* Entity Inspector Tooltip Overlay */}
                {(() => {
                  const selectedNode = scenario.graph.nodes.find(n => n.id === selectedNodeId);
                  if (!selectedNode) return null;
                  return (
                    <div className="absolute bottom-4 left-4 z-10 w-64 bg-[#0a0e31]/95 border border-white/10 backdrop-blur-md p-4 rounded-[20px] shadow-2xl flex flex-col">
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

            </div>
          </div>

          {/* LOWER WORKSPACE SECTION: Timeline Event Log */}
          <div className="h-52 mx-4 mb-4 bg-[#0a0e31]/40 border border-white/10 backdrop-blur-xl rounded-[24px] flex flex-col">
            <div className="h-9 border-b border-white/10 bg-[#0a0e31]/20 flex items-center justify-between px-4">
              <span className="text-[10px] font-mono text-[#a0aec0] uppercase tracking-wider font-semibold">Alert Timeline Ledger</span>
              <span className="text-[10px] text-[#00f2fe] font-mono">{scenario.timeline.length} events correlated</span>
            </div>
            
            <div className="flex-1 overflow-x-auto p-4 relative flex items-stretch space-x-4 scrollbar-thin">
              {/* Timeline Connector Line Background */}
              <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-white/5 -translate-y-1/2 pointer-events-none z-0" />
              
              {scenario.timeline.map((event) => {
                let icon = <Activity className="h-4 w-4 text-[#a0aec0]" />;
                let borderTheme = 'border-white/5 bg-[#060b26]/30';
                
                if (event.type === 'transaction') {
                  icon = <TrendingUp className="h-4 w-4 text-[#0075ff]" />;
                  borderTheme = 'border-[#0075ff]/20 bg-[#0075ff]/5';
                } else if (event.type === 'device_swap') {
                  icon = <Smartphone className="h-4 w-4 text-[#e100ff]" />;
                  borderTheme = 'border-[#e100ff]/20 bg-[#e100ff]/5';
                } else if (event.type === 'cyber_tip') {
                  icon = <AlertTriangle className="h-4 w-4 text-red-500" />;
                  borderTheme = 'border-red-500/20 bg-red-500/5';
                }

                return (
                  <div key={event.id} className={`w-72 flex-shrink-0 p-3 rounded-[18px] border flex flex-col justify-between z-10 backdrop-blur-sm ${borderTheme}`}>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          {icon}
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#a0aec0] font-mono">
                            {event.type}
                          </span>
                        </div>
                        <span className="text-[9px] text-[#a0aec0] font-mono" suppressHydrationWarning>
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white line-clamp-1">{event.title}</h4>
                      <p className="text-[11px] text-[#a0aec0] mt-1 line-clamp-2">{event.description}</p>
                    </div>
                    {event.amount && (
                      <div className="mt-2 text-right">
                        <span className="text-xs font-bold font-mono text-[#00f2fe]">${event.amount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI Copilot Drawer */}
        <div className="w-96 h-full border-l border-white/10 bg-[#0a0e31]/30 backdrop-blur-xl flex flex-col">
          
          {/* Tabbed Navigation Bar (Shadcn Tabs UI look) */}
          <div className="flex border-b border-white/10 bg-[#0a0e31]/20">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider font-mono flex items-center justify-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'chat' 
                  ? 'border-[#0075ff] text-[#00f2fe] bg-[#0a0e31]/20' 
                  : 'border-transparent text-[#a0aec0] hover:text-[#ffffff] hover:bg-[#0a0e31]/10'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Copilot Chat</span>
            </button>
            <button 
              onClick={() => setActiveTab('sar')}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider font-mono flex items-center justify-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'sar' 
                  ? 'border-[#0075ff] text-[#00f2fe] bg-[#0a0e31]/20' 
                  : 'border-transparent text-[#a0aec0] hover:text-[#ffffff] hover:bg-[#0a0e31]/10'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Regulatory SAR</span>
              {currentSar && !sarSubmitted[selectedAlertId] && (
                <span className="h-2 w-2 rounded-full bg-[#00f2fe] animate-pulse" />
              )}
            </button>
          </div>

          {/* TAB CONTENT: Copilot Chat */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scrollbar-thin">
                {chatMessages.length === 0 && !isAnalyzing ? (
                  // Initial State
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <div className="h-12 w-12 rounded-2xl bg-[#0075ff]/10 border border-[#0075ff]/20 flex items-center justify-center mb-3 text-[#00f2fe] shadow-[0_0_15px_rgba(0,117,255,0.2)]">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider mb-1">Instant Risk Explanation</h3>
                    <p className="text-xs text-[#a0aec0] mb-6 leading-relaxed">Request Gemini to analyze the transaction flow, find device sharing anomalies, and draft Suspicious Activity Reports.</p>
                    
                    <div className="flex flex-col space-y-2 w-full max-w-xs">
                      <Button 
                        onClick={() => callChatApi("Analyze this critical alert and highlight the main risk factors.")}
                        className="w-full font-semibold flex items-center justify-center space-x-2 bg-[#0075ff] hover:bg-[#0075ff]/80 text-white rounded-xl py-5 shadow-[0_0_12px_rgba(0,117,255,0.3)] border-transparent cursor-pointer"
                      >
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Analyze Alert with Gemini</span>
                      </Button>
                      
                      <Button 
                        onClick={() => callChatApi("Draft a formal regulatory Suspicious Activity Report (SAR) narrative for this transaction ring.")}
                        className="w-full font-semibold flex items-center justify-center space-x-2 bg-transparent hover:bg-white/5 text-white rounded-xl py-5 border-white/10 cursor-pointer"
                      >
                        <Shield className="h-3.5 w-3.5 text-[#00f2fe]" />
                        <span>Draft SAR Narrative</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Active Conversation Feed
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
                              ? 'bg-[#0075ff] text-white rounded-tr-none whitespace-pre-wrap shadow-[0_0_12px_rgba(0,117,255,0.2)] border-transparent' 
                              : 'bg-[#0a0e31]/80 border border-white/10 text-slate-200 rounded-tl-none shadow-xl'
                          }`}
                        >
                          {msg.role === 'user' ? msg.content : renderMarkdown(msg.content)}
                        </div>
                      </div>
                    ))}
                    
                    {/* Shimmer loading state */}
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

              {/* Prompt / Input bar */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  callChatApi(chatInput);
                }}
                className="p-4 border-t border-white/10 bg-[#0a0e31]/40 flex flex-col space-y-3"
              >
                {/* Quick Prompt Chips */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => callChatApi("Analyze this critical alert and highlight the main risk factors.")}
                    className="text-[9px] px-2 py-1.5 rounded-lg bg-[#060b26] border border-white/5 text-[#a0aec0] hover:bg-[#0075ff]/20 hover:text-white transition-all cursor-pointer"
                    disabled={isAnalyzing}
                  >
                    🔍 Analyze Risk
                  </button>
                  <button
                    type="button"
                    onClick={() => callChatApi("Identify shared device fingerprints and cross-channel overlays.")}
                    className="text-[9px] px-2 py-1.5 rounded-lg bg-[#060b26] border border-white/5 text-[#a0aec0] hover:bg-[#0075ff]/20 hover:text-white transition-all cursor-pointer"
                    disabled={isAnalyzing}
                  >
                    📱 Check Devices
                  </button>
                  <button
                    type="button"
                    onClick={() => callChatApi("Draft a formal regulatory Suspicious Activity Report (SAR) narrative for this transaction ring.")}
                    className="text-[9px] px-2 py-1.5 rounded-lg bg-[#060b26] border border-white/5 text-[#a0aec0] hover:bg-[#0075ff]/20 hover:text-white transition-all cursor-pointer"
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
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-[#060b26] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#0075ff] transition-all"
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
            </>
          )}

          {/* TAB CONTENT: Regulatory SAR Filing Form */}
          {activeTab === 'sar' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between scrollbar-thin">
              
              <div className="space-y-4">
                <div className="border border-white/10 rounded-2xl p-4 bg-[#060b26]/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold text-[#a0aec0] font-mono uppercase">FinCEN Form 111 (Draft)</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wide ${
                      sarSubmitted[selectedAlertId] 
                        ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                        : currentSar 
                          ? 'bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/20' 
                          : 'bg-white/5 text-[#a0aec0] border border-white/5'
                    }`}>
                      {sarSubmitted[selectedAlertId] ? 'SUBMITTED' : currentSar ? 'PENDING' : 'EMPTY'}
                    </span>
                  </div>

                  {/* Preloaded Fields */}
                  <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 block">Filing Bank:</span>
                      <span className="text-slate-200">Sentinel Security Inc</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Filing Date:</span>
                      <span className="text-slate-200">2026-07-04</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Subject Name:</span>
                      <span className="text-slate-200">{currentAlert.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Subject Account:</span>
                      <span className="text-slate-200">acc-{currentAlert.targetAccountId}</span>
                    </div>
                  </div>
                </div>

                {/* Narrative Field */}
                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="text-[10px] uppercase font-bold tracking-wider font-mono text-[#a0aec0]">Section V: Suspicious Activity Narrative Description</label>
                  {currentSar ? (
                    <textarea 
                      value={currentSar}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSarNarratives(prev => ({ ...prev, [selectedAlertId]: val }));
                      }}
                      className="w-full h-[320px] p-3 text-xs rounded-2xl bg-[#060b26] border border-white/10 text-slate-350 focus:outline-none focus:border-[#0075ff] leading-relaxed font-sans scrollbar-thin"
                    />
                  ) : (
                    <div className="h-56 border border-dashed border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-[#0a0e31]/10">
                      <FileText className="h-8 w-8 text-slate-600 mb-2" />
                      <p className="text-xs text-[#a0aec0] max-w-xs">No SAR narrative generated. Go to Copilot Chat and click <strong>"Draft SAR"</strong> to auto-generate this report via Gemini.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submission Button */}
              {currentSar && (
                <div className="border-t border-white/10 pt-4 mt-4">
                  {sarSubmitted[selectedAlertId] ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-2 text-xs text-emerald-450 font-mono shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                      <FileCheck2 className="h-4 w-4" />
                      <span>Filing Submitted. ID: FinCEN-2026-{selectedAlertId.replace('alert-', '')}</span>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleSubmitSar}
                      className="w-full py-2.5 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)] border-transparent"
                    >
                      Submit Regulatory Filing to FinCEN
                    </Button>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}
