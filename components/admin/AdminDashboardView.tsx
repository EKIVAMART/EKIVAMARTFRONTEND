'use client';
import DashboardRevenueChart from './DashboardRevenueChart';
import { Metric, OrderBreakdown } from './OverviewPrimitives';
import RecordStatus from "@/components/admin/RecordStatus";
import NewsletterSubscriberCount from '@/components/admin/NewsletterSubscriberCount';


import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag, Package, Users, Store, ChevronRight,
  RefreshCw, BarChart3, Clock, CheckCircle2, AlertCircle,
  TrendingDown, ShoppingCart, Filter, ArrowUpRight, FileText, Zap
} from '@/components/ui/platform-icons';
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
const OverviewCard = ({ title, metric, loading, period, error }: { title: string; metric?: CardMetric | null; loading?: boolean; period: PeriodType; error?: string | null }) => (
  <Metric label={title} value={loading ? '—' : error ? 'Unavailable' : (metric?.filtered ?? 0).toLocaleString()} context={loading ? 'Loading metrics…' : error ? 'Refresh to try again' : period === 'all_time' ? 'Lifetime total' : `${(metric?.totalAllTime ?? 0).toLocaleString()} lifetime · created in selected period`} />
);

const OrderStatusBadge = ({ status }: { status: string }) => <RecordStatus value={status || 'unknown'} />;

