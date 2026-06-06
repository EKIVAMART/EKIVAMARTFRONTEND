'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { OTPInput } from './OTPInput';

import { z } from 'zod';

const verificationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otpCode: z.string().min(6, 'Invalid verification token').max(64, 'Invalid verification token'),
});

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerified: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
  onVerified,
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(600); // 10 minutes in seconds

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Auto-submit when OTP is complete
  const handleVerify = useCallback(async () => {
    if (otp.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      const payload = { email, otpCode: otp };
      verificationSchema.parse(payload);

      await authApi.verifyEmailOTP(payload);
      toast.success('Email verified successfully! 🎉');
      onVerified();
      setOtp('');
    } catch (err: unknown) {
      let errorMessage = 'Invalid verification code';
      if (err instanceof z.ZodError) {
        errorMessage = err.errors[0]?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
      setOtp(''); // Clear OTP on error
    } finally {
      setLoading(false);
    }
  }, [otp, email, onVerified]);

  useEffect(() => {
    if (otp.length === 6 && !loading) {
      handleVerify();
    }
  }, [otp, loading, handleVerify]);

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');

    try {
      await authApi.resendEmailOTP(email);
      toast.success('New verification code sent!');
      setResendCooldown(60); // 60 seconds cooldown
      setExpiresIn(600); // Reset expiration to 10 minutes
      setOtp('');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to resend code';
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
      return `${username[0]}${'*'.repeat(Math.max(0, username.length - 1))}@${domain}`;
    }
    const maskedUsername =
      username[0] + '*'.repeat(username.length - 2) + username.slice(-1);
    return `${maskedUsername}@${domain}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify your email"
      description={`We sent a verification code to ${maskEmail(email)}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Email Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 gradient-brand rounded-3xl flex items-center justify-center shadow-brand">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Enter the 6-digit verification code sent to your email
          </p>
        </div>

        {/* OTP Input */}
        <div className="py-4">
          <OTPInput
            value={otp}
            onChange={setOtp}
            disabled={loading}
            error={!!error}
          />
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer and Resend */}
        <div className="space-y-4">
          {/* Expiration Timer */}
          <div className="flex items-center justify-center gap-2">
            {expiresIn > 0 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm text-gray-600">
                  Code expires in{' '}
                  <span className="font-bold text-purple-600">
                    {formatTime(expiresIn)}
                  </span>
                </p>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-sm text-red-600 font-semibold">
                  Code expired
                </p>
              </>
            )}
          </div>

          {/* Resend Button */}
          <div className="text-center">
            {resendCooldown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in{' '}
                <span className="font-bold text-purple-600">
                  {resendCooldown}s
                </span>
              </p>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendOTP}
                loading={resendLoading}
                disabled={resendLoading}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Resend code
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            Didn&apos;t receive the code? Check your spam folder or{' '}
            <button
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || resendLoading}
              className="text-purple-600 font-semibold hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              click here to resend
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};
