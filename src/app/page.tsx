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

export default function Home() {
  // Demo interactive state
  const [scenario, setScenario] = useState<DemoScenario>(ROMANCE_SCAM_SCENARIO);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(ROMANCE_SCAM_SCENARIO.alert.id);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([]);
  const [chatInput, setChatInput] = useState<string>('');

  const currentAlert = scenario.alert;

  // Simple resolution freeze trigger
  const handleFreeze = () => {
    setIsFrozen(true);
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
              <h3 className="text-sm font-semibold text-slate-200 mb-1">{currentAlert.customerName}</h3>
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
              }}
            >
              <Database className="h-3.5 w-3.5" />
              <span>Reset Mock Database</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE MIDDLE: Graph Workspace & Timeline */}
        <div className="flex-1 h-full flex flex-col bg-slate-950/20">
          
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
                <span className="text-sm font-bold text-rose-500">94/100 (CRITICAL RISK)</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3 py-2 rounded-lg shadow-xl flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs text-slate-200 font-mono">Interactive Network Loaded</span>
              </div>
            </div>

            {/* Canvas Area Placeholder for graph */}
            <div className="flex-1 w-full flex items-center justify-center bg-slate-950/80 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_55%)] pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
              
              {/* Temporary visual fallback to indicate Graph Rendering component is next */}
              <div className="text-center z-10 flex flex-col items-center">
                <div className="p-4 rounded-full bg-indigo-500/5 border border-indigo-500/10 mb-3 animate-pulse">
                  <Activity className="h-10 w-10 text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300">Transaction Network Visualizer</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">Integrating Graph Network component to render nodes (Victim, Mule Intermediate, Mule Target, Crypto Exchange).</p>
              </div>
            </div>
          </div>

          {/* LOWER WORKSPACE SECTION: Timeline Event Log */}
          <div className="h-56 bg-slate-900/20 flex flex-col">
            <div className="h-9 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Associated Transaction Ledger & Alert Timeline</span>
              <span className="text-[10px] text-slate-400 font-mono">5 events correlated</span>
            </div>
            
            {/* Timeline Placeholder */}
            <div className="flex-1 overflow-x-auto p-4 flex items-center justify-center">
              <p className="text-xs text-slate-500">Integrating horizontal/vertical timeline log representation next.</p>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col items-center justify-center">
            {/* Visual Call to Action */}
            <div className="text-center p-6 bg-slate-900/20 border border-slate-800/60 rounded-xl max-w-xs">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
                <Cpu className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider mb-1">Instant Risk Explanation</h3>
              <p className="text-xs text-slate-400 mb-4">Request Gemini to analyze the transaction flow, find device sharing anomalies, and draft Suspicious Activity Reports.</p>
              
              <div className="flex flex-col space-y-2">
                <button 
                  className="w-full text-xs font-semibold py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                  onClick={() => setIsAnalyzing(true)}
                  disabled={isAnalyzing}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Analyze Alert with Gemini</span>
                </button>
              </div>
            </div>
          </div>

          {/* Prompt / Input bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40">
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Ask Gemini about this network..." 
                className="flex-1 text-xs px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                disabled
              />
              <button 
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 disabled:opacity-50"
                disabled
              >
                Send
              </button>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
