import Container from '../ui/Container';
import Skeleton from '../ui/Skeleton';

export default function ProfileSkeleton() {
  return (
    <Container className="py-16" aria-hidden="true">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-12 w-64 mb-12" />
      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-6">
          <div className="border border-ink-line bg-ink-card p-6 space-y-4">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="border border-ink-line bg-ink-card p-6 space-y-4">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="border border-ink-line bg-ink-card p-6 space-y-4">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </div>
    </Container>
  );
}