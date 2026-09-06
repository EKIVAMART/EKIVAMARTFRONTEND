/**
 * Sends the actual broadcast email after all images (if any) have
 * already been uploaded via uploadBroadcastImage().
 */

export interface SendBroadcastPayload {
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  previewText?: string;
  targetRole?: 'customer' | 'vendor';
  attachedImageUrls?: string[];
  heroBannerUrl?: string;
}

export interface SendBroadcastResult {
  success: boolean;
  message: string;
  sent?: number;
  targetRole?: string | null;
}

export async function sendBroadcast(
  payload: SendBroadcastPayload,
  authToken: string,
  apiBaseUrl: string = process.env.NEXT_PUBLIC_API_URL ?? ''
): Promise<SendBroadcastResult> {
  try {
    const response = await fetch(`${apiBaseUrl}/waitlist/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data?.message ?? `Server error (${response.status})`,
      };
    }

    return {
      success: true,
      message: data.message,
      sent: data.data?.sent,
      targetRole: data.data?.targetRole,
    };
  } catch {
    return {
      success: false,
      message: 'Network error — could not reach the server. Please try again.',
    };
  }
}
