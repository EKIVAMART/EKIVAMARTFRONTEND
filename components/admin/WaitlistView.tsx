'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, CheckCircle, XCircle, AlertTriangle, Calendar, Clock,
  User, Briefcase, Search, Download, ChevronLeft, ChevronRight,
  Settings, Send, Mail, AlertCircle, X, Check, Loader2, Info
} from 'lucide-react';
import { waitlistApi, WaitlistStats, WaitlistSubscriber, LaunchConfig } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function WaitlistView() {
  const [stats, setStats] = useState<WaitlistStats>({
    total: 0,
    active: 0,
    unsubscribed: 0,
    bounced: 0,
    todaySignups: 0,
    weekSignups: 0,
    customers: 0,
    vendors: 0
  });

  const [subscribers, setSubscribers] = useState<WaitlistSubscriber[]>([]);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [launchConfig, setLaunchConfig] = useState<LaunchConfig>({
    launchDate: '2026-10-15T00:00:00.000Z',
    title: 'Something Amazing is Coming',
    subtitle: "Nigeria's Premier Multi-Vendor Marketplace",
    isLaunched: false,
    updatedAt: new Date().toISOString()
  });

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination states
  const [limit, setLimit] = useState<number>(50);
  const [offset, setOffset] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Loading states
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState<boolean>(true);
  const [isLoadingLaunchConfig, setIsLoadingLaunchConfig] = useState<boolean>(true);

  // Modals
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState<boolean>(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);

  // Modal confirm overlays
  const [isLaunchConfirmOpen, setIsLaunchConfirmOpen] = useState<boolean>(false);
  const [isBroadcastConfirmOpen, setIsBroadcastConfirmOpen] = useState<boolean>(false);

  // Modal forms states
  const [launchForm, setLaunchForm] = useState({
    launchDate: '',
    title: '',
    subtitle: '',
    sendBroadcast: false,
    broadcastReason: ''
  });

  const [broadcastForm, setBroadcastForm] = useState({
    subject: '',
    bodyText: '',
    previewText: '',
    role: 'All'
  });

  const [isSavingLaunch, setIsSavingLaunch] = useState<boolean>(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState<boolean>(false);

  // Fetch all data
  // Convert a UTC ISO string → local "YYYY-MM-DDTHH:mm" for datetime-local inputs.
  // Using substring(0,16) on a UTC string feeds midnight-UTC as midnight-local,
  // causing a 1-hour (or more) offset for non-UTC users.
  const toLocalInputValue = (isoStr: string): string => {
    const d = new Date(isoStr);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const loadData = async () => {
    setIsLoadingStats(true);
    setIsLoadingSubscribers(true);
    setIsLoadingLaunchConfig(true);

    try {
      const statsRes = await waitlistApi.getStats();
      if (statsRes?.data) setStats(statsRes.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load statistics');
    } finally {
      setIsLoadingStats(false);
    }

    try {
      const configRes = await waitlistApi.getLaunchConfig();
      if (configRes?.data) {
        setLaunchConfig(configRes.data);
        // Pre-populate launch settings form
        setLaunchForm({
          launchDate: configRes.data.launchDate ? toLocalInputValue(configRes.data.launchDate) : '',
          title: configRes.data.title || '',
          subtitle: configRes.data.subtitle || '',
          sendBroadcast: false,
          broadcastReason: ''
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load launch configuration');
    } finally {
      setIsLoadingLaunchConfig(false);
    }

    await loadSubscribers();
  };

  const loadSubscribers = async (currentOffset = offset, currentLimit = limit, stat = statusFilter, role = roleFilter) => {
    setIsLoadingSubscribers(true);
    try {
      const apiStatus = stat === 'All' ? undefined : stat.toLowerCase();
      const apiRole = role === 'All' ? undefined : role.toLowerCase();

      const res = await waitlistApi.getSubscribers({
        status: apiStatus,
        role: apiRole,
        limit: currentLimit,
        offset: currentOffset
      });

      if (res?.data) {
        setSubscribers(res.data.subscribers || []);
        setTotalSubscribers(res.data.total || 0);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load subscribers');
    } finally {
      setIsLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter change actions
  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setOffset(0);
    setCurrentPage(1);
    loadSubscribers(0, limit, val, roleFilter);
  };

  const handleRoleChange = (val: string) => {
    setRoleFilter(val);
    setOffset(0);
    setCurrentPage(1);
    loadSubscribers(0, limit, statusFilter, val);
  };

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * limit;
    setCurrentPage(page);
    setOffset(newOffset);
    loadSubscribers(newOffset, limit, statusFilter, roleFilter);
  };

  // Client-side search filtering (search by name/email)
  const filteredSubscribers = useMemo(() => {
    if (!searchQuery) return subscribers;
    const query = searchQuery.toLowerCase().trim();
    return subscribers.filter(sub => 
      (sub.fullName || '').toLowerCase().includes(query) ||
      (sub.email || '').toLowerCase().includes(query) ||
      (sub.firstName || '').toLowerCase().includes(query) ||
      (sub.lastName || '').toLowerCase().includes(query)
    );
  }, [subscribers, searchQuery]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredSubscribers.length === 0) {
      toast.error('No subscribers matching criteria to export.');
      return;
    }
    const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Full Name', 'Phone', 'Role', 'Status', 'Referral Source', 'Joined At'];
    const rows = filteredSubscribers.map(sub => [
      sub.id,
      sub.email,
      sub.firstName || '',
      sub.lastName || '',
      sub.fullName || '',
      sub.phoneNumber || '',
      sub.role,
      sub.status,
      sub.referralSource || '',
      new Date(sub.createdAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `waitlist_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredSubscribers.length} subscribers to CSV!`);
  };

  // Calculate dynamic recipient count for Broadcast Composer
  const broadcastRecipientCount = useMemo(() => {
    const selectedRole = broadcastForm.role.toLowerCase();
    if (selectedRole === 'customer') return stats.customers;
    if (selectedRole === 'vendor') return stats.vendors;
    // For 'All', only sum active customer + vendor waitlists
    return stats.active;
  }, [broadcastForm.role, stats]);

  // Form Submit Handlers
  const handleLaunchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (!launchForm.launchDate) {
      toast.error('Launch Date is required');
      return;
    }
    const dateObj = new Date(launchForm.launchDate);
    if (dateObj <= new Date()) {
      toast.error('Launch Date must be a valid future date');
      return;
    }
    if (launchForm.sendBroadcast && (!launchForm.broadcastReason || !launchForm.broadcastReason.trim())) {
      toast.error('Broadcast reason is required when Notify Members is checked');
      return;
    }

    // Open confirmation prompt
    setIsLaunchConfirmOpen(true);
  };

  const confirmLaunchSave = async () => {
    setIsLaunchConfirmOpen(false);
    setIsSavingLaunch(true);
    try {
      const res = await waitlistApi.updateLaunchConfig({
        launchDate: new Date(launchForm.launchDate).toISOString(),
        title: launchForm.title,
        subtitle: launchForm.subtitle,
        sendBroadcast: launchForm.sendBroadcast,
        broadcastReason: launchForm.sendBroadcast ? launchForm.broadcastReason : undefined
      });

      if (res?.success) {
        toast.success(res.message || 'Launch configuration updated successfully!');
        setIsLaunchModalOpen(false);
        // Reload statistics and settings
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update launch configuration');
    } finally {
      setIsSavingLaunch(false);
    }
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.subject.trim()) {
      toast.error('Subject is required');
      return;
    }
    if (!broadcastForm.bodyText.trim()) {
      toast.error('Email body is required');
      return;
    }

    setIsBroadcastConfirmOpen(true);
  };

  const confirmBroadcastSend = async () => {
    setIsBroadcastConfirmOpen(false);
    setIsSendingBroadcast(true);
    const toastId = toast.loading('Sending broadcast emails in background...');
    try {
      const res = await waitlistApi.sendBroadcast({
        subject: broadcastForm.subject,
        bodyText: broadcastForm.bodyText,
        previewText: broadcastForm.previewText || undefined,
        role: broadcastForm.role === 'All' ? undefined : (broadcastForm.role.toLowerCase() as 'customer' | 'vendor')
      });

      if (res?.success) {
        toast.success(res.message || `Broadcast sent successfully!`, { id: toastId });
        setIsBroadcastModalOpen(false);
        // Reset form
        setBroadcastForm({
          subject: '',
          bodyText: '',
          previewText: '',
          role: 'All'
        });
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send broadcast email', { id: toastId });
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  // Helper date formatting
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const totalPages = Math.ceil(totalSubscribers / limit) || 1;

  const statCards = [
    { label: 'Total Subscribers', value: stats.total, icon: <Users size={20} />, color: 'from-blue-500/10 to-indigo-500/5 text-blue-600 ring-blue-100 border-blue-100/50' },
    { label: 'Active Subscribers', value: stats.active, icon: <CheckCircle size={20} />, color: 'from-emerald-500/10 to-teal-500/5 text-emerald-600 ring-emerald-100 border-emerald-100/50' },
    { label: 'Unsubscribed', value: stats.unsubscribed, icon: <XCircle size={20} />, color: 'from-amber-500/10 to-yellow-500/5 text-amber-600 ring-amber-100 border-amber-100/50' },
    { label: 'Bounced Addresses', value: stats.bounced, icon: <AlertTriangle size={20} />, color: 'from-rose-500/10 to-red-500/5 text-rose-600 ring-rose-100 border-rose-100/50' },
    { label: 'Today Signups', value: stats.todaySignups, icon: <Calendar size={20} />, color: 'from-violet-500/10 to-fuchsia-500/5 text-violet-600 ring-violet-100 border-violet-100/50' },
    { label: 'Week Signups', value: stats.weekSignups, icon: <Clock size={20} />, color: 'from-purple-500/10 to-pink-500/5 text-purple-600 ring-purple-100 border-purple-100/50' },
    { label: 'Customers Interest', value: stats.customers, icon: <User size={20} />, color: 'from-teal-500/10 to-cyan-500/5 text-teal-600 ring-teal-100 border-teal-100/50' },
    { label: 'Vendors Interest', value: stats.vendors, icon: <Briefcase size={20} />, color: 'from-fuchsia-500/10 to-purple-500/5 text-fuchsia-600 ring-fuchsia-100 border-fuchsia-100/50' },
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* ── Dashboard Header ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-[-20%] left-[-10%] w-[30%] h-[150%] bg-gradient-to-r from-fuchsia-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[30%] h-[150%] bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Waitlist Manager</h1>
          {isLoadingLaunchConfig ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
              <Loader2 size={14} className="animate-spin" /> Loading Launch Settings...
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-500 text-sm font-semibold">
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-slate-200">
                <Calendar size={12} className="text-slate-500" /> Projected Launch Date:
              </span>
              <span className="text-slate-800 font-extrabold">{formatDate(launchConfig.launchDate)}</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-400 font-bold">Config updated: {new Date(launchConfig.updatedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setIsLaunchModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 active:scale-98 transition shadow-sm hover:border-slate-300 bg-white"
          >
            <Settings size={17} className="text-slate-500" />
            Launch Date Config
          </button>
          
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:from-[#8236be] hover:to-[#692a99] text-white font-bold rounded-2xl active:scale-98 transition shadow-lg shadow-fuchsia-100 flex-1 sm:flex-none text-center justify-center"
          >
            <Send size={17} />
            Send Email Broadcast
          </button>
        </div>
      </div>

      {/* ── Statistics Summary Grid ── */}
      <div>
        <h2 className="text-lg font-black text-slate-700 mb-4 tracking-tight">Waitlist Summary Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-fuchsia-100/50 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br border ${card.color}`}>
                {card.icon}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
                {isLoadingStats ? (
                  <div className="h-7 w-16 bg-slate-100 animate-pulse rounded" />
                ) : (
                  <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                    {(card.value ?? 0).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Table Actions & Filter Header ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Filter Controls Row */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto">
            
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search subscribers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200/80 rounded-2xl text-sm bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-[#9d4ae3] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full sm:w-44 px-3 py-2.5 border border-slate-200/80 rounded-2xl text-sm font-semibold text-slate-700 bg-white cursor-pointer outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-[#9d4ae3] transition"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Unsubscribed">Unsubscribed</option>
                <option value="Bounced">Bounced</option>
              </select>
            </div>

            {/* Role dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap hidden sm:inline">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full sm:w-44 px-3 py-2.5 border border-slate-200/80 rounded-2xl text-sm font-semibold text-slate-700 bg-white cursor-pointer outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-[#9d4ae3] transition"
              >
                <option value="All">All Roles</option>
                <option value="Customer">Customer</option>
                <option value="Vendor">Vendor</option>
              </select>
            </div>

          </div>

          <button
            onClick={handleExportCSV}
            disabled={filteredSubscribers.length === 0}
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-300 transition w-full lg:w-auto bg-white"
          >
            <Download size={16} className="text-slate-500" />
            Export CSV
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          {isLoadingSubscribers ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 size={32} className="animate-spin text-[#9d4ae3]" />
              <p className="text-sm font-semibold text-slate-500">Loading subscriber records...</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Users size={40} className="text-slate-200 mb-2" />
              <p className="text-slate-700 font-bold text-lg">No subscribers found</p>
              <p className="text-sm text-slate-400">Try adjusting your filter dropdowns or search query.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscriber Email</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Role</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Interest Tags</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Referral Source</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Join Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="p-4 font-bold text-slate-800 text-sm">{sub.email}</td>
                    <td className="p-4 text-sm text-slate-600 font-semibold">{sub.fullName}</td>
                    <td className="p-4 text-sm text-slate-500">{sub.phoneNumber || '—'}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold capitalize border ${
                        sub.role === 'vendor' 
                          ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100' 
                          : 'bg-teal-50 text-teal-700 border-teal-100'
                      }`}>
                        {sub.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {sub.interestTags && sub.interestTags.length > 0 ? (
                          sub.interestTags.map((tag, i) => (
                            <span key={i} className="inline-block bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        sub.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : sub.status === 'unsubscribed'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          sub.status === 'active'
                            ? 'bg-emerald-500'
                            : sub.status === 'unsubscribed'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`} />
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500 font-semibold capitalize">{sub.referralSource || '—'}</td>
                    <td className="p-4 text-sm text-slate-500 font-semibold">
                      {new Date(sub.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Showing page {currentPage} of {totalPages} ({totalSubscribers} total records)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoadingSubscribers}
                className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages)
                .map((page, idx, arr) => {
                  const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span className="px-2 text-slate-400">...</span>}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded-xl font-bold text-sm transition flex items-center justify-center ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white shadow-sm'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoadingSubscribers}
                className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Modal: Launch Settings Config ── */}
      {isLaunchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsLaunchModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800">Launch Configuration</h3>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Pre-populate countdown & update marketing message</p>
              </div>
              <button
                onClick={() => setIsLaunchModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Scroll Body */}
            <form onSubmit={handleLaunchSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Date Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Launch Date (Future Only) <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  required
                  value={launchForm.launchDate}
                  onChange={(e) => setLaunchForm({ ...launchForm, launchDate: e.target.value })}
                  min={new Date().toISOString().substring(0, 16)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-[#9d4ae3] transition"
                />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Display Title</label>
                  <span className={`text-xs font-semibold ${launchForm.title.length > 255 ? 'text-red-500' : 'text-slate-400'}`}>
                    {launchForm.title.length}/255
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Something Amazing is Coming"
                  value={launchForm.title}
                  onChange={(e) => setLaunchForm({ ...launchForm, title: e.target.value.substring(0, 300) })}
                  maxLength={255}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-[#9d4ae3] transition"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Display Subtitle</label>
                  <span className={`text-xs font-semibold ${launchForm.subtitle.length > 500 ? 'text-red-500' : 'text-slate-400'}`}>
                    {launchForm.subtitle.length}/500
                  </span>
                </div>
                <textarea
                  placeholder="Nigeria's Premier Multi-Vendor Marketplace"
                  value={launchForm.subtitle}
                  onChange={(e) => setLaunchForm({ ...launchForm, subtitle: e.target.value.substring(0, 600) })}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-[#9d4ae3] transition resize-none"
                />
              </div>

              {/* Broadcast Notify Toggle */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    Notify Waitlist Members
                  </span>
                  <p className="text-xs text-slate-400 font-semibold">Toggling this ON will send a broadcast email updating everyone about this launch date change.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={launchForm.sendBroadcast}
                    onChange={(e) => setLaunchForm({ ...launchForm, sendBroadcast: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9d4ae3]" />
                </label>
              </div>

              {/* Broadcast Reason (conditional) */}
              {launchForm.sendBroadcast && (
                <div className="space-y-1.5 animate-in slide-in-from-top-3 duration-250">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-700 block">
                      Broadcast Reason <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-xs font-semibold ${launchForm.broadcastReason.length > 1000 ? 'text-red-500' : 'text-slate-400'}`}>
                      {launchForm.broadcastReason.length}/1000
                    </span>
                  </div>
                  <textarea
                    placeholder="We've decided to add a few more features before launch to make your vendor and shopping experience unforgettable..."
                    required={launchForm.sendBroadcast}
                    value={launchForm.broadcastReason}
                    onChange={(e) => setLaunchForm({ ...launchForm, broadcastReason: e.target.value.substring(0, 1100) })}
                    maxLength={1000}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-[#9d4ae3] transition resize-none"
                  />
                  <p className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                    <Info size={12} /> Explain why the date shifted; this will be embedded directly in the email broadcast.
                  </p>
                </div>
              )}

              {/* Preview Box */}
              <div className="border border-slate-200 border-dashed rounded-3xl p-4 bg-slate-50/30">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Live UI Preview</span>
                <div className="space-y-2 text-center py-4">
                  <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none">{launchForm.title || 'Something Amazing is Coming'}</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">{launchForm.subtitle || "Nigeria's Premier Multi-Vendor Marketplace"}</p>
                  <div className="inline-flex gap-2 justify-center pt-2">
                    <span className="bg-[#9d4ae3]/10 text-[#9d4ae3] px-3 py-1 rounded-full text-xs font-black">
                      {launchForm.launchDate ? formatDate(new Date(launchForm.launchDate).toISOString()) : 'Set a Date'}
                    </span>
                  </div>
                </div>
              </div>

            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsLaunchModalOpen(false)}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLaunchSubmit}
                className="px-5 py-2.5 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white font-bold rounded-2xl hover:opacity-90 active:scale-98 transition text-sm shadow-md shadow-fuchsia-100"
              >
                Save Launch Config
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Modal: Send Email Broadcast Composer ── */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsBroadcastModalOpen(false)} />
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800">Compose Broadcast</h3>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Send styled plain-text notifications to waitlist groups</p>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Split Screen Body: Editor + Email template simulation */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Column: Form Editor */}
              <form onSubmit={handleBroadcastSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 border-r border-slate-100">
                
                {/* Subject */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-700">Subject Line <span className="text-red-500">*</span></label>
                    <span className={`text-xs font-semibold ${broadcastForm.subject.length > 255 ? 'text-red-500' : 'text-slate-400'}`}>
                      {broadcastForm.subject.length}/255
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Special Offer for Vendors"
                    value={broadcastForm.subject}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value.substring(0, 300) })}
                    maxLength={255}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-[#9d4ae3] transition"
                  />
                </div>

                {/* Preview Text */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-700">Preview Text (Snippet)</label>
                    <span className={`text-xs font-semibold ${broadcastForm.previewText.length > 255 ? 'text-red-500' : 'text-slate-400'}`}>
                      {broadcastForm.previewText.length}/255
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., Vendor exclusive offer inside"
                    value={broadcastForm.previewText}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, previewText: e.target.value.substring(0, 300) })}
                    maxLength={255}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-[#9d4ae3] transition"
                  />
                  <p className="text-[10px] font-semibold text-slate-400">Short text displayed next to subject line in standard inbox views.</p>
                </div>

                {/* Role Filter Selector */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 block">Recipient Filter Group</label>
                  <select
                    value={broadcastForm.role}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, role: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-[#9d4ae3] transition cursor-pointer"
                  >
                    <option value="All">All Active Subscribers</option>
                    <option value="Customer">Customers Only</option>
                    <option value="Vendor">Vendors Only</option>
                  </select>

                  {/* Recipient Count Indicator */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-xs font-bold w-fit">
                    <Users size={14} className="text-slate-500" />
                    Target Audience:
                    <span className="text-[#9d4ae3] font-extrabold">{broadcastRecipientCount} active subscribers</span>
                  </div>
                </div>

                {/* Body Text */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 block">Email Body (Plain Text) <span className="text-red-500">*</span></label>
                  <textarea
                    placeholder="Dear vendor, upgrade your listing today! Exclusive discounts available."
                    required
                    value={broadcastForm.bodyText}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, bodyText: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-[#9d4ae3] transition resize-none font-mono"
                  />
                </div>

              </form>

              {/* Right Column: Simulated Email Template Preview */}
              <div className="hidden md:flex flex-col w-[380px] bg-slate-50 overflow-y-auto p-6 flex-shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-1.5">
                  <Mail size={12} /> Email Template Preview
                </span>
                
                {/* Template Frame */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[350px]">
                  
                  {/* Faflora Email Brand Header */}
                  <div className="bg-[#9d4ae3] p-4 text-center">
                    <h4 className="text-white text-base font-black tracking-widest leading-none">FAFLORA</h4>
                    <span className="text-[9px] text-fuchsia-100 tracking-wider font-semibold uppercase mt-1 inline-block">Nigeria's Flowers & Marketplace</span>
                  </div>

                  {/* Email Body Content */}
                  <div className="p-5 flex-1 space-y-4">
                    {broadcastForm.subject ? (
                      <h5 className="font-extrabold text-sm text-slate-800 leading-snug border-b border-slate-100 pb-2">{broadcastForm.subject}</h5>
                    ) : (
                      <h5 className="font-bold text-sm text-slate-300 border-b border-slate-100 pb-2 italic">Your Subject Here</h5>
                    )}

                    <div className="text-xs text-slate-600 font-medium whitespace-pre-wrap leading-relaxed min-h-[120px]">
                      {broadcastForm.bodyText ? broadcastForm.bodyText : (
                        <span className="text-slate-300 italic">Body content will render here inside the styled HTML template wrapper...</span>
                      )}
                    </div>
                  </div>

                  {/* Unsubscribe Footer */}
                  <div className="bg-slate-50 border-t border-slate-100 p-4 text-center text-[10px] text-slate-400 font-semibold space-y-1">
                    <p>&copy; {new Date().getFullYear()} Faflora Group. All rights reserved.</p>
                    <p>
                      You are receiving this email because you signed up on our waitlist. 
                    </p>
                    <a href="#" className="text-[#9d4ae3] font-extrabold hover:underline block mt-1">
                      Unsubscribe from this list
                    </a>
                  </div>

                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBroadcastSubmit}
                className="px-5 py-2.5 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white font-bold rounded-2xl hover:opacity-90 active:scale-98 transition text-sm shadow-md shadow-fuchsia-100"
              >
                Send Broadcast
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Modal: Confirm Launch config save ── */}
      {isLaunchConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsLaunchConfirmOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 animate-in zoom-in-95 duration-200 border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-fuchsia-100 flex items-center justify-center mx-auto mb-4 text-[#9d4ae3]">
              <Settings size={22} />
            </div>
            <h4 className="text-lg font-black text-slate-800 mb-2">Save Launch Configuration?</h4>
            <p className="text-gray-500 text-xs font-semibold leading-relaxed mb-6">
              {launchForm.sendBroadcast ? (
                <span className="text-amber-600 font-bold">
                  Warning: Toggling ON Notify Members will send an email broadcast explaining this launch update to all {stats.active} active members. Are you sure you want to proceed?
                </span>
              ) : (
                <span>This will save launch countdown details. No email notifications will be sent out.</span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLaunchConfirmOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition text-sm"
                disabled={isSavingLaunch}
              >
                Cancel
              </button>
              <button
                onClick={confirmLaunchSave}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white font-bold rounded-xl hover:opacity-90 transition text-sm flex items-center justify-center gap-1.5"
                disabled={isSavingLaunch}
              >
                {isSavingLaunch ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Yes, Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirm Broadcast Send ── */}
      {isBroadcastConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsBroadcastConfirmOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl p-6 animate-in zoom-in-95 duration-200 border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Send size={20} />
            </div>
            <h4 className="text-lg font-black text-slate-800 mb-2">Send Broadcast Email?</h4>
            <p className="text-gray-500 text-xs font-semibold leading-relaxed mb-6">
              You are about to send a broadcast email to <span className="text-rose-600 font-black">{broadcastRecipientCount} active subscribers</span> filtered by role: <span className="text-slate-800 font-black font-mono capitalize">{broadcastForm.role}</span>.
              <br />
              This endpoint processes recipients in batches of 50. This action is irreversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsBroadcastConfirmOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition text-sm"
                disabled={isSendingBroadcast}
              >
                Cancel
              </button>
              <button
                onClick={confirmBroadcastSend}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition text-sm flex items-center justify-center gap-1.5"
                disabled={isSendingBroadcast}
              >
                {isSendingBroadcast ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Yes, Send Broadcast'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
