import type { ReactNode } from 'react';

const attentionStatuses = new Set(['pending', 'pending_payment', 'unverified', 'requires_resubmission']);
const problemStatuses = new Set(['blocked', 'failed', 'payment_failed', 'rejected', 'suspended', 'banned']);

/** A readable record status, shared by administration tables and detail views. */
export default function RecordStatus({ value, children }: { value: string; children?: ReactNode }) {
  const normalized = value.toLowerCase().replace(/[ -]/g, '_');
  const color = problemStatuses.has(normalized)
    ? 'text-red-700'
    : attentionStatuses.has(normalized)
      ? 'text-amber-800'
      : 'text-slate-700';

  return (
    <span className={`inline-block text-xs font-medium leading-5 ${color}`}>
      {children ?? normalized.replace(/_/g, ' ').replace(/^./, (letter) => letter.toUpperCase())}
    </span>
  );
}
