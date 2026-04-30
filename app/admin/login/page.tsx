'use client';

import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call and login
    setTimeout(() => {
      setIsLoading(false);
      router.push('/admin/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 selection:bg-[#981d87] selection:text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#981d87] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 relative z-10">
        <div className="flex justify-center mb-8">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <ShieldCheck size={36} className="text-[#981d87]" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Admin Portal Access</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Verify your credentials to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 block">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#981d87] focus:ring-4 focus:ring-[#981d87]/10 rounded-xl outline-none transition-all text-sm font-medium text-slate-800 placeholder-slate-400"
                placeholder="admin@faflora.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 block">Password</label>
              <a href="#" className="text-xs font-semibold text-[#981d87] hover:text-[#7a176c] transition-colors">Forgot?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#981d87] focus:ring-4 focus:ring-[#981d87]/10 rounded-xl outline-none transition-all text-sm font-medium text-slate-800 placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#981d87] hover:bg-[#7a176c] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-fuchsia-100 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Secure Login
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-sm font-medium text-slate-400">
        <p>&copy; {new Date().getFullYear()} Faflora Group. All rights reserved.</p>
        <p className="mt-1 flex items-center justify-center gap-1">
          <Lock size={12} />
          Secured by enterprise-grade encryption
        </p>
      </div>
    </div>
  );
}
