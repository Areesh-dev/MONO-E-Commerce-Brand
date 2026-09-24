import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import ProductResultCard from './ProductResultCard';
import CartSummaryCard from './CartSummaryCard';

export default function ChatMessage({ message, isLatest, busy, onSend, onRetry }) {
  const reduceMotion = useReducedMotion();
  const { role, content, products, cart, quickReplies, isError } = message;
  const isUser = role === 'user';

  const enter = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.18 } };

  if (isUser) {
    return (
      <motion.div {...enter} className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-line break-words bg-ink-white px-3.5 py-2.5 text-sm leading-relaxed text-ink">
          {content}
        </p>
      </motion.div>
    );
  }

  const showChips = isLatest && !busy && quickReplies?.length > 0;

  return (
    <motion.div {...enter} className="flex flex-col gap-3">
      {content && (
        <div
          className={`max-w-[92%] border-l pl-3 text-sm leading-relaxed whitespace-pre-line break-words ${
            isError ? 'border-ink-muted text-ink-dim' : 'border-ink-white text-ink-text'
          }`}
        >
          {content}
          {isError && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={busy}
              className="mt-2 flex items-center gap-1.5 text-xs text-ink-white underline-offset-2 hover:underline disabled:opacity-40"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Try again
            </button>
          )}
        </div>
      )}

      {products?.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {products.map((p) => (
            <ProductResultCard
              key={p.id}
              product={p}
              disabled={busy}
              onAdd={(prod) => onSend(`Add ${prod.name} to my bag`)}
            />
          ))}
        </div>
      )}

      {cart && (
        <CartSummaryCard
          cart={cart}
          disabled={busy}
          onRemove={
            isLatest
              ? (item) =>
                  onSend(
                    `Remove ${item.product_name}${item.size_name ? ` (size ${item.size_name})` : ''} from my bag`,
                  )
              : undefined
          }
        />
      )}

      {showChips && (
        <div role="group" aria-label="Pick a size" className="flex flex-wrap gap-1.5">
          {quickReplies.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => onSend(q.message)}
              className="h-8 min-w-[2.5rem] border border-ink-line px-3 text-xs text-ink-white transition-colors hover:border-ink-white hover:bg-ink-white hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink-white"
            >
              {q.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}