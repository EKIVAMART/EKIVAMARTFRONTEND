import type { NotificationData } from '@/types/notification';

/**
 * Translates backend `data.screen` and entity IDs into web App Router URLs.
 * Ref: Section 9.5 of Notification Specification
 */
export function getNotificationRoute(
  data?: NotificationData | null,
  userRole?: string
): string {
  if (!data) return '/notifications';

  const role = String(userRole || '').toLowerCase().replace('_', '-');
  const isSuperAdmin = role === 'super-admin';
  const isAdmin = role === 'admin';
  const isVendor = role === 'vendor';

  const screen = data.screen;

  const targetOrderId =
    data.orderId ||
    data.orderNumber ||
    (data.data as any)?.orderId ||
    (data.data as any)?.orderNumber;

  // Order routes
  if (
    screen === 'OrderDetails' ||
    screen === 'VendorOrderDetails' ||
    screen === 'AdminOrderDetails' ||
    targetOrderId
  ) {
    if (isSuperAdmin) {
      return targetOrderId
        ? `/super-admin/dashboard?tab=orders&orderId=${encodeURIComponent(targetOrderId)}`
        : '/super-admin/dashboard?tab=orders';
    }
    if (isAdmin) {
      return targetOrderId
        ? `/admin/dashboard?tab=orders&orderId=${encodeURIComponent(targetOrderId)}`
        : '/admin/dashboard?tab=orders';
    }
    if (isVendor) {
      return targetOrderId
        ? `/vendor/dashboard?tab=orders&orderId=${encodeURIComponent(targetOrderId)}`
        : '/vendor/dashboard?tab=orders';
    }
    return targetOrderId ? `/orders/${encodeURIComponent(targetOrderId)}` : '/orders';
  }

  switch (screen) {
    case 'VendorProductReviews':
      return isVendor
        ? `/vendor/dashboard?tab=products`
        : data.productId
        ? `/products/${data.productId}`
        : '/products';

    case 'AdminVendorApplications':
      return isSuperAdmin
        ? `/super-admin/dashboard?tab=vendors`
        : isAdmin
        ? `/admin/dashboard?tab=vendors`
        : '/admin/vendors';

    case 'AdminReviewModeration':
      return isSuperAdmin
        ? `/super-admin/dashboard?tab=products`
        : isAdmin
        ? `/admin/dashboard?tab=products`
        : '/admin/reviews';

    case 'VendorDashboard':
      return isVendor ? '/vendor/dashboard' : '/';

    case 'AdminDashboard':
      return isSuperAdmin ? '/super-admin/dashboard' : isAdmin ? '/admin/dashboard' : '/';

    case 'UserProfile':
      return '/profile';

    case 'Products':
      return '/products';

    case 'Notifications':
      return '/notifications';

    case 'Cart':
      return '/cart';

    case 'Checkout':
      return '/checkout';

    case 'Home':
      return '/';

    default:
      if (data.productId) return `/products/${data.productId}`;
      if (data.vendorId) {
        if (isSuperAdmin) return '/super-admin/dashboard?tab=vendors';
        if (isAdmin) return '/admin/dashboard?tab=vendors';
        return `/stores/${data.vendorId}`;
      }

      return '/notifications';
  }
}
