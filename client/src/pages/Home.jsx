import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import ProductCard from '../components/product/ProductCard';
import CategoryCard from '../components/category/CategoryCard';
import SwipeCarousel from '../components/ui/SwipeCarousel';
import Hero from '../components/home/Hero';
import WhyChooseUs from '../components/home/WhyChooseUs';
import BrandStrip from '../components/home/BrandStrip';
import FaqSection from '../components/home/FaqSection';
import MissionVision from '../components/home/MissionVision';
import ReviewList from '../components/reviews/ReviewList';
import AsyncBoundary from '../components/ui/AsyncBoundary';
import EmptyState from '../components/ui/EmptyState';
import Seo from '../components/seo/Seo';
import { ProductGridSkeleton, CategoryGridSkeleton } from '../components/skeletons';
import { fetchCategories, fetchProducts } from '../lib/api';
import { brand } from '../config/brand';

export default function Home() {
  const [popular, setPopular] = useState(null);
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    let active = true;
    fetchProducts({ popular: true, pageSize: 8 })
      .then((r) => active && setPopular(r.data))
      .catch(() => active && setPopular([]));
    fetchCategories()
      .then((c) => active && setCategories(c))
      .catch(() => active && setCategories([]));
    return () => { active = false; };
  }, []);

  return (
    <>
      <Seo
        url="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: brand.name,
          url: brand.seo.siteUrl,
          logo: `${brand.seo.siteUrl}/favicon.svg`,
          sameAs: Object.values(brand.social).filter(Boolean),
        }}
      />

      <Hero />

      {/* Categories */}
      <section className="py-14 sm:py-20 border-t border-ink-line">
        <Container>
          <div className="flex items-end justify-between gap-4 mb-10 sm:mb-12">
            <SectionHeading eyebrow="Collections" title="Shop by Category" />
            <Link
              to="/categories"
              className="text-[11px] uppercase tracking-nav text-ink-dim hover:text-ink-white whitespace-nowrap"
            >
              View all →
            </Link>
          </div>

          <AsyncBoundary
            loading={categories === null}
            error={null}
            isEmpty={categories?.length === 0}
            skeleton={<CategoryGridSkeleton count={4} />}
            empty={<EmptyState title="No categories yet" />}
          >
            <SwipeCarousel
              ariaLabel="Categories"
              items={(categories || []).slice(0, 4).map((c, i) => (
                <CategoryCard category={c} index={i} />
              ))}
              desktopGridClass="lg:grid lg:grid-cols-4 lg:gap-4"
              mobileItemClass="w-[72vw] sm:w-[44vw] md:w-[34vw] lg:w-auto"
            />
          </AsyncBoundary>
        </Container>
      </section>

      {/* Popular products */}
      <section className="py-14 sm:py-20 border-t border-ink-line">
        <Container>
          <div className="flex items-end justify-between gap-4 mb-10 sm:mb-12">
            <SectionHeading eyebrow="Drop" title="Popular Now" />
            <Link
              to="/products"
              className="text-[11px] uppercase tracking-nav text-ink-dim hover:text-ink-white whitespace-nowrap"
            >
              View all →
            </Link>
          </div>

          <AsyncBoundary
            loading={popular === null}
            error={null}
            isEmpty={popular?.length === 0}
            skeleton={<ProductGridSkeleton count={4} />}
            empty={
              <EmptyState
                title="No featured products"
                description="Check back soon for new drops."
              />
            }
          >
            <SwipeCarousel
              ariaLabel="Popular products"
              items={(popular || []).map((p) => (
                <ProductCard product={p} />
              ))}
              desktopGridClass="lg:grid lg:grid-cols-4 lg:gap-6"
              mobileItemClass="w-[72vw] sm:w-[44vw] md:w-[34vw] lg:w-auto"
            />
          </AsyncBoundary>
        </Container>
      </section>

       <MissionVision />

      <WhyChooseUs />

      <section className="py-14 sm:py-20 border-t border-ink-line">
        <Container>
          <ReviewList eyebrow="Community" title="What People Say" limit={6} />
        </Container>
      </section>

      <BrandStrip />

      <FaqSection />
    </>
  );
}