'use client';

import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axios';

export default function NewsletterSubscriberCount() {
  const [total, setTotal] = useState<number | 'unavailable' | null>(null);

  useEffect(() => {
    let active = true;
    axiosInstance.get<{ data: { total: number } }>('/newsletter/stats')
      .then(({ data }) => {
        if (active) setTotal(data.data.total);
      })
      .catch(() => {
        if (active) setTotal('unavailable');
      });

    return () => { active = false; };
  }, []);

  return (
    <section className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-4" aria-label="Newsletter subscribers">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Newsletter subscribers</h2>
        <p className="text-xs text-slate-600">All-time storefront signups</p>
      </div>
      <p role="status" className="text-xl font-semibold tabular-nums text-slate-900">
        {typeof total === 'number' ? total.toLocaleString() : total === null ? 'Loading…' : 'Unavailable'}
      </p>
    </section>
  );
}
