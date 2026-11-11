'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, CreditCard, Package, Calendar, User, Printer, Tag, Store,
  MessageSquare, Plus, CheckCircle2, RotateCcw, AlertTriangle, ShieldCheck, FileText, Truck, ChevronDown
} from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { useAppSelector } from '@/lib/hooks';
import toast from 'react-hot-toast';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onOrderUpdated?: () => void;
}

const statusBadgeStyles: Record<string, string> = {
  PENDING_PAYMENT: 'bg-amber-400/20 text-slate-100 border-amber-400/30',
  pending_payment: 'bg-amber-400/20 text-slate-100 border-amber-400/30',
  PAYMENT_FAILED: 'bg-rose-400/20 text-slate-100 border-rose-400/30',
  payment_failed: 'bg-rose-400/20 text-slate-100 border-rose-400/30',
  CONFIRMED: 'bg-emerald-400/20 text-slate-100 border-emerald-400/30',
  confirmed: 'bg-emerald-400/20 text-slate-100 border-emerald-400/30',
  PROCESSING: 'bg-brand-400/20 text-brand-100 border-brand-400/30',
  processing: 'bg-brand-400/20 text-brand-100 border-brand-400/30',
  SHIPPED: 'bg-blue-400/20 text-slate-100 border-blue-400/30',
  shipped: 'bg-blue-400/20 text-slate-100 border-blue-400/30',
  DELIVERED: 'bg-teal-400/20 text-slate-100 border-teal-400/30',
  delivered: 'bg-teal-400/20 text-slate-100 border-teal-400/30',
  CANCELLED: 'bg-gray-400/20 text-gray-100 border-gray-400/30',
  cancelled: 'bg-gray-400/20 text-gray-100 border-gray-400/30',
  REFUNDED: 'bg-brand-400/20 text-brand-100 border-brand-400/30',
  refunded: 'bg-brand-400/20 text-brand-100 border-brand-400/30',
};

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Pending Payment',
  pending_payment: 'Pending Payment',
  PAYMENT_FAILED: 'Payment Failed',
  payment_failed: 'Payment Failed',
  CONFIRMED: 'Confirmed',
  confirmed: 'Confirmed',
  PROCESSING: 'Processing',
  processing: 'Processing',
  SHIPPED: 'Shipped',
  shipped: 'Shipped',
  DELIVERED: 'Delivered',
  delivered: 'Delivered',
  CANCELLED: 'Cancelled',
  cancelled: 'Cancelled',
  REFUNDED: 'Refunded',
  refunded: 'Refunded',
};

// Central transition rules according to backend specification
const transitionRules: Record<string, string[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'PAYMENT_FAILED', 'CANCELLED'],
  pending_payment: ['confirmed', 'payment_failed', 'cancelled'],
  PAYMENT_FAILED: ['PENDING_PAYMENT', 'CANCELLED'],
  payment_failed: ['pending_payment', 'cancelled'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  confirmed: ['processing', 'cancelled'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  processing: ['shipped', 'cancelled'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  shipped: ['delivered', 'cancelled'],
  DELIVERED: ['REFUNDED'],
  delivered: ['refunded'],
  CANCELLED: [],
  cancelled: [],
  REFUNDED: [],
  refunded: [],
};

function NairaIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline mr-0.5">
      <path d="M6 3v18M18 3v18M6 3l12 18M4 9h16M4 14h16" />
    </svg>
  );
}

