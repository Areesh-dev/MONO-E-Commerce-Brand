import Skeleton from '../ui/Skeleton';

export default function DashboardCardSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-ink-line bg-ink-card p-5 space-y-4">
          <div className="flex items-start justify-between">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="w-4 h-4" />
          </div>
          <Skeleton className="h-6 w-2/3" />
        </div>
      ))}
    </div>
  );
}