import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import WishlistButton from './WishlistButton';

const fmt = (n) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(n);

export default function ProductCard({ product }) {
  const price = fmt(product.price);
  const soldOut = product.stock === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={`/products/${product.slug}`}
        className="group block"
        aria-label={`${product.name}, ${price}${soldOut ? ', sold out' : ''}`}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-ink-card border border-ink-line group-hover:border-ink-soft transition-colors duration-300">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              decoding="async"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.04] ${
                soldOut
                  ? 'grayscale brightness-75'
                  : 'grayscale-[25%] contrast-105 brightness-95 group-hover:grayscale-0 group-hover:brightness-100'
              }`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-ink-line text-xs uppercase tracking-editorial">
              No image
            </div>
          )}

          <div
            className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink/50 to-transparent pointer-events-none"
            aria-hidden="true"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {soldOut && (
              <span className="px-2 py-1 text-[9px] uppercase tracking-editorial text-ink-white bg-ink/85 backdrop-blur-sm border border-ink-line">
                Sold Out
              </span>
            )}
            {!soldOut && product.is_popular && (
              <span className="px-2 py-1 text-[9px] uppercase tracking-editorial text-ink-white bg-ink/85 backdrop-blur-sm border border-ink-line">
                Popular
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <WishlistButton productId={product.id} size="sm" />
          </div>

          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <div className="bg-ink/90 backdrop-blur-sm border-t border-ink-line px-4 py-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-editorial text-ink-white">
                {soldOut ? 'View Details' : 'View Product'}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-ink-white" strokeWidth={1.5} aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="mt-4">
          {product.category?.name && (
            <p className="text-[9px] uppercase tracking-editorial text-ink-dim mb-1.5">
              {product.category.name}
            </p>
          )}
          <h3 className="text-[13px] uppercase tracking-nav text-ink-white leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p
            className={`mt-2 text-sm tabular-nums font-medium ${
              soldOut ? 'text-ink-muted line-through' : 'text-ink-white'
            }`}
          >
            {price}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}