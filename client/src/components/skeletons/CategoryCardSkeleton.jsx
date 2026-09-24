import Skeleton from '../ui/Skeleton';

export default function CategoryCardSkeleton() {
  return (
    <div className="relative aspect-[3/4] bg-ink-card border border-ink-line">
      <Skeleton className="absolute inset-0" />
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-px w-8" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}