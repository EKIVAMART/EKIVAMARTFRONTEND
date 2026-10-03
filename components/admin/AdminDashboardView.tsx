'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Package, Users, Store, ChevronRight,
  RefreshCw, BarChart3, Clock, CheckCircle2, AlertCircle,
  TrendingDown, ShoppingCart, Filter, ArrowUpRight, FileText, Zap
} from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import {
  adminDashboardApi,
  ordersApi,
  categoryApi,
  AdminDashboardStats,
  DetailedOrderAnalytics,
  AdminTopProductItem,
  CardMetric
} from '@/lib/api';
import { toast } from 'react-hot-toast';

type PeriodType = 'day' | 'week' | 'month' | 'all_time';

interface AdminDashboardViewProps {
  onNavigate?: (tab: string) => void;
}

// ── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);

// ── Overview KPI stat card ────────────────────────────────────────────────────
const OverviewCard = ({
  title,
  metric,
  icon: Icon,
  color = 'fuchsia',
  note,
  loading
}: {
  title: string;
  metric?: CardMetric | null;
  icon: React.ElementType;
  color?: 'fuchsia' | 'blue' | 'emerald' | 'amber';
  note: string;
  loading?: boolean;
}) => {
  const gradients: Record<string, string> = {
    fuchsia: 'from-fuchsia-500 to-purple-600',
    blue: 'from-blue-500 to-cyan-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-500',
  };
  const bgColors: Record<string, string> = {
    fuchsia: 'from-fuchsia-50 to-purple-50',
    blue: 'from-blue-50 to-cyan-50',
    emerald: 'from-emerald-50 to-teal-50',
    amber: 'from-amber-50 to-orange-50',
  };
  const iconColors: Record<string, string> = {
    fuchsia: 'text-fuchsia-600',
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
  };

  const filteredVal = metric?.filtered ?? 0;
  const totalAllTimeVal = metric?.totalAllTime ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <div className={`h-1 bg-gradient-to-r ${gradients[color]}`} />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${bgColors[color]}`}>
            <Icon className={`w-5 h-5 ${iconColors[color]}`} />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {title}
          </span>
        </div>
        <div className="mb-2">
          {loading ? (
            <Skeleton className="h-9 w-28 mb-2" />
          ) : (
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">
              {filteredVal.toLocaleString()}
            </h3>
          )}
          <p className="text-sm font-semibold text-slate-700 mt-1">{title}</p>
        </div>
        <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-0.5">
          {loading ? (
            <Skeleton className="h-4 w-36" />
          ) : (
            <>
              <div className="text-xs font-semibold text-slate-500">
                Total All Time: <span className="font-bold text-slate-800">{totalAllTimeVal.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-gray-400">{note}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Status badge component ────────────────────────────────────────────────────
const OrderStatusBadge = ({ status }: { status: string }) => {
  const normalized = status?.toLowerCase() ?? '';
  const map: Record<string, { cls: string; label: string }> = {
    pending_payment: { cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending Payment' },
    payment_failed: { cls: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Payment Failed' },
    confirmed: { cls: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Confirmed' },
    processing: { cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Processing' },
    shipped: { cls: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Shipped' },
    delivered: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Delivered' },
    completed: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' },
    cancelled: { cls: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Cancelled' },
    refunded: { cls: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Refunded' },
  };

  const info = map[normalized] ?? {
    cls: 'bg-gray-50 text-gray-700 border-gray-200',
    label: status ? status.replace(/_/g, ' ') : 'Unknown'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${info.cls}`}>
      {info.label}
    </span>
  );
};

