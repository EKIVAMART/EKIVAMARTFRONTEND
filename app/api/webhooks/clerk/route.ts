import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook } from '@clerk/backend/webhooks';
import { db } from '@/lib/models';

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  throw new Error('CLERK_WEBHOOK_SECRET is not set');
}

export async function POST(req: NextRequest) {
  // Verify incoming webhook signature and get the event
  let event;
  try {
    const payload = await req.text();
    event = await verifyWebhook({
      headers: req.headers,
      body: payload,
    } as any);
    // returns { type: "user.created", data: { … } }
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 401 }
    );
  }

  const { type, data } = event;

  try {
    switch (type) {
      case 'user.created': {
        const email = data.email_addresses?.[0]?.email_address;
        const firstName = data.first_name ?? '';
        const lastName = data.last_name ?? '';
        const name = `${firstName} ${lastName}`.trim();

        if (!email) {
          console.warn('User created event missing email:', data.id);
          return NextResponse.json(
            { error: 'Email is required for user creation' },
            { status: 400 }
          );
        }

        await db.upsertUser(data.id, {
          clerkId: data.id,
          email,
          name: name || 'User',
          image: data.image_url || '',
        });
        console.log(`User created successfully: ${data.id}`);
        break;
      }

      case 'user.updated': {
        const email = data.email_addresses?.[0]?.email_address;
        const firstName = data.first_name ?? '';
        const lastName = data.last_name ?? '';
        const name = `${firstName} ${lastName}`.trim();

        await db.upsertUser(data.id, {
          clerkId: data.id,
          email: email || '',
          name: name || 'User',
          image: data.image_url || '',
        });
        console.log(`User updated successfully: ${data.id}`);
        break;
      }

      case 'user.deleted': {
        if (!data.id) {
          console.warn('User deletion event missing ID');
          return NextResponse.json(
            { error: 'User ID is required for deletion' },
            { status: 400 }
          );
        }

        const result = await db.deleteUserByClerkId(data.id);
        if (result.deletedCount === 0) {
          console.warn(`User not found for deletion: ${data.id}`);
        } else {
          console.log(`User deleted successfully: ${data.id}`);
        }
        break;
      }

      default:
        console.warn('Unhandled webhook event type:', type);
        // Don't fail on unknown event types - they might be added in future
        break;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook processing failed:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
