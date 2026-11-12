'use client';

import { useEffect, useState } from 'react';
import { superAdminDashboardApi } from '@/lib/api';
import { adminVendorApi } from '@/lib/api-vendor';

interface VendorBalance {
  vendorId: string;
  availableBalance: number;
  pendingEscrow: number;
  totalWithdrawn: number;
  lifetimeEarnings: number;
}

interface LedgerEntry {
  id: string;
  orderNumber: string;
  orderDate: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  gatewayFeeAmount: number;
  netAmount: number;
  status: string;
}

const PAGE_SIZE = 10;
const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' });

// Mounted only inside the Super Admin vendor dialog. API authorization remains server-side.
export default function VendorEarningsPanel({ vendorId }: { vendorId: string }) {
  const [balance, setBalance] = useState<VendorBalance | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [ledgerLoading, setLedgerLoading] = useState(true);
  const [balanceError, setBalanceError] = useState(false);
  const [ledgerError, setLedgerError] = useState(false);
  const [balanceRetry, setBalanceRetry] = useState(0);
  const [ledgerRetry, setLedgerRetry] = useState(0);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  useEffect(() => {
    let active = true;
    setBalanceLoading(true);
    setBalanceError(false);
    setBalance(null);
    superAdminDashboardApi.getVendorEarnings({ vendorId, page: 1, limit: 1 })
      .then(response => {
        if (!response?.success || !Array.isArray(response.data?.items)) throw new Error('Invalid earnings response');
        if (active) setBalance(response.data.items.find((item: VendorBalance) => item.vendorId === vendorId) ?? null);
      })
      .catch(() => { if (active) setBalanceError(true); })
      .finally(() => { if (active) setBalanceLoading(false); });
    return () => { active = false; };
  }, [vendorId, balanceRetry]);

  useEffect(() => {
    let active = true;
    setLedgerLoading(true);
    setLedgerError(false);
    setEntries([]);
    adminVendorApi.getPayoutBreakdown({ vendorId, page, limit: PAGE_SIZE })
      .then(response => {
        if (!response?.success || !Array.isArray(response.data?.items) || !response.data?.pagination) {
          throw new Error('Invalid ledger response');
        }
        if (active) {
          setEntries(response.data.items);
          setPagination(response.data.pagination);
        }
      })
      .catch(() => { if (active) setLedgerError(true); })
      .finally(() => { if (active) setLedgerLoading(false); });
    return () => { active = false; };
  }, [vendorId, page, ledgerRetry]);

  return (
    <section aria-label="Vendor earnings" className="space-y-6">
      <div aria-busy={balanceLoading}>
        {balanceLoading ? <p role="status" className="py-6 text-sm text-slate-500">Loading balances…</p> : balanceError ? (
          <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-rose-200 p-4 text-sm text-slate-700">
            <p>Unable to load earnings balances.</p>
            <button type="button" onClick={() => setBalanceRetry(value => value + 1)} className="font-semibold text-emerald-800 underline">Retry balances</button>
          </div>
        ) : balance ? (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Available balance', balance.availableBalance],
              ['Pending escrow', balance.pendingEscrow],
              ['Withdrawn', balance.totalWithdrawn],
              ['Lifetime earnings', balance.lifetimeEarnings],
            ].map(([label, amount]) => (
              <div key={label} className="min-w-0 rounded-lg border border-slate-200 p-4">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-2 break-words text-lg font-semibold tabular-nums text-slate-800">{money.format(Number(amount))}</dd>
              </div>
            ))}
          </dl>
        ) : <p className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500">No earnings balance is available for this vendor yet.</p>}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200" aria-busy={ledgerLoading}>
        <h4 className="border-b border-slate-200 px-4 py-4 text-sm font-semibold text-slate-800">Earnings ledger</h4>
        {ledgerLoading ? <p role="status" className="p-6 text-sm text-slate-500">Loading earnings history…</p> : ledgerError ? (
          <div role="alert" className="flex flex-wrap items-center gap-3 p-6 text-sm text-slate-700">
            <p>Unable to load earnings history.</p>
            <button type="button" onClick={() => setLedgerRetry(value => value + 1)} className="font-semibold text-emerald-800 underline">Retry history</button>
          </div>
        ) : entries.length === 0 ? <p className="p-6 text-sm text-slate-500">No ledger entries.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {['Order ref', 'Gross amount', 'Commission', 'Gateway fee', 'Net payout', 'Status', 'Order date'].map(label => <th key={label} scope="col" className="px-4 py-3 font-medium">{label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {entries.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-semibold">{item.orderNumber}</td>
                    <td className="px-4 py-3 tabular-nums">{money.format(item.grossAmount)}</td>
                    <td className="px-4 py-3 tabular-nums">{money.format(item.commissionAmount)} ({item.commissionRate}%)</td>
                    <td className="px-4 py-3 tabular-nums">{money.format(item.gatewayFeeAmount)}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{money.format(item.netAmount)}</td>
                    <td className="px-4 py-3 capitalize">{item.status}</td>
                    <td className="px-4 py-3">{new Date(item.orderDate).toLocaleDateString('en-NG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!ledgerError && pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600">
            <span>Page {page} of {pagination.totalPages} · {pagination.total} entries</span>
            <div className="flex gap-2">
              <button type="button" aria-label="Previous earnings page" disabled={ledgerLoading || page <= 1} onClick={() => setPage(value => value - 1)} className="min-h-11 rounded-lg border px-3 disabled:opacity-40">Previous</button>
              <button type="button" aria-label="Next earnings page" disabled={ledgerLoading || page >= pagination.totalPages} onClick={() => setPage(value => value + 1)} className="min-h-11 rounded-lg border px-3 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
