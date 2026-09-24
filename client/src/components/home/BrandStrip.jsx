import { useEffect, useState } from 'react';
import { BrandSkeleton } from '../skeletons';
import { fetchBrands } from '../../lib/api';

export default function BrandStrip() {
  const [brands, setBrands] = useState(null);

  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  if (brands === null) return <BrandSkeleton />;
  if (brands.length === 0) return null;

  const track = [...brands, ...brands];

  return (
    <section aria-label="Featured brands" className="py-12 border-y border-ink-line bg-ink-card overflow-hidden">
      <div className="relative">
        <div className="flex gap-10 sm:gap-20 animate-marquee w-max motion-reduce:animate-none">
          {track.map((b, i) => (
            <div
              key={`${b.id}-${i}`}
              aria-hidden={i >= brands.length ? 'true' : undefined}
              className="flex-shrink-0 flex items-center justify-center h-12 opacity-60 hover:opacity-100 transition-opacity"
            >
              {b.logo_url ? (
                <img src={b.logo_url} alt={b.name} loading="lazy" className="h-16 sm:h-20 w-auto object-contain grayscale" />
              ) : (
                <span className="heading-editorial text-xl tracking-editorial text-ink-text whitespace-nowrap">
                  {b.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}