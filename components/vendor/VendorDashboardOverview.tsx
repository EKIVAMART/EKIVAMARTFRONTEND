'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp, ShoppingCart, Package, Clock,
  AlertCircle, CheckCircle2, RefreshCw, BarChart2, Calendar, DollarSign, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

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

type StatsPeriod = 'today' | 'last_7_days' | 'last_30_days' | 'this_month' | 'custom';

interface VendorStatsData {
  period?: string;
  totalEarnings?: number;
  todayEarnings?: number;
  pendingEarnings?: number;
  todayOrders?: number;
  totalOrders?: number;
  totalProducts?: number;
  pendingOrders?: number;
  totalUnitsSold?: number;
  grossRevenue?: number;
  commissionDeducted?: number;
  netRevenue?: number;
  averageOrderValue?: number;
  topProducts?: Array<{
    productId?: string;
    id?: string;
    name?: string;
    unitsSold?: number;
    sales?: number;
    revenue?: number;
  }>;
}

interface OverviewData {
  store?: {
    storeName?: string;
    isOnVacation?: boolean;
    vacationMessage?: string;
    rating?: number;
    totalReviews?: number;
  };
  pendingActions?: any[];
  recentOrders?: any[];
}

interface Props {
  vendorDashboardApi: typeof import('@/lib/api').vendorDashboardApi;
}

