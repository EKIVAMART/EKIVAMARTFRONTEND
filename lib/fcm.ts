/**
 * Firebase Cloud Messaging (FCM) Token Helper & Registration Utility.
 * Prepared for push notification delivery when Firebase FCM credentials are configured.
 */

export interface FcmTokenRegistration {
  token: string;
  deviceType: 'web' | 'android' | 'ios';
  updatedAt: string;
}

const FCM_TOKEN_STORAGE_KEY = 'faflora_fcm_token';

export const fcmClient = {
  /**
   * Retrieves the locally stored FCM token if registered.
   */
  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
  },

  /**
   * Saves FCM registration token to local storage and syncs with backend user device settings.
   */
  async saveToken(token: string, deviceType: 'web' | 'android' | 'ios' = 'web'): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);

      const authToken = localStorage.getItem('accessToken');
      if (!authToken) return true;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      await fetch(`${apiUrl}/notifications/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token, deviceType }),
      }).catch(() => {
        // Soft fail if FCM endpoint is not active yet
      });

      return true;
    } catch (err) {
      console.warn('[FCM] Token save error:', err);
      return false;
    }
  },

  /**
   * Request push notification permission from browser if Web Push SDK is initialized.
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn('[FCM] Permission request failed:', err);
      return 'denied';
    }
  },
};
