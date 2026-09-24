import { useEffect, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import EmptyState from '../components/ui/EmptyState';
import AsyncBoundary from '../components/ui/AsyncBoundary';
import CategoryCard from '../components/category/CategoryCard';
import SwipeCarousel from '../components/ui/SwipeCarousel';
import { CategoryGridSkeleton } from '../components/skeletons';
import Seo from '../components/seo/Seo';
import { fetchCategories } from '../lib/api';

export default function Categories() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });

  const load = () => {
    setState({ loading: true, error: null, data: [] });
    fetchCategories()
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((e) => setState({ loading: false, error: e, data: [] }));
  };

  useEffect(load, []);

  return (
    <>
      <Seo
        title="Categories"
        description="Browse all collections and shop by category."
        url="/categories"
      />

      <Container className="py-12 sm:py-16">
        <SectionHeading
          eyebrow="Collections"
          title="Shop by Category"
          description="Explore our curated collections."
        />

        <div className="mt-10 sm:mt-14">
          <AsyncBoundary
            loading={state.loading}
            error={state.error}
            isEmpty={state.data.length === 0}
            skeleton={<CategoryGridSkeleton count={4} />}
            onRetry={load}
            empty={
              <EmptyState
                title="No categories yet"
                description="Check back soon for new collections."
              />
            }
          >
            <SwipeCarousel
              ariaLabel="All categories"
              items={state.data.map((c, i) => (
                <CategoryCard category={c} index={i} />
              ))}
              desktopGridClass="lg:grid lg:grid-cols-4 lg:gap-4"
              mobileItemClass="w-[72vw] sm:w-[44vw] md:w-[34vw] lg:w-auto"
            />
          </AsyncBoundary>
        </div>
      </Container>
    </>
  );
}