'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface MockCheckoutPageProps {
  params: Promise<{ reference: string }>;
}

interface MockCheckoutResponse {
  success?: boolean;
  redirectUrl?: string;
  message?: string;
}

export default function MockCheckoutPage({ params }: MockCheckoutPageProps) {
  const { reference } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState<'success' | 'fail' | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://faflora-staging.onrender.com/api/v1';

  const handleSimulate = async (action: 'complete' | 'fail') => {
    setSimulating(action === 'complete' ? 'success' : 'fail');
    setLoading(true);
    try {
      // Direct call to complete or fail mock checkout
      const response = await axios.post<MockCheckoutResponse>(`${API_BASE_URL}/payments/mock/checkout/${reference}/${action}`);
      toast.success(action === 'complete' ? 'Payment simulation successful!' : 'Payment simulation failed.');
      
      // The endpoint returns a redirect URL or success response. Let's extract callback URL.
      if (response.data?.success && response.data?.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      } else {
        // Fallback redirect
        router.push('/orders');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to communicate with payment gateway simulator.');
    } finally {
      setLoading(false);
      setSimulating(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-900 to-slate-950 pointer-events-none" />

      <div className="bg-slate-950/80 backdrop-blur-md w-full max-w-md rounded-3xl shadow-2xl border border-slate-800 overflow-hidden relative z-10 flex flex-col p-6 sm:p-8">
        
        {/* Header Branding */}
        <div className="text-center pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/20">
            <CreditCard className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-black text-white tracking-wide">Faflora Payment Sandbox</h1>
          <p className="text-slate-400 text-xs mt-1 font-semibold">Mock Checkout Simulator</p>
        </div>

        {/* Info Box */}
        <div className="py-6 space-y-4">
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Transaction Ref</span>
              <span className="text-purple-400 font-mono font-bold">{reference}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Security State</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck size={13} /> Sandbox Secure
              </span>
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-900/40 rounded-2xl p-4 text-xs text-amber-300 font-semibold leading-relaxed flex gap-2.5">
            <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
            <p>This is a simulated payment screen. No real money will be charged or moved. Click below to verify the order status transitions.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => handleSimulate('complete')}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-emerald-500/10 disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90"
          >
            {simulating === 'success' ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            Simulate Successful Payment
          </button>

          <button
            onClick={() => handleSimulate('fail')}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-rose-500/10 disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90"
          >
            {simulating === 'fail' ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <XCircle size={16} />
            )}
            Simulate Failed Payment
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1.5 mt-2">
          <span>Faflora Checkout Sandbox • 2026</span>
        </div>

      </div>
    </div>
  );
}
