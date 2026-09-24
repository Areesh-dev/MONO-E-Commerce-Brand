import { useEffect, useState } from 'react';
import Skeleton from '../ui/Skeleton';
import { fetchAllSizes } from '../../lib/sizes';

export default function ProductSizesField({ value = [], onChange }) {
  const [sizes, setSizes] = useState(null);

  useEffect(() => {
    fetchAllSizes().then(setSizes).catch(() => setSizes([]));
  }, []);

  if (sizes === null) {
    return (
      <div>
        <label className="block mb-2 text-[10px] uppercase tracking-nav text-ink-dim">Available Sizes</label>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
        </div>
      </div>
    );
  }

  if (sizes.length === 0) {
    return (
      <div className="border border-ink-line bg-ink-surface p-4 text-xs text-ink-dim">
        No sizes configured. Create sizes in <span className="text-ink-white">Admin → Sizes</span> first.
      </div>
    );
  }

  const map = new Map(value.map((v) => [v.size_id, v]));

  const toggle = (sizeId) => {
    if (map.has(sizeId)) {
      onChange(value.filter((v) => v.size_id !== sizeId));
    } else {
      onChange([...value, { size_id: sizeId, stock: 0 }]);
    }
  };

  const setStock = (sizeId, stock) => {
    onChange(value.map((v) => (v.size_id === sizeId ? { ...v, stock: Math.max(0, parseInt(stock, 10) || 0) } : v)));
  };

  return (
    <div>
      <label className="block mb-2 text-[10px] uppercase tracking-nav text-ink-dim">
        Available Sizes & Stock
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sizes.map((s) => {
          const selected = map.has(s.id);
          const row = map.get(s.id);
          return (
            <div
              key={s.id}
              className={`flex items-center gap-3 px-3 py-2 border transition-colors ${
                selected ? 'border-ink-white bg-ink-surface' : 'border-ink-line bg-ink-surface'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(s.id)}
                className={`w-5 h-5 flex-shrink-0 flex items-center justify-center border ${
                  selected ? 'border-ink-white bg-ink-white text-ink' : 'border-ink-line'
                }`}
                aria-pressed={selected}
                aria-label={`Toggle size ${s.name}`}
              >
                {selected && (
                  <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 8l3 3 7-7" />
                  </svg>
                )}
              </button>

              <span className="text-xs uppercase tracking-nav text-ink-white flex-1">{s.name}</span>

              {selected && (
                <input
                  type="number"
                  min={0}
                  value={row.stock}
                  onChange={(e) => setStock(s.id, e.target.value)}
                  placeholder="Stock"
                  className="w-20 h-8 px-2 bg-ink border border-ink-line text-ink-white text-xs tabular-nums focus:border-ink-text focus:outline-none"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}