import { useEffect, useState } from 'react';
import Container from '../ui/Container';
import Skeleton from '../ui/Skeleton';
import { fetchContentSections } from '../../lib/api';

function SectionBlock({ item, index }) {
  const imageRight = item.image_position === 'right';
  const number = String(index + 1).padStart(2, '0');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-center">
      <div className={`order-1 ${imageRight ? 'lg:order-1' : 'lg:order-2'}`}>
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <span className="text-[10px] uppercase tracking-editorial text-ink-muted tabular-nums">
            {number}
          </span>
          <span className="block w-6 h-px bg-ink-line" aria-hidden="true" />
          {item.eyebrow && (
            <span className="text-[10px] uppercase tracking-editorial text-ink-dim">
              {item.eyebrow}
            </span>
          )}
        </div>

        <h2 className="heading-editorial text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] text-ink-white leading-[0.95] whitespace-pre-line max-w-xl">
          {item.title}
        </h2>

        {item.content && (
          <p className="mt-6 sm:mt-8 text-sm sm:text-base text-ink-dim leading-relaxed max-w-lg">
            {item.content}
          </p>
        )}
      </div>

      <div className={`order-2 ${imageRight ? 'lg:order-2' : 'lg:order-1'}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-ink-card border border-ink-line">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover grayscale-[20%] transition-all duration-[900ms] ease-out hover:grayscale-0 hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-ink-line text-xs uppercase tracking-editorial">
              No image
            </div>
          )}

          <span
            aria-hidden="true"
            className="absolute top-3 left-3 w-6 h-6 border-t border-l border-ink-white/30"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-ink-white/30"
          />
        </div>
      </div>
    </div>
  );
}

function MissionVisionSkeleton() {
  return (
    <section className="border-t border-ink-line">
      <div className="py-16 sm:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-center">
            <div className="space-y-5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-3/4" />
              <Skeleton className="h-20 w-full mt-6" />
            </div>
            <Skeleton className="aspect-[4/5]" />
          </div>
        </Container>
      </div>
    </section>
  );
}

export default function MissionVision() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });

  useEffect(() => {
    let active = true;
    fetchContentSections()
      .then((data) => active && setState({ loading: false, error: null, data }))
      .catch(() => active && setState({ loading: false, error: null, data: [] }));
    return () => { active = false; };
  }, []);

  if (state.loading) return <MissionVisionSkeleton />;
  if (state.data.length === 0) return null;

  return (
    <section className="border-t border-ink-line">
      {state.data.map((item, i) => (
        <div
          key={item.id}
          className={i > 0 ? 'border-t border-ink-line' : ''}
        >
          <div className="py-16 sm:py-24">
            <Container>
              <SectionBlock item={item} index={i} />
            </Container>
          </div>
        </div>
      ))}
    </section>
  );
}