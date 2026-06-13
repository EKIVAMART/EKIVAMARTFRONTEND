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
    const { subject, bodyText, previewText, role } = body;

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

    if (!bodyText || !bodyText.trim()) {
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

    if (role && !['customer', 'vendor'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bad Request - Role must be one of: customer, vendor',
        },
        { status: 400 }
      );
    }

    const query: any = { status: 'active' };
    if (role) {
      query.role = role;
    }

    const subscribersCollection = await db.waitlistSubscribers();
    const activeSubscribers = await subscribersCollection.find(query).toArray();

    if (activeSubscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Broadcast skipped - no active subscribers',
        data: {
          sent: 0,
        },
      });
    }

    const batchSize = 50;
    for (let i = 0; i < activeSubscribers.length; i += batchSize) {
      const batch = activeSubscribers.slice(i, i + batchSize);

      // Simulate sending emails to each subscriber in the batch
      batch.forEach((sub: any) => {
        const unsubscribeLink = `${
          request.headers.get('origin') || 'http://localhost:3000'
        }/unsubscribe?token=${sub.unsubscribeToken || 'token'}`;
        console.log(
          `[Email Broadcast] Sent email to ${sub.email}. Subject: "${subject}". Preview: "${
            previewText || ''
          }". Body: "${bodyText}". Unsubscribe: ${unsubscribeLink}`
        );
      });

      // Pause 500ms between batches
      if (i + batchSize < activeSubscribers.length) {
        await delay(500);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Broadcast sent successfully to ${activeSubscribers.length} subscribers`,
      data: {
        sent: activeSubscribers.length,
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
