'use client';
import { useEffect, useId, useRef, useState } from 'react';
export type AnalyticsPoint = {
  date: string;
  grossRevenue?: number;
  platformCommission?: number;
  vendorNetEarnings?: number;
  orders?: number;
  orderValue?: number;
};
const money = (n: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(n);
export default function DashboardRevenueChart({
  points: sourcePoints,
  kind = 'finance',
  interval = 'daily',
}: {
  points: AnalyticsPoint[];
  kind?: 'finance' | 'orders' | 'orderValue';
  interval?: 'daily' | 'weekly' | 'monthly';
}) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(260, entry.contentRect.width))
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  // These endpoints return complete aggregates: absent buckets between observations have zero activity.
  // Missing fields within a returned bucket remain missing and render as gaps.
  const sorted = [...sourcePoints].sort((a, b) => a.date.localeCompare(b.date));
  const points =
    sorted.length < 2
      ? sorted
      : (() => {
          const map = new Map(sorted.map((p) => [p.date, p]));
          const out: AnalyticsPoint[] = [];
          for (
            let day = new Date(sorted[0].date + 'T12:00:00Z');
            day <= new Date(sorted[sorted.length - 1].date + 'T12:00:00Z');
          ) {
            const date = day.toISOString().slice(0, 10);
            out.push(
              map.get(date) ?? {
                date,
                orders: 0,
                orderValue: 0,
                grossRevenue: 0,
                platformCommission: 0,
                vendorNetEarnings: 0,
              }
            );
            if (kind === 'finance' && interval === 'monthly')
              day.setUTCMonth(day.getUTCMonth() + 1);
            else
              day.setUTCDate(
                day.getUTCDate() +
                  (kind === 'finance' && interval === 'weekly' ? 7 : 1)
              );
          }
          return out;
        })();
  const id = useId().replaceAll(':', '');
  const [active, setActive] = useState<number | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const series =
    kind === 'finance'
      ? [
          { key: 'grossRevenue', label: 'Gross sales', color: '#166548' },
          {
            key: 'vendorNetEarnings',
            label: 'Vendor earnings',
            color: '#64748b',
          },
          { key: 'platformCommission', label: 'Commission', color: '#ad7b28' },
        ]
      : [
          {
            key: kind,
            label: kind === 'orders' ? 'Orders placed' : 'Order value',
            color: '#166548',
          },
        ];
  const visible = series.filter((s) => !hidden.includes(s.key));
  const W = width,
    H = 270,
    L = 54,
    R = 22,
    T = 18,
    B = 36,
    pw = W - L - R,
    ph = H - T - B;
  const max = Math.max(
    1,
    ...points.flatMap((p) =>
      visible.map((s) => Number(p[s.key as keyof AnalyticsPoint]) || 0)
    )
  );
  const ceiling =
    kind === 'orders'
      ? Math.max(4, Math.ceil(max / 4) * 4)
      : Math.ceil(max / 10 ** Math.floor(Math.log10(max))) *
        10 ** Math.floor(Math.log10(max));
  const times = points.map((p) => new Date(p.date).getTime());
  const firstTime = Math.min(...times);
  const span = Math.max(...times) - firstTime;
  const x = (i: number) =>
    L + (!span ? pw / 2 : ((times[i] - firstTime) / span) * pw);
  const y = (n: number) => T + ph * (1 - n / ceiling);
  const fmt = (n: number) =>
    kind === 'orders' ? n.toLocaleString() : money(n);
  const short = (n: number) =>
    `${kind === 'orders' ? '' : '₦'}${n >= 1e6 ? (n / 1e6).toFixed(1) + 'm' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : Number(n.toFixed(1))}`;
  const path = (key: string) => {
    let previous = false;
    return points
      .map((p, i) => {
        const v = p[key as keyof AnalyticsPoint];
        if (typeof v !== 'number' || !Number.isFinite(v)) {
          previous = false;
          return '';
        }
        const d = `${previous ? 'L' : 'M'}${x(i)},${y(v)}`;
        previous = true;
        return d;
      })
      .join(' ');
  };
  const selected = active === null ? undefined : points[active];
  return (
    <div ref={container} className="analytics-chart">
      <div className="analytics-legend">
        {series.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={!hidden.includes(s.key)}
            onClick={() =>
              setHidden((v) =>
                v.includes(s.key) ? v.filter((k) => k !== s.key) : [...v, s.key]
              )
            }
            style={{ opacity: hidden.includes(s.key) ? 0.4 : 1 }}
          >
            <span style={{ background: s.color }} />
            {s.label}
            {kind === 'finance' &&
            s.key === 'platformCommission' &&
            points.every((p) => p.platformCommission === 0)
              ? ' · ₦0'
              : ''}
          </button>
        ))}
      </div>
      {points.length === 0 ? (
        <div className="analytics-empty">
          No activity recorded for this period.
        </div>
      ) : (
        <div className="analytics-plot" onMouseLeave={() => setActive(null)}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={
              kind === 'finance'
                ? 'Sales and earnings over time'
                : 'Orders over time'
            }
          >
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#166548" stopOpacity=".12" />
                <stop offset="100%" stopColor="#166548" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <line
                  x1={L}
                  x2={W - R}
                  y1={y((ceiling * i) / 4)}
                  y2={y((ceiling * i) / 4)}
                  stroke="#e8ecea"
                  strokeDasharray={i ? '3 5' : undefined}
                />
                <text
                  x={L - 10}
                  y={y((ceiling * i) / 4) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#738078"
                >
                  {short((ceiling * i) / 4)}
                </text>
              </g>
            ))}
            {visible.map((s, i) => {
              const zero = points.every(
                (p) => p[s.key as keyof AnalyticsPoint] === 0
              );
              return (
                <g key={s.key}>
                  {i === 0 &&
                    points.every(
                      (p) =>
                        typeof p[s.key as keyof AnalyticsPoint] === 'number'
                    ) && (
                      <path
                        d={`${path(s.key)} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`}
                        fill={`url(#${id})`}
                      />
                    )}
                  <path
                    d={path(s.key)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={s.key === 'vendorNetEarnings' ? 2 : 2.5}
                    strokeDasharray={
                      s.key === 'vendorNetEarnings' ? '5 5' : undefined
                    }
                    opacity={zero ? 0.35 : 1}
                  />
                  {points.length === 1 && (
                    <circle
                      cx={x(0)}
                      cy={y(
                        Number(points[0][s.key as keyof AnalyticsPoint]) || 0
                      )}
                      r="4"
                      fill={s.color}
                    />
                  )}
                </g>
              );
            })}
            {active !== null && active < points.length && (
              <line
                x1={x(active)}
                x2={x(active)}
                y1={T}
                y2={H - B}
                stroke="#a4b2aa"
                strokeDasharray="3 3"
              />
            )}
            {points.map((p, i) => (
              <g key={p.date}>
                {(i === 0 ||
                  i === points.length - 1 ||
                  (i %
                    Math.max(
                      1,
                      Math.ceil(points.length / (width < 500 ? 3 : 6))
                    ) ===
                    0 &&
                    x(points.length - 1) - x(i) > 60)) && (
                  <text
                    x={x(i)}
                    y={H - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#738078"
                  >
                    {new Date(p.date).toLocaleDateString('en-GB', {
                      timeZone: 'UTC',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </text>
                )}
                <rect
                  x={Math.max(
                    L,
                    x(i) - pw / Math.max(1, points.length - 1) / 2
                  )}
                  y={T}
                  width={Math.min(
                    pw / Math.max(1, points.length - 1),
                    W -
                      R -
                      Math.max(
                        L,
                        x(i) - pw / Math.max(1, points.length - 1) / 2
                      )
                  )}
                  height={ph}
                  fill="transparent"
                  tabIndex={0}
                  onBlur={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onTouchStart={() => setActive(i)}
                  aria-label={`${p.date}: ${visible.map((s) => `${s.label} ${fmt(Number(p[s.key as keyof AnalyticsPoint]) || 0)}`).join(', ')}`}
                />
              </g>
            ))}
          </svg>
          {selected && (
            <div className="analytics-tooltip">
              <strong>
                {new Date(selected.date).toLocaleDateString('en-GB', {
                  timeZone: 'UTC',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </strong>
              {visible.map((s) => (
                <div key={s.key}>
                  <span>{s.label}</span>
                  <b>
                    {typeof selected[s.key as keyof AnalyticsPoint] === 'number'
                      ? fmt(Number(selected[s.key as keyof AnalyticsPoint]))
                      : 'Unavailable'}
                  </b>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
