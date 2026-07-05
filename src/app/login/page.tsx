'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, Sparkles, Cpu, ShieldAlert, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!email.trim() || !password.trim()) {
      setValidationError('Please enter both email and password.');
      return;
    }

    if (!email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    // Mock authentication transition loading state, then route to dashboard
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col md:flex-row overflow-hidden font-sans relative dark-grid-bg">
      {/* Background neon blobs */}
      <div className="radial-blob bg-[#7C3AED]/15 top-[-100px] left-[-100px]" />
      <div className="radial-blob bg-[#3B82F6]/10 bottom-[-150px] right-[-150px]" />

      {/* Left side: AI Illustration & Branding */}
      <div className="hidden md:flex md:w-1/2 bg-white/1 relative flex-col justify-between p-12 border-r border-white/5 overflow-hidden">
        <div className="absolute inset-0 dark-grid-bg opacity-30 pointer-events-none" />
        
        {/* Top brand */}
        <div className="flex items-center space-x-2.5 z-10">
          <div className="h-9 w-9 bg-[#7C3AED]/20 border border-[#7C3AED]/35 text-[#7C3AED] rounded-xl flex items-center justify-center shadow-md">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white uppercase">SENTINEL AI</span>
        </div>

        {/* Visual Showcase Illustration */}
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto space-y-8 z-10 relative">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center space-x-2 bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-3 py-1 rounded-full text-xs font-semibold text-[#7C3AED]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Identity Verification Node</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Investigate Suspicious <br />
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] bg-clip-text text-transparent">Multi-Hop Chains</span>
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Login to access the forensic investigation workspace. Tracing money laundering, romance scams, and structuring patterns using advanced graph machine learning.
            </p>
          </motion.div>

          {/* Simple animated visualization preview widget */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel border border-white/10 p-5 rounded-2xl relative overflow-hidden h-44 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[9px] text-[#7C3AED] font-mono font-bold uppercase tracking-wider">active security gateway</span>
              <span className="text-[8px] text-gray-500 font-mono">SYS_STATUS: INTAKE</span>
            </div>
            <div className="flex-1 flex items-center justify-around">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"><Cpu className="h-4 w-4" /></div>
                <span className="text-[8px] text-gray-500 mt-1 font-mono">NODE A</span>
              </div>
              <div className="h-0.5 flex-1 bg-gradient-to-r from-[#7C3AED]/20 to-[#3B82F6]/20 relative flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-[#7C3AED] animate-ping" />
              </div>
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/35 text-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#7C3AED]/10 animate-pulse"><ShieldAlert className="h-5 w-5" /></div>
                <span className="text-[8px] text-[#7C3AED] mt-1 font-mono font-bold">MULE_INT</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-gray-500 font-mono z-10">
          &copy; 2026 Sentinel AI Operations. Confidential System Access.
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
        {/* Brand logo for mobile only */}
        <div className="flex items-center space-x-2 md:hidden mb-8">
          <div className="h-8 w-8 bg-[#7C3AED]/20 border border-[#7C3AED]/35 text-[#7C3AED] rounded-lg flex items-center justify-center">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white uppercase">SENTINEL AI</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md glass-panel p-8 rounded-2xl space-y-6"
        >
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight">Access Dashboard</h2>
            <p className="text-xs text-gray-400">Enter your investigator credentials below</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {validationError && (
              <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444] rounded-xl text-xs font-semibold">
                {validationError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.gov"
                  className="w-full text-xs px-3.5 py-3 pl-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#7C3AED] transition-all"
                  disabled={isLoading}
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Password</label>
                <a href="#" className="text-[9px] font-bold text-[#7C3AED] hover:text-[#7C3AED]/80 transition-colors uppercase">Forgot?</a>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs px-3.5 py-3 pl-10 pr-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#7C3AED] transition-all"
                  disabled={isLoading}
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-white/5 border-white/10 text-[#7C3AED] focus:ring-[#7C3AED] h-3.5 w-3.5"
                />
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider select-none">Remember Me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center justify-center space-x-2 shadow-lg shadow-[#7C3AED]/10 hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] disabled:opacity-50 hover:scale-[1.01]"
            >
              {isLoading ? (
                <>
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[8px] font-bold text-gray-500 uppercase tracking-widest font-mono">or continue with</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={async () => {
                setIsLoading(true);
                setValidationError('');
                try {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/dashboard`
                    }
                  });
                  if (error) {
                    setValidationError(error.message);
                    setIsLoading(false);
                  }
                } catch (err: any) {
                  setValidationError(err.message || 'Failed to initialize sign in');
                  setIsLoading(false);
                }
              }}
              className="flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-semibold cursor-pointer"
            >
              <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-6.886 4.113-4.907 0-8.905-3.998-8.905-8.905s3.998-8.905 8.905-8.905c2.202 0 4.2.802 5.753 2.355L21 2.1C18.66.082 15.615-1.127 12.24-1.127 5.037-1.127-.79 4.7-1.127 11.902-.79 19.106 5.037 24.933 12.24 24.933c7.202 0 12.285-5.083 12.285-12.285 0-.832-.083-1.645-.236-2.361H12.24z" />
              </svg>
              <span>Google</span>
            </button>
            <button 
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => { setIsLoading(false); router.push('/dashboard'); }, 1000);
              }}
              className="flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-semibold cursor-pointer"
            >
              <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <div className="text-center pt-2 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Don't have an account? <Link href="/signup" className="text-[#7C3AED] hover:underline font-bold">Sign Up</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
