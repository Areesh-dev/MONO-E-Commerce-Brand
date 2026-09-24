import { Star } from 'lucide-react';

export default function StarRating({
  value = 0,
  size = 14,
  interactive = false,
  onChange,
  className = '',
  fill = 'white',
}) {
  const items = [1, 2, 3, 4, 5];

  const filledClass = fill === 'white'
    ? 'text-ink-white fill-ink-white'
    : 'text-ink-text fill-ink-text';

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? 'Rating' : `Rating: ${value} out of 5`}
    >
      {items.map((i) => {
        const filled = i <= Math.round(value);
        const star = (
          <Star
            style={{ width: size, height: size }}
            className={filled ? filledClass : 'text-ink-line'}
            strokeWidth={1.4}
            aria-hidden="true"
          />
        );

        if (!interactive) return <span key={i}>{star}</span>;

        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i === 1 ? '' : 's'}`}
            onClick={() => onChange?.(i)}
            className="p-0.5 transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-white"
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}