import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../ui/Button';
import { useWishlist } from '../../context/WishlistContext';

const fmt = (n) =>
  `Rs ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0)}`;

export default function WishlistCard({ item }) {
  const { remove } = useWishlist();
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);
  const product = item.product;

  if (!product) return null;

  const soldOut = Number(product.stock) <= 0 || product.status !== 'active';

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      await remove(product.id);
      toast.success('Removed from wishlist');
    } catch (e) {
      toast.error(e.message || 'Could not remove');
      setRemoving(false); 
    }
  };

  const handleAddToCart = () => {
    if (soldOut) {
      toast.error('This product is out of stock');
      return;
    }
    navigate(`/products/${product.slug}`);
  };

  return (
    <article
      className={`grid grid-cols-[112px_1fr] gap-5 border border-ink-line bg-ink-card p-4 transition-opacity ${
        removing ? 'opacity-50' : ''
      }`}
      aria-busy={removing}
    >
      <Link
        to={`/products/${product.slug}`}
        className="aspect-[3/4] bg-ink-surface overflow-hidden border border-ink-line"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover ${soldOut ? 'grayscale brightness-75' : ''}`}
          />
        ) : null}
      </Link>

      <div className="flex flex-col justify-between py-1 min-w-0">
        <div className="min-w-0">
          {product.category?.name && (
            <p className="text-[9px] uppercase tracking-editorial text-ink-dim mb-1">
              {product.category.name}
            </p>
          )}
          <Link
            to={`/products/${product.slug}`}
            className="block text-sm uppercase tracking-nav text-ink-white hover:underline line-clamp-2"
          >
            {product.name}
          </Link>

          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <span className={`text-sm tabular-nums ${soldOut ? 'text-ink-muted line-through' : 'text-ink-white'}`}>
              {fmt(product.price)}
            </span>
            {soldOut && (
              <span className="text-[9px] uppercase tracking-editorial text-ink-soft border border-ink-line px-1.5 py-0.5">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddToCart}
            disabled={soldOut || removing}
            className="flex-1 sm:flex-none"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> {soldOut ? 'Unavailable' : 'View & Add'}
          </Button>

          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            aria-label={`Remove ${product.name} from wishlist`}
            className="w-8 h-8 flex items-center justify-center border border-ink-line text-ink-dim hover:text-ink-white hover:border-ink-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            {removing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}