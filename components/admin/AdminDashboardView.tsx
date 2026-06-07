'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, ShoppingBag, Package, Users,
  ArrowUpRight, ArrowDownRight, Sparkles, ChevronRight,
  Zap, FileText, Clock, CheckCircle2, AlertCircle, Activity,
  Eye, Star, Truck, DollarSign, CreditCard, MapPin, Phone, Mail,
  ShoppingCart, Box, Percent, Award, Target, BarChart3
} from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
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
    location?: string;
    phone?: string;
  };
  product: string;
  amount?: number;
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'RETURNED';
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  growth: number;
  image?: string;
  price?: number;
  rating?: number;
  stock?: number;
}

interface ActivityItem {
  id: string;
  type: 'order' | 'product' | 'user' | 'review';
  message: string;
  time: string;
  icon: React.ReactNode;
}

interface AdminDashboardViewProps {
  onNavigate?: (tab: string) => void;
}

// Uniform Stat Card Component with equal height progress bars
const UniformStatCard = ({ title, value, change, icon: Icon, trend = 'up', suffix = '', subtext = '', color = 'fuchsia', activeUsers, blockedUsers }: any) => {
  const colorGradients: Record<string, string> = {
    fuchsia: 'from-fuchsia-500 to-purple-600',
    blue: 'from-blue-500 to-cyan-600',
    emerald: 'from-emerald-500 to-teal-600'
  };

  const bgGradients: Record<string, string> = {
    fuchsia: 'from-fuchsia-50 to-purple-50',
    blue: 'from-blue-50 to-cyan-50',
    emerald: 'from-emerald-50 to-teal-50'
  };

  const iconColors: Record<string, string> = {
    fuchsia: 'text-fuchsia-600',
    blue: 'text-blue-600',
    emerald: 'text-emerald-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      {/* Decorative top bar */}
      <div className={`h-1 bg-gradient-to-r ${colorGradients[color]}`} />
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${bgGradients[color]}`}>
            <Icon className={`w-5 h-5 ${iconColors[color]}`} />
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(change)}%
          </div>
        </div>
        
        <div className="mb-2">
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-1">{title}</p>
        </div>
        
        {/* Fixed height container for bottom content to ensure equal height */}
        <div className="mt-auto pt-3">
          {title === "Total Users" ? (
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-[11px] font-semibold">
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Active: {activeUsers}
              </span>
              <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                Blocked: {blockedUsers}
              </span>
            </div>
          ) : subtext && (
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-500">{subtext}</span>
                {/* Dynamic bottom-right percentage based on card type */}
                {title === "Total Orders" && (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp size={10} />
                    <span className="text-[10px] font-bold">+{change}% vs target</span>
                  </div>
                )}
                {title === "Products" && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Package size={10} />
                    <span className="text-[10px] font-bold">92% in stock</span>
                  </div>
                )}
                {title === "Conversion Rate" && (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <Target size={10} />
                    <span className="text-[10px] font-bold">76% to goal</span>
                  </div>
                )}
                {!["Total Orders", "Products", "Conversion Rate"].includes(title) && (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp size={10} />
                    <span className="text-[10px] font-bold">+12% vs last period</span>
                  </div>
                )}
              </div>
              {/* Progress bars - all with consistent height */}
              {title === "Total Orders" && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${colorGradients[color]} rounded-full`}
                      style={{ width: '78%' }}
                    />
                  </div>
                </div>
              )}
              {/* Stock indicator for products */}
              {title === "Products" && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"
                          style={{ width: '92%' }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">92%</span>
                  </div>
                </div>
              )}
              {/* Conversion rate progress */}
              {title === "Conversion Rate" && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      style={{ width: '76%' }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-gray-400">Performance: Good</span>
                    <span className="text-[10px] text-gray-400">Target: 5.0%</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboardView({ onNavigate }: AdminDashboardViewProps) {
  const authUser = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Dynamic stats based on timeframe
  const stats = useMemo<DashboardStats>(() => {
    if (timeframe === 'daily') {
      return {
        totalOrders: 28,
        totalProducts: 1248,
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
        totalOrders: 1140,
        totalProducts: 1248,
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
      totalOrders: 284,
      totalProducts: 1248,
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
    { id: 'ORD-001', date: '19 May 2026, 12:14 am', customer: { name: 'Natali Craig', email: 'natali@example.com', location: 'New York, USA', phone: '+1 234 567 8900' }, product: 'Premium Headphones', amount: 299, status: 'SUCCESSFUL' },
    { id: 'ORD-002', date: '19 May 2026, 10:30 am', customer: { name: 'Sarah Johnson', email: 'sarah@example.com', location: 'Los Angeles, USA', phone: '+1 234 567 8901' }, product: 'Wireless Headphones', amount: 199, status: 'SUCCESSFUL' },
    { id: 'ORD-003', date: '18 May 2026, 8:45 pm', customer: { name: 'Michael Chen', email: 'michael@example.com', location: 'San Francisco, USA' }, product: 'Leather Jacket', amount: 159, status: 'SUCCESSFUL' },
    { id: 'ORD-004', date: '18 May 2026, 3:15 pm', customer: { name: 'Emily Davis', email: 'emily@example.com', location: 'Chicago, USA' }, product: 'Smart Watch', amount: 249, status: 'PENDING' },
    { id: 'ORD-005', date: '17 May 2026, 11:20 am', customer: { name: 'James Wilson', email: 'james@example.com', location: 'Miami, USA' }, product: 'Running Shoes', amount: 129, status: 'SUCCESSFUL' },
    { id: 'ORD-006', date: '17 May 2026, 2:45 pm', customer: { name: 'Olivia Brown', email: 'olivia@example.com', location: 'Seattle, USA' }, product: 'Coffee Maker', amount: 89, status: 'FAILED' },
  ]);

  const [topProducts] = useState<TopProduct[]>([
    { id: '1', name: 'Premium Wireless Headphones', sales: 234, growth: 23, price: 299, rating: 4.8, stock: 45 },
    { id: '2', name: 'Smart Fitness Tracker', sales: 187, growth: 15, price: 149, rating: 4.6, stock: 78 },
    { id: '3', name: 'Organic Cotton T-Shirt', sales: 156, growth: -8, price: 39, rating: 4.4, stock: 234 },
    { id: '4', name: 'Gaming Mechanical Keyboard', sales: 98, growth: 12, price: 129, rating: 4.7, stock: 23 },
  ]);

  // Pie chart data
  const pieChartData = useMemo(() => {
    return topProducts.map(product => ({
      name: product.name.length > 20 ? product.name.substring(0, 17) + '...' : product.name,
      value: product.sales,
      fullName: product.name,
      growth: product.growth
    }));
  }, [topProducts]);

  const PIE_COLORS = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6'];

  // Performance chart data reacting to timeframe - ORDERS ONLY
  const performanceData = useMemo(() => {
    if (timeframe === 'daily') {
      return [
        { label: '09:00', orders: 3 },
        { label: '12:00', orders: 8 },
        { label: '15:00', orders: 6 },
        { label: '18:00', orders: 7 },
        { label: '21:00', orders: 3 },
        { label: '24:00', orders: 1 },
      ];
    }
    if (timeframe === 'monthly') {
      return [
        { label: 'Week 1', orders: 220 },
        { label: 'Week 2', orders: 280 },
        { label: 'Week 3', orders: 254 },
        { label: 'Week 4', orders: 270 },
      ];
    }
    // weekly
    return [
      { label: 'Mon', orders: 42 },
      { label: 'Tue', orders: 58 },
      { label: 'Wed', orders: 49 },
      { label: 'Thu', orders: 67 },
      { label: 'Fri', orders: 84 },
      { label: 'Sat', orders: 61 },
      { label: 'Sun', orders: 53 },
    ];
  }, [timeframe]);

  const [activities] = useState<ActivityItem[]>([
    { id: '1', type: 'order', message: 'New order #ORD-9815 from Natali Craig', time: '5 minutes ago', icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
    { id: '2', type: 'product', message: 'Product "Wireless Headphones" inventory updated', time: '1 hour ago', icon: <Package size={14} className="text-blue-500" /> },
    { id: '3', type: 'user', message: 'New customer registration: Jane Doe', time: '3 hours ago', icon: <Users size={14} className="text-purple-500" /> },
    { id: '4', type: 'review', message: '5-star review received for Smart Watch', time: '5 hours ago', icon: <TrendingUp size={14} className="text-amber-500" /> },
    { id: '5', type: 'order', message: 'Order #ORD-9814 marked as Delivered', time: 'Yesterday', icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESSFUL': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'FAILED': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'RETURNED': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESSFUL': return <CheckCircle2 size={12} />;
      case 'PENDING': return <Clock size={12} />;
      case 'FAILED': return <AlertCircle size={12} />;
      case 'RETURNED': return <TrendingDown size={12} />;
      default: return null;
    }
  };

  const maxOrders = Math.max(...performanceData.map(d => d.orders));

  // Custom tooltip component for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const growth = data.growth;
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg">
          <p className="text-sm font-bold text-slate-800">{data.fullName || data.name}</p>
          <p className="text-xs text-gray-600 mt-1">
            Units Sold: <span className="font-bold text-fuchsia-600">{data.value.toLocaleString()}</span>
          </p>
          {growth && (
            <p className={`text-xs mt-1 font-medium ${growth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {growth > 0 ? '↑' : '↓'} {Math.abs(growth)}% growth
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom label renderer for pie chart to handle undefined percent
  const renderCustomLabel = ({ name, percent }: { name?: string; percent?: number }) => {
    if (!percent) return name || '';
    return `${name || ''} ${(percent * 100).toFixed(0)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full border-4 border-fuchsia-200 border-t-fuchsia-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600 mt-4">Loading dashboard insights...</p>
      </div>
    );
  }

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

      {/* FIRST ROW: Uniform Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <UniformStatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          change={stats.ordersChange} 
          icon={ShoppingBag} 
          trend="up"
          suffix=""
          subtext={`${stats.pendingOrders} orders pending execution`}
          color="fuchsia"
        />
        <UniformStatCard 
          title="Products" 
          value={stats.totalProducts} 
          change={stats.productsChange} 
          icon={Package} 
          trend="up"
          suffix=""
          subtext={`${stats.activeVendors} active vendors selling`}
          color="blue"
        />
        <UniformStatCard 
          title="Conversion Rate" 
          value="3.84%" 
          change={6} 
          icon={TrendingUp} 
          trend="up"
          suffix=""
          subtext="Industry average: 2.5%"
          color="emerald"
        />
        <UniformStatCard
          title="Total Users"
          value={stats.totalUsers}
          change={stats.usersChange}
          icon={Users}
          trend="up"
          suffix=""
          color="fuchsia"
          activeUsers={stats.activeUsers}
          blockedUsers={stats.blockedUsers}
        />
      </div>

      {/* SECOND ROW: Pie Chart + Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products Pie Chart  */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800">Sales Volume Breakdown by Product</h3>
              <p className="text-xs text-gray-500 mt-0.5">Distribution of units sold</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Total: {topProducts.reduce((sum, p) => sum + p.sales, 0).toLocaleString()} units</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                  wrapperStyle={{ fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-slate-800 capitalize">{timeframe} Performance</h3>
              <p className="text-xs text-gray-500 mt-0.5">Orders trend analysis</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500" />
              <span className="text-xs font-medium text-gray-600">Orders</span>
            </div>
          </div>
          <div className="relative h-80">
            <div className="absolute inset-0 flex items-end justify-between gap-2">
              {performanceData.map((day, idx) => (
                <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex justify-center gap-1.5 h-64 items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.orders / maxOrders) * 100}%` }}
                      transition={{ delay: idx * 0.05, duration: 0.5 }}
                      className="w-full max-w-[48px] bg-gradient-to-t from-fuchsia-500 to-purple-500 rounded-t"
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
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400 font-medium">
            {timeframe === 'daily' && <span>Real-time hourly insights</span>}
            {timeframe === 'weekly' && <span>Week of May 17 - May 23, 2026</span>}
            {timeframe === 'monthly' && <span>Month of May 2026</span>}
            <span className="flex items-center gap-2">
              <span>Total Orders: {stats.totalOrders.toLocaleString()}</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* THIRD ROW: Recent Orders + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-fuchsia-500" />
                  <h3 className="font-bold text-slate-800">Recent Orders</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">Latest customer transactions</p>
              </div>
              <button
                onClick={() => onNavigate?.('orders')}
                className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 transition flex items-center gap-1"
              >
                View All <ChevronRight size={12} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Customer</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Product</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Date</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {tx.customer.name[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-sm">{tx.customer.name}</span>
                          <span className="text-[10px] text-gray-400">{tx.customer.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">{tx.product}</td>
                    <td className="p-4 text-xs font-medium text-gray-400">{tx.date}</td>
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
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-fuchsia-500" />
              <h3 className="font-bold text-slate-800">Recent Activity</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">Latest store updates</p>
          </div>
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 flex items-center gap-3 hover:bg-slate-50/50 transition">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{activity.message}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
            <Package size={16} /> View Products
          </button>
          <button
            onClick={() => onNavigate?.('orders')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition flex items-center gap-2"
          >
            <ShoppingBag size={16} /> View Orders
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-xl text-sm font-bold transition shadow-md shadow-fuchsia-100 flex items-center gap-2 hover:shadow-lg">
            <FileText size={16} /> Generate Report
          </button>
        </div>
      </motion.div>
    </div>
  );
}