import Skeleton from '../ui/Skeleton';

export default function TableRowSkeleton({ columns = 5 }) {
  return (
    <div className="grid gap-4 px-4 py-3 border-b border-ink-line last:border-b-0"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-3/4" />
      ))}
    </div>
  );
}