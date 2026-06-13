'use client';

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
  const isVerified = user.isEmailVerified;
  const isAuthenticated = user.isAuthenticated ?? isVerified;

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    blocked: 'bg-red-100 text-red-700 border-red-200',
    deleted: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-fuchsia-600 to-purple-700 px-6 pt-8 pb-16 text-white overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">User Profile</p>
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/20 flex items-center justify-center text-2xl font-black text-white">
                      {getInitials(user.firstName, user.lastName)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-xl font-black tracking-tight truncate">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-white/70 text-xs font-medium truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[userStatus]}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {userStatus}
                      </span>
                      <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Status Banner */}
            <div className={`-mt-8 mx-6 rounded-2xl p-4 shadow-md z-10 shrink-0 ${
              isAuthenticated
                ? 'bg-emerald-500'
                : 'bg-slate-500'
            }`}>
              <div className="flex items-center gap-3">
                {isAuthenticated
                  ? <ShieldCheck size={20} className="text-white shrink-0" />
                  : <ShieldOff size={20} className="text-white shrink-0" />
                }
                <div>
                  <p className="text-white text-sm font-black">
                    {isAuthenticated ? 'Authenticated User' : 'Unauthenticated User'}
                  </p>
                  <p className="text-white/80 text-[11px] font-medium">
                    {isAuthenticated
                      ? 'Email verified — full account access granted'
                      : 'Email not verified — limited or no account access'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 mt-2">

              {/* Account Details */}
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Account Details</h3>
                <div className="bg-gray-50/50 rounded-2xl p-2">
                  <DetailRow icon={User} label="Full Name" value={`${user.firstName} ${user.lastName}`} />
                  <DetailRow icon={Mail} label="Email Address" value={user.email} />
                  <DetailRow
                    icon={Phone}
                    label="Phone Number"
                    value={user.phoneNumber || <span className="text-gray-300 font-medium">Not provided</span>}
                  />
                  <DetailRow icon={Award} label="Role" value={
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200">
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
                <div className="bg-gray-50/50 rounded-2xl p-2">
                  <DetailRow icon={ShieldCheck} label="Email Verification" value={
                    user.isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                        <CheckCircle2 size={13} /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs">
                        <XCircle size={13} /> Not Verified
                      </span>
                    )
                  } />
                  <DetailRow icon={Lock} label="Two-Factor Auth" value={
                    user.isTwoFactorEnabled ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
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
                <div className="bg-gray-50/50 rounded-2xl p-2">
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
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition"
                  >
                    <Ban size={15} /> Block User
                  </button>
                )}
                {userStatus === 'blocked' && onUnblock && (
                  <button
                    onClick={() => { onUnblock(user.id); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-sm font-bold transition"
                  >
                    <CheckCircle2 size={15} /> Unblock User
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => { onDelete(user.id); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm font-bold transition"
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
