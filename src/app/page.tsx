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
  Database
} from 'lucide-react';
import { ROMANCE_SCAM_SCENARIO, DemoScenario } from '@/lib/mockData';
import MoneyFlowGraph from '@/components/MoneyFlowGraph';
import { runDetectionEngine } from '@/lib/detectionEngine';

export default function Home() {
  // Demo interactive state
  const [scenario, setScenario] = useState<DemoScenario>(ROMANCE_SCAM_SCENARIO);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(ROMANCE_SCAM_SCENARIO.alert.id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([]);
  const [chatInput, setChatInput] = useState<string>('');

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1000);
  };

  const currentAlert = scenario.alert;

  const detectionResult = runDetectionEngine(
    currentAlert.targetAccountId,
    scenario.graph.nodes,
    scenario.graph.edges,
    scenario.timeline
  );

  // Simple resolution freeze trigger
  const handleFreeze = () => {
    setIsFrozen(true);
    // Automatically document in chat
    const updatedHistory = [...chatMessages, { role: 'user' as const, content: "Trigger mitigation freeze." }, { role: 'model' as const, content: "### Mitigation Executed\n- **Target Account (Robert Chen):** Frozen\n- **Flag Status:** Reported to NCIB database\n- **Graph Visuals:** Suspended entities highlighted in crimson." }];
    setChatMessages(updatedHistory);

    // Dynamically inject Mitigation event card into the timeline ledger
    const freezeEvent = {
      id: "t-6",
      timestamp: new Date().toISOString(),
      type: 'cyber_tip' as const,
      title: "Mitigation Active: Account Frozen",
      description: "Compliance action executed by investigator. Suspect nodes isolated and reported to law enforcement."
    };
    
    setScenario(prev => ({
      ...prev,
      timeline: [...prev.timeline, freezeEvent]
    }));
  };

  const callChatApi = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;
    setIsAnalyzing(true);
    
    const updatedHistory = [...chatMessages, { role: 'user' as const, content: userPrompt }];
    setChatMessages(updatedHistory);
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
      setChatMessages([...updatedHistory, { role: 'model', content: data.response || "No response received." }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages([...updatedHistory, { role: 'model', content: `Error communicating with Gemini: ${err.message || err}` }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* 1. HEADER (Top Bar) */}
      <div className="absolute top-0 left-0 right-0 h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 shadow-lg shadow-indigo-500/20">
            <Shield className="h-5 w-5 text-white" />
            <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-lg text-white">SENTINEL</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider font-mono">MULE INTEL & INVESTIGATION COPILOT</p>
          </div>
        </div>

        {/* Top metrics (Judge focused) */}
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <span className="block text-[10px] text-slate-400 font-mono">INVESTIGATOR PROFILE</span>
              <span className="text-xs font-medium text-slate-200">Compliance Officer</span>
            </div>
            <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <User className="h-4 w-4 text-slate-300" />
            </div>
          </div>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-500/20">
            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-400">1 CRITICAL THREAT</span>
          </div>
        </div>
      </div>

      {/* 2. BODY SPLIT (Dashboard Sidebar + Interactive Workspace) */}
      <div className="flex w-full h-full pt-16">
        
        {/* LEFT COLUMN: Sidebar Alert Queue (Triage) */}
        <div className="w-80 h-full border-r border-slate-800 bg-slate-900/40 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Active Triage Feed</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">1 alert</span>
            </div>
            <input 
              type="text" 
              placeholder="Search suspect accounts..." 
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              disabled
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* The single preloaded Romance Scam Alert */}
            <div 
              onClick={() => setSelectedAlertId(currentAlert.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedAlertId === currentAlert.id 
                  ? 'bg-slate-800/60 border-indigo-500 shadow-md shadow-indigo-500/5' 
                  : 'bg-slate-900/20 border-slate-800 hover:bg-slate-800/20'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-mono text-indigo-400 font-semibold tracking-wider">ALERT #1042</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono ${
                  isFrozen ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {isFrozen ? 'RESOLVED: FROZEN' : 'CRITICAL'}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1 flex items-center justify-between">
                <span>{currentAlert.customerName}</span>
                {!isFrozen && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">{currentAlert.description}</p>
              
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                <div className="flex items-center space-x-1.5">
                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                  <span className="text-[10px] text-slate-400 font-mono">Risk: {currentAlert.riskScore}/100</span>
                </div>
                <div className="flex items-center text-[10px] text-slate-300 font-mono">
                  <span>Details</span>
                  <ChevronRight className="h-3 w-3 ml-0.5" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>MOCK DATABASE</span>
              <span className="text-emerald-400 flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE</span>
              </span>
            </div>
            <button 
              className="w-full text-xs py-2 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 font-medium border border-slate-800 transition-colors flex items-center justify-center space-x-2"
              onClick={() => {
                setIsFrozen(false);
                setChatMessages([]);
                setScenario(ROMANCE_SCAM_SCENARIO);
              }}
            >
              <Database className="h-3.5 w-3.5" />
              <span>Reset Mock Database</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE MIDDLE: Graph Workspace & Timeline */}
        <div className="flex-1 h-full flex flex-col bg-slate-950/20">
          
          {isFrozen && (
            <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-red-500" />
                <span className="text-[11px] font-semibold text-red-400 font-mono">MITIGATION ACTIVE: Account frozen & reported to law enforcement database.</span>
              </div>
              <button 
                onClick={() => setIsFrozen(false)}
                className="text-[10px] text-red-400 hover:text-red-300 font-bold underline font-mono cursor-pointer"
              >
                RESET
              </button>
            </div>
          )}
          {/* Main Triage Workspace Header */}
          <div className="h-14 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between px-6">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-slate-500 uppercase">Alert Details</span>
              <h2 className="text-sm font-semibold text-slate-200">{currentAlert.customerName} (Account #{currentAlert.targetAccountId})</h2>
            </div>
            
            {/* Quick Actions (Freeze Button) */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleFreeze}
                disabled={isFrozen}
                className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-2 border shadow-lg ${
                  isFrozen
                    ? 'bg-red-500/10 text-red-400 border-red-500/20 cursor-not-allowed shadow-none'
                    : 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-red-900/10 hover:scale-[1.02] cursor-pointer'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>{isFrozen ? 'Account & Network Frozen' : 'Freeze Account & Network'}</span>
              </button>
            </div>
          </div>

          {/* Graph Visual Area Container */}
          <div className="flex-1 relative border-b border-slate-800/80 bg-slate-950/45 flex flex-col">
            {/* Floating Info Panels */}
            <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
              <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3 py-2 rounded-lg shadow-xl">
                <span className="block text-[9px] font-mono text-slate-400 uppercase">Mule Risk Factor</span>
                <span className="text-sm font-bold text-rose-500">{detectionResult.riskScore}/100 ({detectionResult.riskScore >= 70 ? 'CRITICAL RISK' : 'LOW RISK'})</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3 py-2 rounded-lg shadow-xl flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs text-slate-200 font-mono">Interactive Network Loaded</span>
              </div>
            </div>

            {/* Threat Diagnostics Scan Overlay (Explainable Detection Engine) */}
            <div className="absolute top-4 right-4 z-10 w-72 bg-slate-900/95 border border-slate-800/80 backdrop-blur-md p-3.5 rounded-xl shadow-2xl flex flex-col max-h-[90%] overflow-y-auto">
              <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-wider mb-2.5 flex items-center space-x-1.5 border-b border-slate-800 pb-1.5">
                <Activity className="h-3 w-3 text-indigo-400 animate-pulse" />
                <span>Threat Diagnostic Scan</span>
              </span>
              <div className="space-y-2 flex-1">
                {isScanning ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="h-7 w-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    <span className="text-[10px] text-indigo-400 font-mono animate-pulse">Evaluating ledger rules...</span>
                  </div>
                ) : (
                  <>
                    {detectionResult.triggeredSignals.map((sig) => (
                      <div key={sig.id} className="flex flex-col text-[11px] border-b border-slate-800/30 pb-2 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-305 font-medium">{sig.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono ${
                            sig.triggered 
                              ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' 
                              : 'bg-slate-950 text-slate-500 border border-slate-800'
                          }`}>
                            {sig.triggered ? 'TRIGGERED' : 'SAFE'}
                          </span>
                        </div>
                        {sig.triggered && (
                          <p className="text-[9px] text-slate-450 mt-1 leading-relaxed bg-rose-950/10 p-1.5 rounded border border-rose-950/20 font-mono">
                            {sig.evidence}
                          </p>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={handleRunScan}
                      disabled={isScanning}
                      className="w-full mt-2 text-[9px] py-1.5 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Re-run Threat Scan
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Canvas Area Placeholder for graph */}
            <div className="flex-1 w-full bg-slate-950/80 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_55%)] pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
              
              <MoneyFlowGraph 
                nodes={scenario.graph.nodes}
                edges={scenario.graph.edges}
                isFrozen={isFrozen}
                onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
              />

              {/* Entity Inspector Tooltip Card Overlay */}
              {(() => {
                const selectedNode = scenario.graph.nodes.find(n => n.id === selectedNodeId);
                if (!selectedNode) return null;
                return (
                  <div className="absolute bottom-4 left-4 z-10 w-64 bg-slate-900/95 border border-slate-800 backdrop-blur-md p-3.5 rounded-xl shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                      <span className="text-[9px] font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>Entity Inspector</span>
                      </span>
                      <button 
                        onClick={() => setSelectedNodeId(null)}
                        className="text-slate-500 hover:text-slate-300 text-xs font-bold font-mono cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100">{selectedNode.label}</h4>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">ID: {selectedNode.id}</p>
                    
                    <div className="mt-2.5 space-y-1.5 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className={`font-mono font-bold ${selectedNode.status === 'FROZEN' || isFrozen ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                          {isFrozen ? 'FROZEN' : selectedNode.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Device ID:</span>
                        <span className="text-slate-350 font-mono">{selectedNode.deviceFingerprint}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">IP Address:</span>
                        <span className="text-slate-350 font-mono">{selectedNode.ipAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Type:</span>
                        <span className="text-slate-300 capitalize font-mono">{selectedNode.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Floating Analytics Metrics Banner */}
              <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-2 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3 py-2 rounded-lg shadow-xl text-[10px] font-mono text-slate-350">
                <div className="flex items-center space-x-1 border-r border-slate-800 pr-2">
                  <span className="text-slate-500">HOPS:</span>
                  <span className="text-indigo-400 font-bold">3 Layer Steps</span>
                </div>
                <div className="flex items-center space-x-1 border-r border-slate-800 px-2">
                  <span className="text-slate-500">DEVICES:</span>
                  <span className="text-amber-450 font-bold">1 Collision</span>
                </div>
                <div className="flex items-center space-x-1 px-2">
                  <span className="text-slate-500">VELOCITY:</span>
                  <span className="text-rose-450 font-bold">3m Layering</span>
                </div>
              </div>
            </div>
          </div>

          {/* LOWER WORKSPACE SECTION: Timeline Event Log */}
          <div className="h-56 bg-slate-900/20 flex flex-col">
            <div className="h-9 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Associated Transaction Ledger & Alert Timeline</span>
              <span className="text-[10px] text-slate-400 font-mono">{scenario.timeline.length} events correlated</span>
            </div>
            
            <div className="flex-1 overflow-x-auto p-4 relative flex items-stretch space-x-4">
              {/* Timeline Connector Line Background */}
              <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-slate-800 -translate-y-1/2 pointer-events-none z-0" />
              
              {scenario.timeline.map((event) => {
                let icon = <Activity className="h-4 w-4 text-slate-400" />;
                let borderTheme = 'border-slate-800 bg-slate-900/10';
                
                if (event.type === 'transaction') {
                  icon = <TrendingUp className="h-4 w-4 text-indigo-455" />;
                  borderTheme = 'border-indigo-500/10 bg-indigo-500/5';
                } else if (event.type === 'device_swap') {
                  icon = <Smartphone className="h-4 w-4 text-amber-555" />;
                  borderTheme = 'border-amber-500/10 bg-amber-500/5';
                } else if (event.type === 'cyber_tip') {
                  icon = <AlertTriangle className="h-4 w-4 text-rose-555" />;
                  borderTheme = 'border-rose-500/15 bg-rose-500/5';
                }

                return (
                  <div key={event.id} className={`w-72 flex-shrink-0 p-3 rounded-xl border flex flex-col justify-between z-10 backdrop-blur-sm ${borderTheme}`}>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          {icon}
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                            {event.type}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{event.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{event.description}</p>
                    </div>
                    {event.amount && (
                      <div className="mt-2 text-right">
                        <span className="text-xs font-bold font-mono text-slate-200">${event.amount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Copilot Drawer */}
        <div className="w-96 h-full border-l border-slate-800 bg-slate-900/40 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-indigo-400 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">Gemini Forensic Copilot</h2>
            </div>
          </div>

          {/* Chat / Analysis panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
            {chatMessages.length === 0 && !isAnalyzing ? (
              // Initial State: Visual Call to Action & Quick Prompts
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                  <Cpu className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider mb-1">Instant Risk Explanation</h3>
                <p className="text-xs text-slate-400 mb-6">Request Gemini to analyze the transaction flow, find device sharing anomalies, and draft Suspicious Activity Reports.</p>
                
                <div className="flex flex-col space-y-2 w-full max-w-xs">
                  <button 
                    className="w-full text-xs font-semibold py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center space-x-2 transition-colors cursor-pointer border border-indigo-500/25"
                    onClick={() => callChatApi("Analyze this critical alert and highlight the main risk factors.")}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Analyze Alert with Gemini</span>
                  </button>
                  
                  <button 
                    className="w-full text-xs font-semibold py-2.5 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-250 flex items-center justify-center space-x-2 transition-colors cursor-pointer border border-slate-700/50"
                    onClick={() => callChatApi("Draft a formal regulatory Suspicious Activity Report (SAR) narrative for this transaction ring.")}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Draft SAR Narrative</span>
                  </button>
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
                    <span className="text-[9px] font-mono text-slate-500 mb-1 px-1">
                      {msg.role === 'user' ? 'Investigator' : 'Gemini Copilot'}
                    </span>
                    <div 
                      className={`p-3 rounded-xl max-w-[95%] text-xs font-sans whitespace-pre-wrap leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {/* Shimmer loading state */}
                {isAnalyzing && (
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] font-mono text-slate-500 mb-1 px-1">Gemini Copilot</span>
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 rounded-tl-none w-5/6 flex flex-col space-y-2">
                      <div className="h-3 bg-slate-800 rounded animate-pulse w-full" />
                      <div className="h-3 bg-slate-800 rounded animate-pulse w-5/6" />
                      <div className="h-3 bg-slate-800 rounded animate-pulse w-4/6" />
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
            className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col space-y-3"
          >
            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => callChatApi("Analyze this critical alert and highlight the main risk factors.")}
                className="text-[9px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                disabled={isAnalyzing}
              >
                🔍 Analyze Risk
              </button>
              <button
                type="button"
                onClick={() => callChatApi("Identify shared device fingerprints and cross-channel overlays.")}
                className="text-[9px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                disabled={isAnalyzing}
              >
                📱 Check Devices
              </button>
              <button
                type="button"
                onClick={() => callChatApi("Draft a formal regulatory Suspicious Activity Report (SAR) narrative for this transaction ring.")}
                className="text-[9px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-800 transition-colors cursor-pointer"
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
                className="flex-1 text-xs px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                disabled={isAnalyzing}
              />
              <button 
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                disabled={isAnalyzing || !chatInput.trim()}
              >
                Send
              </button>
            </div>
          </form>

        </div>

      </div>
    </main>
  );
}
