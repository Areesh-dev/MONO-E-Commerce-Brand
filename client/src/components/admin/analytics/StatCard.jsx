import Skeleton from '../../ui/Skeleton';

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

export default function StatCard({ label, value, hint, icon: Icon, loading, format = 'number' }) {
  if (loading) {
    return (
      <div className="border border-ink-line bg-ink-card p-5">
        <div className="flex items-start justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="w-4 h-4" />
        </div>
        <Skeleton className="h-7 w-2/3 mt-4" />
        <Skeleton className="h-2.5 w-16 mt-3" />
      </div>
    );
  }

  const display = format === 'currency' ? fmtCurrency(value) : value;

  return (
    <div className="border border-ink-line bg-ink-card p-5">
      <div className="flex items-start justify-between">
        <span className="text-[10px] uppercase tracking-editorial text-ink-dim">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-ink-soft" strokeWidth={1.5} aria-hidden="true" />}
      </div>
      <p className="mt-4 text-2xl text-ink-white tabular-nums">{display}</p>
      {hint && (
        <p className="mt-1 text-[10px] uppercase tracking-editorial text-ink-muted">{hint}</p>
      )}
    </div>
  );
}