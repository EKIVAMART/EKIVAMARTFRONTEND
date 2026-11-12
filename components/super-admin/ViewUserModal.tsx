'use client';
import RecordStatus from '@/components/admin/RecordStatus';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Mail, Phone, User, Shield, ShieldCheck, ShieldOff,
  Calendar, Clock, LogIn, Lock, Award, CheckCircle2, XCircle,
  Ban, Key
} from 'lucide-react';
import type { AppUser } from './UserTable';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser | null;
  onBlock?: (id: string) => void;
  onUnblock?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '—';
  }
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
};

const getInitials = (firstName: string, lastName: string) =>
  `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';

const DetailRow = ({
  icon: Icon,
  label,
  value,
  valueClass = '',
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={15} className="text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-semibold text-slate-800 mt-0.5 break-all ${valueClass}`}>{value}</p>
    </div>
  </div>
);

export default function ViewUserModal({
  isOpen,
  onClose,
  user,
  onBlock,
  onUnblock,
  onDelete,
}: ViewUserModalProps) {
  if (!user) return null;

  const userStatus = user.status || 'active';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 dashboard-dialog-overlay">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 "
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white w-full flex flex-col overflow-hidden dashboard-dialog dashboard-dialog--form"
            onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="ViewUserModal-dialog-0-title"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dashboard-dialog-header">
              <div className="min-w-0">
                <p className="text-xs text-slate-500 mb-1">User details</p>
                <h2 className="text-xl font-semibold text-slate-900 break-words" id="ViewUserModal-dialog-0-title">{user.firstName} {user.lastName}</h2>
                <p className="text-sm text-slate-600 break-all mt-1">{user.email}</p>
                <div className="mt-2 flex items-center gap-3">
                  <RecordStatus value={userStatus} />
                  <span className="text-xs text-slate-500 capitalize">{user.role}</span>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close user details" className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dashboard-dialog-close" type="button">
                <X size={18} />
              </button>
            </header>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 mt-2 dashboard-dialog-body">

              {/* Account Details */}
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Account Details</h3>
                <div className="bg-gray-50/50 rounded-md p-2">
                  <DetailRow icon={User} label="Full Name" value={`${user.firstName} ${user.lastName}`} />
                  <DetailRow icon={Mail} label="Email Address" value={user.email} />
                  <DetailRow
                    icon={Phone}
                    label="Phone Number"
                    value={user.phoneNumber || <span className="text-gray-300 font-medium">Not provided</span>}
                  />
                  <DetailRow icon={Award} label="Role" value={
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-700 border border-brand-200">
                      <Shield size={10} />
                      {user.role}
                    </span>
                  } />
                  <DetailRow icon={Key} label="User ID" value={
                    <span className="text-[11px] text-gray-400 font-mono break-all">{user.id}</span>
                  } />
                </div>
              </div>

              {/* Security */}
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Security & Authentication</h3>
                <div className="bg-gray-50/50 rounded-md p-2">
                  <DetailRow icon={ShieldCheck} label="Email Verification" value={
                    user.isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 text-slate-600 font-bold text-xs">
                        <CheckCircle2 size={13} /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-600 font-bold text-xs">
                        <XCircle size={13} /> Not Verified
                      </span>
                    )
                  } />
                  <DetailRow icon={Lock} label="Two-Factor Auth" value={
                    user.isTwoFactorEnabled ? (
                      <span className="inline-flex items-center gap-1 text-slate-600 font-bold text-xs">
                        <CheckCircle2 size={13} /> Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400 font-bold text-xs">
                        <XCircle size={13} /> Disabled
                      </span>
                    )
                  } />
                </div>
              </div>

              {/* Activity & Sessions */}
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Activity & Sessions</h3>
                <div className="bg-gray-50/50 rounded-md p-2">
                  <DetailRow icon={LogIn} label="Last Login" value={formatDateTime(user.lastLoginAt)} />
                  <DetailRow icon={Calendar} label="Account Created" value={formatDateTime(user.createdAt)} />
                  <DetailRow icon={Clock} label="Last Updated" value={formatDateTime(user.updatedAt)} />
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            {userStatus !== 'deleted' && (
              <div className="border-t border-gray-100 p-4 flex flex-wrap gap-3 shrink-0">
                {userStatus === 'active' && onBlock && (
                  <button
                    onClick={() => { onBlock(user.id); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-slate-600 rounded-md text-sm font-bold transition"
                  >
                    <Ban size={15} /> Block User
                  </button>
                )}
                {userStatus === 'blocked' && onUnblock && (
                  <button
                    onClick={() => { onUnblock(user.id); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-slate-600 rounded-md text-sm font-bold transition"
                  >
                    <CheckCircle2 size={15} /> Unblock User
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => { onDelete(user.id); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-slate-500 rounded-md text-sm font-bold transition"
                  >
                    <XCircle size={15} /> Delete Account
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
