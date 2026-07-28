'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogOut, RefreshCw, ShieldAlert } from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import { logout, setTokens } from '@/lib/features/auth/authSlice';
import { useRouter } from 'next/navigation';

// ─── Constants ────────────────────────────────────────────────────────────────
const TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE_MS = 15 * 1000;      // Show warning 15 seconds before expiry
const COUNTDOWN_SECONDS = 15;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Decodes JWT payload without a library. Returns the `exp` field in seconds,
 * or null if the token is absent/malformed.
 */
function getTokenExpiryMs(token: string | null): number | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof payload.exp === 'number') {
      return payload.exp * 1000; // convert to ms
    }
    return null;
  } catch {
    return null;
  }
}

function getSecondsRemaining(expiryMs: number): number {
  return Math.max(0, Math.floor((expiryMs - Date.now()) / 1000));
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SessionTimeoutModalProps {
  loginPath: string; // e.g. '/admin/login' or '/super-admin/login'
}

export default function SessionTimeoutModal({ loginPath }: SessionTimeoutModalProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [isExtending, setIsExtending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const extendInProgress = useRef(false);

  // ── Core cleanup ────────────────────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ── Perform logout ──────────────────────────────────────────────────────────
  const performLogout = useCallback(async () => {
    clearTimer();
    setIsLoggingOut(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId: null }),
        }).catch(() => { /* fire-and-forget */ });
      }
    } finally {
      dispatch(logout());
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.replace(loginPath);
    }
  }, [clearTimer, dispatch, loginPath, router]);

  // ── Extend session ───────────────────────────────────────────────────────────
  const extendSession = useCallback(async () => {
    if (extendInProgress.current) return;
    extendInProgress.current = true;
    setIsExtending(true);

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        await performLogout();
        return;
      }

      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        await performLogout();
        return;
      }

      const data = await res.json();
      const accessToken: string = data?.data?.accessToken ?? data?.accessToken;
      const newRefreshToken: string = data?.data?.refreshToken ?? data?.refreshToken ?? refreshToken;

      if (!accessToken) {
        await performLogout();
        return;
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      dispatch(setTokens({ accessToken, refreshToken: newRefreshToken }));

      // Dismiss modal and restart the check loop
      setShowModal(false);
      setSecondsLeft(COUNTDOWN_SECONDS);
    } catch {
      await performLogout();
    } finally {
      extendInProgress.current = false;
      setIsExtending(false);
    }
  }, [dispatch, performLogout]);

  // ── Main ticker loop ─────────────────────────────────────────────────────────
  const startChecking = useCallback(() => {
    clearTimer();

    intervalRef.current = setInterval(() => {
      const token = localStorage.getItem('accessToken');
      const expiryMs = getTokenExpiryMs(token);

      if (!expiryMs) {
        if (extendInProgress.current) return; // Wait for active refresh
        // No valid token → logout
        clearTimer();
        performLogout();
        return;
      }

      const msRemaining = expiryMs - Date.now();

      if (msRemaining <= 0) {
        if (extendInProgress.current) return; // Wait for active refresh
        // Already expired
        clearTimer();
        performLogout();
        return;
      }

      if (msRemaining <= WARNING_BEFORE_MS) {
        const secs = Math.max(0, Math.ceil(msRemaining / 1000));
        setSecondsLeft(secs);
        setShowModal(true);

        if (secs === 0) {
          if (extendInProgress.current) return; // Wait for active refresh
          clearTimer();
          performLogout();
        }
      } else {
        // Not in warning zone yet, keep modal hidden
        setShowModal(false);
      }
    }, 1000);
  }, [clearTimer, performLogout]);

  // ── Visibility API: handle tab restore ──────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Tab became active — check token immediately
        const token = localStorage.getItem('accessToken');
        const expiryMs = getTokenExpiryMs(token);

        if (!expiryMs || expiryMs - Date.now() <= 0) {
          // Expired while hidden → go to login
          performLogout();
          return;
        }

        // Restart the interval from a fresh tick
        startChecking();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [performLogout, startChecking]);

  // ── Mount: start checking immediately ───────────────────────────────────────
  useEffect(() => {
    startChecking();
    return clearTimer;
  }, [startChecking, clearTimer]);

  // ── Colour coding for progress bar and timer ─────────────────────────────────
  const progressPct = (secondsLeft / COUNTDOWN_SECONDS) * 100;

  const barColor =
    secondsLeft > 10
      ? 'bg-gradient-to-r from-[#9d4ae3] to-[#8236be]'
      : secondsLeft > 5
      ? 'bg-gradient-to-r from-amber-400 to-orange-500'
      : 'bg-gradient-to-r from-red-500 to-rose-600';

  const timerColor =
    secondsLeft > 10
      ? 'text-[#9d4ae3]'
      : secondsLeft > 5
      ? 'text-amber-600'
      : 'text-rose-600';

  const pulseClass = secondsLeft <= 5 ? 'animate-pulse' : '';

  return (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
          >
            {/* ── Progress bar ── */}
            <div className="h-1.5 bg-slate-100 w-full">
              <motion.div
                className={`h-full ${barColor} ${pulseClass} transition-all duration-1000`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* ── Header ── */}
            <div className="px-8 pt-8 pb-0 flex flex-col items-center text-center gap-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                secondsLeft <= 5
                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                  : secondsLeft <= 10
                  ? 'bg-amber-50 text-amber-600 border border-amber-100'
                  : 'bg-fuchsia-50 text-[#9d4ae3] border border-fuchsia-100'
              } ${pulseClass}`}>
                <ShieldAlert size={32} strokeWidth={1.75} />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  ⚠️ Session Expiring!
                </h2>
                <p className="text-sm text-gray-500 font-medium mt-1 leading-relaxed">
                  Your session will expire in{' '}
                  <span className={`font-black ${timerColor}`}>{secondsLeft} second{secondsLeft !== 1 ? 's' : ''}</span>.
                  <br />
                  Click <strong className="text-slate-700">"Extend Session"</strong> to stay logged in.
                </p>
              </div>
            </div>

            {/* ── Countdown ring ── */}
            <div className="flex items-center justify-center py-6">
              <div className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-inner ${
                secondsLeft <= 5
                  ? 'border-rose-200 bg-rose-50'
                  : secondsLeft <= 10
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-fuchsia-100 bg-fuchsia-50/60'
              } ${pulseClass}`}>
                <Clock
                  size={18}
                  className={`absolute top-2 left-1/2 -translate-x-1/2 ${timerColor}`}
                  strokeWidth={2.5}
                />
                <span className={`text-4xl font-black tracking-tighter mt-3 ${timerColor}`}>
                  {secondsLeft}
                </span>
              </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="px-8 pb-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={extendSession}
                disabled={isExtending || isLoggingOut}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] hover:from-[#8236be] hover:to-[#692a99] text-white rounded-2xl font-black text-sm shadow-lg shadow-fuchsia-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isExtending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Extending…
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Extend Session
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={performLogout}
                disabled={isExtending || isLoggingOut}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl font-black text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Logging out…
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    Logout Now
                  </>
                )}
              </button>
            </div>

            {/* ── Footer note ── */}
            <div className={`px-8 pb-5 text-center text-[11px] font-semibold ${timerColor} ${pulseClass}`}>
              Auto-logout in {secondsLeft} second{secondsLeft !== 1 ? 's' : ''}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
