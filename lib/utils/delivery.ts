import { ExpectedDelivery, DeliveryBreakdown } from '@/lib/api';

export type Phase = 'quote' | 'unpaid' | 'paid';

/**
 * Returns user-facing delivery copy based on the expectedDelivery object and order payment phase.
 * Phase 'quote' or 'unpaid' -> "Estimated delivery by <label>"
 * Phase 'paid' -> "Expected delivery by <label>"
 * Legacy orders with undefined expectedDelivery return null.
 */
export function deliveryCopy(e: ExpectedDelivery | undefined, phase: Phase): string | null {
  if (!e || !e.expectedDeliveryLabel) return null; // legacy order: hide the row
  const verb = phase === 'paid' ? 'Expected delivery by' : 'Estimated delivery by';
  return `${verb} ${e.expectedDeliveryLabel}`;
}

/**
 * Calculates whole days until delivery, on calendar dates (no timezone drift).
 * Uses UTC date calculations to avoid timezone shifts.
 */
export function daysUntil(isoDate: string, today = new Date()): number {
  if (!isoDate) return 0;
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const target = Date.UTC(y, m - 1, d);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - now) / 86_400_000);
}

/**
 * Formats a plain number as Nigerian Naira (NGN).
 */
export function formatNaira(amount?: number | null): string {
  if (amount === undefined || amount === null) return '₦0';
  return `₦${Number(amount).toLocaleString('en-NG')}`;
}

/**
 * Lifecycle timeline step definition with icon, status and description.
 */
export interface DeliveryTimelineStep {
  key: string;
  label: string;
  sublabel?: string;
  status: 'completed' | 'active' | 'upcoming';
  dateLabel?: string;
}
