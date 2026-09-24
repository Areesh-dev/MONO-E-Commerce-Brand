export default function Badge({ children, className = '' }) {
  return (
    <span
      className={`inline-block px-2 py-1 text-[9px] uppercase tracking-editorial text-ink-white bg-ink-card border border-ink-line ${className}`}
    >
      {children}
    </span>
  );
}