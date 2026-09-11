'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationApi } from '@/lib/api/notifications';
import { useNotifications } from '@/context/NotificationContext';
import { Megaphone, X, AlertTriangle, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AdminBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminBroadcastModal({ isOpen, onClose }: AdminBroadcastModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState<'customer' | 'vendor' | 'admin' | 'super-admin' | ''>('');
  const [screen, setScreen] = useState('');
  const [category, setCategory] = useState('');

  const [step, setStep] = useState<'compose' | 'confirm'>('compose');
  const [isSending, setIsSending] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const { fetchNotifications } = useNotifications();

  if (!isOpen) return null;

  const titleValid = title.trim().length >= 3 && title.trim().length <= 200;
  const messageValid = message.trim().length >= 10 && message.trim().length <= 1000;
  const canProceed = titleValid && messageValid && !isSending;

  const handleReset = () => {
    setTitle('');
    setMessage('');
    setRole('');
    setScreen('');
    setCategory('');
    setStep('compose');
    setIsSending(false);
    setResultMsg(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSendBroadcast = async () => {
    setIsSending(true);
    setResultMsg(null);

    try {
      const dataPayload: Record<string, string> = {};
      if (screen.trim()) dataPayload.screen = screen.trim();
      if (category.trim()) dataPayload.category = category.trim();

      const res = await notificationApi.broadcastNotification({
        title: title.trim(),
        message: message.trim(),
        role: role !== '' ? role : undefined,
        data: Object.keys(dataPayload).length > 0 ? dataPayload : undefined,
      });

      const count = res.recipientCount ?? 0;

      if (count === 0) {
        toast.error('Sent to 0 recipients — no active users matched that role');
        setResultMsg('Sent to 0 recipients — no active users matched that role.');
      } else {
        toast.success(`Broadcast successfully sent to ${count} active users!`);
        setResultMsg(`Broadcast successfully delivered to ${count} user notification inbox(es).`);
      }

      // Refresh admin's own notification inbox
      void fetchNotifications({ page: 1, limit: 20 });

      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (err: unknown) {
      console.error('Failed to send broadcast notification:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to send broadcast announcement';
      toast.error(errMsg);
      setStep('compose');
    } finally {
      setIsSending(false);
    }
  };

  const getTargetAudienceText = () => {
    switch (role) {
      case 'customer':
        return 'every customer';
      case 'vendor':
        return 'every vendor';
      case 'admin':
        return 'every admin';
      case 'super-admin':
        return 'every super-admin';
      default:
        return 'every registered active user on Faflora';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-neutral-100 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-brand-900 to-brand-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-tight">Compose Platform Broadcast</h3>
                <p className="text-xs text-brand-100/90 font-medium">
                  Send real-time in-app announcements to users
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
              disabled={isSending}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
            {resultMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-lg text-neutral-900">Broadcast Dispatched</h4>
                <p className="text-xs text-neutral-600 font-semibold max-w-xs mx-auto">
                  {resultMsg}
                </p>
              </div>
            ) : step === 'compose' ? (
              <>
                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(
                        e.target.value as 'customer' | 'vendor' | 'admin' | 'super-admin' | ''
                      )
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    <option value="">All Users (Customers, Vendors, Staff)</option>
                    <option value="customer">Customers Only</option>
                    <option value="vendor">Vendors Only</option>
                    <option value="admin">Admins Only</option>
                    <option value="super-admin">Super-Admins Only</option>
                  </select>
                </div>

                {/* Announcement Title */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider">
                      Title
                    </label>
                    <span
                      className={`text-[11px] font-bold ${
                        title.length > 200 ? 'text-rose-600' : 'text-neutral-400'
                      }`}
                    >
                      {title.length} / 200
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Scheduled System Maintenance This Sunday"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                  {title.length > 0 && title.trim().length < 3 && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      Title must be at least 3 characters.
                    </p>
                  )}
                </div>

                {/* Announcement Message Body */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider">
                      Message Body
                    </label>
                    <span
                      className={`text-[11px] font-bold ${
                        message.length > 1000 ? 'text-rose-600' : 'text-neutral-400'
                      }`}
                    >
                      {message.length} / 1000
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Write clear announcement details for recipients..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
                  />
                  {message.length > 0 && message.trim().length < 10 && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      Message must be at least 10 characters.
                    </p>
                  )}
                </div>

                {/* Optional Deep-Link Screen Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
                  <div>
                    <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1">
                      Deep-link Screen (Optional)
                    </label>
                    <select
                      value={
                        ['', 'VendorOrderDetails', 'AdminOrderDetails', 'AdminVendorApplications', 'AdminReviewModeration', 'VendorProductReviews', 'UserProfile', 'VendorDashboard', 'AdminDashboard', 'Products', 'Notifications', 'Cart', 'Checkout'].includes(screen)
                          ? screen
                          : 'OTHER'
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'OTHER') {
                          setScreen('CustomScreen');
                        } else {
                          setScreen(val);
                        }
                      }}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-600"
                    >
                      <option value="">None (Default)</option>
                      <option value="VendorOrderDetails">Vendor Order Details (VendorOrderDetails)</option>
                      <option value="AdminOrderDetails">Admin Order Details (AdminOrderDetails)</option>
                      <option value="AdminVendorApplications">Vendor Applications (AdminVendorApplications)</option>
                      <option value="AdminReviewModeration">Review Moderation (AdminReviewModeration)</option>
                      <option value="VendorProductReviews">Product Reviews (VendorProductReviews)</option>
                      <option value="UserProfile">User Profile (UserProfile)</option>
                      <option value="VendorDashboard">Vendor Dashboard (VendorDashboard)</option>
                      <option value="AdminDashboard">Admin Dashboard (AdminDashboard)</option>
                      <option value="Products">Products List (Products)</option>
                      <option value="Notifications">Notifications Page (Notifications)</option>
                      <option value="Cart">Cart (Cart)</option>
                      <option value="Checkout">Checkout (Checkout)</option>
                      <option value="OTHER">Other (Custom value...)</option>
                    </select>

                    {!['', 'VendorOrderDetails', 'AdminOrderDetails', 'AdminVendorApplications', 'AdminReviewModeration', 'VendorProductReviews', 'UserProfile', 'VendorDashboard', 'AdminDashboard', 'Products', 'Notifications', 'Cart', 'Checkout'].includes(screen) && (
                      <input
                        type="text"
                        placeholder="Enter custom screen name..."
                        value={screen}
                        onChange={(e) => setScreen(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 mt-2 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1">
                      Category Tag (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. maintenance"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3">
                  <button
                    type="button"
                    disabled={!canProceed}
                    onClick={() => setStep('confirm')}
                    className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Review &amp; Confirm Broadcast</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* Step 2: Plain English Confirmation Step */
              <div className="py-2 space-y-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="text-center space-y-1.5">
                  <h4 className="font-extrabold text-base text-neutral-900">
                    Confirm Announcement Broadcast
                  </h4>
                  <p className="text-xs text-neutral-600 font-semibold max-w-sm mx-auto leading-relaxed">
                    This will immediately deliver an in-app notification to{' '}
                    <span className="font-extrabold text-brand-700 underline">
                      {getTargetAudienceText()}
                    </span>
                    . This action cannot be undone.
                  </p>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-left space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Title:
                    </span>
                    <p className="text-xs font-extrabold text-neutral-900">{title}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Message:
                    </span>
                    <p className="text-xs text-neutral-700 font-medium leading-snug">{message}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSending}
                    onClick={() => setStep('compose')}
                    className="flex-1 py-3 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                  >
                    Back to Edit
                  </button>

                  <button
                    type="button"
                    disabled={isSending}
                    onClick={() => void handleSendBroadcast()}
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-extrabold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending broadcast...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Confirm &amp; Send Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