export default function OrderDetailsModal({ isOpen, onClose, order: basicOrder, onOrderUpdated }: OrderDetailsModalProps) {
  const { user } = useAppSelector(state => state.auth);
  const userRole = user?.role || 'VENDOR';

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Staff Notes State
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Status Change State
  const [selectedStatus, setSelectedStatus] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Refund Review State
  const [refundAction, setRefundAction] = useState<'approve' | 'reject' | 'process'>('approve');
  const [rejectionNote, setRejectionNote] = useState('');
  const [submittingRefundReview, setSubmittingRefundReview] = useState(false);

  useEffect(() => {
    if (isOpen && (basicOrder?.orderNumber || basicOrder?.orderId || basicOrder?.id)) {
      void fetchFullOrder();
    }
  }, [isOpen, basicOrder]);

  const getActiveOrderIdentifier = () => order?.id || order?._id || basicOrder?.orderId || basicOrder?.id;

  const fetchFullOrder = async () => {
    setLoading(true);
    try {
      const lookupIdentifier = basicOrder?.orderNumber || basicOrder?.orderId || basicOrder?.id;
      if (!lookupIdentifier) {
        toast.error('Could not load order details: missing identifier');
        return;
      }

      // Detect if the identifier is an order number (human-readable) vs a UUID
      const isOrderNumber =
        basicOrder?.orderNumber != null ||
        /^(ORD-|#|CM)/i.test(String(lookupIdentifier)) ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(String(lookupIdentifier));

      let res: any;
      if (isOrderNumber) {
        // Try by order number first (e.g. ORD-20260822-5PJ76)
        res = await ordersApi.getByNumber(lookupIdentifier).catch(() => null);
      }
      // Fallback to getById if getByNumber failed or wasn't tried
      if (!res?.success || !res.data) {
        res = await ordersApi.getById(lookupIdentifier).catch(() => null);
      }
      // Last resort: try getByNumber if getById also failed
      if (!res?.success || !res.data) {
        res = await ordersApi.getByNumber(lookupIdentifier).catch(() => null);
      }

      if (res?.success && res.data) {
        setOrder(res.data);
        setSelectedStatus('');
        const resolvedOrderId = res.data?.id || res.data?._id || basicOrder?.orderId || basicOrder?.id;
        void fetchNotes(resolvedOrderId);
      } else {
        toast.error('Could not load order details');
      }
    } catch {
      toast.error('Error fetching order');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (orderId?: string) => {
    const targetOrderId = orderId || getActiveOrderIdentifier();
    if (!targetOrderId) return;

    try {
      const res = await ordersApi.getNotes(targetOrderId);
      if (res?.success) {
        setNotes(res.data || []);
      }
    } catch {
      // Notes fail silently
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetOrderId = getActiveOrderIdentifier();
    if (!newNote.trim() || submittingNote || !targetOrderId) return;
    setSubmittingNote(true);
    try {
      const res = await ordersApi.addNote(targetOrderId, newNote.trim());
      if (res?.success) {
        toast.success('Note added successfully');
        setNewNote('');
        void fetchNotes(targetOrderId);
      } else {
        toast.error(res?.message || 'Failed to add note');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleStatusUpdate = async () => {
    const targetOrderId = getActiveOrderIdentifier();
    if (!selectedStatus || submittingStatus || !targetOrderId) return;
    setSubmittingStatus(true);
    try {
      const res = await ordersApi.updateStatus(targetOrderId, selectedStatus);
      if (res?.success) {
        toast.success(`Order status updated to ${statusLabels[selectedStatus]}`);
        setSelectedStatus('');
        void fetchFullOrder();
        onOrderUpdated?.();
        onClose();
      } else {
        toast.error(res?.message || 'Failed to update status');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleRefundReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (refundAction === 'reject' && !rejectionNote.trim()) {
      toast.error('Rejection note is required when rejecting a refund.');
      return;
    }
    const targetOrderId = getActiveOrderIdentifier();
    if (!targetOrderId) return;
    setSubmittingRefundReview(true);
    try {
      const res = await ordersApi.refundReview(targetOrderId, {
        action: refundAction,
        rejectionNote: refundAction === 'reject' ? rejectionNote.trim() : undefined,
      });
      if (res?.success) {
        toast.success(`Refund request successfully reviewed: ${refundAction}`);
        setRejectionNote('');
        void fetchFullOrder();
        onOrderUpdated?.();
      } else {
        toast.error(res?.message || 'Failed to submit refund review');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit refund review');
    } finally {
      setSubmittingRefundReview(false);
    }
  };

  if (!isOpen || !basicOrder) return null;

  const currentStatus = order?.status;
  const allowedNextStatuses = currentStatus
    ? (transitionRules[currentStatus] || transitionRules[currentStatus.toUpperCase()] || transitionRules[currentStatus.toLowerCase()] || [])
    : [];
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userRole);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-[3px] sm:p-6">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="ek-print-invoice flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 text-slate-900 sm:px-8">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Order details</p>
                <div className="flex items-center gap-3">
                  <h2 id="order-details-title" className="text-xl font-semibold tracking-tight sm:text-2xl">Order {order?.orderNumber || basicOrder?.orderNumber || basicOrder?.id}</h2>
                  {order && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                      {statusLabels[order.status] || order.status}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-500">
                  <Calendar size={14} /> Placed on {order?.createdAt && !Number.isNaN(new Date(order.createdAt).getTime()) ? new Date(order.createdAt).toLocaleDateString() : basicOrder.date}
                </div>
              </div>
              <div className="ek-print-hide flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 md:flex"
                >
                  <Printer size={15} /> Print Invoice
                </button>
                <button type="button" onClick={onClose} aria-label="Close order details" className="rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content Body */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
                <p className="text-gray-500 font-bold text-sm">Fetching detailed order information...</p>
              </div>
            ) : order ? (
              <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* Left Side: Items & Payments */}
                  <div className="lg:col-span-2 space-y-8">

                    {/* Items List */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Package size={18} className="text-[#228b22]" /> Order Items
                      </h3>
                      <div className="space-y-4">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4 rounded-lg bg-slate-50 p-3 transition hover:bg-emerald-50/50">
                            <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden border shrink-0 flex items-center justify-center">
                              {item.productImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                              ) : (
                                <Package size={20} className="text-gray-300" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-slate-800 text-sm truncate">{item.productName}</h4>
                              <p className="text-xs text-gray-500 font-medium mt-0.5">SKU: {item.productSku || 'N/A'}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-[11px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                                <span className="text-sm font-bold text-slate-700">{item.unitPrice?.formatted}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cost Breakdowns */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CreditCard size={18} className="text-[#228b22]" /> Financial summary
                      </h3>
                      <div className="space-y-3.5 text-sm">
                        <div className="flex justify-between text-gray-600 font-semibold">
                          <span>Subtotal</span>
                          <span className="text-slate-800 font-bold">{order.subtotal?.formatted}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 font-semibold">
                          <span>Shipping Cost</span>
                          <span className="text-slate-800 font-bold">{order.shippingCost?.formatted}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 font-semibold">
                          <span>Tax Amount</span>
                          <span className="text-slate-800 font-bold">{order.taxAmount?.formatted}</span>
                        </div>
                        {((typeof order.commissionAmount === 'object' ? order.commissionAmount?.amount : order.commissionAmount) || 0) > 0 && (
                          <div className="flex justify-between text-gray-600 font-semibold">
                            <span>Service fee</span>
                            <span className="text-slate-800 font-bold">
                              {order.commissionAmount?.formatted || `₦${(typeof order.commissionAmount === 'object' ? order.commissionAmount?.amount : order.commissionAmount)?.toLocaleString()}`}
                            </span>
                          </div>
                        )}
                        {order.discountAmount?.amount > 0 && (
                          <div className="flex justify-between text-slate-600 font-bold">
                            <span>Discount</span>
                            <span>-{order.discountAmount?.formatted}</span>
                          </div>
                        )}
                        <div className="pt-3 mt-3 border-t flex justify-between items-center">
                          <span className="text-base font-bold text-slate-800">Order total</span>
                          <span className="text-xl font-black text-[#228b22] flex items-center gap-0.5">
                            <NairaIcon size={16} />
                            {order.totalAmount?.formatted?.replace('₦', '') || order.totalAmount?.amount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Refund Review Action Section (ADMIN/SUPER_ADMIN only) */}
                    {order.refundStatus === 'requested' && isAdmin && (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-5">
                        <h3 className="text-sm font-bold text-brand-950 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <RotateCcw size={18} className="text-brand-700" /> Review Refund Request
                        </h3>
                        <p className="text-xs text-brand-700 font-semibold mb-4 leading-relaxed">
                          The customer has requested a refund of <span className="font-bold">{order.refundAmount?.formatted || order.totalAmount?.formatted}</span>.
                          Reason: &ldquo;{order.refundReason || 'No reason provided'}&rdquo;.
                        </p>

                        <form onSubmit={handleRefundReview} className="space-y-4">
                          <div className="flex gap-4">
                            {(['approve', 'reject', 'process'] as const).map((act) => (
                              <label key={act} className="flex items-center gap-1.5 text-xs font-bold text-brand-950 cursor-pointer capitalize">
                                <input
                                  type="radio"
                                  name="refundAction"
                                  value={act}
                                  checked={refundAction === act}
                                  onChange={() => setRefundAction(act)}
                                  className="text-brand-600 focus:ring-brand-400"
                                />
                                {act}
                              </label>
                            ))}
                          </div>

                          {refundAction === 'reject' && (
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-brand-900 uppercase">Rejection Reason Note</label>
                              <textarea
                                required
                                rows={2}
                                value={rejectionNote}
                                onChange={e => setRejectionNote(e.target.value)}
                                placeholder="Explain why the refund request is rejected..."
                                className="w-full text-xs p-2.5 border border-brand-200 bg-white rounded-md focus:outline-none"
                              />
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={submittingRefundReview}
                            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-xs font-bold shadow-sm transition"
                          >
                            {submittingRefundReview ? 'Reviewing...' : 'Submit Refund Decision'}
                          </button>
                        </form>
                      </div>
                    )}

                  </div>

                  {/* Right Side: Customer, Notes & Actions */}
                  <div className="space-y-6">
                    {/* Expected Delivery Promise */}
                    {order.expectedDelivery && (
                      <div className="flex items-start gap-3.5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-5">
                        <div className="w-10 h-10 rounded-md bg-[#228b22] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Truck size={20} />
                        </div>
                        <div className="flex-1 text-xs">
                          <span className="text-[10px] font-black uppercase text-[#228b22] bg-brand-100 px-2 py-0.5 rounded-md">
                            Expected Delivery
                          </span>
                          <p className="font-extrabold text-brand-950 text-sm mt-1">
                            {order.expectedDelivery.expectedDeliveryLabel}
                          </p>
                          <p className="text-brand-800 font-medium mt-0.5">
                            Within {order.expectedDelivery.maxWorkingDays} working days of processing.
                            {order.expectedDelivery.isInterState && (
                              <span className="ml-1.5 px-1.5 py-0.2 bg-brand-200 text-brand-900 rounded font-bold text-[10px]">
                                Inter-state
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Customer & Address */}
                    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
                      <div>
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <User size={14} /> Customer Details
                        </h3>
                        <p className="font-bold text-slate-800 text-sm">{order.shippingAddress?.fullName}</p>
                        <p className="text-xs text-gray-500 font-semibold mt-1">{order.shippingAddress?.phoneNumber}</p>
                      </div>

                      <div className="pt-3 border-t">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <MapPin size={14} /> Destination Address
                        </h3>
                        <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                          {order.shippingAddress?.addressLine1}<br />
                          {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                          {order.shippingAddress?.country}
                        </p>
                      </div>
                    </div>

                    {/* Staff Notes (VENDOR/ADMIN/SUPER_ADMIN only) */}
                    <div className="ek-print-hide space-y-4 rounded-xl border border-slate-200 bg-white p-5">
                      <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider flex items-center gap-2">
                        <FileText size={16} className="text-[#228b22]" /> Staff Internal Notes
                      </h3>

                      {/* Notes List */}
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {notes.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No internal notes added to this order yet.</p>
                        ) : (
                          notes.map((note) => (
                            <div key={note.id} className="p-2.5 bg-gray-55 rounded-md border border-gray-100 text-xs">
                              <p className="text-gray-600 font-semibold leading-snug">{note.note}</p>
                              <p className="text-[9px] text-gray-400 font-bold mt-1">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Note Form */}
                      <form onSubmit={handleAddNote} className="pt-2 border-t flex gap-2">
                        <input
                          type="text"
                          required
                          value={newNote}
                          onChange={e => setNewNote(e.target.value.substring(0, 2000))}
                          placeholder="Add internal note..."
                          className="flex-1 px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-brand-400"
                        />
                        <button
                          type="submit"
                          disabled={submittingNote}
                          className="p-2 bg-[#228b22] hover:bg-[#1c711c] text-white rounded-md transition disabled:opacity-60 flex-shrink-0"
                        >
                          <Plus size={16} />
                        </button>
                      </form>
                    </div>

                  </div>

                </div>
              </div>
            ) : null}

            {/* Footer Action (Status Transition) */}
            {order && (
              <div className="ek-print-hide sticky bottom-0 z-10 flex flex-col items-stretch justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:px-8">
                {allowedNextStatuses.length > 0 ? (
                  <>
                    <label className="relative block w-full sm:w-60">
                      <span className="sr-only">Next order status</span>
                      <select
                        value={selectedStatus}
                        onChange={e => setSelectedStatus(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-3 pl-4 pr-11 text-sm font-medium text-slate-800 focus:border-emerald-700 focus:outline-none"
                        style={{ colorScheme: 'light' }}
                      >
                        <option value="">Choose next status</option>
                        {allowedNextStatuses.map(status => (
                          <option key={status} value={status}>{statusLabels[status] || status}</option>
                        ))}
                      </select>
                      <ChevronDown size={17} aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    </label>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={!selectedStatus || submittingStatus}
                      className="w-full rounded-lg bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {submittingStatus ? 'Updating…' : 'Update status'}
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-400 font-bold">This order is in a terminal status ({statusLabels[order.status] || order.status}) and cannot be transitioned.</span>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
