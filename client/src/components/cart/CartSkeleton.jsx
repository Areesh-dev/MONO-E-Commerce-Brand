import Skeleton from '../ui/Skeleton';

export default function CartSkeleton({ rows = 3 }) {
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-10">
      <div className="space-y-6">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-5 border-b border-ink-line pb-6">
            <Skeleton className="w-24 h-32 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <div className="flex items-center gap-3 pt-4">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border border-ink-line bg-ink-card p-6 space-y-4 h-fit">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-11 w-full mt-4" />
      </div>
    </div>
  );
}