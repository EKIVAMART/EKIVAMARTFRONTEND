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
    const subscribersCollection = await db.waitlistSubscribers();

    // Auto-seed if empty
    const count = await subscribersCollection.countDocuments({});
    if (count === 0) {
      const mockSubscribers = [];
      const referralSources = ['facebook', 'instagram', 'twitter', 'linkedin', 'google', 'friend'];
      const interestTagsOptions = {
        customer: ['flowers', 'weddings', 'gifts', 'events', 'delivery'],
        vendor: ['selling', 'florist', 'events', 'wholesale', 'delivery']
      };

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      const olderDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

      let unsubscribedCount = 0;
      let bouncedCount = 0;
      let todayCount = 0;
      let weekCount = 0;

      for (let i = 0; i < 132; i++) {
        const role = i < 95 ? 'customer' : 'vendor';
        
        let status = 'active';
        if (unsubscribedCount < 10 && i % 13 === 0) {
          status = 'unsubscribed';
          unsubscribedCount++;
        } else if (bouncedCount < 2 && i % 65 === 0) {
          status = 'bounced';
          bouncedCount++;
        }

        let createdAt = olderDate;
        if (todayCount < 5) {
          createdAt = new Date(startOfToday.getTime() + todayCount * 60 * 60 * 1000);
          todayCount++;
          weekCount++;
        } else if (weekCount < 28) {
          createdAt = new Date(startOfWeek.getTime() + (weekCount - 5) * 4 * 60 * 60 * 1000);
          weekCount++;
        }

        const email = role === 'customer' 
          ? `customer.user${i}@example.com`
          : `vendor.shop${i}@example.com`;

        const firstName = role === 'customer' ? `Jane${i}` : `John${i}`;
        const lastName = role === 'customer' ? `Doe${i}` : `Smith${i}`;

        const tags = interestTagsOptions[role].slice(0, 2);

        mockSubscribers.push({
          id: `sub-uuid-${1000 + i}`,
          email,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          phoneNumber: `+23480${Math.floor(10000000 + Math.random() * 90000000)}`,
          role,
          interestTags: tags,
          status,
          referralSource: referralSources[i % referralSources.length],
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          unsubscribeToken: `unsub-token-uuid-${2000 + i}`,
          createdAt,
          updatedAt: now,
        });
      }
      await subscribersCollection.insertMany(mockSubscribers);
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      total,
      active,
      unsubscribed,
      bounced,
      todaySignups,
      weekSignups,
      customers,
      vendors,
    ] = await Promise.all([
      subscribersCollection.countDocuments({}),
      subscribersCollection.countDocuments({ status: 'active' }),
      subscribersCollection.countDocuments({ status: 'unsubscribed' }),
      subscribersCollection.countDocuments({ status: 'bounced' }),
      subscribersCollection.countDocuments({ createdAt: { $gte: startOfToday } }),
      subscribersCollection.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      subscribersCollection.countDocuments({ role: 'customer' }),
      subscribersCollection.countDocuments({ role: 'vendor' }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Request successful',
      data: {
        total,
        active,
        unsubscribed,
        bounced,
        todaySignups,
        weekSignups,
        customers,
        vendors,
      },
    });
  } catch (error: any) {
    console.error('[waitlist stats error]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal Server Error - Failed to fetch waitlist statistics',
      },
      { status: 500 }
    );
  }
}
