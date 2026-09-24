import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function CategoryCard({ category, index }) {
  const number = String((index ?? 0) + 1).padStart(2, '0');

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group relative block aspect-[3/4] overflow-hidden bg-ink-card border border-ink-line hover:border-ink-soft transition-colors duration-300"
    >
      {category.image_url ? (
        <img
          src={category.image_url}
          alt={category.name}
          loading="lazy"
          decoding="async"
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="absolute inset-0 w-full h-full object-cover grayscale-[35%] contrast-105 brightness-90 transition-all duration-[900ms] ease-out group-hover:scale-[1.04] group-hover:grayscale-0 group-hover:brightness-100"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-ink-line text-xs uppercase tracking-editorial">
          No image
        </div>
      )}

      <div
        className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink/95"
        aria-hidden="true"
      />

      <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
        <span className="text-[10px] uppercase tracking-editorial text-ink-white/70">
          {number}
        </span>
      </div>

      <div className="absolute top-4 right-4 sm:top-5 sm:right-5 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 ease-out">
        <ArrowUpRight className="w-4 h-4 text-ink-white" strokeWidth={1.5} aria-hidden="true" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
        <h3 className="heading-editorial text-xl sm:text-2xl text-ink-white leading-tight">
          {category.name}
        </h3>
        <div className="mt-3 h-px w-8 bg-ink-white/40 transition-all duration-500 ease-out group-hover:w-16" />
        <p className="mt-3 text-[10px] uppercase tracking-editorial text-ink-white/60">
          Shop Collection
        </p>
      </div>
    </Link>
  );
}