import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Skeleton from '../../ui/Skeleton';

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="bg-ink border border-ink-line px-3 py-2">
      <p className="text-[10px] uppercase tracking-editorial text-ink-dim mb-1">{label}</p>
      <p className="text-xs text-ink-white tabular-nums">{fmtCurrency(value)}</p>
    </div>
  );
}

export default function CategoryPerformance({ categories, loading }) {
  if (loading) {
    return (
      <div className="border border-ink-line bg-ink-card p-6">
        <Skeleton className="h-3 w-40 mb-6" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const hasData = (categories || []).length > 0;

  return (
    <div className="border border-ink-line bg-ink-card p-6">
      <h3 className="text-[11px] uppercase tracking-editorial text-ink-white mb-6">
        Sales by Category
      </h3>

      {!hasData ? (
        <div className="h-72 flex items-center justify-center text-xs uppercase tracking-editorial text-ink-muted">
          No category sales yet
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={categories} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#2E2C2C" strokeDasharray="2 4" horizontal={false} />
              <XAxis type="number" stroke="#5F5F5E" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#7F7B7A"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip content={<TooltipContent />} cursor={{ fill: '#131313' }} />
              <Bar dataKey="revenue" fill="#F5F5F5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}