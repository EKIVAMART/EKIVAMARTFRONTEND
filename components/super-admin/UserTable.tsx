'use client';
import RecordActions from "@/components/admin/RecordActions";

import RecordStatus from "@/components/admin/RecordStatus";


import React, { useState, useMemo } from 'react';
import {
  Eye, Ban, CheckCircle, Trash2, Filter, ArrowUpDown,
  ChevronLeft, ChevronRight, Mail, Clock, ShieldCheck,
  ShieldOff, Calendar, LogIn, User
} from 'lucide-react';

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: string;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  avatar?: string | null;
  phoneNumber?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'blocked' | 'deleted';
  /** Derived from auth/me isEmailVerified or a separate flag */
  isAuthenticated?: boolean;
}

interface UserTableProps {
  data: AppUser[];
  searchQuery?: string;
  onView?: (user: AppUser) => void;
  onBlock?: (id: string) => void;
  onUnblock?: (id: string) => void;
  onDelete?: (id: string) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  sortBy?: string;
  onSortByChange?: (sort: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  authFilter?: string;
  onAuthFilterChange?: (auth: string) => void;
  dateFrom?: string;
  onDateFromChange?: (date: string) => void;
  dateTo?: string;
  onDateToChange?: (date: string) => void;
}

const allStatuses = ['All', 'active', 'blocked', 'deleted'];
const authFilters = ['All', 'Authenticated', 'Not Authenticated'];

const sortOptions = [
  { value: 'name-asc', label: 'Name: A → Z' },
  { value: 'name-desc', label: 'Name: Z → A' },
  { value: 'createdAt-desc', label: 'Newest Joined' },
  { value: 'createdAt-asc', label: 'Oldest Joined' },
  { value: 'lastLoginAt-desc', label: 'Most Recent Login' },
  { value: 'lastLoginAt-asc', label: 'Oldest Login' },
];

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
};

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

