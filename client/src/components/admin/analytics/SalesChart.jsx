import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import Skeleton from '../../ui/Skeleton';

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(new Date(iso));

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-ink border border-ink-line px-3 py-2">
      <p className="text-[10px] uppercase tracking-editorial text-ink-dim mb-1">
        {new Date(label).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
      </p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs text-ink-white tabular-nums">
          {p.name === 'revenue' ? fmtCurrency(p.value) : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
}

export default function SalesChart({ series, loading }) {
  if (loading) {
    return (
      <div className="border border-ink-line bg-ink-card p-6">
        <Skeleton className="h-3 w-40 mb-6" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const hasData = (series || []).some((d) => d.revenue > 0 || d.orders > 0);

  return (
    <div className="border border-ink-line bg-ink-card p-6">
      <div className="flex items-baseline justify-between gap-3 mb-6">
        <h3 className="text-[11px] uppercase tracking-editorial text-ink-white">
          Revenue & Orders
        </h3>
        <span className="text-[10px] uppercase tracking-editorial text-ink-muted">
          Daily
        </span>
      </div>

      {!hasData ? (
        <div className="h-72 flex items-center justify-center text-xs uppercase tracking-editorial text-ink-muted">
          No sales data yet
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5F5F5" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#F5F5F5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2E2C2C" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDate}
                stroke="#5F5F5E"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                stroke="#5F5F5E"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={40}
              />
              <Tooltip content={<TooltipContent />} cursor={{ stroke: '#2E2C2C' }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#F5F5F5"
                strokeWidth={1.5}
                fill="url(#revFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}