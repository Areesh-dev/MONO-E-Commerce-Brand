import Container from '../ui/Container';
import Skeleton from '../ui/Skeleton';

export default function HeroSkeleton() {
  return (
    <section className="bg-ink" aria-hidden="true">
      <Container className="py-10">
        <Skeleton className="h-[80vh] min-h-[560px] w-full" />
      </Container>
    </section>
  );
}