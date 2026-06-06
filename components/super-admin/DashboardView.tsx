'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, ShoppingBag, Package, Users, DollarSign,
  ArrowUpRight, ArrowDownRight, Sparkles, ChevronRight,
  Zap, FileText, Clock, CheckCircle2, AlertCircle, Activity
} from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  revenueToday: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  usersChange: number;
  pendingOrders: number;
  activeVendors: number;
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  timeframeLabel: string;
}

interface RecentTransaction {
  id: string;
  date: string;
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  product: string;
  amount: number;
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'REFUNDED';
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  growth: number;
  image?: string;
}

interface ActivityItem {
  id: string;
  type: 'order' | 'product' | 'user' | 'review';
  message: string;
  time: string;
  icon: React.ReactNode;
}

interface DashboardViewProps {
  onNavigate?: (tab: string) => void;
}

const StatCard = ({ title, value, change, icon: Icon, trend = 'up', suffix = '', subtext = '' }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-xl bg-gradient-to-br from-fuchsia-50 to-purple-50 group-hover:from-fuchsia-100 group-hover:to-purple-100 transition-colors">
        <Icon className="w-5 h-5 text-fuchsia-600" />
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
        trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
      }`}>
        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(change)}%
      </div>
    </div>
    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
      {typeof value === 'number' ? `₦${value.toLocaleString()}` : value}{suffix}
    </h3>
    <p className="text-sm text-gray-500 font-medium mt-1">{title}</p>
    {subtext && (
      <div className="text-xs text-gray-400 mt-2">
        {subtext}
      </div>
    )}
  </motion.div>
);

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const authUser = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [hoveredCategory, setHoveredCategory] = useState<any | null>(null);
  
  // Dynamic stats based on timeframe
  const stats = useMemo<DashboardStats>(() => {
    if (timeframe === 'daily') {
      return {
        totalRevenue: 450000,
        totalOrders: 28,
        revenueToday: 450000,
        totalProducts: 1248,
        revenueChange: 4.5,
        ordersChange: 1.8,
        productsChange: 0.2,
        usersChange: 1.2,
        pendingOrders: 5,
        activeVendors: 156,
        totalUsers: 3842,
        activeUsers: 3671,
        blockedUsers: 24,
        timeframeLabel: 'today',
      };
    }
    if (timeframe === 'monthly') {
      return {
        totalRevenue: 14850000,
        totalOrders: 1140,
        revenueToday: 450000,
        totalProducts: 1248,
        revenueChange: 18.2,
        ordersChange: 14.5,
        productsChange: 5.4,
        usersChange: 8.5,
        pendingOrders: 23,
        activeVendors: 156,
        totalUsers: 3842,
        activeUsers: 3671,
        blockedUsers: 24,
        timeframeLabel: 'this month',
      };
    }
    // weekly
    return {
      totalRevenue: 3250000,
      totalOrders: 284,
      revenueToday: 450000,
      totalProducts: 1248,
      revenueChange: 12,
      ordersChange: 8,
      productsChange: 5,
      usersChange: 3.2,
      pendingOrders: 23,
      activeVendors: 156,
      totalUsers: 3842,
      activeUsers: 3671,
      blockedUsers: 24,
      timeframeLabel: 'this week',
    };
  }, [timeframe]);

  const [recentTransactions] = useState<RecentTransaction[]>([
    { id: 'TRX-001', date: '19 May 2026, 12:14 am', customer: { name: 'yolo', email: 'yolo@gmail.com' }, product: 'Passport pic', amount: 2000, status: 'SUCCESSFUL' },
    { id: 'TRX-002', date: '19 May 2026, 10:30 am', customer: { name: 'Sarah Johnson', email: 'sarah@example.com' }, product: 'Wireless Headphones', amount: 45000, status: 'SUCCESSFUL' },
    { id: 'TRX-003', date: '18 May 2026, 8:45 pm', customer: { name: 'Michael Chen', email: 'michael@example.com' }, product: 'Leather Jacket', amount: 120000, status: 'SUCCESSFUL' },
    { id: 'TRX-004', date: '18 May 2026, 3:15 pm', customer: { name: 'Emily Davis', email: 'emily@example.com' }, product: 'Smart Watch', amount: 85000, status: 'PENDING' },
    { id: 'TRX-005', date: '17 May 2026, 11:20 am', customer: { name: 'James Wilson', email: 'james@example.com' }, product: 'Running Shoes', amount: 32000, status: 'SUCCESSFUL' },
    { id: 'TRX-006', date: '17 May 2026, 2:45 pm', customer: { name: 'Olivia Brown', email: 'olivia@example.com' }, product: 'Coffee Maker', amount: 55000, status: 'FAILED' },
  ]);

  const [topProducts] = useState<TopProduct[]>([
    { id: '1', name: 'Premium Wireless Headphones', sales: 234, revenue: 10530000, growth: 23 },
    { id: '2', name: 'Smart Fitness Tracker', sales: 187, revenue: 5610000, growth: 15 },
    { id: '3', name: 'Organic Cotton T-Shirt', sales: 156, revenue: 2340000, growth: -8 },
    { id: '4', name: 'Gaming Mechanical Keyboard', sales: 98, revenue: 1960000, growth: 12 },
  ]);

  // Performance chart data reacting to timeframe
  const performanceData = useMemo(() => {
    if (timeframe === 'daily') {
      return [
        { label: '09:00', revenue: 45000, orders: 3 },
        { label: '12:00', revenue: 120000, orders: 8 },
        { label: '15:00', revenue: 95000, orders: 6 },
        { label: '18:00', revenue: 110000, orders: 7 },
        { label: '21:00', revenue: 60000, orders: 3 },
        { label: '24:00', revenue: 20000, orders: 1 },
      ];
    }
    if (timeframe === 'monthly') {
      return [
        { label: 'Week 1', revenue: 3100000, orders: 220 },
        { label: 'Week 2', revenue: 3800000, orders: 280 },
        { label: 'Week 3', revenue: 3450000, orders: 254 },
        { label: 'Week 4', revenue: 4450000, orders: 270 },
      ];
    }
    // weekly
    return [
      { label: 'Mon', revenue: 320000, orders: 42 },
      { label: 'Tue', revenue: 450000, orders: 58 },
      { label: 'Wed', revenue: 380000, orders: 49 },
      { label: 'Thu', revenue: 520000, orders: 67 },
      { label: 'Fri', revenue: 680000, orders: 84 },
      { label: 'Sat', revenue: 490000, orders: 61 },
      { label: 'Sun', revenue: 410000, orders: 53 },
    ];
  }, [timeframe]);

  const [activities] = useState<ActivityItem[]>([
    { id: '1', type: 'order', message: 'New order #CM9815 from Natali Craig', time: '5 minutes ago', icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
    { id: '2', type: 'product', message: 'Product "Wireless Headphones" added by TechHub', time: '1 hour ago', icon: <Package size={14} className="text-blue-500" /> },
    { id: '3', type: 'user', message: 'New vendor registration: Fashion Forward', time: '3 hours ago', icon: <Users size={14} className="text-purple-500" /> },
    { id: '4', type: 'review', message: '5-star review received for Smart Watch', time: '5 hours ago', icon: <TrendingUp size={14} className="text-amber-500" /> },
    { id: '5', type: 'order', message: 'Order #CM9814 marked as Delivered', time: 'Yesterday', icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
  ]);

  // Donut chart sales distribution data reacting to timeframe
  const categoryBreakdown = useMemo(() => {
    if (timeframe === 'daily') {
      return [
        { name: 'Fashion', value: 50, color: '#c800ff', percentage: '50%', amount: 225000 },
        { name: 'Electronics', value: 25, color: '#3b82f6', percentage: '25%', amount: 112500 },
        { name: 'Beauty & Wellness', value: 15, color: '#ec4899', percentage: '15%', amount: 67500 },
        { name: 'Other', value: 10, color: '#10b981', percentage: '10%', amount: 45000 },
      ];
    }
    if (timeframe === 'monthly') {
      return [
        { name: 'Fashion', value: 40, color: '#c800ff', percentage: '40%', amount: 5940000 },
        { name: 'Electronics', value: 35, color: '#3b82f6', percentage: '35%', amount: 5197500 },
        { name: 'Beauty & Wellness', value: 15, color: '#ec4899', percentage: '15%', amount: 2227500 },
        { name: 'Other', value: 10, color: '#10b981', percentage: '10%', amount: 1485000 },
      ];
    }
    // weekly
    return [
      { name: 'Fashion', value: 45, color: '#c800ff', percentage: '45%', amount: 1462500 },
      { name: 'Electronics', value: 30, color: '#3b82f6', percentage: '30%', amount: 975000 },
      { name: 'Beauty & Wellness', value: 15, color: '#ec4899', percentage: '15%', amount: 487500 },
      { name: 'Other', value: 10, color: '#10b981', percentage: '10%', amount: 325000 },
    ];
  }, [timeframe]);

  const donutRadius = 30;
  const donutCircumference = 2 * Math.PI * donutRadius;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESSFUL': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'FAILED': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESSFUL': return <CheckCircle2 size={12} />;
      case 'PENDING': return <Clock size={12} />;
      case 'FAILED': return <AlertCircle size={12} />;
      default: return null;
    }
  };

  const maxRevenue = Math.max(...performanceData.map(d => d.revenue));
  const maxOrders = Math.max(...performanceData.map(d => d.orders));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full border-4 border-fuchsia-200 border-t-fuchsia-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600 mt-4">Loading dashboard insights...</p>
      </div>
    );
  }

  // Calculate donut cumulative rotations
  let accumulatedPercent = 0;

  return (
    <div className="space-y-8">
      {/* Top Welcome Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              Welcome back, {authUser?.firstName || 'Admin'}!
            </h2>
            <p className="text-white/80 text-sm mt-1 font-medium">
              Here's what is happening with your store {stats.timeframeLabel}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Dynamic timeframe filters */}
            <div className="flex bg-white/10 p-1 rounded-xl items-center border border-white/10">
              {(['daily', 'weekly', 'monthly'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    timeframe === t
                      ? 'bg-white text-fuchsia-600 shadow'
                      : 'text-white/85 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate?.('orders')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition flex items-center gap-2"
            >
              View Orders <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <StatCard 
          title="Total Revenue" 
          value={stats.totalRevenue} 
          change={stats.revenueChange} 
          icon={DollarSign} 
          trend="up"
          subtext={`Compared to previous ${timeframe === 'daily' ? 'day' : timeframe === 'weekly' ? 'week' : 'month'}`}
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          change={stats.ordersChange} 
          icon={ShoppingBag} 
          trend="up"
          suffix=""
          subtext={`${stats.pendingOrders} pending execution`}
        />
        <StatCard 
          title="Revenue Today" 
          value={stats.revenueToday} 
          change={6} 
          icon={TrendingUp} 
          trend="up"
          subtext="Last 24 hours"
        />
        <StatCard 
          title="Products" 
          value={stats.totalProducts} 
          change={stats.productsChange} 
          icon={Package} 
          trend="up"
          suffix=""
          subtext={`${stats.activeVendors} active vendors`}
        />
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          change={stats.usersChange} 
          icon={Users} 
          trend="up"
          suffix=""
          subtext={
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Active: {stats.activeUsers}
              </span>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                Blocked: {stats.blockedUsers}
              </span>
            </div>
          }
        />
      </div>

      {/* Balanced Dashboard Grid Layout: Zero vertical overlap whitespace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ROW 1 LEFT: Performance Chart */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 capitalize">{timeframe} Performance</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Revenue vs Orders trend</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-fuchsia-500" />
                    <span className="text-xs font-medium text-gray-600">Revenue (₦)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-gray-600">Orders</span>
                  </div>
                </div>
              </div>
              <div className="relative h-60">
                <div className="absolute inset-0 flex items-end justify-between gap-2">
                  {performanceData.map((day, idx) => (
                    <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full flex justify-center gap-1.5 h-44 items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                          transition={{ delay: idx * 0.05, duration: 0.5 }}
                          className="w-full max-w-[24px] bg-fuchsia-500 rounded-t hover:bg-fuchsia-600 cursor-pointer group relative"
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10 shadow">
                            ₦{day.revenue.toLocaleString()}
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(day.orders / maxOrders) * 100}%` }}
                          transition={{ delay: idx * 0.05 + 0.1, duration: 0.5 }}
                          className="w-full max-w-[24px] bg-emerald-400 rounded-t hover:bg-emerald-500 cursor-pointer group relative"
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10 shadow">
                            {day.orders} orders
                          </div>
                        </motion.div>
                      </div>
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400 font-medium">
              {timeframe === 'daily' && <span>Real-time hourly insights</span>}
              {timeframe === 'weekly' && <span>Week of May 17 - May 23, 2026</span>}
              {timeframe === 'monthly' && <span>Month of May 2026</span>}
              <span className="flex items-center gap-2">
                <span>Total Revenue: ₦{stats.totalRevenue.toLocaleString()}</span>
                <span className="w-px h-3 bg-gray-300" />
                <span>Total Orders: {stats.totalOrders}</span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* ROW 1 RIGHT: Sales Distribution Donut Chart */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-slate-800">Sales Distribution</h3>
              <p className="text-xs text-gray-500 mt-0.5 mb-6">Top performing categories</p>
              
              <div className="flex flex-col items-center justify-center gap-6">
                {/* Increased wrapper size from w-36 h-36 to w-48 h-48 */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r={donutRadius}
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="9"
                    />
                    {categoryBreakdown.map((item, idx) => {
                      const strokeOffset = donutCircumference - (item.value / 100) * donutCircumference;
                      const rotation = (accumulatedPercent / 100) * 360 - 90;
                      accumulatedPercent += item.value;
                      return (
                        <motion.circle
                          key={item.name}
                          cx="50"
                          cy="50"
                          r={donutRadius}
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="9"
                          strokeDasharray={donutCircumference}
                          initial={{ strokeDashoffset: donutCircumference }}
                          animate={{ strokeDashoffset: strokeOffset }}
                          transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                          transform={`rotate(${rotation} 50 50)`}
                          onMouseEnter={() => setHoveredCategory(item)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          className="transition-all duration-300 hover:stroke-[11px] cursor-pointer"
                        />
                      );
                    })}
                  </svg>
                  {/* Dynamic Hover display of Sales numbers per category */}
                  <div className="absolute flex flex-col items-center justify-center text-center px-4 pointer-events-none select-none">
                    {hoveredCategory ? (
                      <>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[120px]">{hoveredCategory.name}</span>
                        <span className="text-sm font-black text-slate-800 mt-1">₦{hoveredCategory.amount.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-fuchsia-600 mt-0.5">{hoveredCategory.percentage} share</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-black text-slate-800">Faflora</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Top Sellers</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-gray-50 mt-4">
              {categoryBreakdown.map((item) => (
                <div 
                  key={item.name} 
                  className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-50 transition-colors"
                  onMouseEnter={() => setHoveredCategory(item)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">{item.percentage} share</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ROW 2 LEFT: Recent Transactions (Expanded 2/3 Width) */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col justify-between"
          >
            <div>
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Recent Transactions</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Latest customer payments</p>
                </div>
                <button className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 transition">
                  View All
                </button>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Customer</th>
                      <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Product</th>
                      <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Date</th>
                      <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-right">Amount</th>
                      <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {tx.customer.name[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 text-sm">{tx.customer.name}</span>
                            <span className="text-[10px] text-gray-400">{tx.customer.email}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600">{tx.product}</td>
                        <td className="p-4 text-xs font-medium text-gray-400">{tx.date}</td>
                        <td className="p-4 text-right text-sm font-bold text-slate-800">₦{tx.amount.toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusColor(tx.status)}`}>
                            {getStatusIcon(tx.status)}
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="px-6 py-4 hover:bg-slate-50/50 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {tx.customer.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{tx.customer.name}</p>
                          <p className="text-xs text-gray-500">{tx.product}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800 text-sm">₦{tx.amount.toLocaleString()}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusColor(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                          {tx.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 ml-11 font-medium">
                      <Clock size={10} />
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span>{tx.customer.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ROW 2 RIGHT: Today's Target Card (height split in half) + Conversion Rate Card (new!) */}
        <div>
          <div className="flex flex-col gap-6 h-full justify-between">
            {/* Sales Target Card (half height) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-2xl p-5 text-white flex-1 flex flex-col justify-between shadow-sm min-h-[188px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={16} className="text-white/80" />
                  <span className="text-xs font-bold">Sales Target</span>
                </div>
                <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full">LIVE</span>
              </div>
              <div className="my-1">
                <p className="text-2xl font-black tracking-tight">₦124,500</p>
                <p className="text-[10px] text-white/80 font-medium">₦180,000 daily goal</p>
              </div>
              <div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '68%' }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
                <p className="text-[10px] text-white/70 mt-2 flex items-center justify-between font-semibold">
                  <span>68% completed</span>
                  <span>₦55,500 left</span>
                </p>
              </div>
            </motion.div>

            {/* Conversion Rate Card (half height) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 flex-1 flex flex-col justify-between shadow-sm min-h-[188px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold text-gray-500">Conversion Rate</span>
                </div>
                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">+1.2%</span>
              </div>
              <div className="my-1">
                <p className="text-2xl font-black tracking-tight text-slate-800">3.84%</p>
                <p className="text-[10px] text-gray-400 font-medium">Industry average: 2.5%</p>
              </div>
              <div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '76%' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 flex items-center justify-between font-semibold">
                  <span>Performance: Good</span>
                  <span>Target: 5.0%</span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ROW 3 LEFT: Top Performing Products */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col justify-between"
          >
            <div>
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Top Performing Products</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Best selling items this month</p>
                </div>
                <button
                  onClick={() => onNavigate?.('products')}
                  className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 flex items-center gap-1 transition"
                >
                  View All <ChevronRight size={14} />
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {topProducts.map((product, idx) => (
                  <div key={product.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition group">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-amber-100 text-amber-700' :
                        idx === 1 ? 'bg-gray-100 text-gray-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm group-hover:text-fuchsia-600 transition">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">{product.sales} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 text-sm">₦{product.revenue.toLocaleString()}</p>
                      <p className={`text-xs font-medium flex items-center gap-1 justify-end ${
                        product.growth > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {product.growth > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(product.growth)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ROW 3 RIGHT: Recent Activity */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col justify-between"
          >
            <div>
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-fuchsia-500" />
                  <h3 className="font-bold text-slate-800">Recent Activity</h3>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Latest store updates</p>
              </div>
              <div className="divide-y divide-gray-100">
                {activities.map((activity) => (
                  <div key={activity.id} className="px-6 py-3 flex items-center gap-3 hover:bg-slate-50/50 transition">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">{activity.message}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Quick Actions Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-amber-500" />
          <span className="text-sm font-bold text-slate-700">Quick Actions</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate?.('products')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition flex items-center gap-2"
          >
            <Package size={16} /> Add Product
          </button>
          <button
            onClick={() => onNavigate?.('vendors')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition flex items-center gap-2"
          >
            <Users size={16} /> Invite Vendor
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-xl text-sm font-bold transition shadow-md shadow-fuchsia-100 flex items-center gap-2 hover:shadow-lg">
            <FileText size={16} /> Generate Report
          </button>
        </div>
      </motion.div>
    </div>
  );
}