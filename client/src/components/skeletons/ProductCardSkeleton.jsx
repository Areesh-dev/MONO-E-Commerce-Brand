import Skeleton from '../ui/Skeleton';

export default function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="mt-4 flex justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2.5 w-1/3" />
        </div>
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}