import Skeleton from '../ui/Skeleton';

export default function OrderTimelineSkeleton({ steps = 5 }) {
  return (
    <div className="relative">
      {Array.from({ length: steps }).map((_, i) => (
        <div key={i} className="flex gap-4 pb-6 last:pb-0">
          <div className="flex flex-col items-center flex-shrink-0">
            <Skeleton className="w-3 h-3" rounded />
            {i < steps - 1 && (
              <span className="w-px flex-1 bg-ink-line mt-1" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1 pb-2 space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}