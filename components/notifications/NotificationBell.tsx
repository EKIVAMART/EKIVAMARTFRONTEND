'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { useAppSelector } from '@/lib/hooks';
import { Bell, CheckCheck, Volume2, VolumeX, ArrowRight } from 'lucide-react';

interface DropdownPos {
  top: number;
  /** right offset from the right viewport edge, so the dropdown is right-anchored */
  right: number;
  /** on very narrow screens, stretch full width left-to-right with these insets */
  left?: number;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  const {
    notifications,
    unreadCount,
    connectionStatus,
    loading,
    soundEnabled,
    setSoundEnabled,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  /** Calculate position of dropdown relative to the bell button using getBoundingClientRect */
  const computePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const GAP = 8; // px gap between bottom of button and top of dropdown
    const SIDE_MARGIN = 12; // px from viewport edges on narrow screens

    // On very narrow screens: stretch edge-to-edge
    if (vw < 480) {
      setDropdownPos({
        top: rect.bottom + GAP,
        right: SIDE_MARGIN,
        left: SIDE_MARGIN,
      });
    } else {
      // Right-anchor to the button's right edge, clamped so panel never goes off left edge
      const panelWidth = Math.min(384, vw - SIDE_MARGIN * 2);
      const rightFromViewport = vw - rect.right;
      // Clamp so panel doesn't overflow left
      const clampedRight = Math.min(rightFromViewport, vw - panelWidth - SIDE_MARGIN);
      setDropdownPos({
        top: rect.bottom + GAP,
        right: Math.max(SIDE_MARGIN, clampedRight),
      });
    }
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      computePosition();
    }
    setIsOpen((prev) => !prev);
  };

  // Recalculate on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    const onUpdate = () => computePosition();
    window.addEventListener('scroll', onUpdate, { passive: true });
    window.addEventListener('resize', onUpdate, { passive: true });
    return () => {
      window.removeEventListener('scroll', onUpdate);
      window.removeEventListener('resize', onUpdate);
    };
  }, [isOpen, computePosition]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideButton = buttonRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideButton && !insideDropdown) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Strictly render only for logged-in authenticated users
  if (!isAuthenticated || !user) {
    return null;
  }

  const displayBadge = unreadCount > 99 ? '99+' : unreadCount;
  const recentNotifications = notifications.slice(0, 8);

  return (
    <div className="relative inline-block">
      {/* Bell Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="relative flex items-center justify-center p-2 rounded-full text-neutral-600 hover:text-brand-600 hover:bg-neutral-100/80 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />

        {/* Unread Badge Counter (Capped at 99+) */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-brand-600 text-[11px] font-extrabold text-white shadow-md animate-pulse">
            {displayBadge}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel — rendered via fixed positioning calculated from the button rect */}
      {isOpen && dropdownPos && (
        <div
          ref={dropdownRef}
          className="fixed bg-white rounded-3xl shadow-2xl border border-neutral-100 z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={
            dropdownPos.left !== undefined
              ? {
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                  right: dropdownPos.right,
                }
              : {
                  top: dropdownPos.top,
                  right: dropdownPos.right,
                  width: Math.min(384, window.innerWidth - 24),
                }
          }
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-neutral-900">Notifications</h3>

              {unreadCount > 0 && (
                <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}

              {/* Real-time SSE Connection Indicator */}
              <div
                className="flex items-center gap-1 text-[10px] font-semibold ml-1 px-2 py-0.5 rounded-full bg-white border border-neutral-200"
                title={`Realtime Stream: ${connectionStatus}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-500 animate-pulse'
                      : connectionStatus === 'reconnecting'
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-neutral-300'
                  }`}
                />
                <span className="text-neutral-500 uppercase tracking-tighter">
                  {connectionStatus === 'connected' ? 'Live' : 'Polling'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                title={soundEnabled ? 'Mute chime' : 'Enable chime'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
              </button>

              {/* Mark All Read Button */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void markAllAsRead()}
                  className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 p-1.5 rounded-lg hover:bg-brand-50 transition"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-neutral-200">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400 font-medium">
                Loading notifications...
              </div>
            ) : recentNotifications.length > 0 ? (
              recentNotifications.map((item) => (
                <NotificationItem
                  key={item.id}
                  notification={item}
                  compact={true}
                  onSelect={(notif) => {
                    void markAsRead(notif.id);
                    setIsOpen(false);
                  }}
                />
              ))
            ) : (
              <div className="py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-2">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-neutral-700">No notifications yet</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  We&apos;ll notify you when orders or updates arrive.
                </p>
              </div>
            )}
          </div>

          {/* Footer view all link */}
          <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline transition"
            >
              <span>View All Notifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
