'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useAppSelector } from '@/lib/hooks';
import { NotificationItem } from './NotificationItem';
import { AdminBroadcastModal } from './AdminBroadcastModal';
import {
  Search,
  CheckCheck,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import type { AppNotification } from '@/types/notification';

export default function NotificationsView() {
  const {
    notifications,
    unreadCount,
    loading,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const user = useAppSelector((state) => state.auth.user);
  const roleNormalized = String(user?.role || '').toLowerCase().replace('_', '-');
  const isAdminOrSuperAdmin = roleNormalized === 'admin' || roleNormalized === 'super-admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  useEffect(() => {
    void fetchNotifications({
      page: currentPage,
      limit: 20,
      isRead: filterUnreadOnly ? false : undefined,
      type: typeFilter !== 'ALL' && typeFilter !== 'ORDERS' ? typeFilter : undefined,
    });
  }, [currentPage, filterUnreadOnly, typeFilter, fetchNotifications]);

  const isOrderType = (type: string) => {
    const t = String(type || '').toUpperCase();
    return t.startsWith('ORDER_') || t.includes('ORDER') || t.includes('REFUND');
  };

  // Client-side search & category filtering across title & message
  const filteredNotifications = notifications.filter((item: AppNotification) => {
    if (typeFilter === 'ORDERS' && !isOrderType(item.type)) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.message.toLowerCase().includes(q);
  });

  const handleNextPage = () => {
    if (pagination && Number(pagination.page) < Number(pagination.totalPages)) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-600">{unreadCount} unread</p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => void markAllAsRead()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-brand-600" />
              <span>Mark all read</span>
            </button>
          )}

          {isAdminOrSuperAdmin && (
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold transition shadow-sm cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>New announcement</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Strip & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search notification headline or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-md pl-11 pr-4 py-2.5 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-sm"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {/* Category Type Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-md p-1 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-neutral-400 ml-2" />
            <button
              onClick={() => { setTypeFilter('ALL'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                typeFilter === 'ALL'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => { setTypeFilter('ORDERS'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                typeFilter === 'ORDERS'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => { setTypeFilter('PLATFORM_ANNOUNCEMENT'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                typeFilter === 'PLATFORM_ANNOUNCEMENT'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Announcements
            </button>
          </div>

          {/* Unread Only Toggle */}
          <button
            onClick={() => {
              setFilterUnreadOnly((v) => !v);
              setCurrentPage(1);
            }}
            className={`px-4 py-2.5 rounded-md border text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              filterUnreadOnly
                ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm'
                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filterUnreadOnly ? 'bg-brand-600' : 'bg-neutral-300'}`} />
            <span>Unread Only</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => void fetchNotifications({ page: currentPage, limit: 20 })}
            className="p-2.5 rounded-md bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition cursor-pointer shadow-sm"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="bg-white rounded-md border border-neutral-100 shadow-sm p-6 space-y-3 min-h-[400px]">
        {loading && filteredNotifications.length === 0 ? (
          <div className="py-20 text-center text-xs text-neutral-400 font-semibold">
            Loading notification inbox...
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
              compact={false}
              onSelect={(notif) => {
                void markAsRead(notif.id);
              }}
            />
          ))
        ) : (
          <div className="py-10 px-4 text-center">
            <h3 className="text-sm font-extrabold text-neutral-800">No notifications found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery
                ? 'No notifications matched your search query.'
                : 'Your inbox is clear. New order, payment, and account updates will appear here.'}
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
            <span className="text-xs font-bold text-neutral-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total items)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 px-3 py-2 rounded-md border border-neutral-200 text-xs font-bold text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={handleNextPage}
                disabled={Number(currentPage) >= Number(pagination.totalPages)}
                className="flex items-center gap-1 px-3 py-2 rounded-md border border-neutral-200 text-xs font-bold text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Broadcast Modal */}
      {isAdminOrSuperAdmin && (
        <AdminBroadcastModal
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
        />
      )}
    </div>
  );
}
