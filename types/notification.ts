export const NOTIFICATION_TYPES = {
  // Customer-facing types
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_PROCESSING: 'ORDER_PROCESSING',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  REFUND_REQUESTED: 'REFUND_REQUESTED',
  REFUND_APPROVED: 'REFUND_APPROVED',
  REFUND_REJECTED: 'REFUND_REJECTED',
  REFUND_PROCESSED: 'REFUND_PROCESSED',

  // Vendor-facing types
  NEW_ORDER_FOR_VENDOR: 'NEW_ORDER_FOR_VENDOR',
  REVIEW_RECEIVED: 'REVIEW_RECEIVED',
  LOW_STOCK: 'LOW_STOCK',
  PAYOUT_PROCESSED: 'PAYOUT_PROCESSED',
  PAYOUT_FAILED: 'PAYOUT_FAILED',
  VENDOR_APPLICATION_APPROVED: 'VENDOR_APPLICATION_APPROVED',
  VENDOR_APPLICATION_REJECTED: 'VENDOR_APPLICATION_REJECTED',
  VENDOR_ACCOUNT_SUSPENDED: 'VENDOR_ACCOUNT_SUSPENDED',
  VENDOR_ACCOUNT_REACTIVATED: 'VENDOR_ACCOUNT_REACTIVATED',

  // Admin-facing types
  NEW_VENDOR_APPLICATION: 'NEW_VENDOR_APPLICATION',
  REVIEW_FLAGGED: 'REVIEW_FLAGGED',
  REFUND_NEEDS_REVIEW: 'REFUND_NEEDS_REVIEW',

  // Platform-wide type
  PLATFORM_ANNOUNCEMENT: 'PLATFORM_ANNOUNCEMENT',
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

/** Deep-link payload. Every field is optional — always guard with optional chaining. */
export interface NotificationData {
  orderId?: string;
  orderNumber?: string;
  productId?: string;
  vendorId?: string;
  reviewId?: string;
  screen?: string;
  category?: string;
  campaign?: string;
  [key: string]: unknown;
}

/** The shape returned by GET /notifications */
export interface AppNotification {
  id: string;
  /** Typed loosely on purpose — backend may add new types. */
  type: NotificationType | string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  data: NotificationData | null;
  createdAt: string | undefined;
}

export interface Pagination {
  total: number;
  /** ⚠️ Backend may return page as a string when passed in query params. Always Number() it. */
  page: number | string;
  limit: number;
  totalPages: number;
}

export interface PaginatedNotifications {
  notifications: AppNotification[];
  pagination: Pagination;
}

/** The shape pushed over SSE — note `notificationId`, not `id`. */
export interface NotificationStreamEvent {
  recipientId: string;
  notificationId: string;
  type: NotificationType | string;
  title: string;
  message: string;
  data?: NotificationData | null;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface BroadcastPayload {
  title: string;
  message: string;
  role?: 'customer' | 'vendor' | 'admin' | 'super-admin';
  data?: Record<string, unknown>;
}

export interface BroadcastResult {
  recipientCount: number;
}
