'use client';
import RecordStatus from "@/components/admin/RecordStatus";


import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  <div className={`bg-slate-100 rounded-md ${className}`} />
);

// ── Overview KPI stat card ────────────────────────────────────────────────────
const OverviewCard = ({ title, metric, loading, period }: { title: string; metric?: CardMetric | null; loading?: boolean; period: PeriodType }) => (
  <div className="min-w-0 border-r last:border-r-0 border-slate-200 px-5 py-4">
    <p className="text-xs font-medium text-slate-600">{title}</p>
    {loading ? <Skeleton className="h-8 w-20 mt-2" /> : <p className="mt-1 text-2xl font-semibold text-slate-900">{(metric?.filtered ?? 0).toLocaleString()}</p>}
    {!loading && period !== 'all_time' && <p className="mt-1 text-xs text-slate-500">{(metric?.totalAllTime ?? 0).toLocaleString()} all time</p>}
  </div>
);

const OrderStatusBadge = ({ status }: { status: string }) => <RecordStatus value={status || 'unknown'} />;

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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
        <div className="flex items-center gap-2"><span className="text-xs text-slate-600">Activity period</span>
          <select aria-label="Activity period" value={period} onChange={e => setPeriod(e.target.value as PeriodType)} className="border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800">
            <option value="day">Today</option><option value="week">Last 7 days</option><option value="month">Last 30 days</option><option value="all_time">All time</option>
          </select>
        </div>
      </div>

      {/* ── 3.1 Overview Cards (GET /admin/dashboard?period=...) ───────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 rounded-lg border border-slate-200 bg-white">
        <OverviewCard
          title="Orders"
          metric={stats?.orders}
          period={period}
          loading={loadingStats}
        />
        <OverviewCard
          title="Products"
          metric={stats?.products}
          period={period}
          loading={loadingStats}
        />
        <OverviewCard
          title="Users"
          metric={stats?.users}
          period={period}
          loading={loadingStats}
        />
        <OverviewCard
          title="Vendors"
          metric={stats?.vendors}
          period={period}
          loading={loadingStats}
        />
      </div>

      {/* ── 3.2 Order Analytics (GET /admin/dashboard/order-analytics) ── */}
      <div
        className="bg-white p-5 border border-slate-200"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-3 border-b border-slate-200 gap-4">
          <div>
            <h2 className="font-semibold text-slate-900 text-base">Orders by status</h2>
            <p className="text-xs text-slate-500 mt-0.5">{periodLabel[period]}</p>
          </div>

          <div className="flex items-baseline gap-3 text-sm">
              <span className="text-slate-600">Order value</span>
              <span className="font-semibold text-slate-900">
                {loadingAnalytics
                  ? '—'
                  : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(orderAnalytics?.totalOrdersRevenue ?? 0)}
              </span>
          </div>
        </div>

        {loadingAnalytics ? (
          <div className="py-8 space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : breakdownList.length === 0 ? (
          <div className="py-8 text-sm text-slate-600">
            No orders for this period.
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
      </div>

      {/* ── 3.3 Top Products & Recent Orders Grid ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Top Products Widget (GET /admin/dashboard/top-products) ──── */}
        <div
              className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden flex flex-col"
        >
          <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Package size={18} className="text-brand-500" />
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
                className="text-xs font-semibold bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
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
                            <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                              <Package size={16} className="text-brand-400" />
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
        </div>

        {/* ── Recent Orders Widget (Replacing Recent Activity) ─────────── */}
        <div
              className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden flex flex-col"
        >
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ShoppingBag size={18} className="text-brand-500" />
                Recent Orders
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 5 orders (newest first)</p>
            </div>
            <button
              onClick={() => onNavigate?.('orders')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
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
                      <div className="w-9 h-9 rounded-md bg-brand-50 flex items-center justify-center flex-shrink-0 text-brand-600 font-bold text-xs">
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
        </div>
      </div>


    </div>
  );
}
