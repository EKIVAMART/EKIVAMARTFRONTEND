'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, AlertCircle } from '@/components/ui/platform-icons';
import toast from 'react-hot-toast';
import { authApi, type ApiError } from '@/lib/api';
import { useAppDispatch } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { setCredentials } from '@/lib/features/auth/authSlice';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/Button';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SocialProvider = 'google';

const socialProviderLabels: Record<SocialProvider, string> = {
  google: 'Google',
};

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

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignup,
  onSwitchToForgotPassword,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    blocked: boolean;
    retryAfter?: number;
  }>({ blocked: false });
  const [socialSubmitting, setSocialSubmitting] =
    useState<SocialProvider | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authApi.login(data);

      dispatch(
        setCredentials({
          user: response?.data.user,
          accessToken: response?.data.accessToken,
          refreshToken: response?.data.refreshToken,
        })
      );

      toast.success('Welcome back! 🎉');
      onClose();
      reset();

      if (response?.data?.user?.role?.toUpperCase() === 'VENDOR') {
        router.push('/vendor/dashboard');
      }
    } catch (error: unknown) {
      if (isApiError(error) && error.statusCode === 429) {
        const retryAfter = error.retryAfter || 900;

        setRateLimitInfo({
          blocked: true,
          retryAfter,
        });
        toast.error(error.message);

        setTimeout(
          () => {
            setRateLimitInfo({ blocked: false });
          },
          retryAfter * 1000
        );
      } else {
        toast.error(getErrorMessage(error, 'Invalid email or password'));
      }
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      setSocialSubmitting(provider);
      await authApi.googleLogin();
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, `${socialProviderLabels[provider]} login failed`)
      );
    } finally {
      setSocialSubmitting(null);
    }
  };

  const handleSwitchToSignup = () => {
    reset();
    onSwitchToSignup();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Welcome back"
      description="Sign in to your account"
      size="md"
      footer={
        <p className="text-center text-xs sm:text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <button
            onClick={handleSwitchToSignup}
            className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
          >
            Sign up
          </button>
        </p>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-2.5 sm:space-y-3.5 md:space-y-4"
      >
        {/* Rate Limit Warning */}
        {rateLimitInfo.blocked && (
          <div className="flex gap-2 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-red-800">
                Too many login attempts
              </p>
              <p className="text-xs text-red-600 mt-0.5 sm:mt-1">
                Please wait {Math.ceil((rateLimitInfo.retryAfter || 900) / 60)}{' '}
                minutes before trying again
              </p>
            </div>
          </div>
        )}

        {/* Email Input */}
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

        {/* Password Input */}
        <PasswordInput
            {...register('password')}
            label="Password"
            placeholder="Enter your password"
            icon={Lock}
            error={errors.password?.message}
            disabled={isSubmitting || rateLimitInfo.blocked}
            autoComplete="current-password"
          />

        {/* Forgot Password */}
        <div className="flex justify-end -mt-1">
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-xs sm:text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          disabled={rateLimitInfo.blocked}
        >
          Sign in
        </Button>

        {/* Divider */}
        <div className="relative my-2 sm:my-3 md:my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-500 font-medium uppercase tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login */}
        <div className="w-full">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full text-xs sm:text-sm"
            onClick={() => handleSocialLogin('google')}
            loading={socialSubmitting === 'google'}
            disabled={
              isSubmitting || rateLimitInfo.blocked || socialSubmitting !== null
            }
            icon={
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            }
          >
            Continue with Google
          </Button>
        </div>
      </form>
    </Modal>
  );
};
