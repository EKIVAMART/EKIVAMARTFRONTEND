'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, MessageSquare, Send, Star } from '@/components/ui/platform-icons';
import toast from 'react-hot-toast';
import { reviewsApi } from '@/lib/api';

interface Review {
  id: string;
  customerName?: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerifiedPurchase: boolean;
  replies: Array<{ id: string; responderRole: string; message: string }>;
}

export default function ProductReviewsPanel({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyId, setReplyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await reviewsApi.listByProduct(productId);
      if (!response?.success) throw new Error(response?.message || 'Could not load reviews.');
      const payload = Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
      setReviews(payload);
    } catch (cause: any) {
      setError(cause?.response?.data?.message || cause?.message || 'Could not load reviews.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { void load(); }, [load]);

  const sendReply = async (event: React.FormEvent, reviewId: string) => {
    event.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const response = await reviewsApi.reply(reviewId, message.trim());
      if (!response?.success) throw new Error(response?.message || 'Could not send reply.');
      toast.success('Reply posted');
      setReplyId(null);
      setMessage('');
      await load();
    } catch (cause: any) {
      toast.error(cause?.response?.data?.message || cause?.message || 'Could not send reply.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 size={18} className="animate-spin" /> Loading reviews…</div>;
  if (error) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error} <button type="button" onClick={() => void load()} className="ml-2 font-semibold underline">Retry</button></div>;
  if (!reviews.length) return <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center"><MessageSquare size={24} className="text-emerald-700" /><p className="mt-3 font-semibold text-slate-800">No reviews yet</p><p className="mt-1 text-sm text-slate-500">Customer feedback for this product will appear here.</p></div>;

  return <div className="space-y-4">
    <p className="text-sm text-slate-500">{reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'}</p>
    {reviews.map((review) => <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><p className="font-semibold text-slate-900">{review.customerName || 'Customer'}</p><div className="mt-1 flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} className={index < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} aria-hidden="true" />)}</div></div>
        {review.isVerifiedPurchase && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">Verified purchase</span>}
      </div>
      {review.title && <h4 className="mt-3 font-semibold text-slate-800">{review.title}</h4>}
      {review.comment && <p className="mt-1 text-sm leading-relaxed text-slate-600">{review.comment}</p>}
      {review.replies?.map((reply) => <div key={reply.id} className="mt-3 border-l-2 border-emerald-300 bg-emerald-50/50 px-3 py-2 text-sm"><p className="font-semibold text-emerald-900">{reply.responderRole === 'admin' ? 'Admin reply' : 'Seller reply'}</p><p className="mt-1 text-slate-700">{reply.message}</p></div>)}
      {replyId === review.id ? <form onSubmit={(event) => void sendReply(event, review.id)} className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={message} onChange={(event) => setMessage(event.target.value.slice(0, 3000))} placeholder="Write a thoughtful reply…" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none" /><button type="submit" disabled={sending || !message.trim()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Send size={14} /> Send</button><button type="button" onClick={() => { setReplyId(null); setMessage(''); }} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600">Cancel</button></form> : <button type="button" onClick={() => { setReplyId(review.id); setMessage(''); }} className="mt-4 text-sm font-semibold text-emerald-800 hover:underline">Reply to review</button>}
    </article>)}
  </div>;
}
