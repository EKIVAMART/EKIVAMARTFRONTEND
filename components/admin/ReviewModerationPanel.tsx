'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, ShieldAlert, Flag, Check, X, ShieldOff, EyeOff, Eye, Send, Reply, User, Star } from 'lucide-react';
import { reviewsApi } from '@/lib/api';
import { useAppSelector } from '@/lib/hooks';
import toast from 'react-hot-toast';

interface ReviewReply {
  id: string;
  responderId: string;
  responderName?: string;
  responderRole: 'vendor' | 'admin';
  message: string;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: string;
  productId: string;
  productName?: string;
  customerId: string;
  customerName?: string;
  orderId: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerifiedPurchase: boolean;
  isHidden?: boolean;
  isFlagged?: boolean;
  flaggedReason?: string | null;
  createdAt: string;
  updatedAt: string;
  replies: ReviewReply[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={`${
            i < rating ? 'fill-amber-400 text-slate-400' : 'fill-gray-155 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewModerationPanel() {
  const { user } = useAppSelector(state => state.auth);
  const userRole = user?.role || 'VENDOR';
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userRole);

  const [productId, setProductId] = useState(''); // Default test product
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  // Moderate flag reason state
  const [flaggingReviewId, setFlaggingReviewId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');

  // Reply states
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    if (productId.trim()) {
      void fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewsApi.listByProduct(productId.trim());
      if (res?.success) {
        setReviews(res.data?.data || []);
      }
    } catch {
      toast.error('Could not load reviews for this product');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: string, action: 'hide' | 'restore' | 'unflag', reason?: string) => {
    try {
      const res = await reviewsApi.moderate(id, { action, reason });
      if (res?.success) {
        toast.success(`Review status updated: ${action}`);
        void fetchReviews();
      } else {
        toast.error(res?.message || 'Failed to moderate review');
      }
    } catch {
      toast.error('Failed to moderate review');
    }
  };

  const handleFlagReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flaggingReviewId || !flagReason.trim()) return;
    try {
      const res = await reviewsApi.moderate(flaggingReviewId, {
        action: 'flag',
        reason: flagReason.trim(),
      });
      if (res?.success) {
        toast.success('Review flagged for follow-up');
        setFlaggingReviewId(null);
        setFlagReason('');
        void fetchReviews();
      } else {
        toast.error(res?.message || 'Failed to flag review');
      }
    } catch {
      toast.error('Failed to flag review');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReviewId || !replyMessage.trim() || submittingReply) return;
    setSubmittingReply(true);
    try {
      const res = await reviewsApi.reply(replyingReviewId, replyMessage.trim());
      if (res?.success) {
        toast.success('Reply submitted successfully');
        setReplyingReviewId(null);
        setReplyMessage('');
        void fetchReviews();
      } else {
        toast.error(res?.message || 'Failed to send reply');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="bg-white rounded-md border shadow-sm p-6 sm:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <MessageSquare size={20} className="text-brand-600" /> Review Moderation & Replies
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">Moderate customer reviews or post official responses.</p>
        </div>

        {/* Product selector */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">Product UUID:</span>
          <input
            type="text"
            value={productId}
            onChange={e => setProductId(e.target.value)}
            placeholder="Enter Product UUID..."
            className="px-3 py-1.5 border rounded-md text-xs focus:outline-none focus:border-brand-400 bg-gray-55 min-w-[220px]"
          />
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 gap-3">
          <div className="w-8 h-8 border-3 border-brand-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-400 font-bold text-xs">Fetching product reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-gray-50 border rounded-md p-12 text-center flex flex-col items-center">
          <MessageSquare size={32} className="text-gray-300 mb-2" />
          <p className="text-xs text-gray-500 font-semibold">No reviews found for this product UUID.</p>
          <p className="text-[10px] text-gray-400 mt-1">Make sure you are querying an active product that has received reviews.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`p-5 border rounded-md shadow-sm transition flex flex-col gap-4 ${
                review.isHidden ? 'bg-gray-50/50 border-dashed border-gray-300' : 'bg-white'
              }`}
            >

              {/* Review Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <User size={13} className="text-gray-400" />
                      {review.customerName || 'Verified Buyer'}
                    </span>
                    <StarRating rating={review.rating} />
                    {review.isVerifiedPurchase && (
                      <span className="text-[9px] uppercase font-black bg-teal-50 border border-teal-200 text-slate-700 px-1.5 py-0.2 rounded-md">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold">
                    Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Moderation Controls (ADMIN/SUPER_ADMIN only) */}
                {isAdmin && (
                  <div className="flex gap-1">
                    {review.isHidden ? (
                      <button
                        onClick={() => handleModerate(review.id, 'restore')}
                        className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-slate-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center gap-1 transition"
                        title="Restore public view"
                      >
                        <Eye size={12} /> Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => handleModerate(review.id, 'hide')}
                        className="px-2.5 py-1 text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center gap-1 transition"
                        title="Hide from public views"
                      >
                        <EyeOff size={12} /> Hide
                      </button>
                    )}
                    {review.isFlagged ? (
                      <button
                        onClick={() => handleModerate(review.id, 'unflag')}
                        className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-slate-700 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-1 transition"
                        title="Clear warning flag"
                      >
                        <ShieldOff size={12} /> Unflag
                      </button>
                    ) : (
                      <button
                        onClick={() => setFlaggingReviewId(review.id)}
                        className="px-2.5 py-1 text-[10px] font-bold bg-rose-50 text-slate-700 border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center gap-1 transition"
                        title="Flag review"
                      >
                        <Flag size={12} /> Flag
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Review Text */}
              <div className="space-y-1 bg-gray-50/40 p-3 rounded-md border border-gray-100">
                {review.title && <h4 className="font-bold text-slate-800 text-sm">{review.title}</h4>}
                {review.comment && <p className="text-xs text-gray-650 leading-relaxed font-semibold">{review.comment}</p>}
                {review.isFlagged && review.flaggedReason && (
                  <div className="mt-2 text-[10px] text-slate-700 bg-rose-50 border border-rose-100 rounded-lg p-2 flex items-center gap-1.5">
                    <ShieldAlert size={12} />
                    <span>Flagged Reason: <span className="font-bold">{review.flaggedReason}</span></span>
                  </div>
                )}
              </div>

              {/* Replies List */}
              {review.replies && review.replies.length > 0 && (
                <div className="pl-4 border-l-2 border-brand-200 space-y-2">
                  {review.replies.map((reply) => (
                    <div key={reply.id} className="bg-brand-50/30 border border-brand-100/50 rounded-r-xl p-3 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-brand-900 capitalize">
                          {reply.responderRole === 'admin' ? 'Official Store Response' : 'Seller Response'}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed font-medium">{reply.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form Trigger */}
              {!replyingReviewId && (
                <button
                  onClick={() => setReplyingReviewId(review.id)}
                  className="self-start text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Reply size={12} /> Reply to Review
                </button>
              )}

              {/* Reply input form */}
              {replyingReviewId === review.id && (
                <form onSubmit={handleSendReply} className="flex gap-2 items-center animate-[slideDown_0.15s_ease-out] pt-2 border-t">
                  <input
                    type="text"
                    required
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value.substring(0, 3000))}
                    placeholder="Write a response to this customer..."
                    className="flex-1 px-3 py-2 border rounded-md text-xs bg-white focus:outline-none focus:border-brand-400"
                  />
                  <button
                    type="submit"
                    disabled={submittingReply || !replyMessage.trim()}
                    className="px-4 py-2 bg-[#228b22] hover:bg-[#1c711c] text-white rounded-md text-xs font-bold transition flex items-center gap-1 disabled:opacity-50 flex-shrink-0"
                  >
                    <Send size={12} /> Post Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReplyingReviewId(null); setReplyMessage(''); }}
                    className="p-2 border rounded-md text-xs font-bold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </form>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Flag review dialog box */}
      {flaggingReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-sm rounded-md shadow-sm p-6">
            <h3 className="font-bold text-base text-slate-800 mb-2">Flag Review</h3>
            <p className="text-xs text-gray-500 mb-4 font-semibold">Flagged reviews are listed for admin investigations. Provide flag reason:</p>

            <form onSubmit={handleFlagReview} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Reason (e.g. offensive, spam, fake review)..."
                value={flagReason}
                onChange={e => setFlagReason(e.target.value.substring(0, 500))}
                className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-brand-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setFlaggingReviewId(null); setFlagReason(''); }}
                  className="px-4 py-2 border rounded-md text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold transition"
                >
                  Flag Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
