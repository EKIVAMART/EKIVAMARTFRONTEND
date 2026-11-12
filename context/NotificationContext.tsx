'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setTokens, logout } from '@/lib/features/auth/authSlice';
import { notificationApi } from '@/lib/api/notifications';
import { useNotificationStream, ConnectionStatus } from '@/lib/hooks/useNotificationStream';
import { playNotificationSound } from '@/lib/utils/audio';
import { getNotificationRoute } from '@/lib/utils/notification-routes';
import type { AppNotification, Pagination } from '@/types/notification';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/axios';

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  connectionStatus: ConnectionStatus;
  loading: boolean;
  hasMore: boolean;
  pagination: Pagination | null;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  fetchNotifications: (params?: { page?: number; limit?: number; type?: string; isRead?: boolean | string }) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);

  // Load sound setting preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('faflora_notification_sound');
      if (stored !== null) {
        setSoundEnabledState(stored === 'true');
      }
    }
  }, []);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('faflora_notification_sound', String(enabled));
    }
  };

  // Token refresh callback for SSE auth auto-recovery
  const handleRefreshToken = useCallback(async (): Promise<string | null> => {
    if (!refreshToken) return null;
    try {
      const baseUrl = API_BASE_URL;

      const res = await axios.post<{ data?: { accessToken?: string; refreshToken?: string } }>(
        `${baseUrl}/auth/refresh`,
        { refreshToken }
      );
      const data = res.data?.data;

      if (data?.accessToken) {
        dispatch(
          setTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || refreshToken,
          })
        );
        return data.accessToken;
      }
    } catch {
      dispatch(logout());
    }
    return null;
  }, [refreshToken, dispatch]);

  // Fetch notifications inbox
  const fetchNotifications = useCallback(
    async (params?: { page?: number; limit?: number; type?: string; isRead?: boolean | string }) => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const res = await notificationApi.getNotifications(params);
        setNotifications(res.notifications);
        setPagination(res.pagination);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Fetch fast indexed unread count
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread notification count:', err);
    }
  }, [isAuthenticated]);

  // Real-time SSE Handler
  const handleNewRealtimeNotification = useCallback(
    (item: AppNotification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === item.id)) return prev;
        return [item, ...prev];
      });
      setUnreadCount((prev) => prev + 1);

      if (soundEnabled) {
        playNotificationSound();
      }

      // Show real-time notification toast popover with click-to-route
      toast.custom(
        (t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id);
              const route = getNotificationRoute(item.data, user?.role, item.type);
              router.push(route);
            }}
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-sm w-full bg-white shadow-2xl rounded-2xl border border-brand-100 p-4 flex items-start gap-3 pointer-events-auto transition-all cursor-pointer hover:bg-brand-50/50 hover:shadow-brand-100`}
            role="button"
            tabIndex={0}
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-lg shrink-0">
              🔔
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-neutral-900 truncate">
                {item.title}
              </p>
              <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2 leading-snug">
                {item.message}
              </p>
            </div>
          </div>
        ),
        { duration: 5500, position: 'top-right' }
      );
    },
    [soundEnabled, user, router]
  );

  // SSE Stream Engine Hook
  const { status: connectionStatus } = useNotificationStream({
    accessToken,
    isAuthenticated,
    onNotificationReceived: handleNewRealtimeNotification,
    onRefreshToken: handleRefreshToken,
  });

  // Initial load on authentication
  useEffect(() => {
    if (isAuthenticated) {
      void fetchNotifications({ page: 1, limit: 20 });
      void refreshUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setPagination(null);
    }
  }, [isAuthenticated, fetchNotifications, refreshUnreadCount]);

  // 60-Second Polling Fallback when SSE is disconnected/reconnecting or window regains focus
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (connectionStatus !== 'connected') {
        void refreshUnreadCount();
      }
    }, 60000);

    const handleFocus = () => {
      void refreshUnreadCount();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, connectionStatus, refreshUnreadCount]);

  // Optimistic Mark Single Read
  const markAsRead = async (id: string) => {
    let wasUnread = false;

    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id && !n.isRead) {
          wasUnread = true;
          return { ...n, isRead: true, readAt: new Date().toISOString() };
        }
        return n;
      })
    );

    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationApi.markAsRead(id);
    } catch (err) {
      // Rollback on non-400 failure
      console.error(`Failed to mark notification ${id} as read:`, err);
      if (wasUnread) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: false, readAt: null } : n))
        );
        setUnreadCount((prev) => prev + 1);
      }
    }
  };

  // Optimistic Mark All Read
  const markAllAsRead = async () => {
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt || new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const hasMore = Boolean(
    pagination && Number(pagination.page) < Number(pagination.totalPages)
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        connectionStatus,
        loading,
        hasMore,
        pagination,
        soundEnabled,
        setSoundEnabled,
        fetchNotifications,
        refreshUnreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