const getInitials = (firstName: string, lastName: string) =>
  `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';

/** Tooltip wrapper for desktop */

export default function UserTable({
  data,
  searchQuery = '',
  onView,
  onBlock,
  onUnblock,
  onDelete,
  currentPage: serverPage,
  totalPages: serverTotalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  isLoading = false,
  sortBy: serverSortBy,
  onSortByChange,
  statusFilter: serverStatusFilter,
  onStatusFilterChange,
  authFilter: serverAuthFilter,
  onAuthFilterChange,
  dateFrom: serverDateFrom,
  onDateFromChange,
  dateTo: serverDateTo,
  onDateToChange,
}: UserTableProps) {
  const [localPage, setLocalPage] = useState(1);
  const [localStatusFilter, setLocalStatusFilter] = useState('All');
  const [localAuthFilter, setLocalAuthFilter] = useState('All');
  const [localSortBy, setLocalSortBy] = useState('createdAt-desc');
  const [localDateFrom, setLocalDateFrom] = useState('');
  const [localDateTo, setLocalDateTo] = useState('');

  const isServerPaginated = Boolean(onPageChange);
  
  const currentPage = serverPage !== undefined ? serverPage : localPage;
  const statusFilter = serverStatusFilter !== undefined ? serverStatusFilter : localStatusFilter;
  const authFilter = serverAuthFilter !== undefined ? serverAuthFilter : localAuthFilter;
  const sortBy = serverSortBy !== undefined ? serverSortBy : localSortBy;
  const dateFrom = serverDateFrom !== undefined ? serverDateFrom : localDateFrom;
  const dateTo = serverDateTo !== undefined ? serverDateTo : localDateTo;

  const setStatusFilter = (val: string) => {
    if (onStatusFilterChange) onStatusFilterChange(val);
    else setLocalStatusFilter(val);
  };
  const setAuthFilter = (val: string) => {
    if (onAuthFilterChange) onAuthFilterChange(val);
    else setLocalAuthFilter(val);
  };
  const setSortBy = (val: string) => {
    if (onSortByChange) onSortByChange(val);
    else setLocalSortBy(val);
  };
  const setDateFrom = (val: string) => {
    if (onDateFromChange) onDateFromChange(val);
    else setLocalDateFrom(val);
  };
  const setDateTo = (val: string) => {
    if (onDateToChange) onDateToChange(val);
    else setLocalDateTo(val);
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Search
    if (!isServerPaginated && searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(q) ||
          u.lastName?.toLowerCase().includes(q) ||
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phoneNumber?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter((u) => (u.status || 'active') === statusFilter);
    }

    // Auth filter
    if (authFilter === 'Authenticated') {
      result = result.filter((u) => u.isAuthenticated || u.isEmailVerified);
    } else if (authFilter === 'Not Authenticated') {
      result = result.filter((u) => !u.isAuthenticated && !u.isEmailVerified);
    }

    // Date joined filter
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter((u) => new Date(u.createdAt).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000; // inclusive day end
      result = result.filter((u) => new Date(u.createdAt).getTime() <= to);
    }

    // Sort
    if (!isServerPaginated) {
      const [field, dir] = sortBy.split('-');
      result.sort((a, b) => {
        let cmp = 0;
        if (field === 'name') {
          cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        } else if (field === 'createdAt') {
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (field === 'lastLoginAt') {
          const aTime = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          const bTime = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          cmp = aTime - bTime;
        }
        return dir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, searchQuery, statusFilter, authFilter, sortBy, dateFrom, dateTo, isServerPaginated]);

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

  React.useEffect(() => {
    if (!isServerPaginated) {
      setLocalPage(1);
    }
  }, [isServerPaginated, searchQuery, statusFilter, authFilter, sortBy, dateFrom, dateTo]);

  const StatusBadge = ({ status }: { status: string }) => <RecordStatus value={status} />;
  const AuthBadge = ({ verified }: { verified: boolean }) => <RecordStatus value={verified ? 'verified' : 'unverified'} />;

  const userStatus = (u: AppUser) => u.status || 'active';

  return (
    <div className="bg-white rounded-md border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Desktop Action Bar ── */}
      <div className="hidden md:flex flex-wrap justify-between items-center p-4 border-b gap-3 bg-white">
        {/* Filters left */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-gray-400" />
            <select
              className="bg-gray-50 border-none text-sm font-medium text-slate-700 rounded-lg p-2 outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <select
            className="bg-gray-50 border-none text-sm font-medium text-slate-700 rounded-lg p-2 outline-none cursor-pointer"
            value={authFilter}
            onChange={(e) => setAuthFilter(e.target.value)}
          >
            {authFilters.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          {/* Date range */}
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-gray-50 border-none text-sm font-medium text-slate-700 rounded-lg p-2 outline-none cursor-pointer"
              title="Joined from"
            />
            <span className="text-gray-400 text-xs font-bold">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-gray-50 border-none text-sm font-medium text-slate-700 rounded-lg p-2 outline-none cursor-pointer"
              title="Joined to"
            />
          </div>
        </div>
        {/* Sort right */}
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-gray-400" />
          <select
            className="bg-gray-50 border-none text-sm font-medium text-slate-700 rounded-lg p-2 outline-none cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Mobile Action Bar ── */}
      <div className="md:hidden flex flex-col gap-3 p-4 border-b bg-gray-50/50">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Users</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="bg-white border text-sm font-medium text-slate-700 rounded-lg px-2 py-1.5 outline-none flex-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {allStatuses.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>
          <select
            className="bg-white border text-sm font-medium text-slate-700 rounded-lg px-2 py-1.5 outline-none flex-1"
            value={authFilter}
            onChange={(e) => setAuthFilter(e.target.value)}
          >
            {authFilters.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <select
            className="bg-white border text-sm font-medium text-slate-700 rounded-lg px-2 py-1.5 outline-none w-full"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400 shrink-0" />
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border rounded-lg px-2 py-1.5 text-sm outline-none flex-1" />
          <span className="text-gray-400 text-xs font-bold">–</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border rounded-lg px-2 py-1.5 text-sm outline-none flex-1" />
        </div>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-gray-50/50 border-b">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">User</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Contact</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">Email Verified</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">Joined</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-center">Last Login</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? paginatedData.map((u) => (
              <tr
                key={u.id}
                onClick={() => onView?.(u)}
                className="border-b last:border-0 hover:bg-gray-50/50 transition cursor-pointer group"
              >
                {/* User */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.fullName || `${u.firstName} ${u.lastName}`}
                        className="w-9 h-9 rounded-full object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-md bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700 shrink-0">
                        {getInitials(u.firstName, u.lastName)}
                      </div>
                    )}
                    <div>
                      <button type="button" onClick={(event) => { event.stopPropagation(); onView?.(u); }} className="text-left font-semibold text-slate-800 text-sm hover:underline underline-offset-2">
                        {u.firstName} {u.lastName}
                      </button>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{u.role}</p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="p-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Mail size={11} className="text-gray-400" />{u.email}
                    </span>
                    {u.phoneNumber && (
                      <span className="text-xs font-medium text-slate-500">{u.phoneNumber}</span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="p-4 text-center">
                  <StatusBadge status={userStatus(u)} />
                </td>

                {/* Email verified */}
                <td className="p-4 text-center">
                  <AuthBadge verified={u.isEmailVerified} />
                </td>

                {/* Joined */}
                <td className="p-4 text-center text-xs font-medium text-slate-500">
                  <div className="flex items-center justify-center gap-1">
                    <Calendar size={11} className="text-gray-400" />
                    {formatDate(u.createdAt)}
                  </div>
                </td>

                {/* Last login */}
                <td className="p-4 text-center text-xs font-medium text-slate-500">
                  {u.lastLoginAt ? (
                    <div className="flex items-center justify-center gap-1">
                      <LogIn size={11} className="text-gray-400" />
                      {formatDate(u.lastLoginAt)}
                    </div>
                  ) : (
                    <span className="text-gray-300 font-medium">Never</span>
                  )}
                </td>

                {/* Actions */}
                <td className="p-4 text-right">
                  <RecordActions name={u.firstName + ' ' + u.lastName} actions={[
  onView && { label: 'View details', onSelect: () => onView(u) },
  userStatus(u) !== 'deleted' && userStatus(u) !== 'blocked' && onBlock && { label: 'Block user', onSelect: () => onBlock(u.id), destructive: true },
  userStatus(u) === 'blocked' && onUnblock && { label: 'Unblock user', onSelect: () => onUnblock(u.id) },
  userStatus(u) !== 'deleted' && onDelete && { label: 'Delete user', onSelect: () => onDelete(u.id), destructive: true },
]} />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500 font-medium">
                  <div className="flex flex-col items-center gap-3">
                    <User size={40} className="text-gray-200" />
                    No users found.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Card View ── */}
      <div className="md:hidden flex flex-col p-4 space-y-4 bg-gray-50/50">
        {paginatedData.length > 0 ? paginatedData.map((u) => (
          <div
            key={u.id}
            onClick={() => onView?.(u)}
            className="bg-white p-4 rounded-md shadow-sm border border-gray-100 space-y-3 cursor-pointer hover:border-brand-200 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {u.avatar ? (
                  <img src={u.avatar} alt={u.fullName} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-brand-100 flex items-center justify-center text-base font-bold text-brand-700">
                    {getInitials(u.firstName, u.lastName)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-800">{u.firstName} {u.lastName}</p>
                  <StatusBadge status={userStatus(u)} />
                </div>
              </div>
              <AuthBadge verified={u.isEmailVerified} />
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-50">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail size={12} />
                <span className="truncate">{u.email}</span>
              </div>
              {u.phoneNumber && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{u.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={12} />
                <span>Joined: {formatDate(u.createdAt)}</span>
              </div>
              {u.lastLoginAt && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <LogIn size={12} />
                  <span>Last login: {formatDate(u.lastLoginAt)}</span>
                </div>
              )}
            </div>

            <RecordActions name={u.firstName + ' ' + u.lastName} actions={[
  onView && { label: 'View details', onSelect: () => onView(u) },
  userStatus(u) !== 'deleted' && userStatus(u) !== 'blocked' && onBlock && { label: 'Block user', onSelect: () => onBlock(u.id), destructive: true },
  userStatus(u) === 'blocked' && onUnblock && { label: 'Unblock user', onSelect: () => onUnblock(u.id) },
  userStatus(u) !== 'deleted' && onDelete && { label: 'Delete user', onSelect: () => onDelete(u.id), destructive: true },
]} />
          </div>
        )) : (
          <div className="bg-white p-8 rounded-md shadow-sm border border-gray-100 text-center text-gray-500 font-medium">
            <div className="flex flex-col items-center gap-3">
              <User size={40} className="text-gray-200" />
              No users found.
            </div>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {(totalPages > 1 || currentPage > 1) && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <span className="text-sm text-gray-500 font-medium hidden sm:block">
            Showing {showingFrom} to {showingTo} of {displayTotal} users
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