export default function AdminDashboardView({ onNavigate }: AdminDashboardViewProps) {
  const router = useRouter();
  const authUser = useAppSelector((state) => state.auth.user);
  const [period, setPeriod] = useState<PeriodType>('week');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Categories list for filter
  const [categories, setCategories] = useState<any[]>([]);

  // Widget states
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [orderAnalytics, setOrderAnalytics] = useState<DetailedOrderAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const [topProducts, setTopProducts] = useState<AdminTopProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingRecentOrders, setLoadingRecentOrders] = useState(true);

  // ── Fetch Categories ─────────────────────────────────────────────────────
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryApi.getCategories({ limit: 100 });
        if (res?.success) {
          const list = res.data?.categories ?? res.data?.items ?? res.data ?? [];
          setCategories(Array.isArray(list) ? list : []);
        }
      } catch {
        // category fetch silent catch
      }
    }
    void loadCategories();
  }, []);

  // ── Fetch Overview Stats (GET /admin/dashboard?period=...) ─────────────
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await adminDashboardApi.getDashboard({ period });
      if (res?.success && res.data) {
        setStats(res.data);
      } else if (res && !res.success) {
        toast.error(res.message || 'Failed to load dashboard metrics');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoadingStats(false);
    }
  }, [period]);

  // ── Fetch Order Analytics (GET /admin/dashboard/order-analytics?period=...) ──
  const fetchOrderAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await adminDashboardApi.getOrderAnalytics({ period });
      if (res?.success && res.data) {
        setOrderAnalytics(res.data);
      } else if (res && !res.success) {
        toast.error(res.message || 'Failed to load order analytics');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load order analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  }, [period]);

  // ── Fetch Top Products (GET /admin/dashboard/top-products?period=...&categoryId=...) ──
  const fetchTopProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await adminDashboardApi.getTopProducts({
        period,
        categoryId: selectedCategoryId || undefined
      });
      if (res?.success) {
        const list = res.data?.products ?? [];
        setTopProducts(Array.isArray(list) ? list : []);
      } else if (res && !res.success) {
        toast.error(res.message || 'Failed to load top products');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load top products');
    } finally {
      setLoadingProducts(false);
    }
  }, [period, selectedCategoryId]);

  // ── Fetch Recent Orders (ordersApi.search sortBy=created_at sortOrder=desc limit=5) ──
  const fetchRecentOrders = useCallback(async () => {
    setLoadingRecentOrders(true);
    try {
      const res = await ordersApi.search({
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit: 5,
        page: 1
      });

      const payload = (res as any)?.data ?? res ?? {};
      const candidates = [
        payload?.orders,
        payload?.items,
        payload?.results,
        payload?.data?.orders,
        payload?.data?.items,
        payload?.data?.results,
        payload?.data,
        payload,
      ];
      const list = candidates.find(Array.isArray) ?? [];

      setRecentOrders(Array.isArray(list) ? list.slice(0, 5) : []);
    } catch {
      setRecentOrders([]);
    } finally {
      setLoadingRecentOrders(false);
    }
  }, []);

  const resolveCurrencyValue = (value: any): number => {
    const raw = typeof value === 'object' && value !== null
      ? value.amount ?? value.total ?? value.value ?? value.price ?? 0
      : value ?? 0;
    const num = Number(raw);
    return Number.isFinite(num) ? num : 0;
  };

  const formatCurrency = (value: any) => new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(resolveCurrencyValue(value));

  const handleOpenRecentOrder = (order: any) => {
    const realOrderId = order?.orderNumber || order?.orderId || order?.id || order?._id;
    if (!realOrderId) return;
    onNavigate?.('orders');
    router.push(`/admin/dashboard?tab=orders&orderId=${encodeURIComponent(String(realOrderId))}`);
  };

  useEffect(() => { void fetchStats(); }, [fetchStats]);
  useEffect(() => { void fetchOrderAnalytics(); }, [fetchOrderAnalytics]);
  useEffect(() => { void fetchTopProducts(); }, [fetchTopProducts]);
  useEffect(() => { void fetchRecentOrders(); }, [fetchRecentOrders]);

  const handleRefreshAll = () => {
    void fetchStats();
    void fetchOrderAnalytics();
    void fetchTopProducts();
    void fetchRecentOrders();
    toast.success('Dashboard refreshed');
  };

  const periodLabel: Record<PeriodType, string> = {
    day: 'Today',
    week: 'Last 7 days',
    month: 'Last 30 days',
    all_time: 'All Time',
  };

  // Status breakdown array sorted by count descending
  const breakdownList = orderAnalytics?.breakdown ?? [];

  return (
    <div className="space-y-8">

      {/* ── Header Banner ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-fuchsia-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-fuchsia-100"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              Welcome back, {authUser?.firstName || 'Admin'}!
            </h2>
            <p className="text-white/80 text-sm mt-1 font-medium">
              Store Analytics ({periodLabel[period]})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Period Filter Switcher */}
            <div className="flex bg-white/10 p-1 rounded-xl items-center border border-white/10">
              {(['day', 'week', 'month', 'all_time'] as PeriodType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setPeriod(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    period === t
                      ? 'bg-white text-fuchsia-600 shadow'
                      : 'text-white/85 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t === 'all_time' ? 'All Time' : t === 'day' ? 'Today' : t === 'week' ? 'Last 7d' : 'Last 30d'}
                </button>
              ))}
            </div>

            <button
              onClick={handleRefreshAll}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition flex items-center gap-2"
              title="Refresh Dashboard"
            >
              <RefreshCw size={14} /> Refresh
            </button>

            <button
              onClick={() => onNavigate?.('orders')}
              className="px-3.5 py-2 bg-white text-fuchsia-600 hover:bg-fuchsia-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              Manage Orders <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── 3.1 Overview Cards (GET /admin/dashboard?period=...) ───────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <OverviewCard
          title="Orders"
          metric={stats?.orders}
          icon={ShoppingBag}
          color="fuchsia"
          loading={loadingStats}
          note="All orders across all statuses"
        />
        <OverviewCard
          title="Products"
          metric={stats?.products}
          icon={Package}
          color="blue"
          loading={loadingStats}
          note="All product rows in database"
        />
        <OverviewCard
          title="Users"
          metric={stats?.users}
          icon={Users}
          color="emerald"
          loading={loadingStats}
          note="All user accounts (all roles)"
        />
        <OverviewCard
          title="Vendors"
          metric={stats?.vendors}
          icon={Store}
          color="amber"
          loading={loadingStats}
          note="All vendor profiles & applications"
        />
      </div>

      {/* ── 3.2 Order Analytics (GET /admin/dashboard/order-analytics) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-gray-100 gap-4">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <BarChart3 size={20} className="text-fuchsia-500" />
              Order Analytics
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Order counts and order value breakdown for {periodLabel[period]}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Orders</span>
              <span className="text-lg font-black text-slate-800">
                {loadingAnalytics ? '—' : (orderAnalytics?.totalOrdersCount ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-fuchsia-50 px-4 py-2 rounded-xl border border-fuchsia-100">
              <span className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-wider block">Order Value</span>
              <span className="text-lg font-black text-fuchsia-700">
                {loadingAnalytics
                  ? '—'
                  : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(orderAnalytics?.totalOrdersRevenue ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {loadingAnalytics ? (
          <div className="py-8 space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : breakdownList.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <AlertCircle size={36} className="opacity-30 mb-2" />
            <p className="text-sm font-medium">No order analytics data for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase">
                  <th className="pb-3 pl-2">Status</th>
                  <th className="pb-3 text-right">Orders</th>
                  <th className="pb-3 text-right">Order Value</th>
                  <th className="pb-3 text-right pr-2">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {breakdownList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 pl-2 font-medium">
                      <OrderStatusBadge status={item.status} />
                    </td>
                    <td className="py-3 text-right font-bold text-slate-800">
                      {item.count.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-700">
                      {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(item.totalRevenue ?? 0)}
                    </td>
                    <td className="py-3 text-right pr-2 font-semibold text-slate-500">
                      {item.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── 3.3 Top Products & Recent Orders Grid ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Top Products Widget (GET /admin/dashboard/top-products) ──── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
        >
          <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Package size={18} className="text-fuchsia-500" />
                Top Products
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Top 5 by units sold ({periodLabel[period]})</p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
              >
                <option value="">All Categories</option>
                {categories.map((c: any) => (
                  <option key={c.id || c._id || c.uuid} value={c.id || c._id || c.uuid}>
                    {c.name || c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingProducts ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-slate-400 flex-1">
              <Package size={36} className="opacity-20 mb-3" />
              <p className="text-sm font-medium">No top products found</p>
              <p className="text-xs text-gray-400 mt-1">Try selecting a different category or period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/60 border-b border-gray-100">
                  <tr className="text-[10px] font-bold text-gray-400 uppercase">
                    <th className="p-3 pl-4">#</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Vendor</th>
                    <th className="p-3 text-right pr-4">Units Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {topProducts.map((p, idx) => (
                    <tr key={p.productId || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 pl-4 text-xs font-bold text-gray-400">{idx + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-9 h-9 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-fuchsia-50 flex items-center justify-center flex-shrink-0">
                              <Package size={16} className="text-fuchsia-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                              {p.name || 'Unnamed Product'}
                            </h4>
                            <p className="text-[10px] text-gray-400 truncate">
                              {p.categoryName || 'General'} {p.sku ? `• SKU: ${p.sku}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs font-medium text-slate-600 truncate max-w-[100px]">
                        {p.vendorName || '—'}
                      </td>
                      <td className="p-3 text-right pr-4 font-black text-slate-800">
                        {p.unitsSold.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* ── Recent Orders Widget (Replacing Recent Activity) ─────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
        >
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ShoppingBag size={18} className="text-fuchsia-500" />
                Recent Orders
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 5 orders (newest first)</p>
            </div>
            <button
              onClick={() => onNavigate?.('orders')}
              className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          {loadingRecentOrders ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-slate-400 flex-1">
              <ShoppingBag size={36} className="opacity-20 mb-3" />
              <p className="text-sm font-medium">No recent orders</p>
              <p className="text-xs text-gray-400 mt-1">New customer orders will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((ord: any, i: number) => {
                const orderNo = ord.orderNumber || ord.id || `ORD-${i + 1}`;
                const custName = ord.user?.firstName
                  ? `${ord.user.firstName} ${ord.user.lastName || ''}`
                  : ord.customerName || ord.shippingAddress?.fullName || ord.email || 'Customer';
                const dateStr = ord.createdAt
                  ? new Date(ord.createdAt).toLocaleString('en-GB', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })
                  : '';
                const totalVal = resolveCurrencyValue(ord.totalAmount ?? ord.total ?? ord.grandTotal ?? ord.amount ?? ord.orderTotal ?? ord.totalPrice ?? ord.price ?? 0);
                const status = ord.status || ord.orderStatus || 'pending';

                return (
                  <div
                    key={ord.id || ord._id || i}
                    onClick={() => handleOpenRecentOrder(ord)}
                    className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-fuchsia-50 flex items-center justify-center flex-shrink-0 text-fuchsia-600 font-bold text-xs">
                        <ShoppingBag size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {orderNo}
                          </span>
                          <OrderStatusBadge status={status} />
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {custName} {dateStr ? `• ${dateStr}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-xs font-black text-slate-800 block">
                        {formatCurrency(totalVal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-amber-500" />
          <span className="text-sm font-bold text-slate-700">Quick Shortcuts</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate?.('products')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-2"
          >
            <Package size={14} /> Products
          </button>
          <button
            onClick={() => onNavigate?.('orders')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-2"
          >
            <ShoppingBag size={14} /> Orders
          </button>
          <button
            onClick={() => onNavigate?.('vendors')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-2"
          >
            <Store size={14} /> Vendors
          </button>
        </div>
      </motion.div>

    </div>
  );
}