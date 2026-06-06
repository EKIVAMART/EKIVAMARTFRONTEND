'use client';

import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-r from-[#c800ff] to-[#912cad] rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 relative z-10">
        <div className="flex justify-center mb-8">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <ShieldCheck size={36} className="text-[#c800ff]" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Super Admin Portal Access</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Verify your credentials to continue</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 block">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#c800ff] focus:ring-4 focus:ring-[#c800ff]/10 rounded-xl outline-none transition-all text-sm font-medium text-slate-800 placeholder-slate-400"
                placeholder="admin@faflora.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 block">Password</label>
              <a href="#" className="text-xs font-semibold text-[#c800ff] hover:text-[#b500e6] transition-colors">Forgot?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-[#c800ff] focus:ring-4 focus:ring-[#c800ff]/10 rounded-xl outline-none transition-all text-sm font-medium text-slate-800 placeholder-slate-400"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-gradient-to-r from-[#c800ff] to-[#912cad] hover:from-[#b500e6] hover:to-[#802699] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-fuchsia-100 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
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
            Admin? <Link href="/admin/login" className="font-bold text-[#c800ff] hover:text-[#b500e6] transition-colors">Access Admin Portal</Link>
          </p>
        </div>

        </form>
      </div>

      <div className="mt-8 text-center text-sm font-medium text-slate-400">
        <p>&copy; {new Date().getFullYear()} Faflora Group. All rights reserved.</p>
        <p className="mt-1 flex items-center justify-center gap-1">
          <Lock size={12} />
          Secured by enterprise-grade encryption
        </p>
      </div>
    </div>
  );
}

