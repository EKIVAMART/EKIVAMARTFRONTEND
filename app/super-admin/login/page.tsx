'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authApi, ApiError } from '@/lib/api';
import Link from 'next/link';
import { setCredentials } from '@/lib/features/auth/authSlice';
import { useAppDispatch } from '@/lib/hooks';

const SUPER_ADMIN_ROLES = ['SUPER-ADMIN', 'super-admin'];

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Login to get tokens + user info
      // Backend returns: { success, data: { accessToken, refreshToken, id, email, role, firstName, ... } }
      const res = await authApi.login({ email, password });
      const payload = res?.data ?? res;

      const accessToken: string =
        payload?.accessToken ?? payload?.tokens?.accessToken ?? payload?.token ?? '';
      const refreshToken: string =
        payload?.refreshToken ?? payload?.tokens?.refreshToken ?? '';

      if (!accessToken) {
        setError('Login failed — no access token returned. Please try again.');
        return;
      }

      // Step 2: Save token to localStorage immediately so /auth/me can use it
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      }

      // Step 3: Fetch full profile from /auth/me — role and all fields are directly in data
      // GET /auth/me → { success, data: { id, email, role, firstName, lastName, avatar, ... } }
      const profileRes = await authApi.getProfile();
      const profile = profileRes?.data ?? profileRes;

      const role: string = profile?.role ?? payload?.role ?? '';

      // Role check — only super-admin can access the panel
      if (!SUPER_ADMIN_ROLES.includes(role)) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setError('Access denied. This portal is restricted to Super Admins only.');
        return;
      }

      // Step 4: Persist full profile to Redux (also syncs localStorage)
      dispatch(setCredentials({
        user: {
          id: profile?.id ?? payload?.id ?? '',
          email: profile?.email ?? email,
          firstName: profile?.firstName ?? payload?.firstName ?? '',
          lastName: profile?.lastName ?? payload?.lastName ?? '',
          profilePicture: profile?.avatar ?? undefined,
          role,
          isEmailVerified: profile?.isEmailVerified ?? payload?.isEmailVerified ?? true,
        },
        accessToken,
        refreshToken,
      }));

      router.push('/super-admin/dashboard');

    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.statusCode === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (apiError.statusCode === 429) {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError(apiError.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#e5f3e8_0%,#f6f9f6_45%,#f9fbf9_100%)] px-4 py-10">

      <div className="relative z-10 w-full max-w-[460px] rounded-2xl border border-[#dce9de] bg-white p-6 shadow-[0_20px_60px_rgba(20,61,31,0.10)] sm:p-9">
        <div className="mb-6 flex justify-center">
          <Link href="/" aria-label="EkivaMart home" className="inline-flex min-h-11 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#228b22]">
            <Image src="/brand/ekivamart-logo.svg" alt="EkivaMart" width={122} height={70} priority className="h-[70px] w-auto object-contain" />
          </Link>
        </div>

        <div className="mb-8 text-center">
          <span className="inline-flex rounded-full bg-[#edf7ee] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#236337]">Staff access</span>
          <h1 className="mt-4 text-[27px] font-bold tracking-tight text-[#183b27]">Super-admin sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Welcome back. Sign in to manage EkivaMart.</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md text-slate-600 text-sm font-medium">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="text-sm font-medium text-slate-700 block">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-400" />
              </div>
              <input
                type="email"
                id="admin-email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="min-h-12 w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#228b22] focus:ring-4 focus:ring-[#228b22]/10"
                placeholder="you@ekivamart.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="admin-password" className="text-sm font-medium text-slate-700 block">Password</label>
              <Link href="/contact-us" className="text-xs font-semibold text-[#228b22] hover:text-[#1c711c] transition-colors">Need help?</Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="admin-password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="min-h-12 w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#228b22] focus:ring-4 focus:ring-[#228b22]/10"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex min-w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="group mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#183d27] py-3.5 font-bold text-white shadow-sm transition-colors hover:bg-[#285a39] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Secure Login
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-center text-slate-600 text-sm">
            Admin? <Link href="/admin/login" className="font-bold text-[#228b22] hover:text-[#1c711c] transition-colors">Access Admin Portal</Link>
          </p>
        </div>

        </form>
      </div>

      <div className="mt-6 text-center text-xs font-medium text-[#617569]">
        <p>&copy; {new Date().getFullYear()} EkivaMart</p>
        <p className="mt-2 flex items-center justify-center gap-1">
          <Lock size={12} />
            Protected staff access
        </p>
      </div>
    </div>
  );
}

