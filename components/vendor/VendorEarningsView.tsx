'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Clock, CheckCircle2, AlertCircle, RefreshCw,
  ArrowUpRight, CreditCard, ChevronLeft, ChevronRight, Filter, ShieldCheck, ArrowDownLeft, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { vendorEarningsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

const NairaIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
  >
    <path d="M6 3v18M18 3v18M6 3l12 18M4 9h16M4 14h16" />
  </svg>
);

const fmt = (n?: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n ?? 0);

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

type EarningsStatusFilter = 'all' | 'pending' | 'available' | 'paid' | 'refunded';
type MainViewTab = 'earnings' | 'withdrawals';

export default function VendorEarningsView() {
  const [activeTab, setActiveTab] = useState<MainViewTab>('earnings');
  const [summary, setSummary] = useState<any>(null);
  const [earningsList, setEarningsList] = useState<any[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<EarningsStatusFilter>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Withdrawal modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState<boolean>(false);
  const [pendingWithdrawalExists, setPendingWithdrawalExists] = useState<boolean>(false);

  const loadEarnings = async () => {
    setLoading(true);
    try {
      const [sumRes, listRes, wdrRes, bankRes] = await Promise.allSettled([
        vendorEarningsApi.getEarningsSummary(),
        vendorEarningsApi.getEarnings({
          page,
          limit: 15,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        vendorEarningsApi.getWithdrawals({ page: 1, limit: 50 }),
        vendorEarningsApi.getBankAccounts(),
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value?.data) {
        setSummary(sumRes.value.data);
      }
      if (listRes.status === 'fulfilled' && listRes.value?.data) {
        const d = listRes.value.data;
        const list = Array.isArray(d.earnings) ? d.earnings : Array.isArray(d.items) ? d.items : Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : [];
        setEarningsList(list);
        setTotalPages(d.pagination?.totalPages || d.totalPages || 1);
      }
      if (wdrRes.status === 'fulfilled' && wdrRes.value?.data) {
        const wdData = wdrRes.value.data;
        const list = Array.isArray(wdData.withdrawals) ? wdData.withdrawals : Array.isArray(wdData.items) ? wdData.items : Array.isArray(wdData) ? wdData : [];
        setWithdrawalsList(list);
        const hasPending = list.some((w: any) => w.status === 'pending');
        setPendingWithdrawalExists(hasPending);
      }
      if (bankRes.status === 'fulfilled' && bankRes.value?.data) {
        const bData = bankRes.value.data;
        const list = Array.isArray(bData.items) ? bData.items : Array.isArray(bData) ? bData : [];
        setBankAccounts(list);
        if (list.length > 0 && !selectedBankId) {
          const primary = list.find((b: any) => b.isPrimary) || list[0];
          setSelectedBankId(primary.id);
        }
      }
    } catch (err) {
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEarnings();
  }, [page, filterStatus]);

  const availableBalance = summary?.availableBalance ?? summary?.available ?? 0;
  const pendingEscrow = summary?.pendingBalance ?? summary?.pendingEscrow ?? 0;
  const processingBalance = summary?.processingBalance ?? 0;
  const pendingWithdrawalAmount = summary?.pendingWithdrawalAmount ?? summary?.pendingWithdrawals ?? processingBalance;
  const totalWithdrawn = summary?.totalWithdrawn ?? summary?.withdrawn ?? 0;
  const lifetimeEarnings = summary?.lifetimeEarnings ?? summary?.totalEarnings ?? (availableBalance + pendingEscrow + totalWithdrawn);

  const canWithdraw = availableBalance >= 5000 && !pendingWithdrawalExists;

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum < 5000) {
      toast.error('Minimum withdrawal amount is ₦5,000');
      return;
    }
    if (amountNum > availableBalance) {
      toast.error(`Insufficient available balance. Available: ₦${availableBalance.toLocaleString()}`);
      return;
    }
    if (!selectedBankId) {
      toast.error('Please select a bank account');
      return;
    }

    setSubmittingWithdrawal(true);
    const toastId = toast.loading('Submitting withdrawal request...');
    try {
      const res = await vendorEarningsApi.requestWithdrawal({
        amount: amountNum,
        bankAccountId: selectedBankId,
      });

      if (res?.success) {
        toast.success(res?.message || 'Withdrawal request submitted successfully!', { id: toastId });
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        await loadEarnings();
      } else {
        toast.error(res?.message || 'Failed to request withdrawal', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit withdrawal request', { id: toastId });
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Earnings & Escrow Tracking
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track your withdrawable balance, pending escrow funds held during fulfillment, payouts, and itemized commissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!canWithdraw) {
                if (pendingWithdrawalExists) {
                  toast.error('You already have a pending withdrawal request in review.');
                } else {
                  toast.error('Minimum withdrawal balance is ₦5,000.');
                }
                return;
              }
              setShowWithdrawModal(true);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              canWithdraw
                ? 'bg-gradient-to-r from-[#228b22] to-[#1c711c] text-white hover:opacity-90'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ArrowDownLeft size={16} />
            Request Withdrawal
          </button>

          <button
            onClick={() => loadEarnings()}
            className="p-2.5 text-slate-600 hover:text-[#228b22] hover:bg-brand-50 border border-slate-200 rounded-xl transition-all flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-brand-700 to-brand-800 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-[-10px] bottom-[-10px] w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <p className="text-[10px] font-bold text-brand-200 uppercase tracking-wider">Available Balance</p>
            <p className="text-2xl font-black mt-2 tracking-tight">{fmt(availableBalance)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-brand-100 font-medium">
            <span>Withdrawable</span>
            <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full text-[9px]">Active</span>
          </div>
        </div>

        {/* Pending Escrow */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-amber-200 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Escrow</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Clock size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 mt-2 tracking-tight">{fmt(pendingEscrow)}</p>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-3">Held during fulfillment</p>
        </div>

        {/* Pending Withdrawal */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-200 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Withdrawal</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <CreditCard size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 mt-2 tracking-tight">{fmt(pendingWithdrawalAmount)}</p>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-3">Processing request</p>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Withdrawn</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 mt-2 tracking-tight">{fmt(totalWithdrawn)}</p>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-3">Paid to bank</p>
        </div>

        {/* Lifetime Earnings */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-brand-200 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lifetime Net Earnings</span>
              <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-[#228b22]">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 mt-2 tracking-tight">{fmt(lifetimeEarnings)}</p>
          </div>
          <p className="text-[10px] text-emerald-600 font-bold mt-3 flex items-center gap-1">
            <ArrowUpRight size={13} /> Net store earnings
          </p>
        </div>
      </div>

      {/* Transaction Records Table Card */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">Itemized Earnings History</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Order gross amount, commission rate, net earning, and release status.</p>
          </div>

          {/* Status Filter Tabs (Includes Refunded) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 overflow-x-auto">
            {(['all', 'pending', 'available', 'paid', 'refunded'] as EarningsStatusFilter[]).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setFilterStatus(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-white text-[#228b22] shadow-xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-brand-200 border-t-[#228b22] rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-400">Loading itemized earnings...</p>
          </div>
        ) : earningsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Order Ref</th>
                  <th className="px-6 py-3.5 text-right">Gross Amount</th>
                  <th className="px-6 py-3.5 text-right">Commission Rate</th>
                  <th className="px-6 py-3.5 text-right">Commission Amt</th>
                  <th className="px-6 py-3.5 text-right">Gateway Fee</th>
                  <th className="px-6 py-3.5 text-right">Net Earning</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {earningsList.map((item, idx) => {
                  const status = (item.status || 'available').toLowerCase();
                  const orderRef = item.orderNumber || item.orderReference || (item.orderId ? `#${String(item.orderId).slice(-8)}` : 'N/A');
                  const gross = item.grossAmount ?? item.amount ?? 0;
                  const commRate = item.commissionRate ?? 0;
                  const commissionFallback = (gross * commRate) / 100;
                  const commAmt = item.commissionAmount ?? commissionFallback;
                  const fee = item.gatewayFeeAmount ?? 0;
                  const net = item.netAmount ?? item.netEarning ?? (gross - commAmt - fee);

                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap">
                        {formatDate(item.date || item.createdAt)}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 font-mono">
                        {orderRef}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">
                        {fmt(gross)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 font-medium">
                        {commRate ? `${commRate}%` : '0%'}
                      </td>
                      <td className="px-6 py-4 text-right text-rose-600 font-semibold">
                        -{fmt(commAmt)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 font-medium">
                        {fee ? `-${fmt(fee)}` : '₦0'}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-700 text-sm whitespace-nowrap">
                        {fmt(net)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          status === 'paid' || status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          status === 'refunded' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-brand-50 text-brand-700 border-brand-200'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs font-medium space-y-2">
            <p>No earnings records matching status filter &quot;{filterStatus}&quot;.</p>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 font-bold flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="font-bold text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 font-bold flex items-center gap-1"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* REQUEST WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <CreditCard size={18} className="text-[#228b22]" />
                Request Earnings Withdrawal
              </h3>
              <button onClick={() => setShowWithdrawModal(false)} className="p-1 hover:bg-slate-100 rounded-full transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Available for Withdrawal</label>
                <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-700">Withdrawable Balance</span>
                  <span className="text-base font-black text-brand-900">{fmt(availableBalance)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Withdrawal Amount (NGN) *</label>
                <input
                  type="number"
                  min={5000}
                  max={availableBalance}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 25000 (Min ₦5,000)"
                  className="w-full px-4 py-2.5 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:border-[#228b22] focus:ring-2 focus:ring-brand-100"
                />
                <p className="text-[10px] text-slate-400 font-medium mt-1">Minimum amount is ₦5,000. Maximum is ₦{availableBalance.toLocaleString()}.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Destination Bank Account *</label>
                {bankAccounts.length > 0 ? (
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl outline-none focus:border-[#228b22]"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} ••••{(b.accountNumber || '').slice(-4)} ({b.accountName}) {b.isPrimary ? '[Primary]' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700 font-medium">
                    No bank accounts linked to store yet. Please add a bank account in your store profile settings.
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed font-medium">
                ⏱️ Estimated Processing Time: <strong className="text-slate-700">24-48 business hours</strong> after admin approval.
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdrawal || bankAccounts.length === 0}
                  className="px-5 py-2 bg-gradient-to-r from-[#228b22] to-[#1c711c] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
                >
                  {submittingWithdrawal ? 'Submitting...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
