'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp, ShoppingCart, Package, Clock,
  AlertCircle, CheckCircle2, Star, Eye, BarChart2, RefreshCw,
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


interface DashboardOverviewData {
  todayEarnings?: number;
  todayOrders?: number;
  totalEarnings?: number;
  totalOrders?: number;
  totalProducts?: number;
  pendingOrders?: number;
  pendingActions?: any[];
  recentOrders?: any[];
  topProducts?: any[];
  averageRating?: number;
  totalReviews?: number;
  earnings?: { today?: number; total?: number };
  orders?: { today?: number; total?: number; pending?: number };
  products?: { total?: number };
  store?: {
    storeName?: string;
    isOnVacation?: boolean;
    vacationMessage?: string;
    rating?: number;
    totalReviews?: number;
  };
}

const fmt = (n?: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n ?? 0);

interface Props {
  vendorDashboardApi: typeof import('@/lib/api').vendorDashboardApi;
}

export default function VendorDashboardOverview({ vendorDashboardApi }: Props) {
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await vendorDashboardApi.getDashboardOverview();
      const d = (res as any)?.data ?? res;
      setData(d);
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const todayEarnings = data?.todayEarnings ?? data?.earnings?.today ?? 0;
  const todayOrders = data?.todayOrders ?? data?.orders?.today ?? 0;
  const totalEarnings = data?.totalEarnings ?? data?.earnings?.total ?? 0;
  const totalOrders = data?.totalOrders ?? data?.orders?.total ?? 0;
  const totalProducts = data?.totalProducts ?? data?.products?.total ?? 0;
  const pendingOrders = data?.pendingOrders ?? data?.orders?.pending ?? 0;
  const rating = data?.averageRating ?? data?.store?.rating ?? 0;
  const totalReviews = data?.totalReviews ?? data?.store?.totalReviews ?? 0;
  const storeName = data?.store?.storeName;
  const isOnVacation = data?.store?.isOnVacation;
  const vacationMessage = data?.store?.vacationMessage;
  const recentOrders: any[] = data?.recentOrders ?? [];
  const topProducts: any[] = data?.topProducts ?? [];
  const pendingActions: any[] = data?.pendingActions ?? [];

  const stats = [
    { label: "Today's Earnings", value: fmt(todayEarnings), icon: <NairaIcon size={20} />, color: 'from-emerald-400 to-teal-500', iconColor: 'text-emerald-600 bg-emerald-50' },
    { label: "Today's Orders", value: String(todayOrders), icon: <ShoppingCart size={20} />, color: 'from-blue-400 to-blue-600', iconColor: 'text-blue-600 bg-blue-50' },
    { label: 'Total Earnings', value: fmt(totalEarnings), icon: <NairaIcon size={20} />, color: 'from-fuchsia-500 to-violet-600', iconColor: 'text-fuchsia-600 bg-fuchsia-50' },
    { label: 'Total Orders', value: String(totalOrders), icon: <BarChart2 size={20} />, color: 'from-amber-400 to-orange-500', iconColor: 'text-amber-600 bg-amber-50' },
    { label: 'Total Products', value: String(totalProducts), icon: <Package size={20} />, color: 'from-indigo-400 to-indigo-600', iconColor: 'text-indigo-600 bg-indigo-50' },
    { label: 'Pending Orders', value: String(pendingOrders), icon: <Clock size={20} />, color: 'from-rose-400 to-rose-600', iconColor: 'text-rose-600 bg-rose-50' },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-12 h-12 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin" />
      <p className="text-sm font-semibold text-slate-500">Loading dashboard overview...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <AlertCircle size={40} className="text-rose-400" />
      <p className="text-slate-600 font-semibold text-sm">{error}</p>
      <button onClick={load} className="flex items-center gap-2 px-5 py-2.5 bg-fuchsia-600 text-white rounded-xl text-sm font-bold hover:bg-fuchsia-700 transition">
        <RefreshCw size={14} /> Try Again
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter">
            Dashboard Overview
          </h2>
          {storeName && (
            <p className="text-sm text-gray-500 font-medium mt-1">
              {storeName}
              {isOnVacation && (
                <span className="ml-2 text-amber-600 bg-amber-50 border border-amber-100 text-xs font-bold px-2 py-0.5 rounded-lg">
                  On Vacation
                </span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={load}
          className="p-2 text-gray-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-xl transition"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Vacation banner */}
      {isOnVacation && vacationMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-amber-800 text-sm font-semibold flex items-start gap-3">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <span>{vacationMessage}</span>
        </div>
      )}

      {/* Pending actions */}
      {pendingActions.length > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4 space-y-2">
          <p className="text-xs font-black text-rose-700 uppercase tracking-wider">Action Required</p>
          {pendingActions.map((action: any, i: number) => (
            <div key={i} className="flex items-start gap-2 text-sm text-rose-700 font-semibold">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{action?.message || JSON.stringify(action)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(({ label, value, icon, iconColor }, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="bg-white border border-gray-200/50 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-sm transition-shadow shadow-xs"
          >
            <div className={`w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center shadow-xs`}>
              {icon}
            </div>
            <p className="text-xs font-bold text-gray-500 leading-tight">{label}</p>
            <p className="text-lg font-black text-slate-800 tracking-tight">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Rating card */}
      {(rating > 0 || totalReviews > 0) && (
        <div className="bg-white border border-amber-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
            <Star size={24} className="text-amber-500 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-gray-500 tracking-wider">Store Rating</p>
            <p className="text-2xl font-black text-slate-800">
              {rating.toFixed(1)} <span className="text-sm text-gray-400 font-semibold">/ 5.0</span>
            </p>
            <p className="text-xs text-gray-400 font-semibold">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-extrabold text-slate-800 text-sm">Recent Orders</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.slice(0, 5).map((order: any, i: number) => {
              const orderId = order?.id || order?._id || `order-${i}`;
              const status: string = order?.status || 'pending';
              const amount = order?.totalAmount ?? order?.amount ?? 0;
              const customerName = order?.customer?.name || order?.customerName || 'Customer';
              return (
                <div key={orderId} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-fuchsia-100 text-fuchsia-600 text-xs font-extrabold flex items-center justify-center">
                      {customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{customerName}</p>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{String(orderId).slice(-8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800">{fmt(amount)}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                      status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                      status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                      status === 'cancelled' ? 'bg-rose-50 text-rose-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>{status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top products */}
      {topProducts.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-extrabold text-slate-800 text-sm">Top Products</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.slice(0, 5).map((product: any, i: number) => {
              const pName = product?.name || product?.title || `Product ${i + 1}`;
              const views = product?.totalViews ?? product?.views ?? 0;
              const sales = product?.totalSales ?? product?.sales ?? 0;
              const revenue = product?.revenue ?? 0;
              return (
                <div key={product?.id || i} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-400 w-5">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800 max-w-[180px] truncate">{pName}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Eye size={10} /> {views}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><ShoppingCart size={10} /> {sales}</span>
                      </div>
                    </div>
                  </div>
                  {revenue > 0 && (
                    <p className="text-sm font-black text-emerald-700">{fmt(revenue)}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {recentOrders.length === 0 && topProducts.length === 0 && !loading && (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="w-16 h-16 bg-fuchsia-50 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-fuchsia-400" />
          </div>
          <p className="text-slate-500 font-semibold text-sm">Your dashboard is all set!</p>
          <p className="text-xs text-gray-400 mt-1">Orders and insights will appear here once your store gets activity.</p>
        </div>
      )}
    </div>
  );
}