export default function VendorDashboardOverview({ vendorDashboardApi }: Props) {
  const [stats, setStats] = useState<VendorStatsData | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [period, setPeriod] = useState<StatsPeriod>('last_30_days');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAllData = async (selectedPeriod: StatsPeriod = period, sDate = startDate, eDate = endDate) => {
    setLoading(true);
    setError('');
    try {
      const [overviewRes, statsRes] = await Promise.allSettled([
        vendorDashboardApi.getDashboardOverview(),
        vendorDashboardApi.getVendorStats
          ? vendorDashboardApi.getVendorStats({
              period: selectedPeriod,
              startDate: selectedPeriod === 'custom' ? sDate : undefined,
              endDate: selectedPeriod === 'custom' ? eDate : undefined,
            })
          : Promise.resolve(null),
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value) {
        const d = (overviewRes.value as any)?.data ?? overviewRes.value;
        setOverview(d);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        const s = (statsRes.value as any)?.data ?? statsRes.value;
        setStats(s);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = async (newPeriod: StatsPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod === 'custom' && (!startDate || !endDate)) return;

    setStatsLoading(true);
    try {
      if (vendorDashboardApi.getVendorStats) {
        const statsRes = await vendorDashboardApi.getVendorStats({
          period: newPeriod,
          startDate: newPeriod === 'custom' ? startDate : undefined,
          endDate: newPeriod === 'custom' ? endDate : undefined,
        });
        const s = (statsRes as any)?.data ?? statsRes;
        setStats(s);
      }
    } catch (e) {
      console.error('Failed to update stats period:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCustomDateSubmit = () => {
    if (startDate && endDate) {
      handlePeriodChange('custom');
    }
  };

  useEffect(() => {
    void loadAllData();
  }, []);

  const todayEarnings = stats?.todayEarnings ?? 0;
  const totalEarnings = stats?.totalEarnings ?? stats?.netRevenue ?? 0;
  const pendingEarnings = stats?.pendingEarnings ?? 0;

  const todayOrders = stats?.todayOrders ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;

  const totalProducts = stats?.totalProducts ?? 0;
  const totalUnitsSold = stats?.totalUnitsSold ?? 0;

  const pendingOrders = stats?.pendingOrders ?? 0;
  const averageOrderValue = stats?.averageOrderValue ?? 0;

  const grossRevenue = stats?.grossRevenue ?? 0;
  const commissionDeducted = stats?.commissionDeducted ?? 0;
  const netRevenue = stats?.netRevenue ?? totalEarnings;

  const storeName = overview?.store?.storeName;
  const isOnVacation = overview?.store?.isOnVacation;
  const vacationMessage = overview?.store?.vacationMessage;
  const recentOrders: any[] = overview?.recentOrders ?? [];
  const pendingActions: any[] = overview?.pendingActions ?? [];
  const topProducts = stats?.topProducts ?? [];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-12 h-12 border-4 border-brand-200 border-t-[#228b22] rounded-full animate-spin" />
      <p className="text-sm font-bold text-slate-500">Loading vendor analytics...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <AlertCircle size={40} className="text-rose-500" />
      <p className="text-slate-700 font-bold text-sm">{error}</p>
      <button onClick={() => loadAllData()} className="flex items-center gap-2 px-5 py-2.5 bg-[#228b22] text-white rounded-xl text-sm font-bold hover:opacity-90 transition">
        <RefreshCw size={14} /> Refresh Analytics
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header & Exact Period Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Dashboard Overview
          </h2>
          {storeName && (
            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
              <span className="font-bold text-slate-700">{storeName}</span>
              {isOnVacation && (
                <span className="text-amber-700 bg-amber-50 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                  On Vacation
                </span>
              )}
            </p>
          )}
        </div>

        {/* Period selection controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold text-slate-600">
            {[
              { id: 'today', label: 'Today' },
              { id: 'last_7_days', label: '7 Days' },
              { id: 'last_30_days', label: '30 Days' },
              { id: 'this_month', label: 'This Month' },
              { id: 'custom', label: 'Custom' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePeriodChange(p.id as StatsPeriod)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === p.id
                    ? 'bg-white text-[#228b22] shadow-xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadAllData()}
            className="p-2 text-slate-500 hover:text-[#228b22] hover:bg-brand-50 border border-slate-200 rounded-xl transition-all"
            title="Refresh analytics"
          >
            <RefreshCw size={16} className={statsLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Custom Date Pickers if custom selected */}
      {period === 'custom' && (
        <div className="bg-brand-50/60 border border-brand-100 rounded-2xl p-4 flex flex-wrap items-center gap-3 text-xs">
          <Calendar size={16} className="text-[#228b22]" />
          <span className="font-bold text-slate-700">Custom Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl font-medium text-slate-800 bg-white"
          />
          <span className="text-slate-400 font-bold">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl font-medium text-slate-800 bg-white"
          />
          <button
            onClick={handleCustomDateSubmit}
            disabled={!startDate || !endDate}
            className="px-4 py-1.5 bg-[#228b22] text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition"
          >
            Apply Filter
          </button>
        </div>
      )}

      {/* Vacation Banner */}
      {isOnVacation && vacationMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-amber-900 text-xs font-semibold flex items-start gap-3 shadow-xs">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="font-bold">Vacation Mode Active</p>
            <p className="mt-0.5 text-amber-800">{vacationMessage}</p>
          </div>
        </div>
      )}

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 space-y-2 shadow-xs">
          <p className="text-[10px] font-black text-rose-800 uppercase tracking-wider">Action Required</p>
          {pendingActions.map((action: any, i: number) => (
            <div key={i} className="flex items-start gap-2 text-xs text-rose-700 font-bold">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{action?.message || JSON.stringify(action)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Grouped Stats Cards Grid (Today's bold + Totals underneath) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Earnings Card */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-brand-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Earnings Overview</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-[#228b22] flex items-center justify-center border border-brand-100">
              <NairaIcon size={18} />
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Today&apos;s Earnings</span>
            <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{fmt(todayEarnings)}</p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Net Earnings:</span>
            <span className="font-black text-[#228b22]">{fmt(totalEarnings)}</span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Order Volume</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Today&apos;s Orders</span>
            <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{todayOrders}</p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Orders:</span>
            <span className="font-black text-slate-800">{totalOrders}</span>
          </div>
        </div>

        {/* Catalog & Sales Card */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Catalog & Units</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Package size={18} />
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Products</span>
            <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{totalProducts}</p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Units Sold:</span>
            <span className="font-black text-emerald-700">{totalUnitsSold}</span>
          </div>
        </div>

        {/* Fulfillment & AOV Card */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fulfillment & AOV</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Pending Orders</span>
            <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{pendingOrders}</p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Avg Order Value:</span>
            <span className="font-black text-slate-800">{fmt(averageOrderValue)}</span>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Strip (Gross, Commission, Net, Pending Escrow) */}
      {(grossRevenue > 0 || commissionDeducted > 0 || pendingEarnings > 0) && (
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Gross Revenue</span>
            <p className="text-lg font-black text-slate-800 mt-0.5">{fmt(grossRevenue)}</p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Commission Deducted</span>
            <p className="text-lg font-black text-rose-600 mt-0.5">-{fmt(commissionDeducted)}</p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Net Earning Revenue</span>
            <p className="text-lg font-black text-emerald-600 mt-0.5">{fmt(netRevenue)}</p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Pending Escrow Funds</span>
            <p className="text-lg font-black text-brand-600 mt-0.5">{fmt(pendingEarnings)}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Table Card (5 recent orders) */}
        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <ShoppingCart size={16} className="text-[#228b22]" />
              Recent Store Orders (Top 5)
            </h3>
            <span className="text-xs font-bold text-slate-400">{recentOrders.length} Recent</span>
          </div>

          {recentOrders.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentOrders.slice(0, 5).map((order: any, i: number) => {
                const orderId = order?.id || order?._id || `order-${i}`;
                const status: string = order?.status || 'pending';
                const amount = order?.totalAmount ?? order?.amount ?? 0;
                const customerName = order?.customer?.name || order?.customerName || 'Customer';
                return (
                  <div key={orderId} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 text-[#228b22] text-xs font-black flex items-center justify-center">
                        {customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{customerName}</p>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">#{String(orderId).slice(-6)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-800">{fmt(amount)}</p>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No recent orders found.
            </div>
          )}
        </div>

        {/* Top Performing Products Card */}
        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <TrendingUp size={16} className="text-[#228b22]" />
              Top Performing Products
            </h3>
            <span className="text-xs font-bold text-slate-400">By Revenue</span>
          </div>

          {topProducts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {topProducts.slice(0, 5).map((product: any, i: number) => {
                const pName = product?.name || product?.title || `Product ${i + 1}`;
                const units = product?.unitsSold ?? product?.sales ?? 0;
                const revenue = product?.revenue ?? 0;
                return (
                  <div key={product?.productId || product?.id || i} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-brand-600 bg-brand-50 w-6 h-6 rounded-lg flex items-center justify-center">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 max-w-[180px] truncate">{pName}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{units} units sold</p>
                      </div>
                    </div>
                    {revenue > 0 && (
                      <p className="text-xs font-black text-emerald-700">{fmt(revenue)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No top products recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
