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

export default function AdminTable({ 
  data, 
  searchQuery = '', 
  onViewDetails,
  onDeactivate,
  onActivate,
  onBlock,
  onUnblock,
  onDelete,
  onResendInvite
}: AdminTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  const itemsPerPage = 10;

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchQuery) {
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
    result.sort((a, b) => {
      const dateA = new Date(a.invitedAt).getTime();
      const dateB = new Date(b.invitedAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [data, searchQuery, statusFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

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

  const StatusBadge = ({ status }: { status: AdminUser['status'] }) => {
    const style = statusStyles[status];
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.className}`}>
        <Icon size={10} />
        {style.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
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
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center text-sm font-bold text-fuchsia-700">
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
                  <div className="flex justify-end gap-1">
                    {/* View Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewDetails?.(admin); }}
                      className="p-2 text-fuchsia-600 hover:bg-fuchsia-50 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>

                    {/* Resend Invite - Only for pending */}
                    {admin.status === 'pending' && onResendInvite && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onResendInvite(admin.id); }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Resend Invite"
                      >
                        <Mail size={16} />
                      </button>
                    )}

                    {/* Deactivate - Only for active */}
                    {admin.status === 'active' && onDeactivate && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeactivate(admin.id); }}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                        title="Deactivate"
                      >
                        <PowerOff size={16} />
                      </button>
                    )}

                    {/* Block - Only for active */}
                    {admin.status === 'active' && onBlock && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onBlock(admin.id); }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Block Account"
                      >
                        <Ban size={16} />
                      </button>
                    )}

                    {/* Unblock - Only for blocked */}
                    {admin.status === 'blocked' && onUnblock && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onUnblock(admin.id); }}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="Unblock Account"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}

                    {/* Activate (Resend Invite) - Only for deactivated */}
                    {admin.status === 'deactivated' && onActivate && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onActivate(admin.id); }}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="Activate & Resend Invite"
                      >
                        <Power size={16} />
                      </button>
                    )}

                    {/* Delete - Not for already deleted */}
                    {admin.status !== 'deleted' && onDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(admin.id); }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete Permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
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
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3 cursor-pointer hover:border-fuchsia-200 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center text-base font-bold text-fuchsia-700">
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

            <div className="flex flex-wrap gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => onViewDetails?.(admin)} 
                className="flex-1 py-2 bg-fuchsia-50 text-fuchsia-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Eye size={14} /> View Details
              </button>

              {admin.status === 'pending' && onResendInvite && (
                <button onClick={() => onResendInvite(admin.id)} className="flex-1 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                  <Mail size={14} /> Resend
                </button>
              )}
              
              {admin.status === 'active' && onDeactivate && (
                <button onClick={() => onDeactivate(admin.id)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                  <PowerOff size={14} /> Deactivate
                </button>
              )}
              
              {admin.status === 'active' && onBlock && (
                <button onClick={() => onBlock(admin.id)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                  <Ban size={14} /> Block
                </button>
              )}
              
              {admin.status === 'blocked' && onUnblock && (
                <button onClick={() => onUnblock(admin.id)} className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle size={14} /> Unblock
                </button>
              )}
              
              {admin.status === 'deactivated' && onActivate && (
                <button onClick={() => onActivate(admin.id)} className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                  <Power size={14} /> Activate
                </button>
              )}
              
              {admin.status !== 'deleted' && onDelete && (
                <button onClick={() => onDelete(admin.id)} className="flex-1 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500 font-medium">
            No sub admins found.
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-sm text-gray-500 font-medium hidden sm:block">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} entries
          </span>
          <div className="flex items-center gap-1 mx-auto sm:mx-0">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 disabled:opacity-50 transition"
            >
              <ChevronLeft size={18} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition text-sm font-medium ${
                  currentPage === page 
                    ? 'bg-gray-100 text-slate-800 font-bold' 
                    : 'hover:bg-gray-50 text-gray-500'
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
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