export default function SizeSelector({ sizes, value, onChange }) {
  if (!sizes || sizes.length === 0) return null;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <label className="text-[10px] uppercase tracking-nav text-ink-dim">Size</label>
        {value && (
          <span className="text-[10px] uppercase tracking-editorial text-ink-text">
            Selected: {sizes.find((s) => s.size?.id === value)?.size?.name || '???'}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map((row, i) => {
          const size = row.size || {};
          const stock = Number(row.stock ?? 0);
          const sizeId = size.id;
          const selected = value === sizeId;
          const out = stock <= 0;

          return (
            <button
              key={sizeId || `row-${i}`}
              type="button"
              onClick={() => {
                console.log('[Size click]', {
                  row,
                  sizeId,
                  stock,
                  out,
                  onChangeIsFunction: typeof onChange === 'function',
                });
                if (out) return;
                if (!sizeId) {
                  console.error('size.id is missing — check fetchProductSizes select');
                  return;
                }
                onChange?.(sizeId);
              }}
              disabled={out}
              aria-pressed={selected}
              className={`min-w-[52px] h-11 px-4 text-xs uppercase tracking-nav border transition-colors ${
                out
                  ? 'border-ink-line text-ink-muted cursor-not-allowed line-through'
                  : selected
                  ? 'border-ink-white bg-ink-white text-ink'
                  : 'border-ink-line text-ink-white hover:border-ink-soft'
              }`}
            >
              {size.name || '—'}
            </button>
          );
        })}
      </div>
    </div>
  );
}