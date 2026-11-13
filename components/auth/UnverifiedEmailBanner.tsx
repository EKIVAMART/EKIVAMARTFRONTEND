'use client';

import React, { useState } from 'react';
import { AlertCircle, X } from '@/components/ui/platform-icons';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAppSelector } from '../../lib/hooks';
import type { RootState } from '../../lib/store';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { EmailVerificationModal } from './EmailVerificationModal';

export const UnverifiedEmailBanner: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector(
    (state: RootState) => state.auth
  );
  const [dismissed, setDismissed] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [resending, setResending] = useState(false);

  if (!isAuthenticated || !user || user.isEmailVerified || dismissed) {
    return null;
  }

  const handleResendOTP = async () => {
    setResending(true);
    try {
      await authApi.resendEmailOTP(user.email);
      toast.success('Verification code sent to your email!');
      setVerificationModalOpen(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to send verification code';
      toast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };

  const handleVerificationComplete = () => {
    setVerificationModalOpen(false);
    toast.success('Email verified successfully!');
    window.location.reload(); // Refresh to update user state
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-linear-to-r from-amber-500 to-orange-500 border-b border-amber-600"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-white shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    Please verify your email address
                  </p>
                  <p className="text-xs text-amber-100 mt-0.5">
                    We sent a verification code to {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResendOTP}
                  loading={resending}
                  className="bg-white text-amber-700 hover:bg-amber-50"
                >
                  Verify now
                </Button>
                <button
                  onClick={() => setDismissed(true)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <EmailVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        email={user.email}
        onVerified={handleVerificationComplete}
      />
    </>
  );
};
