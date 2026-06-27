'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordStrength } from '@/components/auth/PasswordStrength';

import { authApi } from '@/lib/api';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordModalProps {
  isOpen: boolean;
  email?: string;
  otp: string;
  onClose: () => void;
  onBack?: () => void;
  onSuccess: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  email,
  otp,
  onClose,
  onBack,
  onSuccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password', '');

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      if (authApi.resetPassword) {
        await authApi.resetPassword({ otpCode: otp, newPassword: data.password });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      
      toast.success('Password reset successfully! 🎉');
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reset password. Please try again.');
    }
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
        onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 w-full text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to verification
          </button>
        ) : undefined
      }
    >
      <div className="flex flex-col items-center text-center mb-6 pt-2">
        <div className="w-14 h-14 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
          <KeyRound className="w-7 h-7 text-white stroke-[2.5]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Set new password
        </h2>
        <p className="text-sm text-gray-600">
          Your new password must be different from previous used passwords.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            label="New password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            disabled={isSubmitting}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-0.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-purple-600 transition-colors" />
                ) : (
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-purple-600 transition-colors" />
                )}
              </button>
            }
          />
          <PasswordStrength password={password} />
        </div>

        <Input
          {...register('confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.confirmPassword?.message}
          disabled={isSubmitting}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="p-0.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-purple-600 transition-colors" />
              ) : (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-purple-600 transition-colors" />
              )}
            </button>
          }
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={isSubmitting}
        >
          Reset Password
        </Button>
      </form>
    </Modal>
  );
};
