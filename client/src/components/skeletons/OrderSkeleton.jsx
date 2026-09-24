import Skeleton from '../ui/Skeleton';

export default function OrderSkeleton() {
  return (
    <div className="border border-ink-line bg-ink-card p-6" aria-hidden="true">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-32" />
        </div>
        <div className="space-y-3 text-right">
          <Skeleton className="h-4 w-20 ml-auto" />
          <Skeleton className="h-4 w-4 ml-auto" />
        </div>
      </div>
    </div>
  );
}