import { NextResponse } from 'next/server';
import { db } from '@/lib/models';
import { verifyAuth } from '@/lib/api-auth';

export async function GET(request: Request) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const role = searchParams.get('role') || undefined;
    const limitStr = searchParams.get('limit') || '50';
    const offsetStr = searchParams.get('offset') || '0';

    if (status && !['active', 'unsubscribed', 'bounced'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bad Request - status must be one of: active, unsubscribed, bounced',
        },
        { status: 400 }
      );
    }

    if (role && !['customer', 'vendor'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bad Request - role must be one of: customer, vendor',
        },
        { status: 400 }
      );
    }

    const limit = parseInt(limitStr, 10);
    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bad Request - limit must be a positive integer',
        },
        { status: 400 }
      );
    }

    const offset = parseInt(offsetStr, 10);
    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bad Request - offset must be a non-negative integer',
        },
        { status: 400 }
      );
    }

    const query: any = {};
    if (status) query.status = status;
    if (role) query.role = role;

    const subscribersCollection = await db.waitlistSubscribers();

    const [subscribers, total] = await Promise.all([
      subscribersCollection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray(),
      subscribersCollection.countDocuments(query),
    ]);

    const mappedSubscribers = subscribers.map((sub: any) => ({
      id: sub.id || sub._id.toString(),
      email: sub.email,
      firstName: sub.firstName,
      lastName: sub.lastName,
      fullName: sub.fullName || `${sub.firstName || ''} ${sub.lastName || ''}`.trim(),
      phoneNumber: sub.phoneNumber || '',
      role: sub.role,
      interestTags: sub.interestTags || [],
      status: sub.status,
      referralSource: sub.referralSource || '',
      createdAt: sub.createdAt ? new Date(sub.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      message: 'Request successful',
      data: {
        subscribers: mappedSubscribers,
        total,
      },
    });
  } catch (error: any) {
    console.error('[waitlist subscribers error]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal Server Error - Failed to fetch subscribers',
      },
      { status: 500 }
    );
  }
}
