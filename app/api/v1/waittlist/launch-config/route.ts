import { NextResponse } from 'next/server';
import { db } from '@/lib/models';
import { verifyAuth } from '@/lib/api-auth';

// Helper delay for simulating email batches
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const launchConfigCollection = await db.launchConfig();
    let config = await launchConfigCollection.findOne({ configId: 'launch' });

    if (!config) {
      config = {
        configId: 'launch',
        launchDate: new Date('2026-10-15T00:00:00.000Z'),
        title: 'Something Amazing is Coming',
        subtitle: "Nigeria's Premier Multi-Vendor Marketplace",
        isLaunched: false,
        updatedAt: new Date('2026-06-01T10:00:00.000Z'),
      };
      await launchConfigCollection.insertOne(config);
    }

    return NextResponse.json({
      success: true,
      message: 'Request successful',
      data: {
        launchDate: config.launchDate
          ? new Date(config.launchDate).toISOString()
          : null,
        title: config.title,
        subtitle: config.subtitle,
        isLaunched: !!config.isLaunched,
        updatedAt: config.updatedAt
          ? new Date(config.updatedAt).toISOString()
          : null,
      },
    });
  } catch (error: any) {
    console.error('[GET launch-config error]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal Server Error - Failed to fetch launch configuration',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json();
    const { launchDate, title, subtitle, sendBroadcast, broadcastReason } = body;

    // Field Validation
    if (!launchDate) {
      return NextResponse.json(
        { success: false, message: 'Bad Request - launchDate is required' },
        { status: 400 }
      );
    }

    const launchDateObj = new Date(launchDate);
    if (isNaN(launchDateObj.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bad Request - launchDate must be a valid ISO-8601 datetime string',
        },
        { status: 400 }
      );
    }

    if (launchDateObj <= new Date()) {
      return NextResponse.json(
        { success: false, message: 'Bad Request - launchDate must be a valid future date' },
        { status: 400 }
      );
    }

    if (title && title.length > 255) {
      return NextResponse.json(
        { success: false, message: 'Bad Request - Title must not exceed 255 characters' },
        { status: 400 }
      );
    }

    if (subtitle && subtitle.length > 500) {
      return NextResponse.json(
        { success: false, message: 'Bad Request - Subtitle must not exceed 500 characters' },
        { status: 400 }
      );
    }

    if (sendBroadcast) {
      if (!broadcastReason || !broadcastReason.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: 'Bad Request - broadcastReason is required when sendBroadcast is true',
          },
          { status: 400 }
        );
      }
      if (broadcastReason.length > 1000) {
        return NextResponse.json(
          {
            success: false,
            message: 'Bad Request - Broadcast reason must not exceed 1000 characters',
          },
          { status: 400 }
        );
      }
    }

    const launchConfigCollection = await db.launchConfig();
    const now = new Date();

    const updatedData = {
      launchDate: launchDateObj,
      title: title || '',
      subtitle: subtitle || '',
      isLaunched: false,
      updatedAt: now,
    };

    // Update in database
    await launchConfigCollection.updateOne(
      { configId: 'launch' },
      { $set: updatedData },
      { upsert: true }
    );

    // If sendBroadcast is true, notify subscribers
    if (sendBroadcast) {
      const subscribersCollection = await db.waitlistSubscribers();
      const activeSubscribers = await subscribersCollection
        .find({ status: 'active' })
        .toArray();

      const batchSize = 50;
      for (let i = 0; i < activeSubscribers.length; i += batchSize) {
        const batch = activeSubscribers.slice(i, i + batchSize);

        // Simulate sending emails to each subscriber in the batch
        batch.forEach((sub: any) => {
          const unsubscribeLink = `${
            request.headers.get('origin') || 'http://localhost:3000'
          }/unsubscribe?token=${sub.unsubscribeToken || 'token'}`;
          console.log(
            `[Broadcast] Sent launch update notification to ${sub.email}. Reason: ${broadcastReason}. Unsubscribe: ${unsubscribeLink}`
          );
        });

        // Pause 500ms between batches
        if (i + batchSize < activeSubscribers.length) {
          await delay(500);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Launch configuration updated successfully',
      data: {
        launchDate: updatedData.launchDate.toISOString(),
        title: updatedData.title,
        subtitle: updatedData.subtitle,
        isLaunched: updatedData.isLaunched,
        updatedAt: updatedData.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[PUT launch-config error]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal Server Error - Failed to update launch configuration',
      },
      { status: 500 }
    );
  }
}
