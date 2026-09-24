import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export const formatPKR = (n) =>
  `Rs ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0)}`;

export default function ProductResultCard({ product, onAdd, disabled }) {
  const soldOut = Number(product.stock) === 0;
  const lowStock = !soldOut && Number(product.stock) > 0 && Number(product.stock) <= 3;
  const href = `/products/${product.slug}`;

  return (
    <article className="group flex flex-col border border-ink-line bg-ink-surface transition-colors hover:border-ink-soft">
      <Link
        to={href}
        className="relative block aspect-[3/4] overflow-hidden bg-ink-card focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink-white"
        tabIndex={-1}
        aria-hidden="true"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.04] ${
              soldOut ? 'opacity-40 grayscale' : ''
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-ink-muted">
            No image
          </div>
        )}
        {soldOut && (
          <span className="absolute left-2 top-2 bg-ink px-1.5 py-0.5 text-[10px] text-ink-white">
            Sold out
          </span>
        )}
        {lowStock && (
          <span className="absolute left-2 top-2 bg-ink-white px-1.5 py-0.5 text-[10px] text-ink">
            {product.stock} left
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <Link
          to={href}
          className="line-clamp-2 text-xs leading-snug text-ink-white hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {product.name}
        </Link>
        {product.category && <p className="text-[10px] text-ink-dim">{product.category}</p>}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <span className="text-xs tabular-nums text-ink-white">{formatPKR(product.price)}</span>
          <button
            type="button"
            onClick={() => onAdd?.(product)}
            disabled={soldOut || disabled}
            aria-label={`Add ${product.name} to bag`}
            className="flex h-7 w-7 items-center justify-center border border-ink-line text-ink-text transition-colors hover:border-ink-white hover:bg-ink-white hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink-white disabled:pointer-events-none disabled:opacity-30"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}