import Skeleton from '../ui/Skeleton';

export default function BrandSkeleton({ count = 6 }) {
  return (
    <section className="py-12 border-y border-ink-line bg-ink-card" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mb-8">
        <Skeleton className="h-3 w-40 mx-auto" />
      </div>
      <div className="flex justify-center gap-20 px-5">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 flex-shrink-0" />
        ))}
      </div>
    </section>
  );
}