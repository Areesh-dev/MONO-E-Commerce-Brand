import Skeleton from '../../ui/Skeleton';
import OrderStatusBadge from '../../order/OrderStatusBadge';

const ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function StatusDistribution({ counts, total, loading }) {
  if (loading) {
    return (
      <div className="border border-ink-line bg-ink-card p-6">
        <Skeleton className="h-3 w-32 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        </div>
      </div>
    );
  }

  const safeTotal = total || 1;

  return (
    <div className="border border-ink-line bg-ink-card p-6">
      <h3 className="text-[11px] uppercase tracking-editorial text-ink-white mb-6">
        Order Status
      </h3>

      {total === 0 ? (
        <p className="text-xs uppercase tracking-editorial text-ink-muted">No orders in range</p>
      ) : (
        <ul className="space-y-3 list-none">
          {ORDER.map((s) => {
            const n = counts?.[s] || 0;
            const pct = Math.round((n / safeTotal) * 100);
            return (
              <li key={s}>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <OrderStatusBadge status={s} />
                  <span className="text-xs text-ink-white tabular-nums">
                    {n} <span className="text-ink-muted ml-1">· {pct}%</span>
                  </span>
                </div>
                <div className="h-px bg-ink-line relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-ink-white"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}