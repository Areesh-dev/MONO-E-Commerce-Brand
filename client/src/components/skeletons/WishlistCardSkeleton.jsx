import Skeleton from '../ui/Skeleton';

export default function WishlistCardSkeleton() {
  return (
    <div className="grid grid-cols-[112px_1fr] gap-5 border border-ink-line bg-ink-card p-4">
      <Skeleton className="aspect-[3/4]" />
      <div className="flex flex-col justify-between py-1">
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-20 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}