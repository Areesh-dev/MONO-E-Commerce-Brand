import Skeleton from '../ui/Skeleton';
import SkeletonText from '../ui/SkeletonText';

export default function PageSectionSkeleton({ headingWidth = 'w-64', bodyLines = 3, showGrid = false, gridColumns = 3 }) {
  return (
    <section className="py-20 border-t border-ink-line" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className={`h-10 ${headingWidth} mb-10`} />
        {bodyLines > 0 && <SkeletonText lines={bodyLines} className="mb-10 max-w-2xl" />}
        {showGrid && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: gridColumns }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}