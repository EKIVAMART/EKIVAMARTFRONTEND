'use client';
import RecordStatus from "@/components/admin/RecordStatus";

import React, { useState, useEffect, useMemo, useRef, ChangeEvent } from 'react';
import {
  Users, CheckCircle, XCircle, AlertTriangle, Calendar, Clock,
  User, Briefcase, Search, Download, ChevronLeft, ChevronRight,
  Settings, Send, Mail, AlertCircle, X, Check, Loader2, Info,
  Upload, ImageIcon, Star, Trash2, Plus, Wand2, Bold, Italic,
  Heading, Link, FileText, Eye
} from 'lucide-react';
import { waitlistApi, WaitlistStats, WaitlistSubscriber, LaunchConfig } from '@/lib/api';
import { uploadBroadcastImage } from '@/lib/api/broadcast-image-uploader';
import { sendBroadcast } from '@/lib/api/send-broadcast';
import { toast } from 'react-hot-toast';

/** Retrieves the stored JWT token from localStorage (same key used by axiosInstance). */
function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    ''
  );
}

interface UploadedImage {
  /** Cloudinary imageUrl — the permanent URL that goes into the email. */
  imageUrl: string;
  /** Blob Object URL for a fast local thumbnail preview. Revoke on removal. */
  localPreview: string;
  fileName: string;
}

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
    launchDate: '',
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

  const [broadcastForm, setBroadcastForm] = useState<{
    targetRole: 'ALL' | 'VENDOR' | 'CUSTOMER';
    subject: string;
    previewText: string;
    bodyHtml: string;
    bodyText: string;
    heroBannerUrl: string;
    attachedImageUrls: string[];
  }>({
    targetRole: 'ALL',
    subject: '',
    previewText: '',
    bodyHtml: '',
    bodyText: '',
    heroBannerUrl: '',
    attachedImageUrls: [],
  });

  // Image Upload state
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (broadcastForm.targetRole === 'CUSTOMER') return stats.customers;
    if (broadcastForm.targetRole === 'VENDOR') return stats.vendors;
    return stats.active;
  }, [broadcastForm.targetRole, stats]);

  const closeBroadcastModal = () => {
    setIsBroadcastModalOpen(false);
    setBroadcastForm({
      targetRole: 'ALL',
      subject: '',
      previewText: '',
      bodyHtml: '',
      bodyText: '',
      heroBannerUrl: '',
      attachedImageUrls: [],
    });
    // Revoke blob preview URLs to free memory
    uploadedImages.forEach(img => URL.revokeObjectURL(img.localPreview));
    setUploadedImages([]);
    setUploadError(null);
    setIsUploading(false);
  };

  // Image Upload handler — two-step direct Cloudinary flow (per integration docs)
  const handleImageFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be selected again later
    e.target.value = '';

    if (uploadedImages.length >= 5) {
      setUploadError('Maximum 5 images per broadcast. Remove an image first.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    // Create a local blob URL for instant thumbnail preview
    const localPreview = URL.createObjectURL(file);

    const authToken = getAuthToken();
    const result = await uploadBroadcastImage(
      file,
      authToken,
      process.env.NEXT_PUBLIC_API_URL
    );

    setIsUploading(false);

    if (!result.success) {
      URL.revokeObjectURL(localPreview);
      setUploadError(result.error);
      toast.error(result.error);
      return;
    }

    const { imageUrl } = result;

    setUploadedImages(prev => [
      ...prev,
      { imageUrl, localPreview, fileName: file.name },
    ]);
    setBroadcastForm(prev => ({
      ...prev,
      attachedImageUrls: [...(prev.attachedImageUrls || []), imageUrl],
      // Auto-set first image as hero banner
      heroBannerUrl: prev.heroBannerUrl || imageUrl,
    }));
    toast.success('Image uploaded successfully!');
  };

  const handleRemoveImage = (imageUrl: string) => {
    setUploadedImages(prev => {
      const removed = prev.find(img => img.imageUrl === imageUrl);
      if (removed) URL.revokeObjectURL(removed.localPreview);
      return prev.filter(img => img.imageUrl !== imageUrl);
    });
    setBroadcastForm(prev => {
      // Strip any img tag referencing this URL from bodyHtml
      const escaped = imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const imgRegex = new RegExp(`<img[^>]*src=["']${escaped}["'][^>]*>`, 'gi');
      const updatedBody = prev.bodyHtml.replace(imgRegex, '').trim();
      return {
        ...prev,
        bodyHtml: updatedBody,
        heroBannerUrl: prev.heroBannerUrl === imageUrl ? '' : prev.heroBannerUrl,
        attachedImageUrls: (prev.attachedImageUrls || []).filter(u => u !== imageUrl),
      };
    });
    toast.success('Removed image from broadcast and email body');
  };

  const handleInsertImageIntoBody = (imageUrl: string) => {
    const imgTag = `<img src="${imageUrl}" alt="Broadcast image" style="display:block;max-width:100%;height:auto;margin:16px 0;border:0;" />`;
    const textarea = textareaRef.current;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const current = broadcastForm.bodyHtml;
      const updated = current.substring(0, start) + imgTag + current.substring(end);

      setBroadcastForm(prev => ({ ...prev, bodyHtml: updated }));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + imgTag.length, start + imgTag.length);
      }, 50);
    } else {
      setBroadcastForm(prev => ({
        ...prev,
        bodyHtml: prev.bodyHtml ? `${prev.bodyHtml}\n\n${imgTag}` : imgTag,
      }));
    }
    toast.success('Inserted image at cursor position!');
  };

  const handleSetAsHeroBanner = (imageUrl: string) => {
    setBroadcastForm(prev => ({
      ...prev,
      heroBannerUrl: prev.heroBannerUrl === imageUrl ? '' : imageUrl,
    }));
  };

  const handleFormatText = (tagType: 'b' | 'i' | 'h3' | 'p' | 'cta' | 'hr') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = broadcastForm.bodyHtml;
    const selectedText = current.substring(start, end) || 'Sample text';

    let formatted = '';
    if (tagType === 'b') formatted = `<b>${selectedText}</b>`;
    else if (tagType === 'i') formatted = `<i>${selectedText}</i>`;
    else if (tagType === 'h3') formatted = `<h3 style="font-size: 18px; font-weight: bold; color: #1e293b; margin: 16px 0 8px 0;">${selectedText}</h3>`;
    else if (tagType === 'p') formatted = `<p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 12px;">${selectedText}</p>`;
    else if (tagType === 'cta') formatted = `<a href="https://faflora.com" style="display: inline-block; background-color: #228b22; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: bold; text-decoration: none; margin: 16px 0;">${selectedText}</a>`;
    else if (tagType === 'hr') formatted = `<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />`;

    const updated = current.substring(0, start) + formatted + current.substring(end);
    setBroadcastForm(prev => ({ ...prev, bodyHtml: updated }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formatted.length, start + formatted.length);
    }, 50);
  };

  const handleAutoFormatPlainText = () => {
    const rawContent = broadcastForm.bodyHtml;
    if (!rawContent.trim()) return;

    const blockTagRegex = /^\s*<\/?(p|div|h[1-6]|ul|ol|li|blockquote|table|section|article|header|footer|hr|address|pre|img|figure|figcaption)[>\s]/i;
    const lines = rawContent.split('\n');
    const result: string[] = [];
    let currentPlainLines: string[] = [];
    let formattedCount = 0;

    const flushPlainLines = () => {
      if (currentPlainLines.length > 0) {
        const text = currentPlainLines.join('\n');
        if (text.trim()) {
          // Split unformatted text blocks by double newlines into separate paragraphs
          const paragraphs = text.split(/\n\s*\n/);
          paragraphs.forEach(p => {
            const trimmed = p.trim();
            if (trimmed) {
              formattedCount++;
              const inner = trimmed.replace(/\n/g, '<br />');
              result.push(`<p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 12px;">${inner}</p>`);
            }
          });
        }
        currentPlainLines = [];
      }
    };

    lines.forEach(line => {
      if (blockTagRegex.test(line)) {
        flushPlainLines();
        result.push(line);
      } else {
        currentPlainLines.push(line);
      }
    });
    flushPlainLines();

    if (formattedCount === 0) {
      toast.success('All text blocks are already formatted with HTML tags!');
      return;
    }

    setBroadcastForm(prev => ({ ...prev, bodyHtml: result.join('\n') }));
    toast.success(`Converted ${formattedCount} plain text paragraph${formattedCount > 1 ? 's' : ''} into HTML!`);
  };

  // Form Submit Handlers
  const handleLaunchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    if (!broadcastForm.bodyHtml.trim()) {
      toast.error('Email body is required');
      return;
    }
    if (uploadedImages.length > 5) {
      toast.error('Maximum 5 images allowed per broadcast');
      return;
    }

    setIsBroadcastConfirmOpen(true);
  };

  const confirmBroadcastSend = async () => {
    setIsBroadcastConfirmOpen(false);
    setIsSendingBroadcast(true);
    const toastId = toast.loading('Sending broadcast emails in background...');

    const fallbackText = broadcastForm.bodyText.trim() || broadcastForm.bodyHtml.replace(/<[^>]+>/g, '').trim();

    const targetRolePayload: 'customer' | 'vendor' | undefined =
      broadcastForm.targetRole === 'VENDOR'
        ? 'vendor'
        : broadcastForm.targetRole === 'CUSTOMER'
        ? 'customer'
        : undefined;

    const authToken = getAuthToken();
    const result = await sendBroadcast(
      {
        targetRole: targetRolePayload,
        subject: broadcastForm.subject.trim(),
        bodyHtml: broadcastForm.bodyHtml.trim(),
        bodyText: fallbackText || undefined,
        previewText: broadcastForm.previewText.trim() || undefined,
        heroBannerUrl: broadcastForm.heroBannerUrl || undefined,
        attachedImageUrls:
          uploadedImages.length > 0
            ? uploadedImages.map(img => img.imageUrl)
            : undefined,
      },
      authToken
    );

    setIsSendingBroadcast(false);

    if (!result.success) {
      toast.error(result.message || 'Failed to send broadcast email', { id: toastId });
      return;
    }

    if (result.sent === 0) {
      toast('No matching active subscribers were found — nothing was sent.', {
        id: toastId,
        icon: '⚠️',
      });
    } else {
      toast.success(
        result.message || `Broadcast sent to ${result.sent ?? broadcastRecipientCount} subscribers!`,
        { id: toastId }
      );
      closeBroadcastModal();
      loadData();
    }
  };

  // Helper date formatting
  const formatDate = (dateStr: string) => {
    if (!dateStr || Number.isNaN(Date.parse(dateStr))) return 'Not set';
    try {
      return new Date(dateStr).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const totalPages = Math.ceil(totalSubscribers / limit) || 1;

  const statCards = [
    { label: 'Subscribers', value: stats.total },
    { label: 'Active', value: stats.active },
    { label: 'Unsubscribed', value: stats.unsubscribed },
    { label: 'Bounced', value: stats.bounced },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Waitlist</h1>
          <p className="mt-1 text-sm text-slate-600">
            Launch date: {isLoadingLaunchConfig ? 'Loading…' : formatDate(launchConfig.launchDate)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setIsLaunchModalOpen(true)}
            className="min-h-10 border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Edit launch date
          </button>
          <button type="button" onClick={() => setIsBroadcastModalOpen(true)}
            className="min-h-10 bg-[#176a35] px-4 text-sm font-medium text-white hover:bg-[#12582b]">
            Send email
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-200 bg-white">
        {statCards.map((card) => <div key={card.label} className="min-w-0 border-r last:border-r-0 border-slate-200 px-4 py-4">
          <p className="text-xs text-slate-600">{card.label}</p>
          {isLoadingStats ? <div className="mt-2 h-7 w-16 bg-slate-100 " /> :
            <p className="mt-1 text-xl font-semibold text-slate-900">{(card.value ?? 0).toLocaleString()}</p>}
        </div>)}
      </div>

            {/* ── Table Actions & Filter Header ── */}
      <div className="bg-white rounded-md border border-slate-100 shadow-sm overflow-hidden">

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
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200/80 rounded-md text-sm bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-[#228b22] transition"
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
                className="w-full sm:w-44 px-3 py-2.5 border border-slate-200/80 rounded-md text-sm font-semibold text-slate-700 bg-white cursor-pointer outline-none focus:ring-4 focus:ring-brand-100 focus:border-[#228b22] transition"
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
                className="w-full sm:w-44 px-3 py-2.5 border border-slate-200/80 rounded-md text-sm font-semibold text-slate-700 bg-white cursor-pointer outline-none focus:ring-4 focus:ring-brand-100 focus:border-[#228b22] transition"
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
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-300 transition w-full lg:w-auto bg-white"
          >
            <Download size={16} className="text-slate-500" />
            Export CSV
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          {isLoadingSubscribers ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 size={32} className="animate-spin text-[#228b22]" />
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
                      <RecordStatus value={sub.role} />
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
                      <RecordStatus value={sub.status} />
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
                className="p-2 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                        className={`w-8 h-8 rounded-md font-bold text-sm transition flex items-center justify-center ${currentPage === page
                            ? 'bg-[#228b22] text-white shadow-sm'
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
                className="p-2 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
          <div className="absolute inset-0 bg-slate-900/60 " onClick={() => setIsLaunchModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-md shadow-sm flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800">Launch Configuration</h3>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Pre-populate countdown & update marketing message</p>
              </div>
              <button
                onClick={() => setIsLaunchModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-md transition"
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
                  className="w-full px-4 py-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-[#228b22] transition"
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
                  className="w-full px-4 py-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-[#228b22] transition"
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
                  className="w-full px-4 py-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-[#228b22] transition resize-none"
                />
              </div>

              {/* Broadcast Notify Toggle */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-between gap-4">
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
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-md peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-md after:h-5 after:w-5 after:transition-all peer-checked:bg-[#228b22]" />
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
                    className="w-full px-4 py-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-[#228b22] transition resize-none"
                  />
                  <p className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                    <Info size={12} /> Explain why the date shifted; this will be embedded directly in the email broadcast.
                  </p>
                </div>
              )}

              {/* Preview Box */}
              <div className="border border-slate-200 border-dashed rounded-md p-4 bg-slate-50/30">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Live UI Preview</span>
                <div className="space-y-2 text-center py-4">
                  <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none">{launchForm.title || 'Something Amazing is Coming'}</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">{launchForm.subtitle || "Nigeria's Premier Multi-Vendor Marketplace"}</p>
                  <div className="inline-flex gap-2 justify-center pt-2">
                    <span className="bg-[#228b22]/10 text-[#228b22] px-3 py-1 rounded-md text-xs font-black">
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
                className="px-5 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-md hover:bg-slate-100 transition text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLaunchSubmit}
                className="px-5 py-2.5 bg-[#228b22] text-white font-bold rounded-md hover:opacity-90 active:scale-98 transition text-sm shadow-sm "
              >
                Save Launch Config
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Modal: Send email Composer ── */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 " onClick={closeBroadcastModal} />
          <div className="relative w-full max-w-5xl bg-white rounded-md shadow-sm flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800">Compose Broadcast</h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Draft and send an email update to subscribers across your waitlist.
                </p>
              </div>
              <button
                onClick={closeBroadcastModal}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-md transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Split Screen Body: Editor + Email template simulation */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

              {/* Left Column: Form Editor */}
              <form onSubmit={handleBroadcastSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 border-r border-slate-100">

                {/* Recipient Audience Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                    Target Audience Group <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setBroadcastForm(prev => ({ ...prev, targetRole: 'ALL' }))}
                      className={`px-3 py-2.5 rounded-md border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        broadcastForm.targetRole === 'ALL'
                          ? 'bg-[#228b22] text-white border-[#228b22] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Users size={14} /> All Subscribers ({stats.active})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastForm(prev => ({ ...prev, targetRole: 'VENDOR' }))}
                      className={`px-3 py-2.5 rounded-md border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        broadcastForm.targetRole === 'VENDOR'
                          ? 'bg-[#228b22] text-white border-[#228b22] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Briefcase size={14} /> Vendors Only ({stats.vendors})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastForm(prev => ({ ...prev, targetRole: 'CUSTOMER' }))}
                      className={`px-3 py-2.5 rounded-md border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        broadcastForm.targetRole === 'CUSTOMER'
                          ? 'bg-[#228b22] text-white border-[#228b22] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <User size={14} /> Customers Only ({stats.customers})
                    </button>
                  </div>
                </div>

                {/* Subject Line */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Subject Line <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[11px] font-semibold ${broadcastForm.subject.length > 255 ? 'text-rose-500' : 'text-slate-400'}`}>
                      {broadcastForm.subject.length}/255
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Exciting news for our early waitlist members!"
                    value={broadcastForm.subject}
                    onChange={(e) => setBroadcastForm(prev => ({ ...prev, subject: e.target.value.substring(0, 255) }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-[#228b22] transition"
                  />
                </div>

                {/* Preview Text (Inbox Snippet) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Preview Text (Inbox Snippet)
                    </label>
                    <span className={`text-[11px] font-semibold ${broadcastForm.previewText.length > 255 ? 'text-rose-500' : 'text-slate-400'}`}>
                      {broadcastForm.previewText.length}/255
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Exclusive early access details inside. Open to read more."
                    value={broadcastForm.previewText}
                    onChange={(e) => setBroadcastForm(prev => ({ ...prev, previewText: e.target.value.substring(0, 255) }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-[#228b22] transition"
                  />
                  <p className="text-[11px] text-slate-400 font-medium">Displayed in the recipient's inbox preview right after the subject line.</p>
                </div>

                {/* Image Attachments Zone */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                    Upload &amp; Attach Images
                    <span className="ml-2 font-semibold text-slate-400 normal-case">
                      ({uploadedImages.length}/5 used)
                    </span>
                  </label>

                  {/* Dropzone */}
                  <div
                    onClick={() => !isUploading && uploadedImages.length < 5 && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-md p-4 text-center transition group ${
                      uploadedImages.length >= 5
                        ? 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-60'
                        : 'border-slate-200 cursor-pointer hover:border-[#228b22] hover:bg-brand-50/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleImageFileSelected}
                      disabled={isUploading || uploadedImages.length >= 5}
                    />
                    <div className="w-10 h-10 rounded-md bg-brand-100 text-[#228b22] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition">
                      {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      {isUploading
                        ? 'Uploading to Cloudinary…'
                        : uploadedImages.length >= 5
                        ? 'Maximum 5 images reached'
                        : 'Click to select or upload image'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                      JPEG, PNG, WebP, GIF up to 5 MB
                    </p>
                  </div>

                  {uploadError && (
                    <p className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle size={14} /> {uploadError}
                    </p>
                  )}

                  {/* Uploaded Images Gallery */}
                  {uploadedImages.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Uploaded Images ({uploadedImages.length}/5)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {uploadedImages.map((img) => {
                          const isHero = broadcastForm.heroBannerUrl === img.imageUrl;
                          return (
                            <div
                              key={img.imageUrl}
                              className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-md relative group"
                            >
                              {/* Use the local blob URL for fast thumbnail — no network round-trip */}
                              <img
                                src={img.localPreview}
                                alt={img.fileName}
                                className="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-slate-200"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-700 truncate">{img.fileName}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleSetAsHeroBanner(img.imageUrl)}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition flex items-center gap-1 ${
                                      isHero
                                        ? 'bg-amber-100 text-amber-700 border-amber-300'
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                                    }`}
                                    title="Set as hero banner image at top of email"
                                  >
                                    <Star size={10} className={isHero ? 'fill-amber-500 text-amber-500' : ''} />
                                    {isHero ? 'Hero Banner' : 'Set Hero'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleInsertImageIntoBody(img.imageUrl)}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 hover:bg-brand-50 hover:text-[#228b22] hover:border-brand-200 transition flex items-center gap-1"
                                    title="Insert image tag at current cursor position in body"
                                  >
                                    <Plus size={10} /> Insert at Cursor
                                  </button>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(img.imageUrl)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Remove image"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Body & Formatting Tools */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                      Email Body (HTML) <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoFormatPlainText}
                      className="text-[11px] font-bold text-[#228b22] hover:text-[#1c711c] bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                      title="Convert plain text line breaks into HTML <p> tags"
                    >
                      <Wand2 size={12} /> Format Text to HTML
                    </button>
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-100 border border-slate-200 rounded-md text-slate-600 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => handleFormatText('b')}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold transition flex items-center gap-1"
                      title="Bold selection"
                    >
                      <Bold size={12} /> Bold
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatText('i')}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold transition flex items-center gap-1"
                      title="Italic selection"
                    >
                      <Italic size={12} /> Italic
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatText('h3')}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold transition flex items-center gap-1"
                      title="Insert Heading"
                    >
                      <Heading size={12} /> Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatText('p')}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold transition flex items-center gap-1"
                      title="Insert Paragraph"
                    >
                      <FileText size={12} /> Paragraph
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatText('cta')}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[#228b22] font-bold transition flex items-center gap-1"
                      title="Insert CTA Button link"
                    >
                      <Link size={12} /> Button Link
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatText('hr')}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold transition"
                      title="Insert Divider Line"
                    >
                      — Divider
                    </button>
                  </div>

                  <textarea
                    ref={textareaRef}
                    required
                    placeholder="Write your email body here. You can type plain text and click 'Format Text to HTML' or use the toolbar above."
                    rows={8}
                    value={broadcastForm.bodyHtml}
                    onChange={(e) => setBroadcastForm(prev => ({ ...prev, bodyHtml: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-md text-xs font-mono leading-relaxed focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-[#228b22] transition"
                  />
                </div>

                {/* Collapsible Plain Text Fallback */}
                <details className="group border border-slate-200 rounded-md bg-slate-50/50 p-3">
                  <summary className="text-xs font-bold text-slate-600 cursor-pointer flex items-center justify-between select-none">
                    <span>Optional Plain-Text Fallback (`bodyText`)</span>
                    <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-3 space-y-1.5">
                    <textarea
                      placeholder="Plain text version for older email clients. If left blank, this will be automatically generated from your HTML body."
                      rows={3}
                      value={broadcastForm.bodyText}
                      onChange={(e) => setBroadcastForm(prev => ({ ...prev, bodyText: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-[#228b22] transition bg-white"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">Leave empty to auto-strip HTML tags as plain text fallback.</p>
                  </div>
                </details>

              </form>

              {/* Right Column: Live Email Preview Panel (Scrollable) */}
              <div className="hidden md:flex flex-col w-[380px] bg-slate-50 p-6 flex-shrink-0 border-l border-slate-100 overflow-y-auto max-h-[620px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-1.5">
                  <Eye size={12} /> Live Email Preview
                </span>

                {/* Inbox Snippet Preview */}
                {broadcastForm.previewText && (
                  <div className="mb-3 p-2.5 bg-white rounded-md border border-slate-200 shadow-sm text-[11px]">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px] block">Inbox Snippet</span>
                    <p className="text-slate-600 font-medium truncate mt-0.5">{broadcastForm.previewText}</p>
                  </div>
                )}

                {/* Email Canvas Container */}
                <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[380px]">

                  {/* Header Branding */}
                  <div className="bg-[#228b22] p-4 text-center">
                    <h4 className="text-white text-base font-black tracking-widest leading-none">FAFLORA</h4>
                    <span className="text-[9px] text-brand-100 tracking-wider font-semibold uppercase mt-1 inline-block">Nigeria's Flowers & Marketplace</span>
                  </div>

                  {/* Optional Hero Banner Image — use localPreview for the live preview panel */}
                  {broadcastForm.heroBannerUrl && (() => {
                    const hero = uploadedImages.find(img => img.imageUrl === broadcastForm.heroBannerUrl);
                    return (
                      <div className="w-full max-h-[160px] overflow-hidden border-b border-slate-100">
                        <img
                          src={hero?.localPreview ?? broadcastForm.heroBannerUrl}
                          alt="Hero Banner"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
  })()}

                  {/* Email Body Content Area (Scrollable) */}
                  <div className="p-5 flex-1 space-y-3 overflow-y-auto max-h-[420px]">
                    {broadcastForm.subject ? (
                      <h5 className="font-extrabold text-sm text-slate-800 leading-snug border-b border-slate-100 pb-2">
                        {broadcastForm.subject}
                      </h5>
                    ) : (
                      <h5 className="font-bold text-sm text-slate-300 border-b border-slate-100 pb-2 italic">
                        Subject line preview...
                      </h5>
                    )}

                    {broadcastForm.bodyHtml ? (
                      <div
                        className="text-xs text-slate-700 leading-relaxed font-sans"
                        dangerouslySetInnerHTML={{ __html: broadcastForm.bodyHtml }}
                      />
                    ) : (
                      <p className="text-xs text-slate-300 italic">
                        Type or format content in the body editor to view live styled preview here...
                      </p>
                    )}
                  </div>

                  {/* Email Footer */}
                  <div className="bg-slate-50 border-t border-slate-100 p-4 text-center text-[10px] text-slate-400 font-semibold space-y-1">
                    <p>&copy; {new Date().getFullYear()} EkivaMart Group. All rights reserved.</p>
                    <p>You are receiving this email because you signed up on our waitlist.</p>
                    <a href="#" className="text-[#228b22] font-extrabold hover:underline block mt-1">
                      Unsubscribe from this list
                    </a>
                  </div>

                </div>
              </div>

            </div>

            {/* Modal Action Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
              <div className="text-xs text-slate-500 font-medium">
                Recipients: <span className="font-bold text-slate-800">{broadcastRecipientCount} subscribers</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeBroadcastModal}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-md hover:bg-slate-100 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBroadcastSubmit}
                  className="px-5 py-2.5 bg-[#228b22] text-white font-bold rounded-md hover:opacity-90 active:scale-98 transition text-sm shadow-sm flex items-center gap-1.5"
                >
                  <Send size={15} /> Send Broadcast
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Modal: Confirm Launch config save ── */}
      {isLaunchConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 " onClick={() => setIsLaunchConfirmOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-md shadow-sm p-6 animate-in zoom-in-95 duration-200 border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 text-[#228b22]">
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
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-md hover:bg-slate-50 transition text-sm"
                disabled={isSavingLaunch}
              >
                Cancel
              </button>
              <button
                onClick={confirmLaunchSave}
                className="flex-1 py-2.5 bg-[#228b22] text-white font-bold rounded-md hover:opacity-90 transition text-sm flex items-center justify-center gap-1.5"
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
          <div className="absolute inset-0 bg-slate-900/40 " onClick={() => setIsBroadcastConfirmOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-md shadow-sm p-6 animate-in zoom-in-95 duration-200 border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Send size={20} />
            </div>
            <h4 className="text-lg font-black text-slate-800 mb-2">Send Broadcast Email?</h4>
            <p className="text-gray-500 text-xs font-semibold leading-relaxed mb-6">
              You are about to send a broadcast email to <span className="text-rose-600 font-black">{broadcastRecipientCount} active subscribers</span> filtered by role: <span className="text-slate-800 font-black font-mono capitalize">{broadcastForm.targetRole}</span>.
              <br />
              This endpoint processes recipients in batches of 50. This action is irreversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsBroadcastConfirmOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-md hover:bg-slate-50 transition text-sm"
                disabled={isSendingBroadcast}
              >
                Cancel
              </button>
              <button
                onClick={confirmBroadcastSend}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-md hover:bg-rose-700 transition text-sm flex items-center justify-center gap-1.5"
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
