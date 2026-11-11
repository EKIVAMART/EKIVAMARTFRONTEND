'use client';

import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import { Mail, Users } from 'lucide-react';

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
    <section className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-950 to-emerald-800 p-5 text-white shadow-sm sm:p-6" aria-label="Newsletter subscribers">
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <span className="rounded-xl border border-white/20 bg-white/10 p-3"><Mail size={22} aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Audience growth</p>
            <h2 className="mt-1 text-lg font-semibold">Newsletter subscribers</h2>
            <p className="text-sm text-emerald-100/80">All-time storefront signups</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3">
          <Users size={19} className="text-emerald-200" aria-hidden="true" />
          <p role="status" className="text-2xl font-semibold tabular-nums">
            {typeof total === 'number' ? total.toLocaleString() : total === null ? 'Loading…' : 'Unavailable'}
          </p>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[30px] border-white/5" aria-hidden="true" />
    </section>
  );
}
