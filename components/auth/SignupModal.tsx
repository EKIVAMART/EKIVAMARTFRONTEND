'use client';

import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Phone, User } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordStrength } from './PasswordStrength';
import { EmailVerificationModal } from './EmailVerificationModal';

const signupSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(
        /[^a-zA-Z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
    phoneNumber: z
      .string()
      .min(1, 'Phone number is required')
      .refine((value) => isValidPhoneNumber(value), 'Invalid phone number'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;
type SocialProvider = 'google' | 'facebook';

const socialProviderLabels: Record<SocialProvider, string> = {
  google: 'Google',
  facebook: 'Facebook',
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === 'string') {
      return message;
    }
  }

  return fallback;
};

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [socialSubmitting, setSocialSubmitting] =
    useState<SocialProvider | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    try {
      await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
      });

      toast.success('Account created! Please verify your email.');
      setRegisteredEmail(data.email);
      setVerificationModalOpen(true);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Registration failed'));
    }
  };

  const handleSocialSignup = async (provider: SocialProvider) => {
    try {
      setSocialSubmitting(provider);

      if (provider === 'google') {
        await authApi.googleLogin();
      } else {
        await authApi.facebookLogin();
      }
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(
          error,
          `${socialProviderLabels[provider]} signup failed`
        )
      );
    } finally {
      setSocialSubmitting(null);
    }
  };

  const handleVerificationComplete = () => {
    setVerificationModalOpen(false);
    reset();
    onClose();
    toast.success('Email verified! You can now sign in.');
    onSwitchToLogin();
  };

  const handleSwitchToLogin = () => {
    reset();
    onSwitchToLogin();
  };

  const handleCloseSignup = () => {
    reset();
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseSignup}
        title="Create account"
        description="Get started with your free account"
        size="md"
        footer={
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={handleSwitchToLogin}
              className="font-bold text-purple-600 hover:text-purple-700 transition-colors"
            >
              Sign in
            </button>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('firstName')}
              label="First name"
              placeholder="John"
              icon={User}
              error={errors.firstName?.message}
              disabled={isSubmitting}
              autoComplete="given-name"
            />
            <Input
              {...register('lastName')}
              label="Last name"
              placeholder="Doe"
              icon={User}
              error={errors.lastName?.message}
              disabled={isSubmitting}
              autoComplete="family-name"
            />
          </div>

          {/* Email */}
          <Input
            {...register('email')}
            type="email"
            label="Email address"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email?.message}
            disabled={isSubmitting}
            autoComplete="email"
          />

          {/* Password */}
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Create a strong password"
            icon={Lock}
            error={errors.password?.message}
            disabled={isSubmitting}
            autoComplete="new-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            }
          />

          {/* Password Strength */}
          {password && <PasswordStrength password={password} />}

          {/* Confirm Password */}
          <Input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm password"
            placeholder="Confirm your password"
            icon={Lock}
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
            autoComplete="new-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            }
          />

          {/* Phone Number */}
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field, fieldState }) => (
              <div className="space-y-1 sm:space-y-1.5">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Phone number
                </label>
                <PhoneInput
                  {...field}
                  defaultCountry="NG"
                  international
                  countryCallingCodeEditable={false}
                  disabled={isSubmitting}
                  placeholder="Enter your phone number"
                  className={`phone-number-input rounded-lg sm:rounded-xl border bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-200 focus-within:ring-2 ${
                    fieldState.error
                      ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500/20'
                      : 'border-gray-200 focus-within:border-purple-600 focus-within:ring-purple-500/20'
                  }`}
                />
                {fieldState.error && (
                  <p className="text-xs text-red-600 flex items-center gap-1 sm:gap-1.5 animate-in slide-in-from-top-1 duration-200">
                    <svg
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Terms */}
          <p className="text-xs text-gray-600">
            By signing up, you agree to our{' '}
            <a
              href="#"
              className="font-semibold text-purple-600 hover:text-purple-700"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="#"
              className="font-semibold text-purple-600 hover:text-purple-700"
            >
              Privacy Policy
            </a>
          </p>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={isSubmitting}
          >
            Create account
          </Button>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Signup */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => handleSocialSignup('google')}
              loading={socialSubmitting === 'google'}
              disabled={isSubmitting || socialSubmitting !== null}
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full text-xs sm:text-sm"
              onClick={() => handleSocialSignup('facebook')}
              loading={socialSubmitting === 'facebook'}
              disabled={isSubmitting || socialSubmitting !== null}
              icon={
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="#4285F4"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              }
            >
              Facebook
            </Button>
          </div>
        </form>
      </Modal>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        email={registeredEmail}
        onVerified={handleVerificationComplete}
      />
    </>
  );
};