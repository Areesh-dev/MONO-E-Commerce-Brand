import { Link } from 'react-router-dom';
import { formatPKR } from './ProductResultCard';

const VISIBLE_LINES = 4;

export default function CartSummaryCard({ cart, onRemove, disabled }) {
  const items = cart?.items || [];
  const hidden = Math.max(0, items.length - VISIBLE_LINES);

  if (items.length === 0) {
    return (
      <div className="border border-ink-line bg-ink-surface px-3 py-3 text-xs text-ink-dim">
        Your bag is empty.
      </div>
    );
  }

  return (
    <section aria-label="Your bag" className="border border-ink-line bg-ink-surface">
      <header className="flex items-baseline justify-between border-b border-ink-line px-3 py-2">
        <span className="text-xs text-ink-white">Your bag</span>
        <span className="text-[10px] tabular-nums text-ink-dim">
          {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'}
        </span>
      </header>

      <ul className="divide-y divide-ink-line">
        {items.slice(0, VISIBLE_LINES).map((item) => (
          <li key={item.cart_item_id} className="flex items-center gap-3 px-3 py-2.5">
            <div className="h-12 w-10 flex-shrink-0 overflow-hidden bg-ink-card">
              {item.image_url && (
                <img src={item.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-ink-white">{item.product_name}</p>
              <p className="mt-0.5 text-[10px] text-ink-dim">
                {item.size_name ? `Size ${item.size_name}, ` : ''}qty {item.quantity}
                {!item.available && <span className="text-ink-muted"> (unavailable)</span>}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-xs tabular-nums text-ink-white">{formatPKR(item.subtotal)}</span>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  disabled={disabled}
                  className="text-[10px] text-ink-dim underline-offset-2 hover:text-ink-white hover:underline disabled:opacity-40"
                >
                  Remove
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {hidden > 0 && (
        <p className="border-t border-ink-line px-3 py-2 text-[10px] text-ink-dim">
          And {hidden} more in your bag
        </p>
      )}

      <div className="flex items-baseline justify-between border-t border-ink-line px-3 py-2.5">
        <span className="text-xs text-ink-dim">Subtotal</span>
        <span className="text-sm tabular-nums text-ink-white">{formatPKR(cart.total)}</span>
      </div>

      <Link
        to="/cart"
        className="block bg-ink-white py-2.5 text-center text-xs text-ink transition-colors hover:bg-ink-text focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink-white"
      >
        View bag and check out
      </Link>
    </section>
  );
}