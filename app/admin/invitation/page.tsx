'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authApi, ApiError } from '@/lib/api';

type InvitationStep = 'validating' | 'form' | 'success' | 'error';

const getApiErrorMessage = (error: unknown) => {
  const apiError = error as ApiError;
  const validationErrors = Array.isArray(apiError.errors)
    ? apiError.errors.map((item) => `${item.field}: ${item.message}`)
    : [];
  return [apiError.message, ...validationErrors].filter(Boolean).join(' ');
};

export default function AdminInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<InvitationStep>('validating');
  const [token, setToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [inviteeEmail, setInviteeEmail] = useState('');

  // Validate token from URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setErrorMessage('Invalid or missing invitation token. Please contact your administrator.');
      setStep('error');
      return;
    }
    setToken(tokenFromUrl);
    setStep('form');
  }, [searchParams]);

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return Math.min(strength, 5);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const validateForm = () => {
    if (!password || !confirmPassword) {
      setErrorMessage('Please enter and confirm your password.');
      return false;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return false;
    }
    if (password.length > 128) {
      setErrorMessage('Password must not exceed 128 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    if (passwordStrength < 2) {
      setErrorMessage('Password is too weak. Please use a mix of uppercase, lowercase, numbers, and special characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Setting up your admin account...');

    try {
      const response = await authApi.completeAdminInvitation({
        token,
        password,
      });

      toast.success('Admin account activated successfully!', { id: toastId });

      if (response?.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      if (response?.data?.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }

      setStep('success');
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (error) {
      const message = getApiErrorMessage(error) || 'Failed to activate your account. Please try again.';
      setErrorMessage(message);
      toast.error(message, { id: toastId });
      setStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validating State
  if (step === 'validating') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#9d4ae3]/20 border-t-[#9d4ae3] rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-600 animate-pulse">Validating your invitation...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-r from-red-500 to-amber-500 rounded-full blur-[120px] opacity-10 pointer-events-none" />

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center relative z-10 animate-in zoom-in-95 duration-200">
          <div className="flex justify-center mb-6">
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
              <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Invitation Error</h2>
          <p className="text-slate-500 text-sm mt-3 font-medium leading-relaxed">
            {errorMessage}
          </p>
          <Link
            href="/admin/login"
            className="inline-block w-full mt-8 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:from-[#8236be] hover:to-[#692a99] text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-fuchsia-100"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  // Success State
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-[120px] opacity-10 pointer-events-none" />

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center relative z-10 animate-in zoom-in-95 duration-200">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Account Activated!</h2>
          <p className="text-slate-500 text-sm mt-3 font-medium leading-relaxed">
            Your admin account has been successfully activated. Redirecting to your dashboard...
          </p>
          <div className="mt-6 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse" style={{ animation: 'pulse 3s ease-in-out infinite', width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Form State
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
      {/* Content */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex mb-6">
            <div className="flex items-center gap-1.5">
              <Image src="/fa_logo_brand.png" alt="Faflora" width={120} height={32} className="object-contain h-8 w-auto" />
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">Admin</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">
            Activate Your Account
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Complete your setup by creating a secure password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 items-start">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm font-medium leading-snug">{errorMessage}</p>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-slate-700 font-bold text-sm mb-2">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Create a strong password"
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 font-medium transition-all outline-none"
                  minLength={8}
                  maxLength={128}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-slate-700 font-bold text-sm mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#9d4ae3] focus:ring-2 focus:ring-[#9d4ae3]/20 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 font-medium transition-all outline-none"
                  minLength={8}
                  maxLength={128}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && confirmPassword && password === confirmPassword && (
                <p className="text-emerald-600 text-xs font-bold mt-2 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Passwords match
                </p>
              )}
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> Passwords do not match
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
              <p className="text-slate-700 text-xs font-bold uppercase tracking-wide">Password Requirements:</p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className={`flex items-center gap-2 ${password.length >= 8 ? 'text-emerald-600' : ''}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  At least 8 characters
                </li>
                <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-600' : ''}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  Mix of uppercase and lowercase letters
                </li>
                <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-emerald-600' : ''}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  At least one number
                </li>
                <li className={`flex items-center gap-2 ${/[^a-zA-Z0-9]/.test(password) ? 'text-emerald-600' : ''}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${/[^a-zA-Z0-9]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  At least one special character
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !password || !confirmPassword}
              className="w-full bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:from-[#8236be] hover:to-[#692a99] disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-fuchsia-100 disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Activating Account...
                </>
              ) : (
                <>
                  Activate Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-3">
            <p className="text-slate-500 text-xs font-medium">
              By activating this account, you agree to our{' '}
              <Link href="/terms-and-conditions" className="text-[#9d4ae3] hover:text-[#8236be] transition-colors">
                Terms & Conditions
              </Link>
            </p>
            <p className="text-slate-500 text-sm">
              Already set a password?{' '}
              <Link href="/admin/login" className="text-[#9d4ae3] hover:text-[#8236be] font-bold transition-colors">
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-4">Need help?</p>
          <Link
            href="/admin/login"
            className="inline-block text-[#9d4ae3] hover:text-[#8236be] font-bold text-sm transition-colors"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}