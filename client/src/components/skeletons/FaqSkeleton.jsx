import Skeleton from '../ui/Skeleton';

export default function FaqSkeleton({ count = 5 }) {
  return (
    <div className="divide-y divide-ink-line border-y border-ink-line" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-6 flex items-center justify-between gap-6">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-4 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}