export default function AdminDashboardView({ onNavigate }: AdminDashboardViewProps) {
  const router = useRouter();
  const authUser = useAppSelector((state) => state.auth.user);
  const [chartView, setChartView] = useState<'orders' | 'orderValue'>('orders');
  const [period, setPeriod] = useState<PeriodType>('week');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Categories list for filter
  const [categories, setCategories] = useState<any[]>([]);

  // Widget states
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  const [orderAnalytics, setOrderAnalytics] = useState<DetailedOrderAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [errorAnalytics, setErrorAnalytics] = useState<string | null>(null);

  const [topProducts, setTopProducts] = useState<AdminTopProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingRecentOrders, setLoadingRecentOrders] = useState(true);
  const [errorRecentOrders, setErrorRecentOrders] = useState<string | null>(null);

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
    setErrorStats(null);
    try {
      const res = await adminDashboardApi.getDashboard({ period });
      if (res?.success && res.data) {
        setStats(res.data);
      } else if (res && !res.success) {
        setErrorStats(res.message || 'Failed to load dashboard metrics');
      }
    } catch (err: any) {
      setErrorStats(err?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoadingStats(false);
    }
  }, [period]);

  // ── Fetch Order Analytics (GET /admin/dashboard/order-analytics?period=...) ──
  const fetchOrderAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    setErrorAnalytics(null);
    try {
      const res = await adminDashboardApi.getOrderAnalytics({ period });
      if (res?.success && res.data) {
        setOrderAnalytics(res.data);
      } else if (res && !res.success) {
        setErrorAnalytics(res.message || 'Failed to load order analytics');
      }
    } catch (err: any) {
      setErrorAnalytics(err?.message || 'Failed to load order analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  }, [period]);

  // ── Fetch Top Products (GET /admin/dashboard/top-products?period=...&categoryId=...) ──
  const fetchTopProducts = useCallback(async () => {
    setLoadingProducts(true);
    setErrorProducts(null);
    try {
      const res = await adminDashboardApi.getTopProducts({
        period,
        categoryId: selectedCategoryId || undefined
      });
      if (res?.success) {
        const list = res.data?.products ?? [];
        setTopProducts(Array.isArray(list) ? list : []);
      } else if (res && !res.success) {
        setErrorProducts(res.message || 'Failed to load top products');
      }
    } catch (err: any) {
      setErrorProducts(err?.message || 'Failed to load top products');
    } finally {
      setLoadingProducts(false);
    }
  }, [period, selectedCategoryId]);

  // ── Fetch Recent Orders (ordersApi.search sortBy=created_at sortOrder=desc limit=5) ──
  const fetchRecentOrders = useCallback(async () => {
    setLoadingRecentOrders(true);
    setErrorRecentOrders(null);
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
      setErrorRecentOrders("Recent orders could not be loaded.");
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
    <div className="overview-page">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
        <div className="flex items-center gap-2"><span className="text-xs text-slate-600">Activity period</span>
          <select aria-label="Activity period" value={period} onChange={e => setPeriod(e.target.value as PeriodType)} className="border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800">
            <option value="day">Today</option><option value="week">Last 7 days</option><option value="month">Last 30 days</option><option value="all_time">All time</option>
          </select>
        </div>
      </div>

      {/* ── 3.1 Overview Cards (GET /admin/dashboard?period=...) ───────── */}
      <div className="overview-metrics">
        <OverviewCard
          title="Orders"
          metric={stats?.orders}
          period={period}
          loading={loadingStats} error={errorStats}
        />
        <OverviewCard
          title="Products"
          metric={stats?.products}
          period={period}
          loading={loadingStats} error={errorStats}
        />
        <OverviewCard
          title="Users"
          metric={stats?.users}
          period={period}
          loading={loadingStats} error={errorStats}
        />
        <OverviewCard
          title="Vendors"
          metric={stats?.vendors}
          period={period}
          loading={loadingStats} error={errorStats}
        />
      </div>

      {errorStats && <button onClick={fetchStats} className="text-sm text-emerald-800">{errorStats} · Retry</button>}
      <div className="overview-analytics">
        <section className="overview-panel"><div className="overview-panel-heading"><div><h2>Order activity</h2><p>Orders placed · {periodLabel[period]}</p></div><select aria-label="Chart measure" value={chartView} onChange={e=>setChartView(e.target.value as 'orders' | 'orderValue')}><option value="orders">Order count</option><option value="orderValue">Order value</option></select></div>
          {loadingAnalytics ? <div className="analytics-empty">Loading order activity…</div> : errorAnalytics ? <div className="analytics-empty flex-col gap-3" role="alert">{errorAnalytics}<button onClick={fetchOrderAnalytics} className="text-emerald-800 underline">Retry</button></div> : orderAnalytics?.dataPoints ? <DashboardRevenueChart points={orderAnalytics.dataPoints} kind={chartView}/> : <div className="analytics-empty">Order history is unavailable. Refresh to try again.</div>}
        </section>
        <OrderBreakdown rows={breakdownList} total={orderAnalytics?.totalOrdersCount ?? 0} value={orderAnalytics?.totalOrdersRevenue ?? 0} loading={loadingAnalytics} error={errorAnalytics} onRetry={fetchOrderAnalytics} onOpen={()=>onNavigate?.('orders')}/>
      </div>
      <NewsletterSubscriberCount />

      {/* ── 3.3 Top Products & Recent Orders Grid ──────────────────────── */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">

        {/* ── Top Products Widget (GET /admin/dashboard/top-products) ──── */}
        <div
              className="overview-panel overflow-hidden"
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
          ) : errorProducts ? <div className="analytics-empty flex-col gap-3" role="alert">{errorProducts}<button onClick={fetchTopProducts} className="text-emerald-800 underline">Retry</button></div> : topProducts.length === 0 ? (
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
                  {topProducts.slice(0, 5).map((p, idx) => (
                    <tr key={p.productId || idx} className="cursor-pointer transition-colors hover:bg-emerald-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600" tabIndex={0} aria-label={`View ${p.name} in products`} onClick={() => onNavigate?.('products')} onKeyDown={(event) => { if (event.key === 'Enter') onNavigate?.('products'); }}>
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
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package size={16} className="text-brand-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                              <span title={p.name}>{p.name || 'Unnamed Product'}</span>
                            </h4>
                            <p className="text-[10px] text-gray-400 truncate">
                              {p.categoryName || 'General'} {p.sku ? `• SKU: ${p.sku}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td title={p.vendorName || undefined} className="p-3 text-xs font-medium text-slate-600 truncate max-w-[100px]">
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
              className="overview-panel overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ShoppingBag size={18} className="text-brand-500" />
                Recent Orders
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Latest 5 orders · all time</p>
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
          ) : errorRecentOrders ? <div className="analytics-empty flex-col gap-3" role="alert">{errorRecentOrders}<button onClick={fetchRecentOrders} className="text-emerald-800 underline">Retry</button></div> : recentOrders.length === 0 ? (
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
                    onKeyDown={(event) => { if (event.key === 'Enter') handleOpenRecentOrder(ord); }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View order ${orderNo}`}
                    className="recent-order-row px-6 py-3.5 flex items-center justify-between hover:bg-emerald-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 text-brand-600 font-bold text-xs">
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
