import Skeleton from '../ui/Skeleton';

export default function FormSkeleton({ fields = 4 }) {
  return (
    <div className="space-y-5" aria-hidden="true">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-11 w-full" />
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-4 border-t border-ink-line">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}