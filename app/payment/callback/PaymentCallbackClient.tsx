'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import { fetchCart, fetchCartCount, fetchCartSummary } from '@/lib/features/cart/cartSlice';

export function PaymentCallbackClient() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false);

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [reference, setReference] = useState<string>('');
  const [message, setMessage] = useState<string>('Verifying transaction details...');

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const ref =
      searchParams.get('reference') ||
      searchParams.get('trxref') ||
      searchParams.get('tx_ref') ||
      searchParams.get('transaction_id') ||
      '';

    const rawStatus = (
      searchParams.get('status') ||
      searchParams.get('payment_status') ||
      ''
    ).toLowerCase();

    setReference(ref);

    // Refresh cart in background to ensure active items were cleared
    dispatch(fetchCart());
    dispatch(fetchCartCount());
    dispatch(fetchCartSummary());

    if (rawStatus === 'failed' || rawStatus === 'cancelled' || rawStatus === 'error') {
      setStatus('failed');
      setMessage('Your payment was not completed or was cancelled.');
    } else {
      // Completed / Success / Default
      setStatus('success');
      setMessage('Your payment has been successfully received and confirmed.');
    }
  }, [searchParams, dispatch]);

  if (status === 'loading') {
    return (
      <section className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#9d4ae3]" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Verifying Payment</h1>
            <p className="mt-2 text-sm text-gray-500">Please wait while we confirm your payment...</p>
          </div>
        </div>
      </section>
    );
  }

  if (status === 'failed') {
    return (
      <section className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-red-100 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <XCircle size={36} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Payment Unsuccessful</h1>
          <p className="text-sm text-gray-500 mb-6">{message}</p>

          {reference && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left border border-gray-100">
              <span className="text-xs text-gray-400 font-medium block">Reference Code</span>
              <span className="text-xs font-mono font-bold text-slate-700 break-all">{reference}</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link
              href="/cart"
              className="w-full bg-[#9d4ae3] hover:bg-[#8236be] text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              Return to Cart & Retry
            </Link>
            <Link
              href="/"
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-emerald-100 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 animate-in zoom-in-95 duration-200">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Payment Confirmed!</h1>
        <p className="text-sm text-gray-500 mb-6">{message}</p>

        {reference && (
          <div className="bg-emerald-50/50 rounded-2xl p-4 mb-6 text-left border border-emerald-100/60">
            <span className="text-xs text-emerald-600 font-medium block">Payment Reference</span>
            <span className="text-xs font-mono font-bold text-slate-700 break-all">{reference}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:from-[#8236be] hover:to-[#692a99] text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-1.5"
          >
            View My Orders <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
