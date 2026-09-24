import { useEffect, useState } from 'react';
import ReviewCard from './ReviewCard';
import SectionHeading from '../ui/SectionHeading';
import { ReviewGridSkeleton } from '../skeletons';
import { fetchApprovedReviews } from '../../lib/reviews';

export default function ReviewList({
  productId,
  limit = 6,
  title = 'What People Say',
  eyebrow = 'Reviews',
  align = 'left',
}) {
  const [state, setState] = useState({ loading: true, error: null, data: [] });

  useEffect(() => {
    let active = true;
    setState({ loading: true, error: null, data: [] });
    fetchApprovedReviews({ productId, limit })
      .then((data) => active && setState({ loading: false, error: null, data }))
      .catch(() => active && setState({ loading: false, error: null, data: [] }));
    return () => { active = false; };
  }, [productId, limit]);

  if (state.loading) {
    return (
      <section aria-busy="true" aria-live="polite">
        <SectionHeading eyebrow={eyebrow} title={title} align={align} className="mb-10 sm:mb-12" />
        <ReviewGridSkeleton count={3} />
        <span className="sr-only">Loading reviews</span>
      </section>
    );
  }

  if (state.error || state.data.length === 0) return null;

  return (
    <section aria-label="Customer reviews">
      <SectionHeading eyebrow={eyebrow} title={title} align={align} className="mb-10 sm:mb-12" />
      <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 list-none">
        {state.data.map((r, i) => (
          <li key={r.id}>
            <ReviewCard review={r} index={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}