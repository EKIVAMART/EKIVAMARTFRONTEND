'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, Calendar, ArrowRight, Star, MessageSquare, Edit3, 
  Trash2, RefreshCw, AlertCircle, CheckCircle2, Truck, Check, HelpCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { ordersApi, reviewsApi } from '@/lib/api';
import { useAppSelector } from '@/lib/hooks';
import toast from 'react-hot-toast';

/* ─── Enums & Color Badges ──────────────────────────────────────────────── */
const orderStatusStyles: Record<string, { label: string; bg: string; text: string }> = {
  pending_payment: { label: 'Pending Payment', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  payment_failed: { label: 'Payment Failed', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
  confirmed: { label: 'Confirmed', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  processing: { label: 'Processing', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
  shipped: { label: 'Shipped', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  delivered: { label: 'Delivered', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700' },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-50 border-gray-200', text: 'text-gray-600' },
  refunded: { label: 'Refunded', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
};

const refundStatusStyles: Record<string, { label: string; bg: string; text: string }> = {
  none: { label: 'No Refund', bg: 'bg-gray-50 border-gray-100', text: 'text-gray-400' },
  requested: { label: 'Refund Requested', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
  approved: { label: 'Refund Approved', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  rejected: { label: 'Refund Rejected', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
  processed: { label: 'Refund Processed', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700' },
};

function StarRating({ rating, setRating, interactive = false }: { rating: number; setRating?: (r: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starIndex = i + 1;
        const active = starIndex <= rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => setRating?.(starIndex)}
            className={`transition-transform hover:scale-110 ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              size={20}
              className={`${
                active ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

const normalizeOrdersPayload = (payload: unknown): any[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Record<string, unknown>;
  const nested = record.data;

  if (Array.isArray(record.orders)) return record.orders as any[];
  if (Array.isArray(record.data)) return record.data as any[];
  if (Array.isArray((record as any).results)) return (record as any).results as any[];
  if (Array.isArray((record as any).items)) return (record as any).items as any[];
  if (Array.isArray((record as any).docs)) return (record as any).docs as any[];

  if (nested && typeof nested === 'object') {
    const nestedRecord = nested as Record<string, unknown>;
    if (Array.isArray(nestedRecord.orders)) return nestedRecord.orders as any[];
    if (Array.isArray(nestedRecord.data)) return nestedRecord.data as any[];
    if (Array.isArray((nestedRecord as any).results)) return (nestedRecord as any).results as any[];
    if (Array.isArray((nestedRecord as any).items)) return (nestedRecord as any).items as any[];
    if (Array.isArray((nestedRecord as any).docs)) return (nestedRecord as any).docs as any[];
  }

  return [];
};

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'eligible'>('history');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);

  // Eligible products
  const [eligibleProducts, setEligibleProducts] = useState<any[]>([]);
  const [eligibleLoading, setEligibleLoading] = useState(false);

  // Review Dialog Modal state
  const [selectedProductForReview, setSelectedProductForReview] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    // Small delay to let Redux rehydrate before deciding auth state
    const t = setTimeout(() => setAuthResolved(true), 300);
    return () => clearTimeout(t);
  }, []);

  const fetchOrders = async (targetPage = page) => {
    setOrdersLoading(true);
    try {
      const res = await ordersApi.getMyOrders({ page: targetPage, limit: 10 });
      const list = normalizeOrdersPayload(res);
      setOrders(list);
      const resData = (res as any)?.data ?? res;
      const total = resData?.total ?? (res as any)?.total ?? list.length;
      const pages = resData?.totalPages ?? (res as any)?.totalPages ?? Math.ceil(total / 10) ?? 1;
      setTotalOrders(total);
      setTotalPages(pages);
    } catch {
      setOrders([]);
      toast.error('Could not retrieve orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (authResolved && isAuthenticated) {
      void fetchOrders(page);
    }
  }, [authResolved, isAuthenticated, page]);

  const fetchEligibleProducts = async () => {
    setEligibleLoading(true);
    try {
      const res = await reviewsApi.getEligible({ includeReviewed: false });
      if (res?.success) {
        setEligibleProducts(res.data || []);
      }
    } catch {
      toast.error('Could not load eligible products');
    } finally {
      setEligibleLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'eligible') {
      void fetchEligibleProducts();
    }
  }, [activeTab]);

  const handleOpenReviewModal = (item: any) => {
    setSelectedProductForReview(item);
    setReviewRating(5);
    setReviewTitle('');
    setReviewComment('');
  };

  const handleCloseReviewModal = () => {
    setSelectedProductForReview(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForReview) return;
    setSubmittingReview(true);
    try {
      const res = await reviewsApi.create(selectedProductForReview.productId, {
        orderId: selectedProductForReview.orderId,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim() || undefined,
      });
      if (res?.success) {
        toast.success('Thank you! Your review has been submitted successfully.');
        handleCloseReviewModal();
        void fetchEligibleProducts();
      } else {
        toast.error(res?.message || 'Failed to submit review');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  /* ── Guard: not yet resolved ─────────────────────────────────────── */
  if (!authResolved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Guard: unauthenticated ──────────────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={36} className="text-violet-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Sign in to view orders</h2>
          <p className="text-slate-500 text-sm mt-3 font-medium leading-relaxed">
            You need to be logged in to view your order history and track deliveries.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full mt-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-200"
          >
            Go to Login <ArrowRight size={16} />
          </button>
          <button
            onClick={() => router.back()}
            className="w-full mt-3 py-3 text-sm font-semibold text-gray-400 hover:text-gray-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-850 tracking-tight">Order Management</h1>
            <p className="text-gray-500 font-semibold mt-1">Track orders, request refunds, manage transactions and write verified reviews.</p>
          </div>
          <button 
            onClick={() => { activeTab === 'history' ? void fetchOrders() : void fetchEligibleProducts(); }}
            className="flex items-center gap-2 self-start sm:self-center px-4 py-2 border rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition"
          >
            <RefreshCw size={15} /> Refresh List
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 gap-6 mb-6">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all relative ${
              activeTab === 'history' ? 'border-[#9d4ae3] text-[#9d4ae3]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Order History ({orders.length})
            {activeTab === 'history' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#9d4ae3] rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab('eligible')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all relative ${
              activeTab === 'eligible' ? 'border-[#9d4ae3] text-[#9d4ae3]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Review Purchases
            {activeTab === 'eligible' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#9d4ae3] rounded-full" />}
          </button>
        </div>

        {/* Tab 1: Order History */}
        {activeTab === 'history' && (
          <div>
            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white border rounded-2xl p-6 animate-pulse flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-32 bg-gray-100 rounded" />
                      <div className="h-4 w-24 bg-gray-100 rounded" />
                    </div>
                    <div className="h-[1px] bg-gray-100 w-full" />
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-48 bg-gray-100 rounded" />
                        <div className="h-3 w-32 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border shadow-sm flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                  <ShoppingBag size={28} className="text-[#9d4ae3]" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">No orders yet</h3>
                <p className="text-gray-500 max-w-sm mt-1.5 font-medium">You haven&apos;t placed any orders with us yet. Check out our catalogue!</p>
                <Link href="/" className="mt-6 px-6 py-2.5 bg-[#9d4ae3] text-white rounded-xl text-sm font-bold hover:bg-[#8236be] transition">
                  Shop Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, i) => {
                  const orderId = order.orderId || order.id || order._id;
                  const orderNumber = order.orderNumber || order.orderNo || (orderId ? `#${String(orderId).slice(-8).toUpperCase()}` : `ORD-${i + 1}`);
                  const status = orderStatusStyles[order.status] || { label: order.status, bg: 'bg-gray-100', text: 'text-gray-600' };
                  const dateStr = new Date(order.createdAt || order.orderDate || order.date).toLocaleDateString('en-NG', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  });

                  return (
                    <div 
                      key={orderId || i} 
                      className="bg-white border hover:border-purple-200 hover:shadow-md transition rounded-2xl overflow-hidden shadow-sm flex flex-col"
                    >
                      {/* Order Summary Header */}
                      <div className="bg-gray-50/50 p-5 border-b flex flex-wrap justify-between items-center gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order Reference</p>
                          <p className="font-bold text-slate-800 text-sm">{orderNumber}</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Date Placed</p>
                            <p className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                              <Calendar size={13} className="text-gray-400" />
                              {dateStr}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Amount</p>
                            <p className="text-sm font-black text-[#9d4ae3]">{order.totalAmount?.formatted || `₦${order.totalAmount?.amount?.toLocaleString() || order.total?.toLocaleString()}`}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border rounded-full ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                          {order.refundStatus && order.refundStatus !== 'none' && (
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border rounded-full ${
                              refundStatusStyles[order.refundStatus]?.bg || 'bg-gray-100 border-gray-200'
                            } ${refundStatusStyles[order.refundStatus]?.text || 'text-gray-600'}`}>
                              {refundStatusStyles[order.refundStatus]?.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Line Items Sneak-Peak */}
                      <div className="p-5 flex-1 space-y-4">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                              {item.productImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag size={18} className="text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-slate-800 text-sm truncate">{item.productName}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">Quantity: {item.quantity} • SKU: {item.productSku || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-700">{item.subtotal?.formatted || `₦${item.subtotal?.amount?.toLocaleString()}`}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions Footer with Delivery Status */}
                      <div className="bg-gray-50/40 px-5 py-3.5 border-t flex flex-wrap justify-between items-center gap-3">
                        <div>
                          {['confirmed', 'processing', 'shipped'].includes(order.status) && order.expectedDelivery ? (
                            <div className="flex items-center gap-2 text-xs font-semibold text-purple-900">
                              <div className="w-6 h-6 rounded-lg bg-purple-100 text-[#9d4ae3] flex items-center justify-center shrink-0">
                                <Truck size={13} />
                              </div>
                              <span>
                                Expected by <strong className="text-purple-950 font-bold">{order.expectedDelivery.expectedDeliveryLabel}</strong>
                              </span>
                              {order.expectedDelivery.isInterState && (
                                <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded font-bold">
                                  Inter-state
                                </span>
                              )}
                            </div>
                          ) : order.status === 'delivered' && order.deliveredAt ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                              <span>
                                Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        <Link 
                          href={`/orders/${order.orderId || order.id || order.orderNumber}`}
                          className="px-4 py-2 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition ml-auto"
                        >
                          Manage Order <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {/* Customer Orders Pagination */}
                {(totalPages > 1 || page > 1) && (
                  <div className="p-4 border border-gray-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-white shadow-sm mt-4">
                    <span className="font-semibold text-slate-500">
                      Showing {totalOrders === 0 ? 0 : (page - 1) * 10 + 1} to {Math.min(page * 10, totalOrders)} of {totalOrders} orders (Page {page} of {totalPages})
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={page <= 1 || ordersLoading}
                        onClick={() => {
                          setPage(p => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 font-bold flex items-center gap-1 hover:bg-slate-50 transition"
                      >
                        <ChevronLeft size={14} /> Previous
                      </button>

                      {(() => {
                        const pages: (number | string)[] = [];
                        if (totalPages <= 7) {
                          for (let i = 1; i <= totalPages; i++) pages.push(i);
                        } else {
                          if (page <= 4) {
                            for (let i = 1; i <= 5; i++) pages.push(i);
                            pages.push('...');
                            pages.push(totalPages);
                          } else if (page >= totalPages - 3) {
                            pages.push(1);
                            pages.push('...');
                            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
                          } else {
                            pages.push(1);
                            pages.push('...');
                            pages.push(page - 1);
                            pages.push(page);
                            pages.push(page + 1);
                            pages.push('...');
                            pages.push(totalPages);
                          }
                        }

                        return pages.map((p, idx) => {
                          if (typeof p === 'string') {
                            return (
                              <span key={`el-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold select-none text-xs">
                                …
                              </span>
                            );
                          }
                          return (
                            <button
                              key={p}
                              onClick={() => {
                                setPage(p);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              disabled={ordersLoading}
                              className={`w-8 h-8 rounded-lg font-bold text-xs transition ${
                                page === p
                                  ? 'bg-[#9d4ae3] text-white shadow-xs'
                                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {p}
                            </button>
                          );
                        });
                      })()}

                      <button
                        disabled={page >= totalPages || ordersLoading}
                        onClick={() => {
                          setPage(p => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 font-bold flex items-center gap-1 hover:bg-slate-50 transition"
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Write Reviews / Eligible Purchases */}
        {activeTab === 'eligible' && (
          <div>
            {eligibleLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white border rounded-2xl p-6 animate-pulse flex justify-between items-center gap-4">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-4 w-40 bg-gray-100 rounded" />
                        <div className="h-3 w-28 bg-gray-100 rounded" />
                      </div>
                    </div>
                    <div className="h-8 w-24 bg-gray-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : eligibleProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border shadow-sm flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                  <CheckCircle2 size={28} className="text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">All caught up!</h3>
                <p className="text-gray-500 max-w-sm mt-1.5 font-medium">You don&apos;t have any delivered items waiting to be reviewed right now.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border shadow-sm divide-y divide-gray-100">
                {eligibleProducts.map((item, idx) => (
                  <div key={idx} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-gray-50/50 transition">
                    <div className="flex gap-4 min-w-0">
                      <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                        {item.productImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={20} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{item.productName}</h4>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>Order: <span className="font-bold">{item.orderNumber}</span></span>
                          <span>•</span>
                          <span>Delivered: <span className="font-semibold text-teal-600">{new Date(item.deliveredAt).toLocaleDateString()}</span></span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenReviewModal(item)}
                      className="self-start sm:self-center px-4 py-2 border border-purple-200 text-[#9d4ae3] bg-purple-50/40 hover:bg-purple-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <MessageSquare size={14} /> Write Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Write Review Modal ────────────────────────────────────────── */}
      {selectedProductForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-[scaleIn_0.2s_ease-out]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#9d4ae3] to-[#8236be] px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Write a Review</h3>
                <p className="text-xs text-fuchsia-100">Verified Purchase Review</p>
              </div>
              <button 
                onClick={handleCloseReviewModal}
                className="text-white/80 hover:text-white text-sm font-semibold hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReview} className="p-6 space-y-4 flex-1">
              {/* Product Info */}
              <div className="flex gap-3 items-center pb-4 border-b">
                <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border">
                  {selectedProductForReview.productImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedProductForReview.productImage} alt={selectedProductForReview.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={18} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{selectedProductForReview.productName}</h4>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">Order: {selectedProductForReview.orderNumber}</p>
                </div>
              </div>

              {/* Rating selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Product Rating</label>
                <div className="flex items-center gap-2">
                  <StarRating rating={reviewRating} setRating={setReviewRating} interactive={true} />
                  <span className="text-sm font-bold text-slate-700 ml-1">({reviewRating}/5 Stars)</span>
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <label htmlFor="review-title" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Review Headline</label>
                <input
                  id="review-title"
                  type="text"
                  required
                  placeholder="e.g. Absolutely amazing product! / Highly recommended"
                  value={reviewTitle}
                  onChange={e => setReviewTitle(e.target.value.substring(0, 150))}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />
                <p className="text-[10px] text-gray-400 text-right font-medium">{reviewTitle.length}/150 chars</p>
              </div>

              {/* Comment text area */}
              <div className="space-y-1.5">
                <label htmlFor="review-comment" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Detailed Comment</label>
                <textarea
                  id="review-comment"
                  rows={4}
                  placeholder="Tell us what you liked or disliked about this item..."
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value.substring(0, 5000))}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none"
                />
                <p className="text-[10px] text-gray-400 text-right font-medium">{reviewComment.length}/5000 chars</p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseReviewModal}
                  className="px-4 py-2 border rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-[#9d4ae3] hover:bg-[#8236be] text-white rounded-xl text-sm font-bold transition shadow-md shadow-fuchsia-100 disabled:opacity-60 flex items-center gap-1.5"
                >
                  {submittingReview ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
