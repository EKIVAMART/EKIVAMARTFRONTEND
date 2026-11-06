import { getDatabase } from '@/lib/mongodb';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  try {
    const db = await getDatabase();
    await db.collection<{ _id: string; subscribedAt: Date }>('newsletterSubscribers')
      .updateOne({ _id: email }, { $setOnInsert: { subscribedAt: new Date() } }, { upsert: true });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Subscriptions are temporarily unavailable. Please try again later.' }, { status: 503 });
  }
}
