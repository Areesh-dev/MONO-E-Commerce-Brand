import { useEffect, useState } from 'react';
import SectionHeading from '../ui/SectionHeading';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '../skeletons';
import { fetchRelatedProducts } from '../../lib/analytics';

export default function RelatedProducts({ productId, limit = 4 }) {
  const [state, setState] = useState({ loading: true, data: [] });

  useEffect(() => {
    let active = true;
    setState({ loading: true, data: [] });
    fetchRelatedProducts(productId, limit)
      .then((products) => active && setState({ loading: false, data: products }))
      .catch(() => active && setState({ loading: false, data: [] }));
    return () => { active = false; };
  }, [productId, limit]);

  if (state.loading) {
    return (
      <section className="mt-24" aria-busy="true">
        <SectionHeading eyebrow="More From Us" title="You May Also Like" />
        <div className="mt-10">
          <ProductGridSkeleton count={limit} />
        </div>
      </section>
    );
  }

  if (state.data.length === 0) return null;

  return (
    <section aria-label="Related products" className="mt-24">
      <div className="flex items-end justify-between gap-4 mb-10">
        <SectionHeading eyebrow="More From Us" title="You May Also Like" />
      </div>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 list-none">
        {state.data.map((p) => (
          <li key={p.id}><ProductCard product={p} /></li>
        ))}
      </ul>
    </section>
  );
}