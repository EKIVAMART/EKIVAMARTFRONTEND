'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Star,
  Megaphone,
  UserCheck,
  ShieldAlert,
  Bell,
  Clock,
  BookOpen,
} from 'lucide-react';
import type { AppNotification } from '@/types/notification';
import { getNotificationRoute } from '@/lib/utils/notification-routes';
import { useAppSelector } from '@/lib/hooks';

interface NotificationItemProps {
  notification: AppNotification;
  onSelect?: (notification: AppNotification) => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onSelect,
  compact = false,
}: NotificationItemProps) {
  const router = useRouter();
  const { id, type, title, message, isRead, createdAt, data } = notification;

  // Format relative timestamp ("3 hours ago") safely
  let timeAgo = 'Just now';
  if (createdAt) {
    try {
      timeAgo = formatDistanceToNow(parseISO(createdAt), { addSuffix: true });
    } catch {
      timeAgo = 'Recently';
    }
  }

  // Pick visual icon & accent color scheme based on notification category constant
  const getCategoryConfig = (typeStr: string) => {
    switch (typeStr) {
      case 'ORDER_PLACED':
      case 'ORDER_CONFIRMED':
      case 'NEW_ORDER_FOR_VENDOR':
        return {
          icon: <Package className="w-4 h-4 text-slate-600" />,
          bg: 'bg-emerald-50 border-emerald-100',
          dot: 'bg-emerald-500',
        };

      case 'ORDER_PROCESSING':
      case 'ORDER_SHIPPED':
        return {
          icon: <Truck className="w-4 h-4 text-slate-600" />,
          bg: 'bg-sky-50 border-sky-100',
          dot: 'bg-sky-500',
        };

      case 'ORDER_DELIVERED':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-slate-600" />,
          bg: 'bg-teal-50 border-teal-100',
          dot: 'bg-teal-500',
        };

      case 'PAYMENT_SUCCESS':
      case 'PAYOUT_PROCESSED':
        return {
          icon: <CreditCard className="w-4 h-4 text-slate-600" />,
          bg: 'bg-indigo-50 border-indigo-100',
          dot: 'bg-indigo-500',
        };

      case 'PAYMENT_FAILED':
      case 'PAYOUT_FAILED':
      case 'ORDER_CANCELLED':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-slate-600" />,
          bg: 'bg-rose-50 border-rose-100',
          dot: 'bg-rose-500',
        };

      case 'REFUND_REQUESTED':
      case 'REFUND_APPROVED':
      case 'REFUND_REJECTED':
      case 'REFUND_PROCESSED':
      case 'REFUND_NEEDS_REVIEW':
        return {
          icon: <RotateCcw className="w-4 h-4 text-slate-600" />,
          bg: 'bg-amber-50 border-amber-100',
          dot: 'bg-amber-500',
        };

      case 'REVIEW_RECEIVED':
        return {
          icon: <Star className="w-4 h-4 text-slate-500" />,
          bg: 'bg-amber-50 border-amber-100',
          dot: 'bg-amber-500',
        };

      case 'NEW_VENDOR_APPLICATION':
      case 'VENDOR_APPLICATION_APPROVED':
      case 'VENDOR_APPLICATION_REJECTED':
        return {
          icon: <UserCheck className="w-4 h-4 text-slate-600" />,
          bg: 'bg-purple-50 border-purple-100',
          dot: 'bg-purple-500',
        };

      case 'REVIEW_FLAGGED':
      case 'VENDOR_ACCOUNT_SUSPENDED':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-slate-600" />,
          bg: 'bg-rose-50 border-rose-100',
          dot: 'bg-rose-500',
        };

      case 'PLATFORM_ANNOUNCEMENT':
        return {
          icon: <Megaphone className="w-4 h-4 text-brand-600" />,
          bg: 'bg-brand-50 border-brand-100',
          dot: 'bg-brand-600',
        };

      case 'BLOG_POST_PUBLISHED':
      case 'BLOG_ANNOUNCEMENT':
      case 'NEW_BLOG_POST':
        return {
          icon: <BookOpen className="w-4 h-4 text-brand-600" />,
          bg: 'bg-purple-50 border-purple-100',
          dot: 'bg-purple-600',
        };

      default:
        return {
          icon: <Bell className="w-4 h-4 text-neutral-600" />,
          bg: 'bg-neutral-100 border-neutral-200',
          dot: 'bg-brand-600',
        };
    }
  };

  const user = useAppSelector((state) => state.auth.user);
  const config = getCategoryConfig(String(type));

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect?.(notification);

    const route = getNotificationRoute(data, user?.role, String(type));
    router.push(route);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      className={`group relative flex items-start gap-3 p-3.5 rounded-md transition-all cursor-pointer border ${
        !isRead
          ? 'bg-brand-50/40 border-brand-100/70 shadow-sm hover:bg-brand-50'
          : 'bg-white border-neutral-100 hover:bg-neutral-50/80 hover:border-neutral-200'
      }`}
    >
      {/* Category Icon */}
      <div
        className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 border ${config.bg}`}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center justify-between gap-2">
          <h4
            className={`text-xs font-bold text-neutral-900 truncate ${
              !isRead ? 'font-extrabold text-brand-950' : 'font-semibold text-neutral-800'
            }`}
          >
            {title}
          </h4>

          <div className="flex items-center gap-1 text-[10px] text-neutral-400 shrink-0 font-medium">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>

        <p
          className={`text-xs text-neutral-600 mt-1 leading-snug ${
            compact ? 'line-clamp-2' : 'line-clamp-3'
          }`}
        >
          {message}
        </p>
      </div>

      {/* Unread Indicator Dot */}
      {!isRead && (
        <span className="absolute top-3.5 right-3 w-2.5 h-2.5 rounded-full bg-brand-600 " />
      )}
    </div>
  );
}
