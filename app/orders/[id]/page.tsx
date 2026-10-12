'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, Calendar, MapPin, CreditCard, ChevronRight, Package, ArrowLeft,
  XCircle, RotateCcw, AlertTriangle, Truck, DollarSign, Clock, HelpCircle,
  AlertCircle, ShieldCheck, FileText, ChevronDown, CheckCircle2, MessageCircle
} from 'lucide-react';
import { ordersApi, ExpectedDelivery } from '@/lib/api';
import { deliveryCopy, daysUntil } from '@/lib/utils/delivery';
import toast from 'react-hot-toast';

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

const statusSteps = [
  { status: 'pending_payment', label: 'Payment Pending', icon: Clock },
  { status: 'confirmed', label: 'Confirmed', icon: ShieldCheck },
  { status: 'processing', label: 'Processing', icon: Package },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle2 }
];

function NairaIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v18M18 3v18M6 3l12 18M4 9h16M4 14h16" />
    </svg>
  );
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mock');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Reorder Skipped items modal state
  const [reorderResult, setReorderResult] = useState<{ newOrder: any; skippedItems: any[] } | null>(null);

  useEffect(() => {
    void fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    if (!id || id === 'undefined' || id === 'null') {
      toast.error('Invalid order identifier');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let res: any;
      const isNumberLike = id.startsWith('ORD-') || id.startsWith('#') || !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(id);
      
      if (isNumberLike) {
        res = await ordersApi.getByNumber(id).catch(() => null);
      }
      if (!res?.success || !res.data) {
        res = await ordersApi.getById(id).catch(() => null);
      }
      if (!res?.success || !res.data) {
        res = await ordersApi.getByNumber(id).catch(() => null);
      }

      if (res?.success && res.data) {
        setOrder(res.data);
      } else {
        toast.error('Order not found');
      }
    } catch {
      toast.error('Could not fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setSubmittingCancel(true);
    try {
      const res = await ordersApi.cancel(id, cancelReason.trim());
      if (res?.success) {
        toast.success('Order has been cancelled successfully');
        setShowCancelModal(false);
        void fetchOrderDetails();
      } else {
        toast.error(res?.message || 'Failed to cancel order');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleRequestRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundReason.trim()) return;
    setSubmittingRefund(true);
    try {
      const payload: any = { reason: refundReason.trim() };
      if (refundAmount.trim()) {
        payload.amount = parseFloat(refundAmount);
      }
      const res = await ordersApi.refundRequest(id, payload);
      if (res?.success) {
        toast.success('Refund request submitted successfully');
        setShowRefundModal(false);
        void fetchOrderDetails();
      } else {
        toast.error(res?.message || 'Failed to request refund');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request refund');
    } finally {
      setSubmittingRefund(false);
    }
  };

  const handleProcessPayment = async () => {
    setProcessingPayment(true);
    try {
      const res = await ordersApi.processPayment(id, { paymentMethod });
      if (res?.success && res.data?.payment) {
        const payData = res.data.payment;
        if (payData.paymentUrl) {
          toast.success('Redirecting to checkout sandbox...');
          router.push(payData.paymentUrl);
        } else {
          toast.success('Payment completed successfully!');
          void fetchOrderDetails();
        }
      } else {
        toast.error(res?.message || 'Could not process payment');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not process payment');
    } finally {
      setProcessingPayment(false);
      setShowPaymentModal(false);
    }
  };

  const handleReorder = async () => {
    const loadingToast = toast.loading('Processing reorder...');
    try {
      const res = await ordersApi.reorder(id);
      toast.dismiss(loadingToast);
      if (res?.success && res.data) {
        const orderData = res.data.order;
        const skipped = res.data.skippedItems || [];
        if (skipped.length > 0) {
          setReorderResult({ newOrder: orderData, skippedItems: skipped });
        } else {
          toast.success('Reordered successfully!');
          router.push(`/orders/${orderData.id}`);
        }
      } else {
        toast.error(res?.message || 'Failed to process reorder');
      }
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || 'Failed to process reorder');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-bold text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 p-4">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-2xl font-bold text-slate-800">Order Not Found</h2>
        <Link href="/orders" className="px-6 py-2.5 bg-[#9d4ae3] text-white rounded-xl font-bold text-sm">
          Back to Orders
        </Link>
      </div>
    );
  }

  // Determine current active step in progress bar
  const activeStatusIndex = statusSteps.findIndex(s => s.status === order.status);
  const isCancelled = order.status === 'cancelled';
  const isFailed = order.status === 'payment_failed';

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Back Link */}
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 font-bold text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to My Orders
        </Link>

        {/* Top Info Banner */}
        <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-slate-800">Order {order.orderNumber || order.id}</h1>
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${
                order.paymentStatus === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                order.paymentStatus === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
            <p className="text-gray-400 font-semibold text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-NG', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {order.status === 'pending_payment' && (
              <button 
                onClick={() => setShowPaymentModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-purple-100 flex items-center gap-1.5"
              >
                <CreditCard size={15} /> Pay Now
              </button>
            )}
            {order.canBeCancelled && (
              <button 
                onClick={() => setShowCancelModal(true)}
                className="px-5 py-2.5 border border-red-200 text-red-600 bg-red-50/20 hover:bg-red-50 rounded-xl font-bold text-sm transition"
              >
                Cancel Order
              </button>
            )}
            {/* Reorder Button */}
            <button 
              onClick={handleReorder}
              className="px-5 py-2.5 border border-purple-200 text-[#9d4ae3] bg-purple-50/20 hover:bg-purple-50 rounded-xl font-bold text-sm transition flex items-center gap-1.5"
            >
              <RotateCcw size={15} /> Reorder Products
            </button>
            {/* Refund Button */}
            {['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) && order.refundStatus === 'none' && (
              <button 
                onClick={() => setShowRefundModal(true)}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-sm transition"
              >
                Request Refund
              </button>
            )}
          </div>
        </div>

        {/* Delivery Lifecycle & Progress Tracker */}
        {!isCancelled && !isFailed && (
          <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-sm mb-8 space-y-6">
            {/* Delivery Date / Status Callout */}
            {order.status === 'delivered' ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-100">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                      Delivered
                    </span>
                    <h3 className="text-lg font-black text-slate-800">
                      {order.deliveredAt
                        ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString('en-NG', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}`
                        : 'Package successfully delivered'}
                    </h3>
                    <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                      Your items have arrived safely. Thank you for shopping with Faflories!
                    </p>
                  </div>
                </div>
              </div>
            ) : order.expectedDelivery ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-purple-50/70 to-indigo-50 border border-purple-200 shadow-xs">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9d4ae3] to-[#8236be] text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-200 animate-pulse">
                    <Truck size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9d4ae3] bg-purple-100 px-2 py-0.5 rounded-full">
                        {order.paymentStatus === 'completed' ? 'Delivery Promised' : 'Estimated Delivery'}
                      </span>
                      {order.expectedDelivery.isInterState && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900 bg-purple-200 px-2 py-0.5 rounded-full">
                          Inter-State
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-purple-950 mt-0.5">
                      {deliveryCopy(
                        order.expectedDelivery,
                        order.paymentStatus === 'completed' ? 'paid' : 'unpaid'
                      )}
                    </h3>
                    <p className="text-xs text-purple-800 font-semibold mt-0.5">
                      Within {order.expectedDelivery.maxWorkingDays} working days of processing.
                      {order.paymentStatus !== 'completed' && (
                        <span className="ml-1 text-gray-500 font-medium">
                          (Calculated as if paid today. Pay before 3:00 PM on a working day for earliest dispatch)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {order.expectedDelivery.expectedDeliveryDate && (
                  <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-purple-200/60">
                    <span className="text-[11px] font-bold text-purple-700 block">
                      Target Window
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {order.expectedDelivery.expectedDeliveryLabel}
                    </span>
                  </div>
                )}
              </div>
            ) : null}

            {/* Timeline Header */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck size={14} className="text-[#9d4ae3]" />
                  Delivery Lifecycle Tracker
                </h3>
                <span className="text-xs font-bold text-purple-700 capitalize">
                  Current Status: {order.status?.replace('_', ' ')}
                </span>
              </div>

              {/* Steps Timeline with rich icons */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 relative">
                {statusSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const done = idx <= activeStatusIndex;
                  const active = idx === activeStatusIndex;

                  return (
                    <div key={idx} className="flex flex-col items-center text-center relative z-10">
                      <div
                        className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${
                          active
                            ? 'bg-gradient-to-br from-[#9d4ae3] to-[#8236be] border-[#9d4ae3] text-white shadow-lg shadow-purple-200 scale-105'
                            : done
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}
                      >
                        <Icon size={20} className={active ? 'animate-bounce' : ''} />
                      </div>
                      <p
                        className={`text-xs font-bold mt-2.5 ${
                          active
                            ? 'text-[#9d4ae3] font-black'
                            : done
                            ? 'text-slate-800'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      {active && (
                        <span className="text-[10px] text-purple-600 font-extrabold uppercase mt-0.5 tracking-wider">
                          In Progress
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Cancelled Banner */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm mb-8 flex items-start gap-4">
            <XCircle className="text-red-500 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-red-800 text-base">Order Cancelled</h3>
              {order.cancelledReason && (
                <p className="text-red-700 text-sm mt-1"><span className="font-bold">Reason:</span> {order.cancelledReason}</p>
              )}
              {order.cancelledAt && (
                <p className="text-red-500 text-xs mt-1">On {new Date(order.cancelledAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        {/* Refund Status Banner */}
        {order.refundStatus && order.refundStatus !== 'none' && (
          <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 shadow-sm mb-8 space-y-3">
            <div className="flex items-start gap-4">
              <RotateCcw className="text-purple-600 flex-shrink-0 mt-0.5" size={24} />
              <div className="space-y-1">
                <h3 className="font-bold text-purple-800 text-base">Refund Details</h3>
                <p className="text-sm text-purple-700"><span className="font-bold">Status:</span> {order.refundStatus.toUpperCase()}</p>
                {order.refundReason && <p className="text-sm text-purple-600"><span className="font-semibold text-purple-700">Reason:</span> {order.refundReason}</p>}
                {order.refundAmount && <p className="text-sm text-purple-600"><span className="font-semibold text-purple-700">Requested Amount:</span> {order.refundAmount.formatted}</p>}
              </div>
            </div>
            {(order.refundReviewedAt || order.refundRejectionNote) && (
              <div className="pl-10 pt-2 border-t border-purple-100 text-xs text-purple-500 space-y-1.5">
                {order.refundReviewedAt && <p>Reviewed on: {new Date(order.refundReviewedAt).toLocaleString()}</p>}
                {order.refundReviewedBy && <p>Reviewed by: {order.refundReviewedBy}</p>}
                {order.refundRejectionNote && (
                  <p className="bg-white/80 border border-purple-100 rounded-xl p-3 text-purple-700 text-sm mt-1">
                    <span className="font-bold">Rejection Note:</span> {order.refundRejectionNote}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Left Columns */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Products List */}
            <div className="bg-white rounded-3xl border shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Package size={18} className="text-purple-600" /> Items in Order
              </h3>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 p-3 border rounded-2xl hover:bg-gray-50/50 transition">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border flex-shrink-0">
                      {item.productImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={20} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-850 text-sm truncate">{item.productName}</h4>
                      <p className="text-xs text-gray-500 font-semibold mt-0.5">SKU: {item.productSku || 'N/A'}</p>
                      <div className="flex justify-between items-center mt-2.5">
                        <span className="text-xs font-bold text-slate-700 bg-gray-100 px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold text-slate-800">{item.unitPrice?.formatted}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Details */}
            <div className="bg-white rounded-3xl border shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-purple-600" /> Payment & Costs
              </h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between font-medium text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-slate-800 font-bold">{order.subtotal?.formatted || `₦${order.subtotal?.amount?.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-500">
                  <span>Shipping Cost</span>
                  <span className="text-slate-800 font-bold">{order.shippingCost?.formatted || `₦${order.shippingCost?.amount?.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-500">
                  <span>Tax Amount</span>
                  <span className="text-slate-800 font-bold">{order.taxAmount?.formatted || `₦${order.taxAmount?.amount?.toLocaleString()}`}</span>
                </div>
                {order.discountAmount?.amount > 0 && (
                  <div className="flex justify-between font-medium text-emerald-600">
                    <span>Discount</span>
                    <span className="font-bold">-{order.discountAmount?.formatted}</span>
                  </div>
                )}
                <div className="pt-3 border-t flex justify-between items-center text-slate-800">
                  <span className="font-bold text-base">Grand Total</span>
                  <span className="text-xl font-black text-purple-700 flex items-center gap-0.5">
                    <NairaIcon size={16} />
                    {order.totalAmount?.formatted?.replace('₦', '') || order.total?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            
            {/* Delivery address */}
            <div className="bg-white rounded-3xl border shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-purple-600" /> Delivery Address
              </h3>
              <div className="text-sm text-gray-600 leading-relaxed font-semibold">
                <p className="text-slate-850 font-black">{order.shippingAddress?.fullName}</p>
                <p className="mt-1">{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress?.addressLine2}</p>}
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p>{order.shippingAddress?.country} {order.shippingAddress?.postalCode}</p>
                <p className="mt-2 text-slate-800">Phone: {order.shippingAddress?.phoneNumber}</p>
              </div>
            </div>

            {/* Note */}
            {order.notes && (
              <div className="bg-white rounded-3xl border shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <FileText size={18} className="text-purple-600" /> Order Note
                </h3>
                <p className="text-sm text-gray-600 font-semibold italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                  &ldquo;{order.notes}&rdquo;
                </p>
              </div>
            )}

            {/* Support Widget */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold mb-1.5">Need Help with Order?</h3>
              <p className="text-xs text-purple-100 font-semibold mb-4 leading-relaxed">If there are any issues with returns, defective goods or delays, open a ticket.</p>
              <Link 
                href="/support"
                className="w-full text-center block bg-white text-purple-950 font-black text-xs py-2.5 rounded-xl transition hover:bg-purple-50 shadow-sm"
              >
                Contact Support
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* ── Cancel Order Dialog ───────────────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-2">Cancel Order</h3>
            <p className="text-sm text-gray-500 mb-4 font-semibold">Please provide a brief reason for cancelling your purchase. This helps us audit returns.</p>
            
            <form onSubmit={handleCancelOrder} className="space-y-4">
              <textarea
                required
                rows={3}
                placeholder="Reason for cancellation..."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCancel}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-1.5"
                >
                  {submittingCancel ? 'Processing...' : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Request Refund Dialog ──────────────────────────────────────── */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-2">Request Refund</h3>
            <p className="text-sm text-gray-500 mb-4 font-semibold">Requests are subjected to verification rules. Enter partial or full refund amount.</p>
            
            <form onSubmit={handleRequestRefund} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Amount (Optional, leave blank for full)</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <NairaIcon size={14} />
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder={order.totalAmount?.amount?.toString() || order.total?.toString()}
                    value={refundAmount}
                    onChange={e => setRefundAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Reason for Refund</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Products were defective or missing from parcel..."
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value.substring(0, 1000))}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition"
                >
                  {submittingRefund ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Process Payment Dialog ─────────────────────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-2">Process Checkout Payment</h3>
            <p className="text-sm text-gray-500 mb-4 font-semibold">Select your preferred payment gateway provider:</p>
            
            <div className="space-y-2">
              <button
                onClick={() => setPaymentMethod('mock')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                  paymentMethod === 'mock' ? 'border-purple-500 bg-purple-50/20 text-purple-950 font-bold' : 'border-gray-150 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span>Mock Gateway (Local Sandbox)</span>
                <span className="text-[10px] uppercase bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-black">Free</span>
              </button>
              <button
                onClick={() => setPaymentMethod('paystack')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                  paymentMethod === 'paystack' ? 'border-purple-500 bg-purple-50/20 text-purple-950 font-bold' : 'border-gray-150 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span>Paystack Gateway</span>
                <span className="text-[10px] uppercase bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-black">Live</span>
              </button>
              <button
                onClick={() => setPaymentMethod('flutterwave')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                  paymentMethod === 'flutterwave' ? 'border-purple-500 bg-purple-50/20 text-purple-950 font-bold' : 'border-gray-150 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span>Flutterwave Gateway</span>
                <span className="text-[10px] uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black">Live</span>
              </button>
              <button
                onClick={() => setPaymentMethod('kora_pay')}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                  paymentMethod === 'kora_pay' ? 'border-purple-500 bg-purple-50/20 text-purple-950 font-bold' : 'border-gray-150 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span>Korapay Gateway</span>
                <span className="text-[10px] uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black">Live</span>
              </button>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayment}
                disabled={processingPayment}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-fuchsia-100 disabled:opacity-60 flex items-center gap-1.5"
              >
                {processingPayment ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reorder Skipped Items Dialog ────────────────────────────────── */}
      {reorderResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
              <AlertTriangle className="text-amber-500" size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Reordered with Warnings</h3>
            <p className="text-sm text-gray-500 mb-4 font-semibold">The following items from your original order could not be re-ordered:</p>
            
            <div className="space-y-2 max-h-40 overflow-y-auto mb-6 pr-1">
              {reorderResult.skippedItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl flex items-start gap-2.5">
                  <AlertCircle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.productName || item.productId}</p>
                    <p className="text-[10px] text-amber-700 font-semibold">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  const newId = reorderResult.newOrder.id;
                  setReorderResult(null);
                  router.push(`/orders/${newId}`);
                }}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-fuchsia-100 transition"
              >
                Go to New Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
