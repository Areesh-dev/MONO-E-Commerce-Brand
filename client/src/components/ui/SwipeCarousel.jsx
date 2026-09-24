import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function SwipeCarousel({
  items = [],
  desktopGridClass = 'lg:grid lg:grid-cols-4 lg:gap-6',
  mobileItemClass = 'w-[75vw] sm:w-[45vw] md:w-[35vw] lg:w-auto',
  ariaLabel = 'Items',
  showHint = true,
}) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setCanPrev(el.scrollLeft > 4);
      setCanNext(max > 4 && el.scrollLeft < max - 4);
      setScrollProgress(max > 0 ? el.scrollLeft / max : 0);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items.length]);

  const scrollStep = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    // Scroll ~1 card width so a single tap moves a full card.
    const firstItem = el.querySelector('li');
    const step = firstItem ? firstItem.clientWidth + 16 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Track — horizontal snap scroller on mobile, grid on desktop */}
      <ul
        ref={trackRef}
        aria-label={ariaLabel}
        className={`flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-1 lg:overflow-visible lg:pb-0 lg:snap-none ${desktopGridClass}`}
      >
        {items.map((item, i) => (
          <li
            key={i}
            className={`flex-shrink-0 snap-start ${mobileItemClass}`}
          >
            {item}
          </li>
        ))}
      </ul>

      {/* Mobile/tablet controls */}
      <div className="lg:hidden mt-5 flex items-center justify-between gap-4">
        {showHint ? (
          <span className="text-[10px] uppercase tracking-editorial text-ink-muted">
            Swipe to explore
          </span>
        ) : (
          <span aria-hidden="true" />
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollStep(-1)}
            disabled={!canPrev}
            aria-label="Scroll left"
            className="w-9 h-9 border border-ink-line text-ink-white hover:border-ink-white disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:border-ink-line transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollStep(1)}
            disabled={!canNext}
            aria-label="Scroll right"
            className="w-9 h-9 border border-ink-line text-ink-white hover:border-ink-white disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:border-ink-line transition-colors flex items-center justify-center"
          >
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Progress line — mobile/tablet only */}
      <div className="lg:hidden mt-3 h-px bg-ink-line relative overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-y-0 left-0 bg-ink-white transition-all duration-300"
          style={{
            width: '35%',
            transform: `translateX(${scrollProgress * (100 / 0.35 - 100)}%)`,
          }}
        />
      </div>
    </div>
  );
}