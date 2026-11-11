import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  AppNotification,
  NotificationStreamEvent,
} from '@/types/notification';
import { API_BASE_URL } from '@/lib/axios';

interface UseNotificationStreamOptions {
  accessToken: string | null;
  isAuthenticated: boolean;
  onNotificationReceived?: (notification: AppNotification) => void;
  onRefreshToken?: () => Promise<string | null>;
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export function useNotificationStream({
  accessToken,
  isAuthenticated,
  onNotificationReceived,
  onRefreshToken,
}: UseNotificationStreamOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const isComponentMounted = useRef(true);

  // Store callback refs so effect dependencies stay stable
  const callbackRef = useRef(onNotificationReceived);
  useEffect(() => {
    callbackRef.current = onNotificationReceived;
  }, [onNotificationReceived]);

  const refreshRef = useRef(onRefreshToken);
  useEffect(() => {
    refreshRef.current = onRefreshToken;
  }, [onRefreshToken]);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const connect = useCallback(
    (tokenToUse: string) => {
      cleanup();

      if (!isComponentMounted.current) return;

      const baseUrl = API_BASE_URL;

      const streamUrl = `${baseUrl}/notifications/stream?token=${encodeURIComponent(
        tokenToUse
      )}`;

      setStatus('reconnecting');

      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        if (!isComponentMounted.current) return;
        setStatus('connected');
        retryCountRef.current = 0;
      };

      // ⚠️ MUST listen to named event 'notification' (es.onmessage will NOT fire)
      es.addEventListener('notification', (event: MessageEvent) => {
        if (!isComponentMounted.current) return;

        try {
          const payload: NotificationStreamEvent = JSON.parse(event.data);

          // Normalize SSE payload to standard AppNotification shape
          const normalized: AppNotification = {
            id: payload.notificationId,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            data: payload.data ?? null,
            isRead: false,
            readAt: null,
            createdAt: new Date().toISOString(),
          };

          callbackRef.current?.(normalized);
        } catch (err) {
          console.error('[SSE] Failed to parse notification payload:', err);
        }
      });

      es.onerror = async () => {
        if (!isComponentMounted.current) return;

        es.close();
        eventSourceRef.current = null;
        setStatus('disconnected');

        // Exponential backoff reconnect logic (max 30s)
        const delay = Math.min(
          30000,
          Math.pow(2, retryCountRef.current) * 2000
        );
        retryCountRef.current += 1;

        reconnectTimeoutRef.current = setTimeout(async () => {
          if (!isComponentMounted.current || !isAuthenticated) return;

          // Attempt token refresh on auth disconnect
          let activeToken = tokenToUse;
          if (refreshRef.current) {
            try {
              const newToken = await refreshRef.current();
              if (newToken) activeToken = newToken;
            } catch (err) {
              console.warn('[SSE] Token refresh failed during reconnect:', err);
            }
          }

          if (activeToken) {
            connect(activeToken);
          }
        }, delay);
      };
    },
    [cleanup, isAuthenticated]
  );

  useEffect(() => {
    isComponentMounted.current = true;

    if (isAuthenticated && accessToken) {
      connect(accessToken);
    } else {
      cleanup();
      setStatus('disconnected');
    }

    return () => {
      isComponentMounted.current = false;
      cleanup();
    };
  }, [isAuthenticated, accessToken, connect, cleanup]);

  return {
    status,
    reconnect: () => {
      if (accessToken) connect(accessToken);
    },
  };
}
