import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';

const fmt = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));

export default function OrderCard({ order }) {
  const itemCount = (order.order_items || []).reduce((s, it) => s + it.quantity, 0);
  return (
    <Link
      to={`/profile/orders/${order.id}`}
      aria-label={`Order ${order.id.slice(0, 8)}, ${itemCount} item${itemCount === 1 ? '' : 's'}, ${order.status}`}
      className="block border border-ink-line bg-ink-card hover:border-ink-soft transition-colors"
    >
      <div className="p-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] uppercase tracking-editorial text-ink-dim">
              #{order.id.slice(0, 8)}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-3 text-xs uppercase tracking-nav text-ink-white">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-editorial text-ink-dim">
            {fmtDate(order.created_at)}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm text-ink-white tabular-nums">{fmt(order.total_amount)}</p>
          <ChevronRight className="w-4 h-4 text-ink-dim mt-2 ml-auto" />
        </div>
      </div>
    </Link>
  );
}