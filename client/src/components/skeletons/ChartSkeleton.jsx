import Skeleton from '../ui/Skeleton';

export default function ChartSkeleton({ className = 'h-72' }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <Skeleton className="w-full h-full" />
      <div className="absolute inset-6 flex items-end gap-3">
        {[40, 65, 30, 80, 55, 70, 45, 60].map((h, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}