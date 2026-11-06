import RecordActions from "@/components/admin/RecordActions";
import RecordStatus from "@/components/admin/RecordStatus";
import React, { useState, useMemo } from 'react';
import { Calendar, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Mail, Phone, Clock, AlertCircle, CheckCircle, XCircle, Eye, Trash2, Power, PowerOff, User, Ban } from 'lucide-react';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'pending' | 'active' | 'deactivated' | 'blocked' | 'deleted';
  role: 'sub_admin';
  avatar?: string;
  invitedAt: string;
  activatedAt?: string;
  lastUpdated: string;
  permissions: {
    manageProducts: boolean;
    manageOrders: boolean;
    manageVendors: boolean;
    viewAnalytics: boolean;
  };
}

interface AdminTableProps {
  data: AdminUser[];
  searchQuery?: string;
  onViewDetails?: (admin: AdminUser) => void;
  onDeactivate?: (id: string) => void;
  onActivate?: (id: string) => void;
  onBlock?: (id: string) => void;
  onUnblock?: (id: string) => void;
  onDelete?: (id: string) => void;
  onResendInvite?: (id: string) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  sortOrder?: 'asc' | 'desc';
  onSortOrderChange?: (order: 'asc' | 'desc') => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

const statusStyles = {
  pending: {
    label: 'Pending Invite',
    className: 'bg-amber-100 text-amber-600 border-amber-200',
    icon: Clock
  },
  active: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    icon: CheckCircle
  },
  deactivated: {
    label: 'Deactivated',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: AlertCircle
  },
  blocked: {
    label: 'Blocked',
    className: 'bg-red-100 text-red-600 border-red-200',
    icon: Ban
  },
  deleted: {
    label: 'Deleted',
    className: 'bg-gray-100 text-gray-400 border-gray-200',
    icon: XCircle
  }
};

const allStatuses = ['All', 'pending', 'active', 'deactivated', 'blocked', 'deleted'];

/** Tooltip wrapper for desktop — matches ProductTable/UserTable styling */

