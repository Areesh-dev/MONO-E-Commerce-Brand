const MAP = {
  pending:    'border-ink-line text-ink-text',
  confirmed:  'border-ink-soft text-ink-white',
  processing: 'border-ink-soft text-ink-white',
  shipped:    'border-ink-white text-ink-white',
  delivered:  'border-ink-white text-ink-white',
  cancelled:  'border-ink-line text-ink-muted line-through',
};

export default function OrderStatusBadge({ status }) {
  return (
    <span className={`inline-block px-2 py-1 text-[9px] uppercase tracking-editorial border bg-ink-card ${MAP[status] || MAP.pending}`}>
      {status}
    </span>
  );
}