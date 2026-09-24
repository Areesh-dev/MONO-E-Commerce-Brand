import { Link } from 'react-router-dom';
import Skeleton from '../../ui/Skeleton';

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

export default function TopProductsTable({ products, loading }) {
  if (loading) {
    return (
      <div className="border border-ink-line bg-ink-card p-6">
        <Skeleton className="h-3 w-32 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-ink-line bg-ink-card">
      <div className="p-6 pb-4">
        <h3 className="text-[11px] uppercase tracking-editorial text-ink-white">
          Top Products
        </h3>
      </div>

      {products.length === 0 ? (
        <p className="px-6 pb-6 text-xs uppercase tracking-editorial text-ink-muted">
          No sales data yet
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-y border-ink-line">
                <th className="px-6 py-3 text-[10px] uppercase tracking-editorial text-ink-dim">Product</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-editorial text-ink-dim text-right w-24">Units</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-editorial text-ink-dim text-right w-40">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.product_id || p.product_name} className="border-b border-ink-line last:border-b-0 hover:bg-ink-surface">
                  <td className="px-6 py-3 text-xs text-ink-white">
                    {p.product_id ? (
                      <Link to={`/admin/products`} className="hover:underline">{p.product_name}</Link>
                    ) : (
                      <span className="text-ink-dim">{p.product_name} <span className="text-ink-muted">(deleted)</span></span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-xs text-ink-text tabular-nums text-right">{p.units}</td>
                  <td className="px-6 py-3 text-xs text-ink-white tabular-nums text-right">{fmtCurrency(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}