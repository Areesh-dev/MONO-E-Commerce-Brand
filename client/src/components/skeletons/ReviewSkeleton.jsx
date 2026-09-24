import Skeleton from '../ui/Skeleton';
import SkeletonText from '../ui/SkeletonText';

export default function ReviewSkeleton() {
  return (
    <div className="border border-ink-line bg-ink-card p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-2.5 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}