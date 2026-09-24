import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import ProductCard from '../components/product/ProductCard';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import AsyncBoundary from '../components/ui/AsyncBoundary';
import { ProductGridSkeleton } from '../components/skeletons';
import { fetchProducts } from '../lib/api';
import { sanitizeSearch } from '../lib/sanitize';

export default function Search() {
  const [params] = useSearchParams();
  const raw = params.get('q') || '';
  const query = sanitizeSearch(raw);
  const [state, setState] = useState({ loading: true, error: null, data: [], count: 0 });

  useEffect(() => {
    if (!query) {
      setState({ loading: false, error: null, data: [], count: 0 });
      return;
    }
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchProducts({ search: query, pageSize: 24 })
      .then((r) => active && setState({ loading: false, error: null, data: r.data, count: r.count }))
      .catch((e) => active && setState({ loading: false, error: e, data: [], count: 0 }));
    return () => { active = false; };
  }, [query]);

  return (
    <>
      <Helmet>
        <title>{query ? `Search: ${query}` : 'Search'} — Catalog</title>
        <meta name="robots" content="noindex,follow" />
      </Helmet>

      <Container className="py-16">
        <SectionHeading
          eyebrow="Search"
          title={query ? `Results for “${query}”` : 'Search Products'}
          description={query ? `${state.count} match${state.count === 1 ? '' : 'es'}` : 'Type a query in the navigation bar.'}
        />

        <div className="mt-12">
          {!query ? (
            <EmptyState title="No query" description="Use the search bar in the header." />
          ) : (
            <AsyncBoundary
              loading={state.loading}
              error={state.error}
              isEmpty={state.data.length === 0}
              skeleton={<ProductGridSkeleton count={8} />}
              empty={<EmptyState title="No products found" description="Try a different search." />}
            >
              <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 list-none">
                {state.data.map((p) => (
                  <li key={p.id}><ProductCard product={p} /></li>
                ))}
              </ul>
            </AsyncBoundary>
          )}
        </div>
      </Container>
    </>
  );
}