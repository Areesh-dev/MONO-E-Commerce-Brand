import { CheckCircle2 } from 'lucide-react';
import StarRating from './StarRating';

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(new Date(iso));

const initials = (name = '?') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function ReviewCard({ review, index }) {
  const name = review.reviewer_name || 'Verified Customer';
  const number = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null;

  return (
    <article className="group relative flex flex-col h-full bg-ink-card border border-ink-line hover:border-ink-soft transition-colors duration-500 overflow-hidden">
      
      <span
        aria-hidden="true"
        className="absolute -top-4 right-4 sm:right-6 heading-editorial text-[80px] sm:text-[100px] leading-none text-ink-line/60 group-hover:text-ink-line transition-colors duration-500 pointer-events-none select-none"
      >
        &rdquo;
      </span>

      <div className="relative flex items-center justify-between gap-3 px-6 sm:px-7 pt-6 sm:pt-7">
        <StarRating value={review.rating} size={15} />
        {number && (
          <span className="text-[10px] uppercase tracking-editorial text-ink-muted tabular-nums">
            {number}
          </span>
        )}
      </div>

      <blockquote className="relative flex-1 px-6 sm:px-7 py-6 sm:py-7">
        <p className="text-[15px] sm:text-base text-ink-white leading-[1.65] whitespace-pre-line">
          {review.review_text}
        </p>
      </blockquote>

      <footer className="px-6 sm:px-7 pb-6 sm:pb-7 pt-5 border-t border-ink-line">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-ink border border-ink-line text-[10px] tracking-editorial text-ink-white group-hover:border-ink-soft transition-colors duration-500">
            {initials(name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-nav text-ink-white truncate">
              {name}
            </p>
            <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-editorial text-ink-muted">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
                Verified
              </span>
              <span aria-hidden="true">·</span>
              <span>{fmtDate(review.created_at)}</span>
            </div>
          </div>
        </div>
      </footer>
    </article>
  );
}