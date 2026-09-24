const OPTIONS = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1Y' },
];

export default function RangePicker({ value, onChange }) {
  return (
    <div className="inline-flex border border-ink-line" role="group" aria-label="Date range">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`h-9 px-4 text-[10px] uppercase tracking-editorial border-r border-ink-line last:border-r-0 transition-colors ${
            value === o.value
              ? 'bg-ink-white text-ink'
              : 'text-ink-dim hover:text-ink-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}