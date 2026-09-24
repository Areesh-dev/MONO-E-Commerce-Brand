import Skeleton from './Skeleton';

export default function SkeletonText({ lines = 3, className = '', lastLineWidth = 'w-3/4' }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? lastLineWidth : 'w-full'}`} />
      ))}
    </div>
  );
}