export default function AdminTable({ 
  data, 
  searchQuery = '', 
  onViewDetails,
  onDeactivate,
  onActivate,
  onBlock,
  onUnblock,
  onDelete,
  onResendInvite,
  currentPage: serverPage,
  totalPages: serverTotalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  isLoading = false,
  sortOrder: serverSortOrder,
  onSortOrderChange,
  statusFilter: serverStatusFilter,
  onStatusFilterChange,
}: AdminTableProps) {
  const [localPage, setLocalPage] = useState(1);
  const [localSortOrder, setLocalSortOrder] = useState<'asc' | 'desc'>('desc');
  const [localStatusFilter, setLocalStatusFilter] = useState<string>('All');
  
  const isServerPaginated = Boolean(onPageChange);

  const currentPage = serverPage !== undefined ? serverPage : localPage;
  const sortOrder = serverSortOrder !== undefined ? serverSortOrder : localSortOrder;
  const statusFilter = serverStatusFilter !== undefined ? serverStatusFilter : localStatusFilter;

  const setStatusFilter = (val: string) => {
    if (onStatusFilterChange) onStatusFilterChange(val);
    else setLocalStatusFilter(val);
  };
  const setSortOrder = (val: 'asc' | 'desc') => {
    if (onSortByChangeWrapper) onSortByChangeWrapper(val);
    else setLocalSortOrder(val);
  };

  const onSortByChangeWrapper = (val: 'asc' | 'desc') => {
    onSortOrderChange?.(val);
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (!isServerPaginated && searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(admin => 
        admin.firstName?.toLowerCase().includes(query) ||
        admin.lastName?.toLowerCase().includes(query) ||
        `${admin.firstName} ${admin.lastName}`.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query) ||
        admin.phone.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(admin => admin.status === statusFilter);
    }

    // Sort by invited date (newest first)
    if (!isServerPaginated) {
      result.sort((a, b) => {
        const dateA = new Date(a.invitedAt).getTime();
        const dateB = new Date(b.invitedAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
    }

    return result;
  }, [data, searchQuery, statusFilter, sortOrder, isServerPaginated]);

  const totalPages =
    serverTotalPages || Math.ceil(filteredAndSortedData.length / itemsPerPage) || 1;

  const paginatedData = isServerPaginated
    ? filteredAndSortedData
    : filteredAndSortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

  const displayTotal = totalItems ?? filteredAndSortedData.length;
  const showingFrom =
    displayTotal === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(
    (currentPage - 1) * itemsPerPage + paginatedData.length,
    displayTotal
  );

  const goToPage = (page: number) => {
    const nextPage = Math.min(totalPages, Math.max(1, page));
    if (isServerPaginated) {
      onPageChange?.(nextPage);
    } else {
      setLocalPage(nextPage);
    }
  };

  const handleSortToggle = () => {
    const nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(nextOrder);
  };

  React.useEffect(() => {
    if (!isServerPaginated) {
      setLocalPage(1);
    }
  }, [isServerPaginated, searchQuery, statusFilter]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  const StatusBadge = ({ status }: { status: AdminUser['status'] }) => (
    <RecordStatus value={status}>{statusStyles[status].label}</RecordStatus>
  );

  return (
    <div className="bg-white rounded-md border shadow-sm overflow-hidden">
      {/* Action Bar - Desktop */}
      <div className="hidden md:flex justify-end items-center p-4 border-b gap-4 bg-white">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select 
            className="bg-gray-50 border-none text-sm font-medium text-slate-700 rounded-lg p-2 outline-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {allStatuses.map(status => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleSortToggle}
          className="p-2 hover:bg-gray-50 rounded-lg transition text-gray-500 flex items-center gap-2 text-sm font-medium"
        >
          <ArrowUpDown size={16} />
          Sort by Invite Date: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      {/* Mobile Action Bar */}
      <div className="md:hidden flex justify-between items-center p-4 border-b bg-gray-50/50">
        <h2 className="text-lg font-bold text-slate-800">Admin Users</h2>
        <div className="flex gap-2">
          <select 
            className="bg-white border text-sm font-medium text-slate-700 rounded-lg px-2 py-1 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {allStatuses.map(status => (
              <option key={status} value={status}>{status === 'All' ? 'All' : status}</option>
            ))}
          </select>
          <button onClick={handleSortToggle} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg bg-white border">
            <ArrowUpDown size={18} />
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-gray-50/50 border-b">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Admin</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Contact</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Invited</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Activated</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? paginatedData.map((admin) => (
              <tr 
                key={admin.id} 
                onClick={() => onViewDetails?.(admin)}
                className="border-b last:border-0 hover:bg-gray-50/50 transition cursor-pointer group"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
                      {admin.avatar ? (
                        <img src={admin.avatar} alt={`${admin.firstName} ${admin.lastName}`} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(admin.firstName, admin.lastName)
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 text-sm">
                        {admin.firstName} {admin.lastName}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Mail size={12} className="text-gray-400" />
                      {admin.email}
                    </span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Phone size={12} className="text-gray-400" />
                      {admin.phone}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <StatusBadge status={admin.status} />
                </td>
                <td className="p-4 text-xs font-medium text-gray-500">
                  {formatDate(admin.invitedAt)}
                </td>
                <td className="p-4 text-xs font-medium text-gray-500">
                  {admin.activatedAt ? formatDate(admin.activatedAt) : '—'}
                </td>
                <td className="p-4 text-right">
                  <RecordActions name={admin.firstName + ' ' + admin.lastName} actions={[
  onViewDetails && { label: 'View details', onSelect: () => onViewDetails(admin) },
  admin.status === 'pending' && onResendInvite && { label: 'Resend invitation', onSelect: () => onResendInvite(admin.id) },
  admin.status === 'active' && onDeactivate && { label: 'Deactivate account', onSelect: () => onDeactivate(admin.id) },
  admin.status === 'active' && onBlock && { label: 'Block account', onSelect: () => onBlock(admin.id), destructive: true },
  admin.status === 'blocked' && onUnblock && { label: 'Unblock account', onSelect: () => onUnblock(admin.id) },
  admin.status === 'deactivated' && onActivate && { label: 'Activate account', onSelect: () => onActivate(admin.id) },
  admin.status !== 'deleted' && onDelete && { label: 'Delete account', onSelect: () => onDelete(admin.id), destructive: true },
]} />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col p-4 space-y-4 bg-gray-50/50">
        {paginatedData.length > 0 ? paginatedData.map((admin) => (
          <div 
            key={admin.id} 
            onClick={() => onViewDetails?.(admin)}
            className="bg-white p-4 rounded-md shadow-sm border border-gray-100 space-y-3 cursor-pointer hover:border-brand-200 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-brand-100 flex items-center justify-center text-base font-bold text-brand-700">
                  {getInitials(admin.firstName, admin.lastName)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{admin.firstName} {admin.lastName}</p>
                  <StatusBadge status={admin.status} />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 pt-2 border-t border-gray-50">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail size={12} />
                <span className="truncate">{admin.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone size={12} />
                <span>{admin.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={12} />
                <span>Invited: {formatDate(admin.invitedAt)}</span>
              </div>
              {admin.activatedAt && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle size={12} />
                  <span>Activated: {formatDate(admin.activatedAt)}</span>
                </div>
              )}
            </div>

            <RecordActions name={admin.firstName + ' ' + admin.lastName} actions={[
  onViewDetails && { label: 'View details', onSelect: () => onViewDetails(admin) },
  admin.status === 'pending' && onResendInvite && { label: 'Resend invitation', onSelect: () => onResendInvite(admin.id) },
  admin.status === 'active' && onDeactivate && { label: 'Deactivate account', onSelect: () => onDeactivate(admin.id) },
  admin.status === 'active' && onBlock && { label: 'Block account', onSelect: () => onBlock(admin.id), destructive: true },
  admin.status === 'blocked' && onUnblock && { label: 'Unblock account', onSelect: () => onUnblock(admin.id) },
  admin.status === 'deactivated' && onActivate && { label: 'Activate account', onSelect: () => onActivate(admin.id) },
  admin.status !== 'deleted' && onDelete && { label: 'Delete account', onSelect: () => onDelete(admin.id), destructive: true },
]} />
          </div>
        )) : (
          <div className="bg-white p-8 rounded-md shadow-sm border border-gray-100 text-center text-gray-500 font-medium">
            No sub admins found.
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {(totalPages > 1 || currentPage > 1) && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-sm text-gray-500 font-medium hidden sm:block">
            Showing {showingFrom} to {showingTo} of {displayTotal} entries
          </span>
          <div className="flex items-center gap-1 mx-auto sm:mx-0">
            <button 
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 disabled:opacity-50 transition"
            >
              <ChevronLeft size={18} />
            </button>
            
            {(() => {
              const pages: number[] = [];
              const maxVisible = 5;
              let start = Math.max(1, currentPage - 2);
              let end = Math.min(totalPages, currentPage + 2);

              if (start === 1) {
                end = Math.min(totalPages, maxVisible);
              } else if (end === totalPages) {
                start = Math.max(1, totalPages - maxVisible + 1);
              }

              for (let i = start; i <= end; i++) {
                pages.push(i);
              }

              return pages.map(page => (
                <button 
                  key={page}
                  onClick={() => goToPage(page)}
                  disabled={isLoading}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition text-sm font-medium ${
                    currentPage === page 
                      ? 'bg-gray-100 text-slate-800 font-bold' 
                      : 'hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  {page}
                </button>
              ));
            })()}

            <button 
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 disabled:opacity-50 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}