import Skeleton from '../ui/Skeleton';
import TableRowSkeleton from './TableRowSkeleton';

export default function TableSkeleton({ rows = 6, columns = 5 }) {
  return (
    <div className="border border-ink-line bg-ink-card" aria-hidden="true">
      <div className="grid gap-4 px-4 py-3 border-b border-ink-line"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => <Skeleton key={i} className="h-3 w-2/3" />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => <TableRowSkeleton key={i} columns={columns} />)}
    </div>
  );
}