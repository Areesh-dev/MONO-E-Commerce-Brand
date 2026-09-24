import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import ProductCard from '../components/product/ProductCard';
import SwipeCarousel from '../components/ui/SwipeCarousel';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Skeleton from '../components/ui/Skeleton';
import AsyncBoundary from '../components/ui/AsyncBoundary';
import { ProductGridSkeleton } from '../components/skeletons';
import Seo from '../components/seo/Seo';
import { fetchCategoryBySlug, fetchProducts } from '../lib/api';

export default function CategoryDetail() {
  const { slug } = useParams();
  const [category, setCategory] = useState({ loading: true, error: null, data: null });
  const [products, setProducts] = useState({ loading: true, error: null, data: [] });

  useEffect(() => {
    let active = true;
    setCategory({ loading: true, error: null, data: null });
    setProducts({ loading: true, error: null, data: [] });

    fetchCategoryBySlug(slug)
      .then((c) => {
        if (!active) return;
        setCategory({ loading: false, error: null, data: c });
        return fetchProducts({ categoryId: c.id, pageSize: 24 });
      })
      .then((r) => {
        if (!active || !r) return;
        setProducts({ loading: false, error: null, data: r.data });
      })
      .catch((e) => {
        if (!active) return;
        setCategory({ loading: false, error: e, data: null });
        setProducts({ loading: false, error: null, data: [] });
      });

    return () => { active = false; };
  }, [slug]);

  if (category.loading) {
    return (
      <Container className="py-16" aria-busy="true">
        <Skeleton className="h-3 w-32 mb-8" />
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-12" />
        <ProductGridSkeleton count={4} />
      </Container>
    );
  }

  if (category.error || !category.data) {
    return (
      <Container className="py-16">
        <ErrorState
          title="Category not found"
          description="This category doesn't exist or is no longer available."
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  const cat = category.data;

  return (
    <>
      <Seo
        title={cat.name}
        description={`Shop the ${cat.name} collection.`}
        url={`/categories/${cat.slug}`}
        image={cat.image_url || undefined}
      />

      <Container className="py-10 sm:py-16">
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-editorial text-ink-dim hover:text-ink-white"
        >
          <ArrowLeft className="w-3 h-3" aria-hidden="true" /> All categories
        </Link>

        <div className="mt-8">
          <SectionHeading
            eyebrow="Collection"
            title={cat.name}
            description={`${products.data.length} product${products.data.length === 1 ? '' : 's'}`}
          />
        </div>

        <div className="mt-10 sm:mt-14">
          <AsyncBoundary
            loading={products.loading}
            error={products.error}
            isEmpty={products.data.length === 0}
            skeleton={<ProductGridSkeleton count={4} />}
            empty={
              <EmptyState
                title="No products in this category"
                description="Check back soon for new drops."
              />
            }
          >
            <SwipeCarousel
              ariaLabel={`${cat.name} products`}
              items={products.data.map((p) => (
                <ProductCard product={p} />
              ))}
              desktopGridClass="lg:grid lg:grid-cols-4 lg:gap-6"
              mobileItemClass="w-[72vw] sm:w-[44vw] md:w-[34vw] lg:w-auto"
            />
          </AsyncBoundary>
        </div>
      </Container>
    </>
  );
}