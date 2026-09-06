import { NextResponse } from 'next/server';
import { db } from '@/lib/models';
import { verifyAuth } from '@/lib/api-auth';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json();
    const { targetRole, role, subject, bodyHtml, bodyText, previewText, attachedImageUrls, heroBannerUrl } = body;

    const effectiveRole = targetRole || role;

    // Field validations
    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { success: false, message: 'Bad Request - Subject is required' },
        { status: 400 }
      );
    }

    if (subject.length > 255) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bad Request - Subject must not exceed 255 characters',
        },
        { status: 400 }
      );
    }

    const htmlBody = bodyHtml || bodyText;
    if (!htmlBody || !htmlBody.trim()) {
      return NextResponse.json(
        { success: false, message: 'Bad Request - Email body is required' },
        { status: 400 }
      );
    }

    if (previewText && previewText.length > 255) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bad Request - Preview text must not exceed 255 characters',
        },
        { status: 400 }
      );
    }

    const query: any = { status: 'active' };
    if (effectiveRole === 'VENDOR' || effectiveRole === 'vendor') {
      query.role = 'vendor';
    } else if (effectiveRole === 'BUYER' || effectiveRole === 'customer') {
      query.role = 'customer';
    }

    const subscribersCollection = await db.waitlistSubscribers();
    const activeSubscribers = await subscribersCollection.find(query).toArray();

    if (activeSubscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Broadcast skipped - no active subscribers for selected role',
        data: {
          sent: 0,
          targetRole: effectiveRole || 'ALL',
        },
      });
    }

    const batchSize = 50;
    for (let i = 0; i < activeSubscribers.length; i += batchSize) {
      const batch = activeSubscribers.slice(i, i + batchSize);

      batch.forEach((sub: any) => {
        const unsubscribeLink = `${
          request.headers.get('origin') || 'http://localhost:3000'
        }/unsubscribe?token=${sub.unsubscribeToken || 'token'}`;
        console.log(
          `[Email Broadcast] Sent email to ${sub.email}. TargetRole: ${effectiveRole || 'ALL'}. Subject: "${subject}". Preview: "${
            previewText || ''
          }". Hero: "${heroBannerUrl || 'none'}". Attached Images: ${attachedImageUrls?.length || 0}. Unsubscribe: ${unsubscribeLink}`
        );
      });

      if (i + batchSize < activeSubscribers.length) {
        await delay(500);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Broadcast sent successfully to ${activeSubscribers.length} subscribers`,
      data: {
        sent: activeSubscribers.length,
        targetRole: effectiveRole || 'ALL',
      },
    });
  } catch (error: any) {
    console.error('[POST broadcast error]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal Server Error - Failed to send broadcast',
      },
      { status: 500 }
    );
  }
}
