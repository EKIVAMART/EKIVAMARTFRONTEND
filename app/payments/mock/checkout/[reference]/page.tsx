'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface MockCheckoutPageProps {
  params: Promise<{ reference: string }>;
}

export default function MockCheckoutPage({ params: _params }: MockCheckoutPageProps) {
  const router = useRouter();

  useEffect(() => {
    toast.error('Mock payment gateway is disabled.');
    router.replace('/orders');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-950/80 backdrop-blur-md w-full max-w-md rounded-3xl shadow-2xl border border-slate-800 p-6 sm:p-8 text-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
          <CreditCard size={24} />
        </div>
        <h1 className="text-xl font-bold">Mock Payment Disabled</h1>
        <p className="text-slate-400 text-sm">
          Mock payment gateway has been removed. Redirecting to your orders...
        </p>
        <button
          onClick={() => router.push('/orders')}
          className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300"
        >
          <ArrowLeft size={14} /> Back to Orders
        </button>
      </div>
    </div>
  );
}
