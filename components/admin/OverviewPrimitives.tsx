'use client';
export const currency = (n: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(n);
export function Metric({
  label,
  value,
  context,
}: {
  label: string;
  value: string;
  context: string;
}) {
  return (
    <div className="overview-metric">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{context}</span>
    </div>
  );
}
export function OrderBreakdown({
  rows,
  total,
  value,
  loading,
  error,
  onOpen,
  onRetry,
}: {
  rows: {
    status: string;
    count: number;
    totalRevenue: number;
    percentage: number;
  }[];
  total: number;
  value: number;
  loading?: boolean;
  error?: string | null;
  onOpen?: () => void;
  onRetry?: () => void;
}) {
  return (
    <section className="overview-panel order-breakdown">
      <div className="overview-panel-heading">
        <h2>Orders by status</h2>
        <span>{loading || error ? '—' : total.toLocaleString()} orders</span>
      </div>
      <div className="order-value">
        <span>Total order value</span>
        <strong>{loading || error ? '—' : currency(value)}</strong>
      </div>
      {loading ? (
        <p className="analytics-empty">Loading orders…</p>
      ) : error ? (
        <div className="analytics-empty flex-col gap-3" role="alert">
          {error}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-emerald-800 underline"
            >
              Retry
            </button>
          )}
        </div>
      ) : rows.length === 0 ? (
        <p className="analytics-empty">No orders in this period.</p>
      ) : (
        <div className="status-list">
          {[...rows]
            .sort(
              (a, b) =>
                [
                  'pending_payment',
                  'confirmed',
                  'processing',
                  'shipped',
                  'delivered',
                  'cancelled',
                  'payment_failed',
                  'refunded',
                ].indexOf(a.status) -
                [
                  'pending_payment',
                  'confirmed',
                  'processing',
                  'shipped',
                  'delivered',
                  'cancelled',
                  'payment_failed',
                  'refunded',
                ].indexOf(b.status)
            )
            .map((r) => (
              <button
                type="button"
                key={r.status}
                onClick={onOpen}
                title={`${r.status.replaceAll('_', ' ')}: ${currency(r.totalRevenue)}`}
              >
                <div>
                  <span
                    className={`status-dot status-${r.status.toLowerCase()}`}
                  />
                  <span>{r.status.replaceAll('_', ' ')}</span>
                  <strong>{r.count}</strong>
                  <small>{r.percentage.toFixed(1)}%</small>
                </div>
                <div className="status-details">
                  <div className="status-track">
                    <i style={{ width: `${Math.min(100, r.percentage)}%` }} />
                  </div>
                  <span>{currency(r.totalRevenue)}</span>
                </div>
              </button>
            ))}
        </div>
      )}
    </section>
  );
}
