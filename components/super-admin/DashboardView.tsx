'use client';
import RecordStatus from "@/components/admin/RecordStatus";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, Package, Users, ArrowUpRight, ChevronRight,
  Zap, FileText, Clock, CheckCircle2, AlertCircle, Activity, RefreshCw,
  Search, Filter, DollarSign, Award, Shield, Layers, CreditCard, ChevronLeft
} from 'lucide-react';
import { superAdminDashboardApi, superAdminPayoutsApi, categoryApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

export const NairaIcon = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    width={props.size || 20}
    height={props.size || 20}
    {...props}
  >
    <path d="M6 3v18M18 3v18M6 3l12 18M4 9h16M4 14h16" />
  </svg>
);

const fmtNGN = (n?: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n ?? 0);

const formatDateString = (dateStr?: string | null) => {
  if (!dateStr) return 'N/A';
  // Handle date-only strings YYYY-MM-DD directly without timezone shift
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
  }
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

type PeriodType = 'day' | 'week' | 'month' | 'all_time';
type IntervalType = 'daily' | 'weekly' | 'monthly';

interface DashboardViewProps {
  onNavigate?: (tab: string) => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  // Shared Filter Controls
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('all_time');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedInterval, setSelectedInterval] = useState<IntervalType>('daily');

  // Filter Dropdown Options
  const [vendorOptions, setVendorOptions] = useState<any[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);

  // 1. KPI Overview State
  const [kpiData, setKpiData] = useState<any>(null);
  const [loadingKpi, setLoadingKpi] = useState<boolean>(true);
  const [errorKpi, setErrorKpi] = useState<string | null>(null);

  // 2. Vendor Lifetime Earnings Table State
  const [vendorEarningsData, setVendorEarningsData] = useState<any>(null);
  const [loadingVendorEarnings, setLoadingVendorEarnings] = useState<boolean>(true);
  const [errorVendorEarnings, setErrorVendorEarnings] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [tablePage, setTablePage] = useState<number>(1);

  // 3. Recent Activities State
  const [activitiesData, setActivitiesData] = useState<any>(null);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(true);
  const [errorActivities, setErrorActivities] = useState<string | null>(null);
  const [activityTab, setActivityTab] = useState<'payments' | 'payouts' | 'orders'>('payments');

  // 4. Top Products Pie Chart State
  const [pieChartData, setPieChartData] = useState<any>(null);
  const [loadingPieChart, setLoadingPieChart] = useState<boolean>(true);
  const [errorPieChart, setErrorPieChart] = useState<string | null>(null);

  // 5. Earnings Line Graph State
  const [graphData, setGraphData] = useState<any>(null);
  const [loadingGraph, setLoadingGraph] = useState<boolean>(true);
  const [errorGraph, setErrorGraph] = useState<string | null>(null);

  // 6. Orders Bar Chart State
  const [ordersBarData, setOrdersBarData] = useState<any>(null);
  const [loadingOrdersBar, setLoadingOrdersBar] = useState<boolean>(true);
  const [errorOrdersBar, setErrorOrdersBar] = useState<string | null>(null);

  // Load Dropdown Options (Vendors & Categories)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [vRes, cRes] = await Promise.allSettled([
          superAdminPayoutsApi.getVendors({ limit: 100 }),
          categoryApi.getCategories(),
        ]);
        if (vRes.status === 'fulfilled' && vRes.value?.data) {
          const vList = vRes.value.data.vendors || vRes.value.data.items || [];
          setVendorOptions(vList);
        }
        if (cRes.status === 'fulfilled' && cRes.value?.data) {
          const cList = Array.isArray(cRes.value.data) ? cRes.value.data : cRes.value.data.categories || [];
          setCategoryOptions(cList);
        }
      } catch (err) {
        console.error('Failed to load dashboard filter options', err);
      }
    };
    void fetchOptions();
  }, []);

  // Search Debounce (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(tableSearch);
      setTablePage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [tableSearch]);

  // Fetch 1: KPI Overview
  const fetchKpiOverview = useCallback(async () => {
    setLoadingKpi(true);
    setErrorKpi(null);
    try {
      const res = await superAdminDashboardApi.getKpiOverview({
        period: selectedPeriod,
        vendorId: selectedVendorId || undefined,
      });
      if (res?.success) {
        setKpiData(res.data);
      } else {
        setErrorKpi(res?.message || 'Failed to load KPI metrics');
      }
    } catch (err: any) {
      setErrorKpi(err?.message || 'Failed to load KPI metrics');
    } finally {
      setLoadingKpi(false);
    }
  }, [selectedPeriod, selectedVendorId]);

  // Fetch 2: Vendor Lifetime Earnings Table
  const fetchVendorEarnings = useCallback(async () => {
    setLoadingVendorEarnings(true);
    setErrorVendorEarnings(null);
    try {
      const res = await superAdminDashboardApi.getVendorEarnings({
        search: debouncedSearch || undefined,
        vendorId: selectedVendorId || undefined,
        page: tablePage,
        limit: 10,
      });
      if (res?.success) {
        setVendorEarningsData(res.data);
      } else {
        setErrorVendorEarnings(res?.message || 'Failed to load vendor earnings table');
      }
    } catch (err: any) {
      setErrorVendorEarnings(err?.message || 'Failed to load vendor earnings table');
    } finally {
      setLoadingVendorEarnings(false);
    }
  }, [debouncedSearch, selectedVendorId, tablePage]);

  // Fetch 3: Recent Activities
  const fetchRecentActivities = useCallback(async () => {
    setLoadingActivities(true);
    setErrorActivities(null);
    try {
      const res = await superAdminDashboardApi.getRecentActivities({ limit: 10 });
      if (res?.success) {
        setActivitiesData(res.data);
      } else {
        setErrorActivities(res?.message || 'Failed to load recent activities');
      }
    } catch (err: any) {
      setErrorActivities(err?.message || 'Failed to load recent activities');
    } finally {
      setLoadingActivities(false);
    }
  }, []);

  // Fetch 4: Top Products Pie Chart
  const fetchPieChart = useCallback(async () => {
    setLoadingPieChart(true);
    setErrorPieChart(null);
    try {
      const res = await superAdminDashboardApi.getPieChart({
        period: selectedPeriod,
        categoryId: selectedCategoryId || undefined,
      });
      if (res?.success) {
        setPieChartData(res.data);
      } else {
        setErrorPieChart(res?.message || 'Failed to load top products chart');
      }
    } catch (err: any) {
      setErrorPieChart(err?.message || 'Failed to load top products chart');
    } finally {
      setLoadingPieChart(false);
    }
  }, [selectedPeriod, selectedCategoryId]);

  // Fetch 5: Earnings Line Graph
  const fetchEarningsGraph = useCallback(async () => {
    setLoadingGraph(true);
    setErrorGraph(null);
    try {
      const res = await superAdminDashboardApi.getEarningsGraph({
        interval: selectedInterval,
        vendorId: selectedVendorId || undefined,
      });
      if (res?.success) {
        setGraphData(res.data);
      } else {
        setErrorGraph(res?.message || 'Failed to load earnings graph');
      }
    } catch (err: any) {
      setErrorGraph(err?.message || 'Failed to load earnings graph');
    } finally {
      setLoadingGraph(false);
    }
  }, [selectedInterval, selectedVendorId]);

  // Fetch 6: Orders Bar Chart
  const fetchOrdersBarChart = useCallback(async () => {
    setLoadingOrdersBar(true);
    setErrorOrdersBar(null);
    try {
      const res = await superAdminDashboardApi.getOrdersBarChart({
        period: selectedPeriod,
        vendorId: selectedVendorId || undefined,
      });
      if (res?.success) {
        setOrdersBarData(res.data);
      } else {
        setErrorOrdersBar(res?.message || 'Failed to load orders breakdown chart');
      }
    } catch (err: any) {
      setErrorOrdersBar(err?.message || 'Failed to load orders breakdown chart');
    } finally {
      setLoadingOrdersBar(false);
    }
  }, [selectedPeriod, selectedVendorId]);

  // Effect triggers per widget independent dependencies
  useEffect(() => { void fetchKpiOverview(); }, [fetchKpiOverview]);
  useEffect(() => { void fetchVendorEarnings(); }, [fetchVendorEarnings]);
  useEffect(() => { void fetchRecentActivities(); }, [fetchRecentActivities]);
  useEffect(() => { void fetchPieChart(); }, [fetchPieChart]);
  useEffect(() => { void fetchEarningsGraph(); }, [fetchEarningsGraph]);
  useEffect(() => { void fetchOrdersBarChart(); }, [fetchOrdersBarChart]);

  // Process Continuous Dates for Earnings Line Graph
  const processedGraphPoints = useMemo(() => {
    const rawPoints: any[] = graphData?.dataPoints || [];
    if (rawPoints.length === 0) return [];
    // Ensure points are sorted by date
    return [...rawPoints].sort((a, b) => a.date.localeCompare(b.date));
  }, [graphData]);

  // Max value in graph for scaling
  const maxGraphValue = useMemo(() => {
    if (processedGraphPoints.length === 0) return 1;
    return Math.max(...processedGraphPoints.map((p) => Math.max(p.grossRevenue || 0, p.platformCommission || 0, p.vendorNetEarnings || 0)));
  }, [processedGraphPoints]);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-slate-600" htmlFor="overview-store">Store</label>
          <select id="overview-store" value={selectedVendorId} onChange={(event) => setSelectedVendorId(event.target.value)}
            className="min-h-9 border border-slate-300 bg-white px-3 text-sm text-slate-800">
            <option value="">All stores</option>
            {vendorOptions.map((vendor) => <option key={vendor.vendorId || vendor.id} value={vendor.vendorId || vendor.id}>
              {vendor.storeName || vendor.name}
            </option>)}
          </select>
          <label className="ml-2 text-xs text-slate-600" htmlFor="overview-period">Activity period</label>
          <select id="overview-period" value={selectedPeriod} onChange={(event) => setSelectedPeriod(event.target.value as PeriodType)}
            className="min-h-9 border border-slate-300 bg-white px-3 text-sm text-slate-800">
            <option value="day">Today</option><option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option><option value="all_time">All time</option>
          </select>
        </div>
      </div>

      <section aria-label="Marketplace activity">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">Marketplace activity</h2>
          <span className="text-xs text-slate-500">{selectedPeriod === 'all_time' ? 'All time' : selectedPeriod === 'day' ? 'Today' : selectedPeriod === 'week' ? 'Last 7 days' : 'Last 30 days'}</span>
        </div>
        {loadingKpi ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-200 bg-white">
            {[...Array(4)].map((_, index) => <div key={index} className="h-24 border-r last:border-r-0 border-slate-200 p-4 " />)}
          </div>
        ) : errorKpi ? (
          <div role="status" className="flex items-center justify-between gap-4 border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <span>{errorKpi}</span>
            <button type="button" onClick={() => void fetchKpiOverview()} className="border border-slate-300 px-3 py-2 font-medium">Retry</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-200 bg-white">
            {[
              { label: 'Gross sales', value: fmtNGN(kpiData?.platformGmv?.filtered), allTime: fmtNGN(kpiData?.platformGmv?.totalAllTime) },
              { label: 'Platform commission', value: fmtNGN(kpiData?.platformCommissionEarned?.filtered), allTime: fmtNGN(kpiData?.platformCommissionEarned?.totalAllTime) },
              { label: 'Vendor earnings', value: fmtNGN(kpiData?.vendorEarningsTotal?.filtered), allTime: fmtNGN(kpiData?.vendorEarningsTotal?.totalAllTime) },
              { label: 'Pending escrow', value: fmtNGN(kpiData?.pendingVendorEscrow?.filtered), allTime: fmtNGN(kpiData?.pendingVendorEscrow?.totalAllTime) },
            ].map((metric) => <div key={metric.label} className="min-w-0 border-r last:border-r-0 border-slate-200 px-4 py-4">
              <p className="text-xs text-slate-600">{metric.label}</p>
              <p className="mt-1 truncate text-xl font-semibold text-slate-900" title={metric.value}>{metric.value}</p>
              {selectedPeriod !== 'all_time' && <p className="mt-1 truncate text-xs text-slate-500" title={metric.allTime}>{metric.allTime} all time</p>}
            </div>)}
          </div>
        )}
        {kpiData && !errorKpi && <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-xs text-slate-600">
          <span><strong className="font-semibold text-slate-900">{kpiData.activeVendorsCount ?? 0}</strong> active vendors</span>
          <span><strong className="font-semibold text-slate-900">{kpiData.totalOrdersCount ?? 0}</strong> orders</span>
          <span><strong className="font-semibold text-slate-900">{fmtNGN(kpiData.withdrawnTotal?.totalAllTime)}</strong> withdrawn all time</span>
        </div>}
      </section>

            {/* ── 5. EARNINGS TIME-SERIES LINE GRAPH & 6. ORDERS BAR CHART ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Line Graph (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-md border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Sales and earnings</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gross sales, commission, and vendor earnings over time.
              </p>
            </div>

            {/* Interval Toggle: Daily / Weekly / Monthly */}
            <div className="flex items-center bg-slate-100 p-1 rounded-md text-xs font-bold text-slate-600 self-start sm:self-auto">
              {(
                [
                  { label: 'Daily (7d)', value: 'daily' },
                  { label: 'Weekly (60d)', value: 'weekly' },
                  { label: 'Monthly (365d)', value: 'monthly' },
                ] as const
              ).map((int) => (
                <button
                  key={int.value}
                  onClick={() => setSelectedInterval(int.value)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedInterval === int.value
                      ? 'bg-white text-[#228b22] shadow-xs font-black'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {int.label}
                </button>
              ))}
            </div>
          </div>

          {loadingGraph ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-bold gap-2">
              <RefreshCw className="animate-spin" size={16} /> Loading time-series graph…
            </div>
          ) : errorGraph ? (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-md flex items-center justify-between">
              <span>{errorGraph}</span>
              <button onClick={() => fetchEarningsGraph()} className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold">Retry</button>
            </div>
          ) : processedGraphPoints.length === 0 ? (
            <div className="py-8 text-sm text-slate-600">
              No sales data for this interval.
            </div>
          ) : (
            <div>
              {/* Visual Bar Chart Comparison per bucket */}
              <div className="h-56 flex items-end gap-3 pt-6 pb-2 px-2 overflow-x-auto border-b border-slate-100">
                {processedGraphPoints.map((point: any, idx: number) => {
                  const grossHeight = Math.max(8, (point.grossRevenue / maxGraphValue) * 100);
                  const commHeight = Math.max(8, (point.platformCommission / maxGraphValue) * 100);
                  const netHeight = Math.max(8, (point.vendorNetEarnings / maxGraphValue) * 100);

                  return (
                    <div key={point.date || idx} className="flex-1 min-w-[48px] flex flex-col items-center gap-1 group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-900 text-white text-[10px] p-2.5 rounded-md shadow-sm z-20 whitespace-nowrap gap-1 pointer-events-none">
                        <span className="font-bold border-b border-slate-700 pb-1">{formatDateString(point.date)}</span>
                        <span>Gross: {fmtNGN(point.grossRevenue)}</span>
                        <span className="text-brand-300">Commission: {fmtNGN(point.platformCommission)}</span>
                        <span className="text-emerald-300">Vendor Net: {fmtNGN(point.vendorNetEarnings)}</span>
                      </div>

                      <div className="w-full flex items-end justify-center gap-1 h-44">
                        {/* Gross Bar */}
                        <div
                          style={{ height: `${grossHeight}%` }}
                          className="w-2.5 bg-brand-700 rounded-t-md transition-all group-hover:bg-brand-800"
                        />
                        {/* Commission Bar */}
                        <div
                          style={{ height: `${commHeight}%` }}
                          className="w-2.5 bg-amber-400 rounded-t-md transition-all group-hover:bg-amber-500"
                        />
                        {/* Net Bar */}
                        <div
                          style={{ height: `${netHeight}%` }}
                          className="w-2.5 bg-emerald-500 rounded-t-md transition-all group-hover:bg-emerald-600"
                        />
                      </div>

                      <span className="text-[10px] font-bold text-slate-400 truncate w-full text-center">
                        {formatDateString(point.date).split(' ').slice(0, 2).join(' ')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center gap-6 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-brand-700 rounded-xs" />
                  <span>Gross Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-amber-400 rounded-xs" />
                  <span>Platform Commission</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-emerald-500 rounded-xs" />
                  <span>Vendor Net Earnings</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders Bar Chart (1 col) */}
        <div className="bg-white p-6 rounded-md border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 text-base">Orders by status</h3>
              <span className="text-[10px] font-extrabold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md uppercase">
                {ordersBarData?.period || selectedPeriod}
              </span>
            </div>

            {loadingOrdersBar ? (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400 font-bold gap-2">
                <RefreshCw className="animate-spin" size={16} /> Loading order status...
              </div>
            ) : errorOrdersBar ? (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-md flex items-center justify-between">
                <span>{errorOrdersBar}</span>
                <button onClick={() => fetchOrdersBarChart()} className="px-2 py-0.5 bg-rose-600 text-white rounded-md text-[11px]">Retry</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-md border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
                    <p className="text-xl font-black text-slate-800">{ordersBarData?.totalOrdersCount ?? 0}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Value</span>
                    <p className="text-base font-black text-brand-700">{fmtNGN(ordersBarData?.totalOrdersRevenue)}</p>
                  </div>
                </div>

                {/* Status Segments */}
                <div className="space-y-3 pt-1">
                  {/* Delivered */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={13} /> Delivered
                      </span>
                      <span className="text-slate-600">
                        {ordersBarData?.delivered?.count ?? 0} ({ordersBarData?.delivered?.percentage ?? 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-sm overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, ordersBarData?.delivered?.percentage ?? 0)}%` }}
                        className="h-full bg-emerald-500 rounded-md"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 text-right">{fmtNGN(ordersBarData?.delivered?.revenue)}</p>
                  </div>

                  {/* Processing */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-blue-700 flex items-center gap-1">
                        <Clock size={13} /> Processing & In-Transit
                      </span>
                      <span className="text-slate-600">
                        {ordersBarData?.processing?.count ?? 0} ({ordersBarData?.processing?.percentage ?? 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-sm overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, ordersBarData?.processing?.percentage ?? 0)}%` }}
                        className="h-full bg-blue-500 rounded-md"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 text-right">{fmtNGN(ordersBarData?.processing?.revenue)}</p>
                  </div>

                  {/* Ordered */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-amber-700 flex items-center gap-1">
                        <ShoppingBag size={13} /> Pending Payment / Confirmed
                      </span>
                      <span className="text-slate-600">
                        {ordersBarData?.ordered?.count ?? 0} ({ordersBarData?.ordered?.percentage ?? 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-sm overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, ordersBarData?.ordered?.percentage ?? 0)}%` }}
                        className="h-full bg-amber-500 rounded-md"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 text-right">{fmtNGN(ordersBarData?.ordered?.revenue)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. TOP PRODUCTS & 3. RECENT ACTIVITIES FEEDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Products Chart/Cards (1 col) */}
        <div className="bg-white p-6 rounded-md border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Award size={18} className="text-[#228b22]" />
                  Top Products
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Ranked by units sold (Share of Top 5)</span>
              </div>

              {/* Category Filter Dropdown */}
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md font-bold text-slate-700 outline-none text-xs"
              >
                <option value="">All Categories</option>
                {categoryOptions.map((c) => (
                  <option key={c.id || c.categoryId} value={c.id || c.categoryId}>
                    {c.name || c.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {loadingPieChart ? (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400 font-bold gap-2">
                <RefreshCw className="animate-spin" size={16} /> Loading top products...
              </div>
            ) : errorPieChart ? (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-md flex items-center justify-between">
                <span>{errorPieChart}</span>
                <button onClick={() => fetchPieChart()} className="px-2 py-0.5 bg-rose-600 text-white rounded-md text-[11px]">Retry</button>
              </div>
            ) : (pieChartData?.products || []).length === 0 ? (
              <div className="py-8 text-sm text-slate-600">
                No product sales for this period.
              </div>
            ) : (
              <div className="space-y-3">
                {pieChartData.products.map((item: any, idx: number) => (
                  <div key={item.productId || idx} className="p-3 rounded-md border border-slate-100 hover:border-brand-200 transition-colors bg-slate-50/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-md bg-brand-100 overflow-hidden shrink-0 flex items-center justify-center font-bold text-brand-700 text-xs">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          `#${idx + 1}`
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                          {item.vendorName ? `${item.vendorName} • ` : ''}{item.categoryName || 'General'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-slate-800 text-xs">{item.unitsSold} sold</p>
                      <p className="text-[10px] text-brand-600 font-bold">{item.percentageShare}% share</p>
                      <p className="text-[10px] text-slate-400 font-medium">{fmtNGN(item.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feeds (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-md border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Activity size={18} className="text-[#228b22]" />
                  Real-time Activity Feeds
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Live customer payments, vendor payout requests, and order placements.</p>
              </div>

              {/* Feed Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs font-bold text-slate-600">
                <button
                  onClick={() => setActivityTab('payments')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activityTab === 'payments' ? 'bg-white text-[#228b22] shadow-xs font-black' : 'hover:text-slate-900'
                  }`}
                >
                  Payments
                </button>
                <button
                  onClick={() => setActivityTab('payouts')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activityTab === 'payouts' ? 'bg-white text-[#228b22] shadow-xs font-black' : 'hover:text-slate-900'
                  }`}
                >
                  Vendor Payouts
                </button>
                <button
                  onClick={() => setActivityTab('orders')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activityTab === 'orders' ? 'bg-white text-[#228b22] shadow-xs font-black' : 'hover:text-slate-900'
                  }`}
                >
                  Recent Orders
                </button>
              </div>
            </div>

            {loadingActivities ? (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400 font-bold gap-2">
                <RefreshCw className="animate-spin" size={16} /> Loading activity feed...
              </div>
            ) : errorActivities ? (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-md flex items-center justify-between">
                <span>{errorActivities}</span>
                <button onClick={() => fetchRecentActivities()} className="px-2 py-0.5 bg-rose-600 text-white rounded-md text-[11px]">Retry</button>
              </div>
            ) : activityTab === 'payments' ? (
              /* Customer Payments Feed */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Order Ref</th>
                      <th className="p-2.5">Customer</th>
                      <th className="p-2.5 text-right">Amount</th>
                      <th className="p-2.5 text-center">Status</th>
                      <th className="p-2.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(activitiesData?.recentCustomerTransactions || []).length > 0 ? (
                      activitiesData.recentCustomerTransactions.map((trx: any, idx: number) => (
                        <tr key={trx.orderId || idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-bold font-mono text-slate-800">{trx.orderNumber}</td>
                          <td className="p-2.5 font-medium text-slate-600">{trx.customerName || 'Guest Customer'}</td>
                          <td className="p-2.5 text-right font-black text-slate-800">{fmtNGN(trx.amount)}</td>
                          <td className="p-2.5 text-center">
                            <RecordStatus value={trx.paymentStatus} />
                          </td>
                          <td className="p-2.5 text-slate-400 font-medium">{formatDateString(trx.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-400">No recent transactions recorded.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : activityTab === 'payouts' ? (
              /* Vendor Payout Requests Feed */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Reference</th>
                      <th className="p-2.5">Store</th>
                      <th className="p-2.5 text-right">Amount</th>
                      <th className="p-2.5">Bank Details</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(activitiesData?.recentVendorPayouts || []).length > 0 ? (
                      activitiesData.recentVendorPayouts.map((po: any, idx: number) => (
                        <tr key={po.withdrawalId || idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-bold font-mono text-slate-800">{po.reference || 'WDR'}</td>
                          <td className="p-2.5 font-medium text-slate-600">{po.storeName}</td>
                          <td className="p-2.5 text-right font-black text-slate-800">{fmtNGN(po.amount)}</td>
                          <td className="p-2.5 text-slate-500 font-medium">
                            {po.bankName ? `${po.bankName} • ${po.accountNumber}` : '—'}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                              po.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              po.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {po.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-400">No recent payout requests.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Recent Orders Feed */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Order Ref</th>
                      <th className="p-2.5">Customer</th>
                      <th className="p-2.5">Selling Stores</th>
                      <th className="p-2.5 text-right">Total</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(activitiesData?.recentOrders || []).length > 0 ? (
                      activitiesData.recentOrders.map((ord: any, idx: number) => (
                        <tr key={ord.orderId || idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-bold font-mono text-slate-800">{ord.orderNumber}</td>
                          <td className="p-2.5 font-medium text-slate-600">{ord.customerName || 'Guest Customer'}</td>
                          <td className="p-2.5 text-brand-700 font-medium">
                            {Array.isArray(ord.vendors) ? ord.vendors.join(', ') : 'Store'}
                          </td>
                          <td className="p-2.5 text-right font-black text-slate-800">{fmtNGN(ord.totalAmount)}</td>
                          <td className="p-2.5 text-center">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-400">No recent orders found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. VENDOR LIFETIME EARNINGS TABLE WIDGET ── */}
      <div className="bg-white p-6 rounded-md border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <Shield size={18} className="text-[#228b22]" />
              Lifetime Vendor Earnings & Commission Ledger
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Comprehensive list of approved store profiles, lifetime earnings, platform commission generated, and payout banks.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search store name or email..."
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-[#228b22]"
            />
          </div>
        </div>

        {/* Global Lifetime Sums Header Banner */}
        {vendorEarningsData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-brand-50/60 rounded-md border border-brand-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-900">Total Platform Vendor Earnings Sum:</span>
              <span className="font-black text-brand-900 text-sm">{fmtNGN(vendorEarningsData.totalVendorEarningsSum)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-900">Total Platform Commission Sum:</span>
              <span className="font-black text-brand-900 text-sm">{fmtNGN(vendorEarningsData.totalPlatformCommissionSum)}</span>
            </div>
          </div>
        )}

        {/* Table Body */}
        {loadingVendorEarnings ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="animate-spin text-[#228b22]" size={20} />
            <p className="text-xs font-bold text-slate-400">Loading vendor lifetime earnings...</p>
          </div>
        ) : errorVendorEarnings ? (
          <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-md flex items-center justify-between">
            <span>{errorVendorEarnings}</span>
            <button onClick={() => fetchVendorEarnings()} className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold">Retry</button>
          </div>
        ) : (vendorEarningsData?.items || []).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Store & Contact</th>
                  <th className="px-4 py-3 text-right">Comm % / Fee %</th>
                  <th className="px-4 py-3 text-right">Pending Escrow</th>
                  <th className="px-4 py-3 text-right">Available Balance</th>
                  <th className="px-4 py-3 text-right">Lifetime Earnings</th>
                  <th className="px-4 py-3 text-right">Total Withdrawn</th>
                  <th className="px-4 py-3 text-right">GMV Generated</th>
                  <th className="px-4 py-3 text-right">Platform Comm</th>
                  <th className="px-4 py-3">Primary Bank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorEarningsData.items.map((row: any, idx: number) => (
                  <tr key={row.vendorId || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-extrabold text-slate-800 text-xs">{row.storeName}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{row.ownerEmail}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-600">
                      {row.commissionRate}% / {row.processingFeeRate}%
                    </td>
                    <td className="px-4 py-3.5 text-right text-amber-600 font-bold">{fmtNGN(row.pendingEscrow)}</td>
                    <td className="px-4 py-3.5 text-right text-emerald-700 font-bold">{fmtNGN(row.availableBalance)}</td>
                    <td className="px-4 py-3.5 text-right text-brand-900 font-black text-sm">{fmtNGN(row.lifetimeEarnings)}</td>
                    <td className="px-4 py-3.5 text-right text-slate-700 font-semibold">{fmtNGN(row.totalWithdrawn)}</td>
                    <td className="px-4 py-3.5 text-right text-slate-800 font-extrabold">{fmtNGN(row.totalGmvGenerated)}</td>
                    <td className="px-4 py-3.5 text-right text-rose-600 font-bold">{fmtNGN(row.platformCommissionGenerated)}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {row.bankAccount ? (
                        <span>{row.bankAccount.bankName} ••••{(row.bankAccount.accountNumber || '').slice(-4)}</span>
                      ) : (
                        <span className="text-slate-400 italic">No bank</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs font-medium">
            No vendor earnings records found matching &quot;{debouncedSearch}&quot;.
          </div>
        )}

        {/* Pagination Footer */}
        {vendorEarningsData?.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              disabled={tablePage <= 1}
              onClick={() => setTablePage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 font-bold flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="font-bold text-slate-500">
              Page {tablePage} of {vendorEarningsData.totalPages}
            </span>
            <button
              disabled={tablePage >= vendorEarningsData.totalPages}
              onClick={() => setTablePage((p) => Math.min(vendorEarningsData.totalPages, p + 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 font-bold flex items-center gap-1"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
