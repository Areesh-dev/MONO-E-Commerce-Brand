import Skeleton from '../ui/Skeleton';

export default function CouponSkeleton() {
  return (
    <div className="mt-6 pt-6 border-t border-ink-line space-y-2">
      <Skeleton className="h-2.5 w-24" />
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}