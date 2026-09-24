import ReviewSkeleton from './ReviewSkeleton';

export default function ReviewGridSkeleton({ count = 3 }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => <ReviewSkeleton key={i} />)}
    </div>
  );
}