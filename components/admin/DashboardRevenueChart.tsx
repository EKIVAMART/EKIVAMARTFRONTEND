'use client';

import { useState } from 'react';

type Point = { date: string; grossRevenue?: number; platformCommission?: number; vendorNetEarnings?: number };

const money = (value: number) => new Intl.NumberFormat('en-NG', {
  style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
}).format(value);
const shortMoney = (value: number) => value >= 1_000_000 ? `₦${(value / 1_000_000).toFixed(1)}m` : value >= 1_000 ? `₦${(value / 1_000).toFixed(0)}k` : `₦${value}`;

export default function DashboardRevenueChart({ points }: { points: Point[] }) {
  const [active, setActive] = useState<number | null>(null);
  const width = 720;
  const height = 250;
  const left = 54;
  const right = 14;
  const top = 18;
  const bottom = 40;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const max = Math.max(1, ...points.flatMap((point) => [point.grossRevenue || 0, point.vendorNetEarnings || 0, point.platformCommission || 0]));
  const ceiling = Math.max(1, Math.ceil(max / 4 / Math.pow(10, Math.floor(Math.log10(max / 4 || 1)))) * Math.pow(10, Math.floor(Math.log10(max / 4 || 1))) * 4);
  const x = (index: number) => left + (points.length === 1 ? plotWidth / 2 : index * plotWidth / (points.length - 1));
  const y = (value: number) => top + plotHeight * (1 - Math.min(1, value / ceiling));
  const line = (key: keyof Point) => points.map((point, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(Number(point[key]) || 0)}`).join(' ');
  const area = `${line('grossRevenue')} L ${x(points.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`;
  const selected = active === null ? null : points[active];
  const labelStep = Math.max(1, Math.ceil(points.length / 7));

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-600" aria-label="Chart legend">
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-emerald-700" />Gross sales</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-teal-400" />Vendor earnings</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-amber-500" />Commission</span>
      </div>
      <div className="relative mt-4" onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${width} ${height}`} className="block w-full" role="img" aria-label="Gross sales, vendor earnings and commission over time">
          <defs>
            <linearGradient id="dashboard-revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#15803d" stopOpacity=".18" /><stop offset="100%" stopColor="#15803d" stopOpacity="0" /></linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((step) => {
            const value = ceiling * step / 4;
            return <g key={step}><line x1={left} x2={width - right} y1={y(value)} y2={y(value)} stroke="#e7ede9" strokeDasharray={step === 0 ? undefined : '4 5'} /><text x={left - 10} y={y(value) + 4} textAnchor="end" fontSize="11" fill="#728279">{shortMoney(value)}</text></g>;
          })}
          <path d={area} fill="url(#dashboard-revenue-fill)" />
          <path d={line('grossRevenue')} fill="none" stroke="#166534" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={line('vendorNetEarnings')} fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={line('platformCommission')} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {active !== null && <><line x1={x(active)} x2={x(active)} y1={top} y2={top + plotHeight} stroke="#94a3a7" strokeDasharray="4 4" /><circle cx={x(active)} cy={y(selected?.grossRevenue || 0)} r="5" fill="#166534" stroke="white" strokeWidth="2" /></>}
          {points.map((point, index) => <g key={`${point.date}-${index}`}>
            {(index % labelStep === 0 || index === points.length - 1) && <text x={x(index)} y={height - 10} textAnchor="middle" fontSize="11" fill="#728279">{new Date(point.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</text>}
            <rect x={x(index) - plotWidth / Math.max(2, points.length) / 2} y={top} width={plotWidth / Math.max(2, points.length)} height={plotHeight} fill="transparent" onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} tabIndex={0} aria-label={`${point.date}: gross sales ${money(point.grossRevenue || 0)}, vendor earnings ${money(point.vendorNetEarnings || 0)}, commission ${money(point.platformCommission || 0)}`} />
          </g>)}
        </svg>
        {selected && <div className="pointer-events-none absolute right-2 top-1 rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur-sm" role="status">
          <p className="mb-2 font-semibold text-slate-900">{new Date(selected.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          <p className="text-emerald-800">Gross sales <strong className="ml-2">{money(selected.grossRevenue || 0)}</strong></p>
          <p className="text-teal-700">Vendor earnings <strong className="ml-2">{money(selected.vendorNetEarnings || 0)}</strong></p>
          <p className="text-amber-700">Commission <strong className="ml-2">{money(selected.platformCommission || 0)}</strong></p>
        </div>}
      </div>
    </div>
  );
}
