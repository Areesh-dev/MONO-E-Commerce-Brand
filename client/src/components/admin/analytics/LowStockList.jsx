import { Link } from 'react-router-dom';
import Skeleton from '../../ui/Skeleton';

export default function LowStockList({ items, threshold, loading }) {
  if (loading) {
    return (
      <div className="border border-ink-line bg-ink-card p-6">
        <Skeleton className="h-3 w-32 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-ink-line bg-ink-card">
      <div className="p-6 pb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-[11px] uppercase tracking-editorial text-ink-white">
          Low Stock
        </h3>
        <span className="text-[10px] uppercase tracking-editorial text-ink-muted">
          Below {threshold}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="px-6 pb-6 text-xs uppercase tracking-editorial text-ink-muted">
          All products are stocked
        </p>
      ) : (
        <ul className="border-t border-ink-line divide-y divide-ink-line list-none">
          {items.map((it) => (
            <li key={it.key} className="flex items-center gap-3 px-6 py-3">
              <div className="w-8 h-10 flex-shrink-0 bg-ink-surface border border-ink-line overflow-hidden">
                {it.image_url && (
                  <img src={it.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-white truncate">
                  {it.product_name}
                  {it.size_name && <span className="text-ink-dim ml-1.5">· {it.size_name}</span>}
                </p>
                {it.category && (
                  <p className="text-[10px] uppercase tracking-editorial text-ink-muted mt-0.5">
                    {it.category}
                  </p>
                )}
              </div>
              <span className="text-xs text-ink-white tabular-nums flex-shrink-0">
                {it.stock}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}