import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Select from '../ui/Select';
import { useCart } from '../../context/CartContext';
import { fetchProductSizes } from '../../lib/sizes';

const fmt = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

export default function CartLine({ item }) {
  const { updateQty, updateSize, remove } = useCart();
  const [busy, setBusy] = useState(false);
  const [availableSizes, setAvailableSizes] = useState([]);
  const { product, quantity, size_id, size } = item;

  const line = Number(product?.price || 0) * quantity;
  const overStock = quantity > item.effectiveStock;
  const unavailable = product?.status !== 'active';

  useEffect(() => {
    if (!product?.id) return;
    let active = true;
    fetchProductSizes(product.id)
      .then((s) => active && setAvailableSizes(s))
      .catch(() => active && setAvailableSizes([]));
    return () => { active = false; };
  }, [product?.id]);

  const run = async (fn) => {
    setBusy(true);
    try { await fn(); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const handleSizeChange = (e) => {
    const newSizeId = e.target.value;
    if (newSizeId === size_id) return;
    run(() => updateSize(item.id, newSizeId));
  };

  const sizeOptions = availableSizes.map((s) => ({
    value: s.size.id,
    label: s.stock > 0 ? `${s.size.name}` : `${s.size.name} — Out of stock`,
  }));

  return (
    <div className={`flex gap-5 border-b border-ink-line pb-6 ${unavailable ? 'opacity-50' : ''}`}>
      <Link
        to={`/products/${product?.slug}`}
        className="w-24 h-32 flex-shrink-0 bg-ink-card border border-ink-line overflow-hidden"
      >
        {product?.image_url && (
          <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link
              to={`/products/${product?.slug}`}
              className="text-xs uppercase tracking-nav text-ink-white hover:underline"
            >
              {product?.name}
            </Link>
            <p className="mt-1 text-[10px] uppercase tracking-editorial text-ink-dim">
              {fmt(product?.price)} each
            </p>

            {size && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-editorial text-ink-dim">Size</span>
                {availableSizes.length > 1 ? (
                  <Select
                    value={size_id || ''}
                    onChange={handleSizeChange}
                    disabled={busy}
                    options={sizeOptions}
                    className="h-8 text-xs min-w-[110px]"
                  />
                ) : (
                  <span className="text-xs uppercase tracking-nav text-ink-white">{size.name}</span>
                )}
              </div>
            )}

            {unavailable && (
              <p className="mt-2 text-[10px] uppercase tracking-editorial text-ink-soft">Unavailable</p>
            )}
            {!unavailable && overStock && (
              <p className="mt-2 text-[10px] uppercase tracking-editorial text-ink-soft">
                Only {item.effectiveStock} left
              </p>
            )}
          </div>

          <button
            onClick={() => run(() => remove(item.id))}
            disabled={busy}
            aria-label={`Remove ${product?.name}`}
            className="text-ink-dim hover:text-ink-white disabled:opacity-50 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="inline-flex items-center border border-ink-line">
            <button
              onClick={() => run(() => updateQty(item.id, quantity - 1))}
              disabled={busy || quantity <= 1}
              aria-label="Decrease quantity"
              className="w-9 h-9 flex items-center justify-center text-ink-text hover:text-ink-white disabled:opacity-30"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-xs text-ink-white tabular-nums">{quantity}</span>
            <button
              onClick={() => run(() => updateQty(item.id, quantity + 1))}
              disabled={busy || quantity >= item.effectiveStock}
              aria-label="Increase quantity"
              className="w-9 h-9 flex items-center justify-center text-ink-text hover:text-ink-white disabled:opacity-30"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-sm text-ink-white font-medium tabular-nums">{fmt(line)}</span>
        </div>
      </div>
    </div>
  );
}