'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Check, X, Ban,
  Award, Shield, FileText, Settings, UserCheck, DollarSign, Clock, AlertTriangle,
  HelpCircle, MoreVertical, RefreshCw, Trash2, ShieldAlert, BookOpen, AlertCircle, Briefcase
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminVendorApi, AdminVendorProfile, AdminVendorDocument, AdminVendorBankAccount, AdminVendorAuditLogEntry, AdminWithdrawal, AdminFlaggedReview, AdminCommissionConfig } from '@/lib/api-vendor';
import { authApi, categoryApi } from '@/lib/api';
import RecordActions from '@/components/admin/RecordActions';

interface VendorManagementViewProps {
  isSuperAdmin: boolean;
  currentUserId: string;
}

type TabType = 'assigned' | 'pending' | 'in_review' | 'requires_resubmission' | 'approved' | 'rejected' | 'suspended' | 'banned';
type SubSectionType = 'applications' | 'withdrawals' | 'commissions' | 'reviews' | 'audit-log';

export default function VendorManagementView({ isSuperAdmin, currentUserId }: VendorManagementViewProps) {
  // Navigation States
  const [activeSection, setActiveSection] = useState<SubSectionType>('applications');
  const [activeTab, setActiveTab] = useState<TabType>(isSuperAdmin ? 'pending' : 'assigned');

  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Listing States
  const [vendors, setVendors] = useState<AdminVendorProfile[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [commissions, setCommissions] = useState<AdminCommissionConfig[]>([]);
  const [reviews, setReviews] = useState<AdminFlaggedReview[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminVendorAuditLogEntry[]>([]);

  // Pagination & Filters
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorTypeFilter, setVendorTypeFilter] = useState('all');
  const [trustLevelFilter, setTrustLevelFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Assigned count (for the Assigned to You tab label)
  const [assignedCount, setAssignedCount] = useState(0);

  // List of Admins for reviewer assignment
  const [adminsList, setAdminsList] = useState<any[]>([]);

  // Selected Vendor Detail Modal
  const [detailVendorId, setDetailVendorId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<{
    profile: AdminVendorProfile;
    documents: AdminVendorDocument[];
    bankAccounts: AdminVendorBankAccount[];
    recentAuditLog: AdminVendorAuditLogEntry[];
    earnings?: any;
    earningsHistory?: any[];
  } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailTab, setDetailTab] = useState<'profile' | 'docs' | 'bank' | 'earnings' | 'audit'>('profile');

  // Action Modals State
  const [actionType, setActionType] = useState<
    'approve' | 'reject' | 'suspend' | 'reactivate' | 'ban' | 'unban' | 'override' | 'resubmission' | 'process_withdrawal' | 'override_withdrawal' | 'bulk_reject' | null
  >(null);
  const [actionVendor, setActionVendor] = useState<AdminVendorProfile | null>(null);
  const [actionWithdrawal, setActionWithdrawal] = useState<AdminWithdrawal | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Bulk check selection state for super admin
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);

  // Lists for dropdown selectors
  const [allVendorsList, setAllVendorsList] = useState<AdminVendorProfile[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  // Selected vendor ID for Platform Logs audit trail
  const [selectedAuditVendorId, setSelectedAuditVendorId] = useState<string>('');

  // Synchronize activeTab based on isSuperAdmin changes
  useEffect(() => {
    setActiveTab(isSuperAdmin ? 'pending' : 'assigned');
    if (!isSuperAdmin && activeSection === 'withdrawals') {
      setActiveSection('applications');
    }
  }, [isSuperAdmin, activeSection]);

  // Reset selection on tab/page change
  useEffect(() => {
    setSelectedVendorIds([]);
  }, [activeTab, page]);

  const [actionDecision, setActionDecision] = useState<'approved' | 'rejected'>('approved');
  const [withdrawalAction, setWithdrawalAction] = useState<'complete' | 'fail'>('complete');

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // Bulk skipped details modal
  const [skippedModal, setSkippedModal] = useState<{
    open: boolean;
    action: 'approved' | 'rejected';
    approved?: number;
    rejected?: number;
    skipped: number;
    details: Array<{ vendorId: string; reason: string }>;
  } | null>(null);

  // Document lightbox
  const [docLightbox, setDocLightbox] = useState<{ open: boolean; url: string; type: 'image' | 'pdf' | 'other'; name: string } | null>(null);

  // Document review reason modal
  const [docReviewModal, setDocReviewModal] = useState<{
    open: boolean;
    docId: string;
    action: 'rejected' | 'requires_resubmission';
    reason: string;
  } | null>(null);

  // Assign Reviewer Dialog
  const [assignVendorTarget, setAssignVendorTarget] = useState<AdminVendorProfile | null>(null);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [confirmAssignModal, setConfirmAssignModal] = useState(false);

  // Trust Level Modal
  const [trustLevelVendor, setTrustLevelVendor] = useState<AdminVendorProfile | null>(null);
  const [selectedTrustLevel, setSelectedTrustLevel] = useState('');

  // Commission Modal
  const [commissionModal, setCommissionModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    configId?: string;
    commissionRate: number;
    gatewayFeeRate: number;
    categoryId: string;
    vendorId: string;
  }>({
    isOpen: false,
    mode: 'create',
    commissionRate: 10,
    gatewayFeeRate: 1.5,
    categoryId: '',
    vendorId: ''
  });

  // Fetch list of admin users for the reviewer assignment dropdown
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await authApi.searchUsers({ role: 'admin', page: 1, limit: 100 });
        const data = response?.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.users)
            ? data.users
            : Array.isArray(data?.data)
              ? data.data
              : [];
        setAdminsList(list.map((admin: any) => ({ ...admin, id: String(admin.id || admin._id || '') })).filter((admin: any) => admin.id));
      } catch {
        setAdminsList([]);
      }
    };
    fetchAdmins();
  }, []);

  // Fetch categories and all vendors for dropdown selections & mapping
  useEffect(() => {
    const fetchAllVendorsAndCategories = async () => {
      try {
        const resVendors = await adminVendorApi.listVendors({ limit: 1000 });
        if (resVendors?.success) {
          setAllVendorsList(resVendors.data?.vendors || []);
        }
        const resCategories = await categoryApi.getCategories({ limit: 200 });
        if (resCategories?.success) {
          // Handle all possible response data shapes
          const data = resCategories.data;
          const list = Array.isArray(data)
            ? data
            : data?.categories || data?.data || data?.docs || data?.items || [];
          setCategoriesList(list);
        }
      } catch (e) {
        console.error('Failed to load categories or vendors list', e);
      }
    };
    fetchAllVendorsAndCategories();
  }, []);

  // Fetch Platform Stats (Super Admin only)
  const fetchStats = async () => {
    if (!isSuperAdmin) return;
    setLoadingStats(true);
    try {
      const response = await adminVendorApi.getPlatformStats();
      if (response?.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load platform stats', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [isSuperAdmin]);

  // Fetch Assigned count to display dynamically on "Assigned to You" Tab
  const fetchAssignedCount = async () => {
    if (!currentUserId) { setAssignedCount(0); return; }
    try {
      const response = await adminVendorApi.listVendors({
        assignedAdminId: currentUserId,
        limit: 100,
        page: 1
      });
      if (response?.success) {
        setAssignedCount(response.data?.pagination?.total || response.data?.vendors?.length || 0);
      }
    } catch {
      setAssignedCount(0);
    }
  };

  useEffect(() => {
    fetchAssignedCount();
  }, [currentUserId]);

  // Fetch Main Data based on active section and tab
  const fetchData = async () => {
    if (activeSection === 'applications' && activeTab === 'assigned' && !currentUserId) {
      setVendors([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (activeSection === 'applications') {
        let response: any;
        const baseParams = {
          page,
          limit,
          search: searchQuery || undefined,
          vendorType: vendorTypeFilter !== 'all' ? vendorTypeFilter : undefined,
          trustLevel: trustLevelFilter !== 'all' ? trustLevelFilter : undefined
        };

        if (searchQuery) {
          // Global cross-status search — no tab filter, search across all vendors
          response = await adminVendorApi.listVendors({
            ...baseParams
          });
        } else {
          switch (activeTab) {
            case 'assigned':
              response = await adminVendorApi.listVendors({
                ...baseParams,
                assignedAdminId: currentUserId
              });
              break;
            case 'pending':
              response = await adminVendorApi.getPendingApplications(baseParams);
              break;
            case 'in_review':
              response = await adminVendorApi.getInReviewApplications(baseParams);
              break;
            case 'requires_resubmission':
              response = await adminVendorApi.getAwaitingResubmission(baseParams);
              break;
            case 'approved':
              response = await adminVendorApi.getApprovedApplications(baseParams);
              break;
            case 'rejected':
              response = await adminVendorApi.getRejectedApplications(baseParams);
              break;
            case 'suspended':
              response = await adminVendorApi.getSuspendedApplications(baseParams);
              break;
            case 'banned':
              response = await adminVendorApi.getBannedApplications(baseParams);
              break;
          }
        }

        if (response?.success) {
          const fetchedList = response.data?.vendors || response.data?.applications || [];
          setVendors(fetchedList);
          const pagination = response.data?.pagination;
          if (pagination) {
            setTotalPages(pagination.totalPages || 1);
            setTotalItems(pagination.total || fetchedList.length);
          } else {
            setTotalPages(1);
            setTotalItems(fetchedList.length);
          }
        } else {
          setError(response?.message || 'Failed to load applications.');
        }
      } else if (activeSection === 'withdrawals' && isSuperAdmin) {
        const response = await adminVendorApi.getAllWithdrawalRequests({
          page,
          limit,
          isSuperAdmin,
          status: searchQuery ? undefined : undefined // Search filter custom logic if needed
        });
        if (response?.success) {
          setWithdrawals(response.data?.withdrawals || []);
          setTotalItems(response.data?.total || response.data?.withdrawals?.length || 0);
          setTotalPages(Math.ceil((response.data?.total || 1) / limit));
        } else {
          setError('Failed to fetch withdrawal requests.');
        }
      } else if (activeSection === 'commissions' && isSuperAdmin) {
        const response = await adminVendorApi.getCommissionConfigs();
        if (response?.success) {
          setCommissions(response.data || []);
        } else {
          setError('Failed to fetch commission configurations.');
        }
      } else if (activeSection === 'reviews') {
        const response = await adminVendorApi.getViewFlaggedReviews();
        if (response?.success) {
          setReviews(response.data || []);
        } else {
          setError('Failed to fetch flagged reviews.');
        }
      } else if (activeSection === 'audit-log' && isSuperAdmin) {
        if (!selectedAuditVendorId) {
          setAuditLogs([]);
          setLoading(false);
          return;
        }
        const response = await adminVendorApi.getPlatformAuditLog({
          vendorId: selectedAuditVendorId,
          page,
          limit
        });
        if (response?.success) {
          setAuditLogs(response.data?.entries || []);
          const total = response.data?.pagination?.total || response.data?.entries?.length || 0;
          setTotalItems(total);
          setTotalPages(Math.ceil(total / limit));
        } else {
          setError('Failed to fetch platform audit log.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while loading data.');
      toast.error(err?.message || 'Could not retrieve data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSection, activeTab, page, searchQuery, vendorTypeFilter, trustLevelFilter, selectedAuditVendorId, currentUserId]);

  // Reset page when switching categories
  useEffect(() => {
    setPage(1);
    setSearchQuery('');
  }, [activeSection, activeTab]);

  // Fetch full details of one vendor
  const handleViewVendor = async (vendorId: string) => {
    setDetailVendorId(vendorId);
    setLoadingDetail(true);
    setDetailTab('profile');
    try {
      const response = await adminVendorApi.getVendorDetail(vendorId);
      if (response?.success) {
        const earningsRes = await adminVendorApi.getVendorEarnings(vendorId).catch(() => null);
        const historyRes = await adminVendorApi.getVendorEarningsHistory(vendorId).catch(() => null);
        setDetailData({
          profile: response.data.profile,
          documents: response.data.documents,
          bankAccounts: response.data.bankAccounts,
          recentAuditLog: response.data.recentAuditLog,
          earnings: earningsRes?.data || null,
          earningsHistory: historyRes?.data?.earnings || []
        });
      } else {
        toast.error('Failed to load vendor details.');
        setDetailVendorId(null);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load details.');
      setDetailVendorId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Submit generic reason modals (rejections, suspension, ban, unban, override, resubmission notes)
  const handleReasonActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionVendor && actionType !== 'bulk_reject') return;
    const toastId = toast.loading('Processing action…');
    try {
      let res: any;
      if (actionType === 'reject') {
        res = await adminVendorApi.rejectVendor(actionVendor!.id, actionReason);
      } else if (actionType === 'suspend') {
        res = await adminVendorApi.suspendVendor(actionVendor!.id, actionReason);
      } else if (actionType === 'resubmission') {
        res = await adminVendorApi.requestResubmission(actionVendor!.id, actionReason);
      } else if (actionType === 'ban' && isSuperAdmin) {
        res = await adminVendorApi.banVendor(actionVendor!.id, actionReason);
      } else if (actionType === 'unban' && isSuperAdmin) {
        res = await adminVendorApi.unbanVendor(actionVendor!.id, actionReason);
      } else if (actionType === 'bulk_reject') {
        res = await adminVendorApi.bulkReject(selectedVendorIds, actionReason);
      } else if (actionType === 'override' && isSuperAdmin) {
        res = await adminVendorApi.overrideDecision(actionVendor!.id, {
          newDecision: actionDecision,
          reason: actionReason
        });
      }

      if (res?.success) {
        toast.success(res?.message || 'Operation successful!', { id: toastId });
        // Handle bulk reject skipped vendors
        if (actionType === 'bulk_reject') {
          const { rejected = 0, skipped = 0, skippedDetails = [] } = res.data || {};
          if (skipped > 0) {
            setSkippedModal({ open: true, action: 'rejected', rejected, skipped, details: skippedDetails });
          }
        }
        setActionType(null);
        setActionReason('');
        setActionVendor(null);
        setSelectedVendorIds([]);
        setDetailVendorId(null);
        fetchData();
        fetchAssignedCount();
        fetchStats();
      } else {
        toast.error(res?.message || 'Failed to process request.', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Server error occurred.', { id: toastId });
    }
  };

  // Single Action Direct Triggers (No reason required or confirmation prompts)
  const handleApproveVendor = async (vendor: AdminVendorProfile) => {
    setConfirmModal({
      open: true,
      title: 'Approve Application',
      message: `Confirm approval and make the store live: "${vendor.storeName}"?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, open: false }));
        const toastId = toast.loading('Approving vendor…');
        try {
          const res = await adminVendorApi.approveVendor(vendor.id);
          if (res?.success) {
            toast.success('Vendor store is now approved and live!', { id: toastId });
            setDetailVendorId(null);
            fetchData();
            fetchStats();
          } else {
            toast.error(res?.message || 'Approval failed.', { id: toastId });
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to approve vendor.', { id: toastId });
        }
      }
    });
  };

  const handleReactivateVendor = async (vendor: AdminVendorProfile) => {
    setConfirmModal({
      open: true,
      title: 'Reactivate Vendor',
      message: `Confirm reactivation of suspended vendor: "${vendor.storeName}"?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, open: false }));
        const toastId = toast.loading('Reactivating vendor…');
        try {
          const res = await adminVendorApi.reactivateVendor(vendor.id);
          if (res?.success) {
            toast.success('Vendor has been reactivated successfully!', { id: toastId });
            setDetailVendorId(null);
            fetchData();
            fetchStats();
          } else {
            toast.error(res?.message || 'Reactivation failed.', { id: toastId });
          }
        } catch (err: any) {
          toast.error(err?.message || 'Error reactivating vendor.', { id: toastId });
        }
      }
    });
  };

  // Assign review to admin action
  const handleAssignReviewerSubmit = async () => {
    if (!assignVendorTarget || !selectedAdminId) return;
    const selectedAdmin = adminsList.find((a) => a.id === selectedAdminId);
    const adminName = selectedAdmin ? `${selectedAdmin.firstName} ${selectedAdmin.lastName}` : 'the selected admin';

    setConfirmAssignModal(true);
  };

  const executeAssignment = async () => {
    if (!assignVendorTarget || !selectedAdminId) return;
    const toastId = toast.loading('Assigning application…');
    try {
      const res = await adminVendorApi.assignVendor(assignVendorTarget.id, selectedAdminId);
      if (res?.success) {
        toast.success('Application assigned reviewer successfully!', { id: toastId });
        setConfirmAssignModal(false);
        setAssignVendorTarget(null);
        setSelectedAdminId('');
        fetchData();
        fetchAssignedCount();
      } else {
        toast.error(res?.message || 'Assignment failed.', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to assign application.', { id: toastId });
    }
  };

  // Upgrade Trust Level Action
  const handleUpgradeTrustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trustLevelVendor || !selectedTrustLevel) return;
    const toastId = toast.loading('Upgrading trust level…');
    try {
      const res = await adminVendorApi.upgradeTrustLevel(trustLevelVendor.id, selectedTrustLevel);
      if (res?.success) {
        toast.success(`Upgraded trust level to ${selectedTrustLevel.replace('_', ' ')}!`, { id: toastId });
        setTrustLevelVendor(null);
        setSelectedTrustLevel('');
        setDetailVendorId(null);
        fetchData();
      } else {
        toast.error(res?.message || 'Upgrade failed.', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error occurred.', { id: toastId });
    }
  };

  // Document Verification Action (inside detail modal)
  const handleDocumentReview = async (docId: string, action: 'verified' | 'rejected' | 'requires_resubmission') => {
    if (action !== 'verified') {
      // Open reason input modal
      setDocReviewModal({ open: true, docId, action, reason: '' });
      return;
    }
    // verified: no reason needed
    await _executeDocumentReview(docId, action, '');
  };

  const _executeDocumentReview = async (docId: string, action: 'verified' | 'rejected' | 'requires_resubmission', reason: string) => {
    const toastId = toast.loading('Updating document status…');
    try {
      const res = await adminVendorApi.reviewDocument(detailVendorId!, docId, { action, reason });
      if (res?.success) {
        toast.success('Document status updated!', { id: toastId });
        if (detailData) {
          const updatedDocs = detailData.documents.map((d) =>
            d.id === docId ? { ...d, status: action, rejectionReason: reason || null } : d
          );
          setDetailData({ ...detailData, documents: updatedDocs });
        }
      } else {
        toast.error(res?.message || 'Failed to review document.', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save review.', { id: toastId });
    }
  };

  // Payout/Withdrawal actions
  const handleProcessWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionWithdrawal) return;
    const toastId = toast.loading('Processing withdrawal payout…');
    try {
      const res = await adminVendorApi.processWithdrawal(
        actionWithdrawal.id,
        {
          action: withdrawalAction,
          reason: actionReason || undefined
        },
        isSuperAdmin
      );
      if (res?.success) {
        toast.success(`Withdrawal payout marked as ${withdrawalAction === 'complete' ? 'Completed' : 'Failed'}!`, { id: toastId });
        setActionType(null);
        setActionWithdrawal(null);
        setActionReason('');
        fetchData();
        fetchStats();
      } else {
        toast.error(res?.message || 'Failed to complete payout.', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to process.', { id: toastId });
    }
  };

  const handleOverrideWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionWithdrawal || !isSuperAdmin) return;
    const toastId = toast.loading('Force-overriding withdrawal state…');
    try {
      const res = await adminVendorApi.overrideWithdrawal(actionWithdrawal.id, {
        action: withdrawalAction,
        reason: actionReason
      });
      if (res?.success) {
        toast.success(`Withdrawal overridden to ${withdrawalAction === 'complete' ? 'Completed' : 'Failed'} successfully!`, { id: toastId });
        setActionType(null);
        setActionWithdrawal(null);
        setActionReason('');
        fetchData();
        fetchStats();
      } else {
        toast.error(res?.message || 'Failed to override state.', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error occurred.', { id: toastId });
    }
  };

  // Flagged Reviews Moderation
  const handleReviewModerate = async (reviewId: string, action: 'hide' | 'unhide' | 'delete') => {
    const actionLabel = action === 'delete' ? 'permanently delete' : action;
    setConfirmModal({
      open: true,
      title: action === 'delete' ? 'Delete Review' : action === 'hide' ? 'Hide Review' : 'Restore Review',
      message: `Confirm: ${actionLabel} this flagged customer review? ${ action === 'delete' ? 'This cannot be undone.' : ''}`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, open: false }));
        const toastId = toast.loading(`${action === 'delete' ? 'Deleting' : 'Modifying'} review…`);
        try {
          let res: any;
          if (action === 'hide') res = await adminVendorApi.hideReview(reviewId);
          else if (action === 'unhide') res = await adminVendorApi.unhideReview(reviewId);
          else if (action === 'delete') res = await adminVendorApi.deleteReview(reviewId);

          if (res?.success) {
            toast.success(`Review ${action === 'delete' ? 'permanently deleted' : action === 'hide' ? 'hidden' : 'restored'} successfully!`, { id: toastId });
            fetchData();
          } else {
            toast.error(res?.message || 'Action failed.', { id: toastId });
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to moderate review.', { id: toastId });
        }
      }
    });
  };

  // Commission Configurations CRUD
  const handleCommissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    const toastId = toast.loading('Saving commission rate configuration…');
    try {
      let res: any;
      if (commissionModal.mode === 'create') {
        res = await adminVendorApi.createCommissionConfig({
          commissionRate: Number(commissionModal.commissionRate),
          gatewayFeeRate: Number(commissionModal.gatewayFeeRate),
          categoryId: commissionModal.categoryId || null,
          vendorId: commissionModal.vendorId || null
        });
      } else {
        res = await adminVendorApi.updateCommissionConfig(commissionModal.configId!, {
          commissionRate: Number(commissionModal.commissionRate),
          gatewayFeeRate: Number(commissionModal.gatewayFeeRate)
        });
      }

      if (res?.success) {
        toast.success(`Commission rate ${commissionModal.mode === 'create' ? 'configured' : 'updated'} successfully!`, { id: toastId });
        setCommissionModal({ ...commissionModal, isOpen: false });
        fetchData();
      } else {
        toast.error(res?.message || 'Failed to save configuration.', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to process commission configuration.', { id: toastId });
    }
  };

  const handleCommissionDelete = async (configId: string) => {
    setConfirmModal({
      open: true,
      title: 'Delete Commission Config',
      message: 'Delete this commission rate config? The system will fallback to the global default configuration.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, open: false }));
        const toastId = toast.loading('Deleting rate config…');
        try {
          const res = await adminVendorApi.deleteCommissionConfig(configId);
          if (res?.success) {
            toast.success('Commission configuration deleted successfully.', { id: toastId });
            fetchData();
          } else {
            toast.error(res?.message || 'Failed to delete config.', { id: toastId });
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to delete config.', { id: toastId });
        }
      }
    });
  };

  // Bulk actions (super admin only)
  const handleBulkApprove = async () => {
    if (selectedVendorIds.length < 2) {
      setConfirmModal({
        open: true,
        title: 'Selection Required',
        message: 'Please select at least 2 vendors before performing bulk approval.',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, open: false }))
      });
      return;
    }
    setConfirmModal({
      open: true,
      title: 'Bulk Approve Applications',
      message: `Confirm bulk approval of ${selectedVendorIds.length} selected vendor applications? Ineligible vendors will be skipped.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, open: false }));
        const toastId = toast.loading('Bulk approving applications…');
        try {
          const res = await adminVendorApi.bulkApprove(selectedVendorIds);
          if (res?.success) {
            const { approved = 0, skipped = 0, skippedDetails = [] } = res.data || {};
            toast.success(`Bulk approved ${approved} vendors!`, { id: toastId });
            setSelectedVendorIds([]);
            fetchData();
            fetchStats();
            if (skipped > 0) {
              setSkippedModal({ open: true, action: 'approved', approved, skipped, details: skippedDetails });
            }
          } else {
            toast.error(res?.message || 'Bulk action failed.', { id: toastId });
          }
        } catch (err: any) {
          toast.error(err?.message || 'Error occurred.', { id: toastId });
        }
      }
    });
  };

  const handleBulkReject = () => {
    if (selectedVendorIds.length < 2) {
      setConfirmModal({
        open: true,
        title: 'Selection Required',
        message: 'Please select at least 2 vendors before performing bulk rejection.',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, open: false }))
      });
      return;
    }
    setActionType('bulk_reject');
    setActionReason('');
  };

  // Render Section Headers
  const getSubSectionLabel = (sec: SubSectionType) => {
    switch (sec) {
      case 'applications': return 'Vendor Profiles & Applications';
      case 'withdrawals': return 'Withdrawal Requests Ledger';
      case 'commissions': return 'Commissions Rate Config';
      case 'reviews': return 'Flagged Product Reviews';
      case 'audit-log': return 'Platform Security Audit Trail';
    }
  };

  return (
    <div className="space-y-5">

      {isSuperAdmin && activeSection === 'applications' && stats && (
        <div className="grid grid-cols-3 border border-slate-200 bg-white">
          {[
            { label: 'Vendors', value: stats.totalVendors },
            { label: 'Approved', value: stats.vendorsByStatus?.approved || 0 },
            { label: 'Pending review', value: stats.vendorsByStatus?.submitted || 0 },
          ].map((metric) => <div key={metric.label} className="border-r last:border-r-0 border-slate-200 px-4 py-4">
            <p className="text-xs text-slate-600">{metric.label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{metric.value}</p>
          </div>)}
        </div>
      )}

            {/* Primary Section Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSection('applications')}
          className={`px-4 min-h-10 font-medium text-sm ${
            activeSection === 'applications'
              ? 'bg-[#e8f3e8] text-[#166a24]'
              : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
        >
          Vendor Profiles
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveSection('withdrawals')}
            className={`px-4 min-h-10 font-medium text-sm ${
              activeSection === 'withdrawals'
                ? 'bg-[#e8f3e8] text-[#166a24]'
                : 'bg-white border text-slate-600 hover:bg-slate-50'
            }`}
          >
            Withdrawals
          </button>
        )}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveSection('commissions')}
            className={`px-4 min-h-10 font-medium text-sm ${
              activeSection === 'commissions'
                ? 'bg-[#e8f3e8] text-[#166a24]'
                : 'bg-white border text-slate-600 hover:bg-slate-50'
            }`}
          >
            Commissions
          </button>
        )}
        <button
          onClick={() => setActiveSection('reviews')}
          className={`px-4 min-h-10 font-medium text-sm ${
            activeSection === 'reviews'
              ? 'bg-[#e8f3e8] text-[#166a24]'
              : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
        >
          Flagged Reviews
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveSection('audit-log')}
            className={`px-4 min-h-10 font-medium text-sm ${
              activeSection === 'audit-log'
                ? 'bg-[#e8f3e8] text-[#166a24]'
                : 'bg-white border text-slate-600 hover:bg-slate-50'
          }`}
          >
            Platform Logs
          </button>
        )}
      </div>

      {/* Main Display Area */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Sub-header with Title & Search & Action buttons */}
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{getSubSectionLabel(activeSection)}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input (For relevant sections) */}
            {(activeSection === 'applications' || activeSection === 'withdrawals') && (
              <div className="relative flex items-center bg-white border border-gray-200 rounded-md px-3 py-2 text-sm max-w-xs focus-within:border-brand-400 focus-within:ring-2 ring-brand-100 transition-all">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="outline-none border-none p-0 text-xs font-semibold text-slate-700 w-full placeholder:text-gray-400 focus:!ring-0"
                />
              </div>
            )}

            {/* Bulk Actions for Super Admin in Applications Queue */}
            {isSuperAdmin && activeSection === 'applications' && (activeTab === 'pending' || activeTab === 'in_review') && selectedVendorIds.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">{selectedVendorIds.length} selected</span>
                <button
                  onClick={handleBulkApprove}
                  className="bg-emerald-50 text-slate-700 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-md text-xs font-bold transition flex items-center gap-1"
                >
                  <Check size={14} /> Bulk Approve
                </button>
                <button
                  onClick={handleBulkReject}
                  className="bg-rose-50 text-slate-700 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-md text-xs font-bold transition flex items-center gap-1"
                >
                  <X size={14} /> Bulk Reject
                </button>
                <button type="button" onClick={() => setSelectedVendorIds([])} className="px-2 text-xs text-slate-600 underline">Clear</button>
              </div>
            )}

            {/* Create Commission rate for Super Admin */}
            {isSuperAdmin && activeSection === 'commissions' && (
              <button
                onClick={() => setCommissionModal({
                  isOpen: true,
                  mode: 'create',
                  commissionRate: 10,
                  gatewayFeeRate: 1.5,
                  categoryId: '',
                  vendorId: ''
                })}
                className="bg-[#228b22] text-white px-4 py-2 rounded-md text-xs font-bold shadow-sm hover:shadow-sm transition flex items-center gap-1"
              >
                + Configure Rate
              </button>
            )}
          </div>
        </div>

        {/* APPLICATIONS TAB STRIP */}
        {activeSection === 'applications' && (
          <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3" role="group" aria-label="Filter applications by status">
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {(
              [
                ...(!isSuperAdmin ? [{ id: 'assigned' as const, label: `Assigned to You (${assignedCount})` }] : []),
                { id: 'pending' as const, label: 'Pending Queue' },
                { id: 'in_review' as const, label: 'In Review' },
                { id: 'requires_resubmission' as const, label: 'Awaiting Resubmission' },
                { id: 'approved' as const, label: 'Approved' },
                { id: 'rejected' as const, label: 'Rejected' },
                { id: 'suspended' as const, label: 'Suspended' },
                { id: 'banned' as const, label: 'Banned' }
              ]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                aria-pressed={activeTab === tab.id}
                className={`flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {tab.id === 'assigned' && <UserCheck size={13} />}
                {tab.id === 'pending' && <Clock size={13} />}
                {tab.id === 'in_review' && <RefreshCw size={13} />}
                {tab.id === 'requires_resubmission' && <AlertTriangle size={13} />}
                {tab.id === 'approved' && <Award size={13} />}
                {tab.id === 'rejected' && <X size={13} />}
                {tab.id === 'suspended' && <Ban size={13} />}
                {tab.id === 'banned' && <ShieldAlert size={13} />}
                {tab.label}
              </button>
            ))}
            </div>
          </div>
        )}

        {/* MAIN DATA TABLES */}
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-[#228b22]/20 border-t-[#228b22] rounded-full animate-spin" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ">Loading administrative records...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="bg-red-50 p-4 rounded-md border border-red-100 text-slate-500 mb-4 ">
                <ShieldAlert size={36} />
              </div>
              <h3 className="text-base font-black text-slate-800">Operational Failure</h3>
              <p className="text-xs text-gray-500 font-medium max-w-sm mt-2 leading-relaxed">{error}</p>
              <button
                onClick={fetchData}
                className="mt-6 px-5 py-2 bg-slate-100 hover:bg-slate-200 border text-slate-700 rounded-md text-xs font-bold transition flex items-center gap-1"
              >
                <RefreshCw size={12} /> Retry Fetch
              </button>
            </div>
          ) : activeSection === 'applications' ? (
            // ================= VENDORS QUEUES TABLES =================
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-slate-50/50 border-b">
                <tr>
                  {/* Checkbox column (Super Admin bulk selection for pending/in_review) */}
                  {isSuperAdmin && (activeTab === 'pending' || activeTab === 'in_review') && (
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        className="rounded accent-[#228b22] cursor-pointer"
                        checked={selectedVendorIds.length === vendors.length && vendors.length > 0}
                        onChange={(e) => setSelectedVendorIds(e.target.checked ? vendors.map(v => v.id) : [])}
                        title="Select all"
                      />
                    </th>
                  )}
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10">#</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference / Store Details</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Type</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Trust Level</th>
                  {/* Dynamic status badge column shown during search */}
                  {searchQuery && (
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  )}
                  {activeTab === 'pending' && (
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Days Waiting</th>
                  )}
                  {activeTab === 'rejected' && (
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rejection Reason</th>
                  )}
                  {(activeTab === 'suspended' || activeTab === 'banned') && (
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason</th>
                  )}
                  {activeTab !== 'assigned' && activeTab !== 'pending' && activeTab !== 'banned' && (
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Assigned Reviewer</th>
                  )}
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.length > 0 ? (
                  vendors.map((vendor, idx) => {
                    const matchedAdmin = adminsList.find((a) => a.id === vendor.assignedAdminId);
                    const adminName = matchedAdmin ? `${matchedAdmin.firstName} ${matchedAdmin.lastName}` : 'Unassigned';
                    const rowNumber = (page - 1) * limit + idx + 1;
                    const isSelected = selectedVendorIds.includes(vendor.id);

                    return (
                      <tr key={vendor.id} tabIndex={0} aria-label={`View ${vendor.storeName} details`} onClick={() => handleViewVendor(vendor.id)} onKeyDown={(event) => { if (event.key === 'Enter' && event.target === event.currentTarget) handleViewVendor(vendor.id); }} className={`group cursor-pointer transition-colors hover:bg-emerald-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 ${isSelected ? 'bg-slate-50' : ''}`}>
                        {/* Checkbox cell */}
                        {isSuperAdmin && (activeTab === 'pending' || activeTab === 'in_review') && (
                          <td className="p-4 w-10">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(e) => {
                                setSelectedVendorIds(prev =>
                                  e.target.checked ? [...prev, vendor.id] : prev.filter(id => id !== vendor.id)
                                );
                              }}
                              className="rounded accent-[#228b22] cursor-pointer"
                            />
                          </td>
                        )}
                        {/* Row Number */}
                        <td className="p-4 w-10">
                          <span className="text-[10px] font-black text-slate-400">{rowNumber}</span>
                        </td>
                        {/* Store Details */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-sm font-semibold text-emerald-800">
                              {vendor.storeLogoUrl ? (
                                <img src={vendor.storeLogoUrl} className="w-full h-full object-cover" alt="" />
                              ) : (
                                vendor.storeName[0].toUpperCase()
                              )}
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-slate-900">
                                {vendor.storeName}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-medium text-slate-500">
                                  {vendor.applicationReference || 'NO-REF'}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {vendor.storeEmail}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Vendor Type */}
                        <td className="p-4 text-center">
                          <span className="text-xs font-medium capitalize text-slate-700">
                            {vendor.vendorType.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Trust Level */}
                        <td className="p-4 text-center">
                          <span className="text-xs font-medium capitalize text-slate-700">
                            {vendor.trustLevel.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Dynamic Status Badge (search results only) */}
                        {searchQuery && (
                          <td className="p-4 text-center">
                            <span className="text-xs font-medium capitalize text-slate-700">
                              {(vendor.applicationStatus || 'pending').replace(/_/g, ' ')}
                            </span>
                          </td>
                        )}
                        {activeTab === 'pending' && (
                          <td className="p-4 text-center">
                            <span className="text-xs font-medium tabular-nums text-slate-700">
                              {vendor.daysWaiting !== null && vendor.daysWaiting !== undefined ? `${vendor.daysWaiting} days` : '0 days'}
                            </span>
                          </td>
                        )}

                        {/* Rejection Reason (At a glance column) */}
                        {activeTab === 'rejected' && (
                          <td className="p-4">
                            <p className="text-xs font-medium text-slate-600 max-w-xs truncate" title={vendor.rejectionReason || ''}>
                              {vendor.rejectionReason || 'No reason provided.'}
                            </p>
                          </td>
                        )}

                        {/* Suspension Reason (At a glance column) */}
                        {activeTab === 'suspended' && (
                          <td className="p-4">
                            <p className="text-xs font-medium text-slate-600 max-w-xs truncate" title={vendor.rejectionReason || ''}>
                              {vendor.rejectionReason || 'No reason provided.'}
                            </p>
                          </td>
                        )}

                        {/* Banned Reason column */}
                        {activeTab === 'banned' && (
                          <td className="p-4">
                            <p className="text-xs font-medium text-slate-600 max-w-xs truncate" title={(vendor as any).banReason || vendor.rejectionReason || ''}>
                              {(vendor as any).banReason || vendor.rejectionReason || 'No reason provided.'}
                            </p>
                          </td>
                        )}

                        {/* Assigned Reviewer Column */}
                        {activeTab !== 'assigned' && activeTab !== 'pending' && activeTab !== 'banned' && (
                          <td className="p-4 text-center">
                            <span className={`text-xs font-bold ${vendor.assignedAdminId ? 'text-slate-700' : 'text-gray-400 italic'}`}>
                              {adminName}
                            </span>
                          </td>
                        )}

                        <td className="p-4 text-right">
                          <RecordActions name={vendor.storeName || 'vendor'} actions={[
                            { label: 'View details', onSelect: () => handleViewVendor(vendor.id) },
                            activeTab === 'pending' && { label: 'Assign admin', onSelect: () => { setAssignVendorTarget(vendor); setSelectedAdminId(''); } },
                            activeTab === 'approved' && { label: 'Change trust level', onSelect: () => { setTrustLevelVendor(vendor); setSelectedTrustLevel(vendor.trustLevel); } },
                            activeTab === 'approved' && { label: 'Suspend seller', onSelect: () => { setActionVendor(vendor); setActionType('suspend'); setActionReason(''); } },
                            activeTab === 'suspended' && { label: 'Reactivate store', onSelect: () => handleReactivateVendor(vendor) },
                            activeTab === 'banned' && isSuperAdmin && { label: 'Unban vendor', onSelect: () => { setActionVendor(vendor); setActionType('unban'); setActionReason(''); } },
                            isSuperAdmin && ['approved', 'rejected', 'suspended', 'requires_resubmission'].includes(activeTab) && { label: 'Override decision', onSelect: () => { setActionVendor(vendor); setActionType('override'); setActionDecision(vendor.applicationStatus === 'approved' ? 'rejected' : 'approved'); setActionReason(''); } },
                            isSuperAdmin && activeTab !== 'banned' && { label: 'Ban vendor', destructive: true, onSelect: () => { setActionVendor(vendor); setActionType('ban'); setActionReason(''); } },
                          ]} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="p-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center">
                          <Search size={28} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-500">
                          {searchQuery ? `No results for "${searchQuery}"` : 'No vendors in this queue.'}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                          {searchQuery ? 'Try adjusting your search term.' : 'This status queue is currently empty.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : activeSection === 'withdrawals' ? (
            // ================= WITHDRAWALS LIST TABLE =================
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead className="bg-slate-50/50 border-b">
                <tr>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor Store</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Amount</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created Date</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Processed Date</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {withdrawals.length > 0 ? (
                  withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-4 text-xs font-extrabold text-slate-600 uppercase tracking-tight">{withdrawal.reference}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 text-sm">{withdrawal.vendorStoreName || 'Unknown Store'}</span>
                      </td>
                      <td className="p-4 text-center font-black text-slate-800 text-sm">
                        {Number(withdrawal.amount).toLocaleString()} NGN
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          withdrawal.status === 'completed'
                            ? 'bg-emerald-100 text-slate-700 border-emerald-200'
                            : withdrawal.status === 'pending'
                              ? 'bg-amber-100 text-slate-700 border-amber-200'
                              : 'bg-rose-100 text-slate-700 border-rose-200'
                        }`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-500 font-medium">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-xs text-gray-500 font-medium">
                        {withdrawal.processedAt ? new Date(withdrawal.processedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-4 text-right">
                        <RecordActions name={`withdrawal ${withdrawal.reference}`} actions={[
                          withdrawal.status === 'pending' && { label: 'Process payout', onSelect: () => { setActionWithdrawal(withdrawal); setActionType('process_withdrawal'); setWithdrawalAction('complete'); setActionReason(''); } },
                          isSuperAdmin && { label: 'Override payout state', onSelect: () => { setActionWithdrawal(withdrawal); setActionType('override_withdrawal'); setWithdrawalAction(withdrawal.status === 'completed' ? 'fail' : 'complete'); setActionReason(''); } },
                        ]} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-20 text-center text-gray-500 font-semibold">
                      No withdrawal requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : activeSection === 'commissions' && isSuperAdmin ? (
            // ================= COMMISSIONS RATE LIST TABLE (Super Admin) =================
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead className="bg-slate-50/50 border-b">
                <tr>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level scope</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Commission Rate</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Gateway Fee Rate</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created By</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Updated</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.length > 0 ? (
                  commissions.map((comm) => (
                    <tr key={comm.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-4">
                        {!comm.categoryId && !comm.vendorId ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                            Global Platform Configuration
                          </span>
                        ) : comm.vendorId ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                              Vendor Specific Scope
                            </span>
                            <p className="text-xs text-gray-500 mt-1 font-semibold">
                              {allVendorsList.find(v => v.id === comm.vendorId)?.storeName || comm.vendorId}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-100 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                              Category Specific Scope
                            </span>
                            <p className="text-xs text-gray-500 mt-1 font-semibold">
                              {categoriesList.find((c: any) => (c.id || c._id) === comm.categoryId)?.name || comm.categoryId}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center font-black text-slate-800 text-sm">
                        {comm.commissionRate}%
                      </td>
                      <td className="p-4 text-center font-black text-slate-800 text-sm">
                        {comm.gatewayFeeRate}%
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-600">
                        {(() => {
                          const creator = adminsList.find((a) => a.id === comm.createdBy);
                          return creator ? `${creator.firstName} ${creator.lastName}`.trim() : comm.createdBy;
                        })()}
                      </td>
                      <td className="p-4 text-xs text-gray-400 font-medium">
                        {new Date(comm.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <RecordActions name="commission rate" actions={[
                          { label: 'Edit rates', onSelect: () => setCommissionModal({
                            isOpen: true, mode: 'edit', configId: comm.id,
                            commissionRate: comm.commissionRate, gatewayFeeRate: comm.gatewayFeeRate,
                            categoryId: comm.categoryId || '', vendorId: comm.vendorId || '',
                          }) },
                          Boolean(comm.categoryId || comm.vendorId) && { label: 'Delete rate', destructive: true, onSelect: () => handleCommissionDelete(comm.id) },
                        ]} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-gray-500 font-semibold">
                      No custom commission rates configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : activeSection === 'reviews' ? (
            // ================= FLAGGED CUSTOMER REVIEWS =================
            <div className="divide-y divide-slate-100">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-6 hover:bg-slate-50/30 transition flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-sm">{rev.vendorStoreName || 'Store Review'}</span>
                        <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">Order #{rev.orderId}</span>
                        {rev.productId && (
                          <span className="text-[10px] text-slate-600 font-bold bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">Product: {rev.productId}</span>
                        )}
                        <span className="text-[10px] text-slate-600 font-bold bg-red-50 border border-red-100 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                          <AlertCircle size={10} /> Flagged: {rev.flaggedReason}
                        </span>
                        {rev.isHidden && (
                          <span className="text-[10px] text-gray-600 font-bold bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                            <Ban size={10} /> Hidden
                          </span>
                        )}
                      </div>

                      {/* Reviewer info */}
                      {rev.reviewerName && (
                        <p className="text-[10px] text-gray-400 font-semibold">Reviewer: <span className="text-slate-600">{rev.reviewerName}</span></p>
                      )}

                      {/* Stars Rating */}
                      <div className="flex items-center gap-0.5 text-slate-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-base ${i < rev.rating ? 'opacity-100' : 'opacity-20'}`}>★</span>
                        ))}
                        <span className="text-xs text-gray-400 ml-1 font-semibold">{rev.rating}/5 Rating</span>
                      </div>

                      <p className="text-sm text-slate-700 font-medium leading-relaxed italic bg-slate-50 p-3 rounded-md border border-slate-100">{rev.comment}</p>

                      {/* Review images */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {rev.images.map((img: string, idx: number) => (
                            <a key={idx} href={img} target="_blank" rel="noreferrer">
                              <img src={img} alt={`Review image ${idx + 1}`} className="w-16 h-16 object-cover rounded-md border border-slate-200 hover:opacity-80 transition" />
                            </a>
                          ))}
                        </div>
                      )}

                      {rev.vendorReply && (
                        <div className="ml-6 pl-4 border-l-2 border-slate-200 mt-2 space-y-1">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seller Reply:</p>
                          <p className="text-xs text-gray-600 leading-relaxed font-semibold">{rev.vendorReply}</p>
                        </div>
                      )}

                      {/* Date info */}
                      <p className="text-[10px] text-gray-400 font-medium">
                        Reviewed on {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Unknown date'}
                        {rev.updatedAt && rev.updatedAt !== rev.createdAt && (
                          <> · Updated {new Date(rev.updatedAt).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {rev.isHidden ? (
                        <button
                          onClick={() => handleReviewModerate(rev.id, 'unhide')}
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-slate-700 text-xs font-bold rounded-md border border-emerald-100 transition flex items-center gap-1"
                        >
                          Unhide Review
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReviewModerate(rev.id, 'hide')}
                          className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-slate-700 text-xs font-bold rounded-md border border-amber-100 transition flex items-center gap-1"
                        >
                          Hide Review
                        </button>
                      )}
                      <button
                        onClick={() => handleReviewModerate(rev.id, 'delete')}
                        className="p-2 text-slate-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-md transition"
                        title="Permanently Delete Review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center">
                    <BookOpen size={28} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">No flagged reviews found.</p>
                  <p className="text-xs text-gray-400 font-medium">Reviews flagged by users will appear here for moderation.</p>
                </div>
              )}
            </div>
          ) : (
            // ================= PLATFORM AUDIT LOGS =================
            <div className="flex flex-col">
              {/* Vendor filter dropdown */}
              <div className="p-5 border-b bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Filter by Vendor</label>
                <select
                  value={selectedAuditVendorId}
                  onChange={(e) => { setSelectedAuditVendorId(e.target.value); setPage(1); }}
                  className="flex-1 max-w-xs p-2.5 rounded-md border bg-white font-semibold text-xs text-slate-700 outline-none focus:ring-2 ring-brand-100 transition"
                >
                  <option value="">— Select a vendor to view audit logs —</option>
                  {allVendorsList.map((v) => (
                    <option key={v.id} value={v.id}>{v.storeName}</option>
                  ))}
                </select>
              </div>
              {!selectedAuditVendorId ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center">
                    <Search size={28} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">Select a vendor to view audit logs</p>
                  <p className="text-xs text-gray-400 font-medium">Choose a vendor from the dropdown above to load their platform activity.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead className="bg-slate-50/50 border-b">
                    <tr>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Type</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actor / Admin</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Log Note</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                    {auditLogs.length > 0 ? (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                              log.action.includes('APPROVE')
                                ? 'bg-emerald-50 text-slate-700 border border-emerald-100'
                                : log.action.includes('REJECT') || log.action.includes('BAN')
                                  ? 'bg-rose-50 text-slate-700 border border-rose-100'
                                  : 'bg-brand-50 text-brand-700 border border-brand-100'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 font-semibold">
                            {allVendorsList.find(v => v.id === log.vendorId)?.storeName || log.vendorId}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700">{log.actorRole}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{log.actorId || 'SYSTEM'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 max-w-sm font-medium">{log.notes}</td>
                          <td className="p-4 text-gray-400 font-medium">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-16 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <BookOpen size={28} className="text-slate-300" />
                            <p className="text-sm font-bold text-slate-500">No audit logs found for this vendor.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* PAGINATION FOOTER */}
        {(activeSection === 'applications' || activeSection === 'withdrawals' || activeSection === 'audit-log') && totalPages > 1 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Page {page} of {totalPages} ({totalItems} records)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-white border shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition ${
                    page === idx + 1
                      ? 'bg-[#228b22] text-white shadow-sm'
                      : 'bg-white border hover:bg-slate-50 text-slate-700 shadow-sm'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-white border shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FULL VENDOR DETAIL MODAL CONTAINER */}
      <AnimatePresence>
        {detailVendorId && detailData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-[3px]  dashboard-dialog-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full overflow-hidden flex flex-col relative dashboard-dialog dashboard-dialog--large" role="dialog" aria-modal="true" aria-labelledby="VendorManagementView-dialog-0-title"
            >
              {/* Header */}
              <div className="bg-white border-b border-slate-200 px-6 py-4 text-slate-900 flex items-center justify-between shrink-0 dashboard-dialog-header">
                <div>
                  <h3 className="text-xl font-black tracking-tight" id="VendorManagementView-dialog-0-title">{detailData.profile.storeName}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#228b22] bg-white border px-2 py-0.5 rounded-md shadow-sm">
                      {detailData.profile.applicationStatus}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Ref: {detailData.profile.applicationReference || 'N/A'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailVendorId(null)}
                  className="p-2 text-slate-500 rounded-md transition-colors dashboard-dialog-close" aria-label="Close dialog"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              {/* Inside Modal tab triggers */}
              <div className="flex overflow-x-auto border-b bg-slate-50/50 shrink-0 select-none scrollbar-none">
                <button
                  onClick={() => setDetailTab('profile')}
                  className={`px-6 py-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                    detailTab === 'profile' ? 'border-[#228b22] text-[#228b22]' : 'border-transparent text-gray-500 hover:text-slate-700'
                  }`}
                >
                  Seller Profile
                </button>
                <button
                  onClick={() => setDetailTab('docs')}
                  className={`px-6 py-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                    detailTab === 'docs' ? 'border-[#228b22] text-[#228b22]' : 'border-transparent text-gray-500 hover:text-slate-700'
                  }`}
                >
                  Uploaded Documents ({detailData.documents.length})
                </button>
                <button
                  onClick={() => setDetailTab('bank')}
                  className={`px-6 py-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                    detailTab === 'bank' ? 'border-[#228b22] text-[#228b22]' : 'border-transparent text-gray-500 hover:text-slate-700'
                  }`}
                >
                  Bank Payout Details
                </button>
                <button
                  onClick={() => setDetailTab('earnings')}
                  className={`px-6 py-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                    detailTab === 'earnings' ? 'border-[#228b22] text-[#228b22]' : 'border-transparent text-gray-500 hover:text-slate-700'
                  }`}
                >
                  Earnings Balance
                </button>
                <button
                  onClick={() => setDetailTab('audit')}
                  className={`px-6 py-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                    detailTab === 'audit' ? 'border-[#228b22] text-[#228b22]' : 'border-transparent text-gray-500 hover:text-slate-700'
                  }`}
                >
                  Audit Trail
                </button>
              </div>

              {/* Scrollable details contents */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 dashboard-dialog-body">
                {detailTab === 'profile' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-semibold">
                    {/* Basic specs */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b">Store Details</h4>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Store Description</p>
                        <p className="text-sm text-slate-800 font-medium mt-1 leading-relaxed break-words whitespace-pre-wrap">{detailData.profile.storeDescription || 'No description.'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Contact Email</p>
                        <p className="text-sm text-slate-800 mt-0.5">{detailData.profile.storeEmail}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Contact Phone</p>
                        <p className="text-sm text-slate-800 mt-0.5">{detailData.profile.storePhone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Years in Business</p>
                        <p className="text-sm text-slate-800 mt-0.5">
                          {String(detailData.profile.yearsInBusiness || '0').replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>

                    {/* Address & policies */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b">Addresses & Policies</h4>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Registered Business Address</p>
                        {detailData.profile.businessAddress ? (
                          <p className="text-sm text-slate-800 font-medium mt-1">
                            {detailData.profile.businessAddress.street}, {detailData.profile.businessAddress.city}, {detailData.profile.businessAddress.state} ({detailData.profile.businessAddress.lga} LGA)
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 italic mt-0.5">Not provided.</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Return Policy</p>
                        <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">{detailData.profile.returnPolicy || 'No policy.'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Shipping Policy</p>
                        <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">{detailData.profile.shippingPolicy || 'No policy.'}</p>
                      </div>
                    </div>

                    {/* Social links */}
                    {detailData.profile.socialLinks && (
                      <div className="md:col-span-2 space-y-3">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b">Social Media Integration</h4>
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600">
                          {detailData.profile.socialLinks.instagram && (
                            <span className="bg-slate-50 border px-3 py-1.5 rounded-lg">Instagram: {detailData.profile.socialLinks.instagram}</span>
                          )}
                          {detailData.profile.socialLinks.facebook && (
                            <span className="bg-slate-50 border px-3 py-1.5 rounded-lg">Facebook: {detailData.profile.socialLinks.facebook}</span>
                          )}
                          {detailData.profile.socialLinks.twitter && (
                            <span className="bg-slate-50 border px-3 py-1.5 rounded-lg">Twitter: {detailData.profile.socialLinks.twitter}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Uploaded Documents Verify Queue */}
                {detailTab === 'docs' && (
                  <div className="space-y-6">
                    {detailData.documents.length > 0 ? (
                      detailData.documents.map((doc) => (
                        <div key={doc.id} className="border rounded-md p-5 hover:shadow-sm transition flex flex-col md:flex-row md:items-start justify-between gap-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-brand-50 border border-brand-100 rounded-md text-[#228b22] shrink-0">
                              <FileText size={24} />
                            </div>
                            <div className="space-y-1 font-semibold">
                              <p className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">{doc.documentType.replace('_', ' ')}</p>
                              <p className="text-xs text-gray-500 font-mono flex items-center gap-1.5">
                                File: <span className="underline select-all">{doc.originalFilename}</span> ({Math.ceil(doc.fileSizeBytes / 1024)} KB)
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                                  doc.status === 'verified'
                                    ? 'bg-emerald-50 text-slate-700 border-emerald-100'
                                    : doc.status === 'pending'
                                      ? 'bg-amber-50 text-slate-700 border-amber-100'
                                      : 'bg-rose-50 text-slate-700 border-rose-100'
                                }`}>
                                  Status: {doc.status}
                                </span>
                                {doc.rejectionReason && (
                                  <span className="text-[10px] text-slate-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                                    Reason: {doc.rejectionReason}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                            {/* File view button */}
                            <button
                              type="button"
                              onClick={() => {
                                const url = doc.documentUrl.toLowerCase();
                                let type: 'image' | 'pdf' | 'other' = 'other';
                                if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.webp') || url.endsWith('.gif')) {
                                  type = 'image';
                                } else if (url.endsWith('.pdf')) {
                                  type = 'pdf';
                                }
                                setDocLightbox({
                                  open: true,
                                  url: doc.documentUrl,
                                  type,
                                  name: doc.documentType.replace('_', ' ')
                                });
                              }}
                              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border text-slate-700 text-xs font-bold rounded-md flex items-center justify-center gap-1"
                            >
                              View Document File
                            </button>

                            {/* Verification trigger buttons */}
                            {detailData.profile.applicationStatus !== 'approved' && doc.status === 'pending' && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleDocumentReview(doc.id, 'verified')}
                                  className="p-2 text-slate-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-md transition"
                                  title="Approve / Verify Document"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => handleDocumentReview(doc.id, 'rejected')}
                                  className="p-2 text-slate-700 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-md transition"
                                  title="Reject Document"
                                >
                                  <X size={14} />
                                </button>
                                <button
                                  onClick={() => handleDocumentReview(doc.id, 'requires_resubmission')}
                                  className="p-2 text-slate-700 bg-amber-50 border border-amber-100 hover:bg-amber-100 rounded-md transition"
                                  title="Request Resubmission"
                                >
                                  <RefreshCw size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="p-10 text-center text-gray-500 font-semibold">No uploaded document records exist.</p>
                    )}
                  </div>
                )}

                {/* Masked Bank Accounts */}
                {detailTab === 'bank' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {detailData.bankAccounts.length > 0 ? (
                      detailData.bankAccounts.map((account) => (
                        <div key={account.id} className="border rounded-md p-6 bg-slate-50/50 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-extrabold text-slate-800 text-sm">{account.bankName}</p>
                              <p className="text-xs text-gray-400 font-semibold mt-1">Bank Code: {account.bankCode} • {account.accountType.toUpperCase()}</p>
                            </div>
                            {account.isPrimary && (
                              <span className="text-[10px] font-black uppercase bg-brand-50 border border-brand-100 text-[#228b22] px-2 py-0.5 rounded">
                                Primary payout
                              </span>
                            )}
                          </div>
                          <div className="bg-white p-4 rounded-md border border-slate-100 flex items-center justify-between font-semibold">
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase">Account Name</p>
                              <p className="text-sm text-slate-800">{account.accountName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 uppercase">Account Number</p>
                              <p className="text-sm text-slate-800 font-mono">{account.accountNumber}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="p-10 text-center text-gray-500 font-semibold">No bank account details configured.</p>
                    )}
                  </div>
                )}

                {/* Earnings & ledger list */}
                {detailTab === 'earnings' && (
                  <div className="space-y-6">
                    {/* Account Balance Summaries */}
                    {detailData.earnings ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="border rounded-md p-4 text-center bg-slate-50/30">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Available Balance</span>
                          <p className="text-base font-black text-slate-800 mt-1">{Number(detailData.earnings.availableBalance).toLocaleString()} NGN</p>
                        </div>
                        <div className="border rounded-md p-4 text-center bg-slate-50/30">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pending Balance</span>
                          <p className="text-base font-black text-slate-800 mt-1">{Number(detailData.earnings.pendingBalance).toLocaleString()} NGN</p>
                        </div>
                        <div className="border rounded-md p-4 text-center bg-slate-50/30">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Withdrawn</span>
                          <p className="text-base font-black text-slate-800 mt-1">{Number(detailData.earnings.totalWithdrawn).toLocaleString()} NGN</p>
                        </div>
                        <div className="border rounded-md p-4 text-center bg-slate-50/30">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Lifetime Earnings</span>
                          <p className="text-base font-black text-slate-800 mt-1">{Number(detailData.earnings.lifetimeEarnings).toLocaleString()} NGN</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 font-bold uppercase text-center ">Failed to load live earnings balances.</p>
                    )}

                    {/* Earnings History Ledger */}
                    <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-6 py-4 border-b">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Earnings Ledger History</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs font-semibold">
                          <thead className="bg-slate-50/50 border-b">
                            <tr>
                              <th className="p-3 text-[10px] text-gray-400 uppercase">Order Ref</th>
                              <th className="p-3 text-[10px] text-gray-400 uppercase text-center">Gross Amount</th>
                              <th className="p-3 text-[10px] text-gray-400 uppercase text-center">Platform Comm</th>
                              <th className="p-3 text-[10px] text-gray-400 uppercase text-center">Gateway Fee</th>
                              <th className="p-3 text-[10px] text-gray-400 uppercase text-center">Net Payout</th>
                              <th className="p-3 text-[10px] text-gray-400 uppercase text-center">Status</th>
                              <th className="p-3 text-[10px] text-gray-400 uppercase">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {detailData.earningsHistory && detailData.earningsHistory.length > 0 ? (
                              detailData.earningsHistory.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/20">
                                  <td className="p-3 text-slate-700 font-extrabold">{item.orderNumber}</td>
                                  <td className="p-3 text-center text-slate-800">{Number(item.grossAmount).toLocaleString()} NGN</td>
                                  <td className="p-3 text-center text-slate-500">{Number(item.commissionAmount).toLocaleString()} NGN ({item.commissionRate}%)</td>
                                  <td className="p-3 text-center text-slate-500">{Number(item.gatewayFeeAmount).toLocaleString()} NGN</td>
                                  <td className="p-3 text-center text-slate-800 font-black">{Number(item.netAmount).toLocaleString()} NGN</td>
                                  <td className="p-3 text-center">
                                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] uppercase font-extrabold border">
                                      {item.status}
                                    </span>
                                  </td>
                                  <td className="p-3 text-gray-400 font-medium">{new Date(item.date).toLocaleDateString()}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="p-10 text-center text-gray-400 font-semibold">No ledger entries.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audit log for vendor */}
                {detailTab === 'audit' && (
                  <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Vendor Specific Audit Trail</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-semibold">
                        <thead className="bg-slate-50/50 border-b">
                          <tr>
                            <th className="p-3 text-[10px] text-gray-400 uppercase">Action</th>
                            <th className="p-3 text-[10px] text-gray-400 uppercase">Actor</th>
                            <th className="p-3 text-[10px] text-gray-400 uppercase">Note / Explanation</th>
                            <th className="p-3 text-[10px] text-gray-400 uppercase">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {detailData.recentAuditLog.length > 0 ? (
                            detailData.recentAuditLog.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/20">
                                <td className="p-3">
                                  <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 border text-slate-700">
                                    {log.action}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-600 font-bold">{log.actorRole} ({log.actorId ? 'ID' : 'System'})</td>
                                <td className="p-3 text-slate-600 font-medium leading-relaxed max-w-xs">{log.notes}</td>
                                <td className="p-3 text-gray-400 font-medium">{new Date(log.createdAt).toLocaleString()}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-10 text-center text-gray-400 font-semibold">No audit logs found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer review buttons */}
              {detailData.profile.applicationStatus !== 'approved' && (
                <div className="p-6 border-t bg-slate-50/50 flex flex-wrap gap-2 justify-end shrink-0 select-none dashboard-dialog-footer">
                  {/* Approve vendor application */}
                  {(detailData.profile.applicationStatus === 'submitted' || detailData.profile.applicationStatus === 'in_review') && (
                    <button
                      onClick={() => handleApproveVendor(detailData.profile)}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-xs font-black shadow-sm hover:shadow-sm transition-all"
                    >
                      Approve Application
                    </button>
                  )}

                  {/* Reject application */}
                  {(detailData.profile.applicationStatus === 'submitted' || detailData.profile.applicationStatus === 'in_review') && (
                    <button
                      onClick={() => { setActionVendor(detailData.profile); setActionType('reject'); }}
                      className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-slate-700 rounded-md text-xs font-black transition-all"
                    >
                      Reject Application
                    </button>
                  )}

                  {/* Requires resubmission note — Only for application in review */}
                  {detailData.profile.applicationStatus === 'in_review' && (
                    <button
                      onClick={() => { setActionVendor(detailData.profile); setActionType('resubmission'); }}
                      className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-slate-700 rounded-md text-xs font-black transition-all"
                    >
                      Request Corrections
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN ASSIGN REVIEWER MODAL */}
      <AnimatePresence>
        {assignVendorTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-[3px]  dashboard-dialog-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full overflow-hidden dashboard-dialog dashboard-dialog--form" role="dialog" aria-modal="true" aria-labelledby="VendorManagementView-dialog-1-title"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50 dashboard-dialog-header">
                <h3 className="font-extrabold text-slate-800 text-base" id="VendorManagementView-dialog-1-title">Assign Application Reviewer</h3>
                <button onClick={() => setAssignVendorTarget(null)} className="p-1 hover:bg-slate-100 rounded-md transition dashboard-dialog-close" aria-label="Close dialog" type="button">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                  Assign the submitted application of <strong className="text-slate-700">{assignVendorTarget.storeName}</strong> to an administrative reviewer. The status will move to <strong className="text-[#228b22]">In Review</strong> automatically.
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Reviewer Admin Name</label>
                  <select
                    value={selectedAdminId}
                    onChange={(e) => setSelectedAdminId(e.target.value)}
                    className="w-full p-3 rounded-md border bg-slate-50 font-semibold text-xs text-slate-700 outline-none focus:bg-white focus:ring-2 ring-brand-100 transition"
                  >
                    <option value="">{adminsList.length ? 'Select admin...' : 'No admins available'}</option>
                    {adminsList.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.firstName} {admin.lastName} ({admin.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-6 border-t flex gap-2 justify-end bg-slate-50/50 dashboard-dialog-footer">
                <button
                  onClick={() => setAssignVendorTarget(null)}
                  className="px-4 py-2 border rounded-md text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignReviewerSubmit}
                  disabled={!selectedAdminId}
                  className="px-4 py-2 bg-[#228b22] text-white rounded-md text-xs font-bold disabled:opacity-50 transition"
                >
                  Assign Application
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOUBLE CONFIRM ASSIGN MODAL */}
      <AnimatePresence>
        {confirmAssignModal && assignVendorTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-[3px]  dashboard-dialog-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full p-6 text-center dashboard-dialog dashboard-dialog--compact dashboard-dialog--padded" role="dialog" aria-modal="true" aria-labelledby="VendorManagementView-dialog-2-title"
            >
              <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-md flex items-center justify-center mx-auto mb-4 border border-brand-100 dashboard-dialog-icon">
                <UserCheck size={24} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg" id="VendorManagementView-dialog-2-title">Confirm Reviewer Assignment</h3>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-3">
                Confirm you want to assign <strong className="text-slate-700">{assignVendorTarget.storeName}</strong> application to{" "}
                <strong className="text-slate-700">
                  {(() => {
                    const ad = adminsList.find((a) => a.id === selectedAdminId);
                    return ad ? `${ad.firstName} ${ad.lastName}` : 'the reviewer';
                  })()}
                </strong>?
              </p>
              <div className="flex gap-2.5 mt-8">
                <button
                  onClick={() => setConfirmAssignModal(false)}
                  className="flex-1 py-3 border rounded-md text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAssignment}
                  className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-md text-xs font-bold transition shadow-sm"
                >
                  Confirm Assignment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRUST LEVEL UPGRADE DIALOG */}
      <AnimatePresence>
        {trustLevelVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-[3px]  dashboard-dialog-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full overflow-hidden dashboard-dialog dashboard-dialog--form" role="dialog" aria-modal="true" aria-labelledby="VendorManagementView-dialog-3-title"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50 dashboard-dialog-header">
                <h3 className="font-extrabold text-slate-800 text-base" id="VendorManagementView-dialog-3-title">Adjust Seller Trust Level</h3>
                <button onClick={() => setTrustLevelVendor(null)} className="p-1 hover:bg-slate-100 rounded-md transition dashboard-dialog-close" aria-label="Close dialog" type="button">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleUpgradeTrustSubmit}>
                <div className="p-6 space-y-4">
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    Set the administrative trust level for <strong className="text-slate-700">{trustLevelVendor.storeName}</strong>. This dictates their marketplace visibility tiers.
                  </p>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Trust Tier Level</label>
                    <select
                      value={selectedTrustLevel}
                      onChange={(e) => setSelectedTrustLevel(e.target.value)}
                      className="w-full p-3 rounded-md border bg-slate-50 font-semibold text-xs text-slate-700 outline-none focus:bg-white focus:ring-2 ring-brand-100 transition"
                    >
                      <option value="new_seller">New Seller</option>
                      <option value="verified_seller">Verified Seller</option>
                      <option value="trusted_seller">Trusted Seller</option>
                      <option value="top_seller">Top Seller</option>
                      <option value="official_brand">Official Brand</option>
                    </select>
                  </div>
                </div>
                <div className="p-6 border-t flex gap-2 justify-end bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setTrustLevelVendor(null)}
                    className="px-4 py-2 border rounded-md text-xs font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#228b22] text-white rounded-md text-xs font-bold shadow-sm transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMMISSION RATE MANAGE MODAL (Super Admin) */}
      <AnimatePresence>
        {commissionModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-[3px]  dashboard-dialog-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 dashboard-dialog dashboard-dialog--form" role="dialog" aria-modal="true" aria-labelledby="VendorManagementView-dialog-4-title"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50 dashboard-dialog-header">
                <h3 className="font-extrabold text-slate-800 text-base" id="VendorManagementView-dialog-4-title">
                  {commissionModal.mode === 'create' ? 'Create Commission Configuration' : 'Edit Configuration Rate'}
                </h3>
                <button onClick={() => setCommissionModal({ ...commissionModal, isOpen: false })} className="p-1 hover:bg-slate-100 rounded-md transition dashboard-dialog-close" aria-label="Close dialog" type="button">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCommissionSubmit}>
                <div className="p-6 space-y-4 font-semibold text-xs text-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Commission Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={commissionModal.commissionRate}
                        onChange={(e) => setCommissionModal({ ...commissionModal, commissionRate: Number(e.target.value) })}
                        className="w-full p-3 rounded-md border bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-brand-100 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Gateway Fee Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={commissionModal.gatewayFeeRate}
                        onChange={(e) => setCommissionModal({ ...commissionModal, gatewayFeeRate: Number(e.target.value) })}
                        className="w-full p-3 rounded-md border bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-brand-100 transition"
                      />
                    </div>
                  </div>

                  {commissionModal.mode === 'create' && (() => {
                    const globalConfigExists = commissions.some(c => !c.categoryId && !c.vendorId);
                    const scopeRequired = globalConfigExists;
                    return (
                      <>
                        {globalConfigExists ? (
                          <div className="p-3 bg-rose-50 border border-rose-100 rounded-md text-xs text-slate-700 font-medium leading-relaxed">
                            <strong>⚠ Global config already exists.</strong> You must specify a <em>Category</em> or <em>Vendor</em> scope for this new configuration — another global config cannot be created.
                          </div>
                        ) : (
                          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-md text-xs text-slate-700 font-medium leading-relaxed">
                            <strong>No global config yet.</strong> Leave both fields blank to create the <em>Global</em> platform default, or select a scope to limit this config to a specific category or vendor.
                          </div>
                        )}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            Category Scope {scopeRequired ? <span className="text-slate-500">*</span> : '(Optional)'}
                          </label>
                          <select
                            value={commissionModal.categoryId}
                            onChange={(e) => setCommissionModal({ ...commissionModal, categoryId: e.target.value })}
                            required={scopeRequired && !commissionModal.vendorId}
                            className="w-full p-3 rounded-md border bg-slate-50 font-semibold text-xs text-slate-700 outline-none focus:bg-white focus:ring-2 ring-brand-100 transition"
                          >
                            <option value="">— {scopeRequired ? 'Select a category scope' : 'Global / No Category Scope'} —</option>
                            {categoriesList.map((cat: any) => (
                              <option key={cat.id || cat._id} value={cat.id || cat._id}>
                                {cat.name || cat.title || cat.id}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            Vendor Scope {scopeRequired ? <span className="text-slate-500">*</span> : '(Optional)'}
                          </label>
                          <select
                            value={commissionModal.vendorId}
                            onChange={(e) => setCommissionModal({ ...commissionModal, vendorId: e.target.value })}
                            required={scopeRequired && !commissionModal.categoryId}
                            className="w-full p-3 rounded-md border bg-slate-50 font-semibold text-xs text-slate-700 outline-none focus:bg-white focus:ring-2 ring-brand-100 transition"
                          >
                            <option value="">— {scopeRequired ? 'Select a vendor scope' : 'Global / No Vendor Scope'} —</option>
                            {allVendorsList.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.storeName}
                              </option>
                            ))}
                          </select>
                        </div>
                        {scopeRequired && !commissionModal.categoryId && !commissionModal.vendorId && (
                          <p className="text-[10px] text-slate-500 font-semibold">
                            At least one scope (category or vendor) is required when a global config already exists.
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
                <div className="p-6 border-t flex gap-2 justify-end bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setCommissionModal({ ...commissionModal, isOpen: false })}
                    className="px-4 py-2 border rounded-md text-xs font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#228b22] text-white rounded-md text-xs font-bold shadow-sm transition"
                  >
                    Save Configuration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GENERIC ACTION NOTE / REASON MODALS (Scale transition animation) */}
      <AnimatePresence>
        {actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-[3px]  dashboard-dialog-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full overflow-hidden dashboard-dialog dashboard-dialog--form" role="dialog" aria-modal="true" aria-labelledby="VendorManagementView-dialog-5-title"
            >
              {/* Header */}
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50 dashboard-dialog-header">
                <h3 className="font-extrabold text-slate-800 text-base" id="VendorManagementView-dialog-5-title">
                  {actionType === 'reject' && 'Reject Vendor Application'}
                  {actionType === 'suspend' && 'Suspend Vendor Store'}
                  {actionType === 'resubmission' && 'Request Document Corrections'}
                  {actionType === 'ban' && 'Ban Vendor Account'}
                  {actionType === 'unban' && 'Unban Vendor Account'}
                  {actionType === 'override' && 'Override Previous Decision'}
                  {actionType === 'process_withdrawal' && 'Process Withdrawal Payout'}
                  {actionType === 'override_withdrawal' && 'Force-Override Payout Status'}
                  {actionType === 'bulk_reject' && `Bulk Reject ${selectedVendorIds.length} Applications`}
                </h3>
                <button onClick={() => { setActionType(null); setActionReason(''); setActionVendor(null); setActionWithdrawal(null); }} className="p-1 hover:bg-slate-100 rounded-md transition dashboard-dialog-close" aria-label="Close dialog" type="button">
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={
                actionType === 'process_withdrawal' ? handleProcessWithdrawal :
                actionType === 'override_withdrawal' ? handleOverrideWithdrawal :
                handleReasonActionSubmit
              }>
                <div className="p-6 space-y-4 font-semibold text-xs text-slate-700">
                  {/* Context Text */}
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                    {actionVendor && actionType !== 'bulk_reject' && (
                      <>
                        You are performing this action on <strong className="text-slate-700">{actionVendor.storeName}</strong>.
                        Please explain your decision. This note is logged in the audit trail.
                      </>
                    )}
                    {actionType === 'bulk_reject' && (
                      <>
                        You are about to reject <strong className="text-slate-700">{selectedVendorIds.length} selected vendor applications</strong>.
                        This action is irreversible. Please provide a rejection reason that applies to all selected vendors.
                      </>
                    )}
                    {actionWithdrawal && (
                      <>
                        Processing payout reference <strong className="text-slate-700">{actionWithdrawal.reference}</strong> of{" "}
                        <strong className="text-slate-700">{Number(actionWithdrawal.amount).toLocaleString()} NGN</strong>.
                      </>
                    )}
                  </p>

                  {/* Context fields for override decision */}
                  {actionType === 'override' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Override Decision Status</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="override_decision"
                            checked={actionDecision === 'approved'}
                            onChange={() => setActionDecision('approved')}
                            className="text-[#228b22] focus:ring-[#228b22]"
                          />
                          <span>Approved</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="override_decision"
                            checked={actionDecision === 'rejected'}
                            onChange={() => setActionDecision('rejected')}
                            className="text-[#228b22] focus:ring-[#228b22]"
                          />
                          <span>Rejected</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Context fields for processing withdrawal payouts */}
                  {(actionType === 'process_withdrawal' || actionType === 'override_withdrawal') && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Payout Action Outcome</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="wd_action"
                            checked={withdrawalAction === 'complete'}
                            onChange={() => setWithdrawalAction('complete')}
                            className="text-[#228b22] focus:ring-[#228b22]"
                          />
                          <span>Completed Payout</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="wd_action"
                            checked={withdrawalAction === 'fail'}
                            onChange={() => setWithdrawalAction('fail')}
                            className="text-[#228b22] focus:ring-[#228b22]"
                          />
                          <span>Failed Payout</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Reason Text Area */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      {(actionType === 'process_withdrawal' && withdrawalAction === 'complete') ? 'Process Notes (Optional)' : 'Explanation / Reason Note'}
                    </label>
                    <textarea
                      required={
                        actionType !== 'process_withdrawal' || withdrawalAction === 'fail'
                      }
                      rows={3}
                      placeholder="Explain details..."
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      className="w-full p-3 rounded-md border bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-brand-100 transition font-medium text-xs"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t flex gap-2 justify-end bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => { setActionType(null); setActionReason(''); setActionVendor(null); setActionWithdrawal(null); }}
                    className="px-4 py-2 border rounded-md text-xs font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#228b22] text-white rounded-md text-xs font-bold shadow-sm transition"
                  >
                    Confirm Action
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM CONFIRM MODAL (Replaces alerts and window.confirm) */}
      <AnimatePresence>
        {confirmModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-[3px]  dashboard-dialog-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full overflow-hidden dashboard-dialog dashboard-dialog--form" role="dialog" aria-modal="true" aria-labelledby="VendorManagementView-dialog-6-title"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50 dashboard-dialog-header">
                <h3 className="font-extrabold text-slate-800 text-base" id="VendorManagementView-dialog-6-title">{confirmModal.title}</h3>
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                  className="p-1 hover:bg-slate-100 rounded-md transition dashboard-dialog-close" aria-label="Close dialog" type="button"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
              <div className="p-6 border-t flex gap-2 justify-end bg-slate-50/50 dashboard-dialog-footer">
                <button
                  type="button"
                  onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                  className="px-4 py-2 border rounded-md text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="px-4 py-2 bg-[#228b22] text-white rounded-md text-xs font-bold shadow-sm transition"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK ACTION SKIPPED DETAILS WARNING MODAL */}
      <AnimatePresence>
        {skippedModal && skippedModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-[3px]  dashboard-dialog-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full overflow-hidden dashboard-dialog dashboard-dialog--form" role="dialog" aria-modal="true" aria-labelledby="VendorManagementView-dialog-7-title"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50 dashboard-dialog-header">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2" id="VendorManagementView-dialog-7-title">
                  <AlertTriangle className="text-slate-500" size={18} /> Bulk Action Summary (Skipped Warnings)
                </h3>
                <button
                  onClick={() => setSkippedModal(null)}
                  className="p-1 hover:bg-slate-100 rounded-md transition dashboard-dialog-close" aria-label="Close dialog" type="button"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto dashboard-dialog-body">
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  Bulk {skippedModal.action === 'approved' ? 'approval' : 'rejection'} completed.
                  {skippedModal.approved !== undefined && <span className="block mt-1 text-slate-600 font-bold">Successfully Approved: {skippedModal.approved}</span>}
                  {skippedModal.rejected !== undefined && <span className="block mt-1 text-slate-600 font-bold">Successfully Rejected: {skippedModal.rejected}</span>}
                  <span className="block text-slate-600 font-bold">Skipped/Failed: {skippedModal.skipped}</span>
                </p>
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ineligible Vendor Details:</h4>
                  {skippedModal.details.map((detail, idx) => {
                    const name = allVendorsList.find(v => v.id === detail.vendorId)?.storeName || detail.vendorId;
                    return (
                      <div key={idx} className="p-3 bg-rose-50 border border-rose-100 rounded-md space-y-1">
                        <p className="text-xs font-bold text-slate-700">{name}</p>
                        <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">{detail.reason}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-6 border-t flex justify-end bg-slate-50/50 dashboard-dialog-footer">
                <button
                  type="button"
                  onClick={() => setSkippedModal(null)}
                  className="px-5 py-2 bg-[#228b22] text-white rounded-md text-xs font-bold shadow-sm transition"
                >
                  Close & Acknowledge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCUMENT LIGHTBOX MODAL */}
      <AnimatePresence>
        {docLightbox && docLightbox.open && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center dashboard-dialog-overlay">
            <div className="dashboard-dialog dashboard-dialog--wide flex flex-col" role="dialog" aria-modal="true" aria-labelledby="vendor-document-title">
            <div className="dashboard-dialog-header flex items-center justify-between">
              <h3 id="vendor-document-title">{docLightbox.name}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={docLightbox.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 border border-slate-200 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-50"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={() => setDocLightbox(null)}
                  aria-label="Close document" className="dashboard-dialog-close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="dashboard-dialog-body flex min-h-0 items-center justify-center overflow-y-auto">
              {docLightbox.type === 'image' ? (
                <img
                  src={docLightbox.url}
                  alt={docLightbox.name}
                  className="max-w-full max-h-[65dvh] object-contain rounded-md animate-in zoom-in-95 duration-200"
                />
              ) : docLightbox.type === 'pdf' ? (
                <iframe
                  src={docLightbox.url}
                  title={docLightbox.name}
                  className="w-full h-[65dvh] border-0 rounded-md"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 p-10 text-center text-slate-500">
                  <FileText size={48} className="text-slate-300" />
                  <p className="text-sm font-bold">Preview not available for this file type</p>
                  <p className="text-xs">You can open this file in a new window or download it to view.</p>
                  <a
                    href={docLightbox.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 px-5 py-2.5 bg-[#228b22] text-white rounded-md text-xs font-bold shadow-sm transition"
                  >
                    Open Document File
                  </a>
                </div>
              )}
            </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCUMENT REVIEW REASON MODAL */}
      <AnimatePresence>
        {docReviewModal && docReviewModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-[3px]  dashboard-dialog-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full overflow-hidden dashboard-dialog dashboard-dialog--form" role="dialog" aria-modal="true" aria-labelledby="VendorManagementView-dialog-8-title"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50 dashboard-dialog-header">
                <h3 className="font-extrabold text-slate-800 text-base" id="VendorManagementView-dialog-8-title">
                  Document Review: {docReviewModal.action === 'rejected' ? 'Reject Document' : 'Request Resubmission'}
                </h3>
                <button
                  onClick={() => setDocReviewModal(null)}
                  className="p-1 hover:bg-slate-100 rounded-md transition dashboard-dialog-close" aria-label="Close dialog" type="button"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!docReviewModal.reason.trim()) {
                  toast.error('A reason note is required.');
                  return;
                }
                const { docId, action, reason } = docReviewModal;
                setDocReviewModal(null);
                await _executeDocumentReview(docId, action, reason.trim());
              }}>
                <div className="p-6 space-y-4 font-semibold text-xs text-slate-700">
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                    Please provide an explanation for rejecting or requesting resubmission of this document. This note will be visible to the seller.
                  </p>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Reason / Feedback Note</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Explain what is wrong with the document..."
                      value={docReviewModal.reason}
                      onChange={(e) => setDocReviewModal({ ...docReviewModal, reason: e.target.value })}
                      className="w-full p-3 rounded-md border bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-brand-100 transition font-medium text-xs"
                    />
                  </div>
                </div>
                <div className="p-6 border-t flex gap-2 justify-end bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setDocReviewModal(null)}
                    className="px-4 py-2 border rounded-md text-xs font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#228b22] text-white rounded-md text-xs font-bold shadow-sm transition"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
