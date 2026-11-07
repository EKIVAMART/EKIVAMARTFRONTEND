export async function POST(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (baseUrl) {
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: await request.text(),
        signal: AbortSignal.timeout(5000),
      });
      const { success, message } = await response.json();
      if (response.ok) return Response.json({ success });
      if (response.status < 500) return Response.json({ error: message }, { status: response.status });
    } catch {
      // Return the same public error when the backend cannot be reached.
    }
  }
  return Response.json({ error: 'Subscriptions are temporarily unavailable. Please try again later.' }, { status: 503 });
}
