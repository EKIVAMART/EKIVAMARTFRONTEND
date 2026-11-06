'use client';

import { useState, type FormEvent } from 'react';

export default function Newsletter() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true); setMessage('');
    try {
      const email = new FormData(form).get('email');
      const response = await fetch('/api/newsletter', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email }) });
      if (!response.ok) throw new Error((await response.json()).error);
      form.reset(); setMessage('You’re subscribed to EkivaMart updates.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Please try again later.');
    } finally { setPending(false); }
  }
  return <section className="ek-newsletter"><div><span className="ek-kicker">Newsletter</span><h2>The marketplace edit</h2><p>New arrivals, store discoveries and app launch news in your inbox.</p></div>
    <form onSubmit={subscribe}><label htmlFor="newsletter-email">Email address</label><div><input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254}/><button className="ek-action" disabled={pending}>{pending ? 'Subscribing…' : 'Subscribe'}</button></div><small role="status">{message}</small></form>
  </section>;
}
