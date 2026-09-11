import axiosInstance from '@/lib/axios';
import type {
  ApiEnvelope,
  PaginatedNotifications,
  BroadcastPayload,
  BroadcastResult,
} from '@/types/notification';

export class NotificationApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'NotificationApiError';
  }

  get isAuthError() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isValidationError() {
    return this.status === 400;
  }
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseApiError(error: unknown): NotificationApiError {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiError = error as {
      response?: {
        status?: number;
        data?: {
          message?: string;
          errors?: Array<{ field: string; message: string }>;
        };
      };
      message?: string;
    };

    const status = axiError.response?.status ?? 500;
    const message =
      axiError.response?.data?.message ||
      axiError.message ||
      'An unexpected error occurred';
    const fieldErrors = axiError.response?.data?.errors;

    return new NotificationApiError(status, message, fieldErrors);
  }

  if (error instanceof NotificationApiError) {
    return error;
  }

  return new NotificationApiError(
    500,
    error instanceof Error ? error.message : 'An unexpected error occurred'
  );
}

export interface GetNotificationsParams {
  type?: string;
  isRead?: boolean | string;
  page?: number;
  limit?: number;
}

export const notificationApi = {
  /**
   * GET /api/v1/notifications
   * Fetch paginated notification inbox for current user (Customer, Vendor, Admin, Super-Admin).
   */
  async getNotifications(params: GetNotificationsParams = {}): Promise<PaginatedNotifications> {
    try {
      const queryParams: Record<string, string | number> = {};

      if (params.type && params.type.trim()) {
        queryParams.type = params.type.trim();
      }

      if (params.isRead !== undefined && params.isRead !== null) {
        // Enforce strict lowercase "true" or "false" string per backend spec
        if (typeof params.isRead === 'boolean') {
          queryParams.isRead = params.isRead ? 'true' : 'false';
        } else if (params.isRead === 'true' || params.isRead === 'false') {
          queryParams.isRead = params.isRead;
        }
      }

      if (params.page !== undefined) {
        queryParams.page = Math.max(1, Math.floor(Number(params.page) || 1));
      }

      if (params.limit !== undefined) {
        // Enforce limit <= 100 per spec rule
        queryParams.limit = Math.min(100, Math.max(1, Math.floor(Number(params.limit) || 20)));
      }

      const res = await axiosInstance.get<ApiEnvelope<PaginatedNotifications>>(
        '/notifications',
        { params: queryParams }
      );

      const rawData = res.data.data;
      // Coerce pagination.page to a number in case backend echoes it back as string
      const normalizedPage = Number(rawData.pagination.page) || 1;

      return {
        ...rawData,
        pagination: {
          ...rawData.pagination,
          page: normalizedPage,
        },
      };
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * GET /api/v1/notifications/unread-count
   * Fast indexed unread count for badge.
   */
  async getUnreadCount(): Promise<number> {
    try {
      const res = await axiosInstance.get<ApiEnvelope<{ count: number }>>(
        '/notifications/unread-count'
      );
      return res.data.data.count ?? 0;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * PATCH /api/v1/notifications/:id/read
   * Mark single notification read (Idempotent).
   */
  async markAsRead(id: string): Promise<void> {
    if (!id || !UUID_REGEX.test(id)) {
      throw new NotificationApiError(400, 'Validation failed', [
        { field: 'params.id', message: 'Invalid notification ID' },
      ]);
    }
    try {
      await axiosInstance.patch<ApiEnvelope<null>>(`/notifications/${id}/read`);
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * PATCH /api/v1/notifications/read-all
   * Mark all unread notifications read for logged-in user.
   */
  async markAllAsRead(): Promise<void> {
    try {
      await axiosInstance.patch<ApiEnvelope<null>>('/notifications/read-all');
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * POST /api/v1/admin/notifications/broadcast
   * Synchronous admin & super-admin announcement broadcast.
   */
  async broadcastNotification(payload: BroadcastPayload): Promise<BroadcastResult> {
    if (!payload.title || payload.title.trim().length < 3) {
      throw new NotificationApiError(400, 'Validation failed', [
        { field: 'body.title', message: 'Title must be at least 3 characters' },
      ]);
    }
    if (payload.title.trim().length > 200) {
      throw new NotificationApiError(400, 'Validation failed', [
        { field: 'body.title', message: 'Title must not exceed 200 characters' },
      ]);
    }
    if (!payload.message || payload.message.trim().length < 10) {
      throw new NotificationApiError(400, 'Validation failed', [
        { field: 'body.message', message: 'Message must be at least 10 characters' },
      ]);
    }
    if (payload.message.trim().length > 1000) {
      throw new NotificationApiError(400, 'Validation failed', [
        { field: 'body.message', message: 'Message must not exceed 1,000 characters' },
      ]);
    }

    try {
      const res = await axiosInstance.post<ApiEnvelope<BroadcastResult>>(
        '/admin/notifications/broadcast',
        {
          title: payload.title.trim(),
          message: payload.message.trim(),
          ...(payload.role ? { role: payload.role } : {}),
          ...(payload.data ? { data: payload.data } : {}),
        },
        { timeout: 65000 } // Extended timeout for synchronous fan-out
      );
      return res.data.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  // ─── Legacy Vendor Notifications (Section 8) — Documented & Preserved ───

  /** @deprecated Legacy endpoint. Use `getNotifications` instead. */
  async getVendorNotifications(params: { isRead?: boolean; page?: number; limit?: number } = {}) {
    try {
      const res = await axiosInstance.get('/vendor/notifications', {
        params: {
          ...(params.isRead !== undefined ? { isRead: params.isRead ? 'true' : 'false' } : {}),
          ...(params.page ? { page: params.page } : {}),
          ...(params.limit ? { limit: params.limit } : {}),
        },
      });
      return res.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /** @deprecated Legacy endpoint. Use `getUnreadCount` instead. */
  async getVendorUnreadCount() {
    try {
      const res = await axiosInstance.get('/vendor/notifications/unread-count');
      return res.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /** @deprecated Legacy endpoint. Use `markAsRead` instead. */
  async markVendorNotificationAsRead(id: string) {
    try {
      const res = await axiosInstance.patch(`/vendor/notifications/${id}/read`);
      return res.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /** @deprecated Legacy endpoint. Use `markAllAsRead` instead. */
  async markVendorAllAsRead() {
    try {
      const res = await axiosInstance.patch('/vendor/notifications/read-all');
      return res.data;
    } catch (error) {
      throw parseApiError(error);
    }
  },
};
