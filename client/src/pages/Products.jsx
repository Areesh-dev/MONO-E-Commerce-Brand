import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import ProductCard from '../components/product/ProductCard';
import SwipeCarousel from '../components/ui/SwipeCarousel';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Select from '../components/ui/Select';
import AsyncBoundary from '../components/ui/AsyncBoundary';
import { ProductGridSkeleton } from '../components/skeletons';
import { fetchProducts, fetchCategories } from '../lib/api';

const PAGE_SIZE = 12;

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, error: null, data: [], count: 0 });
  const [categories, setCategories] = useState([]);

  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const page = parseInt(params.get('page') || '1', 10);

  useEffect(() => { fetchCategories().then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchProducts({ categoryId: category || undefined, sort, page, pageSize: PAGE_SIZE })
      .then((r) => active && setState({ loading: false, error: null, data: r.data, count: r.count }))
      .catch((e) => active && setState({ loading: false, error: e, data: [], count: 0 }));
    return () => { active = false; };
  }, [category, sort, page]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const totalPages = Math.max(1, Math.ceil(state.count / PAGE_SIZE));

  return (
    <>
      <Container className="py-10 sm:py-16">
        <SectionHeading eyebrow="Catalog" title="All Products" description="Explore the latest drops and essentials." />

        <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:items-end justify-between border-y border-ink-line py-4">
          <div className="flex gap-4">
            <Select
              label="Category"
              value={category}
              onChange={(e) => update('category', e.target.value)}
              options={[{ value: '', label: 'All' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
              className="min-w-[180px]"
            />
            <Select
              label="Sort"
              value={sort}
              onChange={(e) => update('sort', e.target.value)}
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'price_asc', label: 'Price ↑' },
                { value: 'price_desc', label: 'Price ↓' },
                { value: 'name', label: 'Name A–Z' },
              ]}
              className="min-w-[160px]"
            />
          </div>
          <span className="text-[10px] uppercase tracking-editorial text-ink-dim" aria-live="polite">
            {state.count} item{state.count === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-10">
          <AsyncBoundary
            loading={state.loading}
            error={state.error}
            isEmpty={state.data.length === 0}
            skeleton={<ProductGridSkeleton count={PAGE_SIZE} />}
            empty={<EmptyState title="No products found" description="Try a different filter or search term." />}
            onRetry={() => update('page', '1')}
          >
            <SwipeCarousel
              ariaLabel="Products"
              items={state.data.map((p) => (
                <ProductCard product={p} />
              ))}
              desktopGridClass="lg:grid lg:grid-cols-4 lg:gap-6"
              mobileItemClass="w-[72vw] sm:w-[44vw] md:w-[34vw] lg:w-auto"
            />
          </AsyncBoundary>
        </div>

        {!state.loading && state.count > PAGE_SIZE && (
          <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Pagination">
            <button
              onClick={() => update('page', String(Math.max(1, page - 1)))}
              disabled={page <= 1}
              className="h-9 px-4 border border-ink-line text-[10px] uppercase tracking-editorial text-ink-text hover:text-ink-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-[10px] uppercase tracking-editorial text-ink-dim px-3" aria-current="page">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => update('page', String(Math.min(totalPages, page + 1)))}
              disabled={page >= totalPages}
              className="h-9 px-4 border border-ink-line text-[10px] uppercase tracking-editorial text-ink-text hover:text-ink-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        )}
      </Container>
    </>
  );
}