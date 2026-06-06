'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi, type ApiError } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const isApiError = (error: unknown): error is ApiError => {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return false;
  }
  return typeof (error as { message?: unknown }).message === 'string';
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (isApiError(error)) {
    return error.message;
  }
  return fallback;
};

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onSuccess: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onSuccess,
}) => {
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    blocked: boolean;
    retryAfter?: number;
  }>({ blocked: false });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // Use authApi.forgotPassword if available, otherwise mock it.
      if (authApi.forgotPassword) {
        await authApi.forgotPassword(data.email);
      } else {
        // Simulation delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      toast.success('Invitation sent. The link expires in 15 minutes.');
      onSuccess(data.email);
    } catch (error: unknown) {
      if (isApiError(error) && error.statusCode === 429) {
        const retryAfter = error.retryAfter || 900;
        setRateLimitInfo({
          blocked: true,
          retryAfter,
        });
        toast.error(error.message);

        setTimeout(() => {
          setRateLimitInfo({ blocked: false });
        }, retryAfter * 1000);
      } else {
        toast.error(getErrorMessage(error, 'Failed to send reset link'));
      }
    }
  };

  const handleSwitchToLogin = () => {
    reset();
    onSwitchToLogin();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      footer={
        <button
          onClick={handleSwitchToLogin}
          className="flex items-center justify-center gap-1.5 w-full text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to log in
        </button>
      }
    >
      <div className="flex flex-col items-center text-center mb-6 pt-2">
        <div className="w-14 h-14 bg-gradient-to-r from-[#c800ff] to-[#912cad] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
          <Mail className="w-7 h-7 text-white stroke-[2.5]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Reset your password
        </h2>
        <p className="text-sm text-gray-600">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
          {rateLimitInfo.blocked && (
            <div className="flex gap-2 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-red-800">
                  Too many attempts
                </p>
                <p className="text-xs text-red-600 mt-0.5 sm:mt-1">
                  Please wait {Math.ceil((rateLimitInfo.retryAfter || 900) / 60)}{' '}
                  minutes before trying again
                </p>
              </div>
            </div>
          )}

          <Input
            {...register('email')}
            type="email"
            label="Email address"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email?.message}
            disabled={isSubmitting || rateLimitInfo.blocked}
            autoComplete="email"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            loading={isSubmitting}
            disabled={rateLimitInfo.blocked}
          >
            Send Reset Link
          </Button>
        </form>
    </Modal>
  );
};
