import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import Container from '../components/ui/Container';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import WishlistCard from '../components/wishlist/WishlistCard';
import WishlistCardSkeleton from '../components/skeletons/WishlistCardSkeleton';
import AsyncBoundary from '../components/ui/AsyncBoundary';
import Seo from '../components/seo/Seo';
import { useWishlist } from '../context/WishlistContext';

export default function Wishlist() {
  const { items, loading, error, refresh } = useWishlist();

  return (
    <>
      <Seo title="Wishlist" noIndex />

      <Container className="py-12 sm:py-16">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-editorial text-ink-dim hover:text-ink-white mb-8"
        >
          <ArrowLeft className="w-3 h-3" aria-hidden="true" /> Back to profile
        </Link>

        <header className="mb-10 sm:mb-12">
          <span className="text-[10px] uppercase tracking-editorial text-ink-dim">Account</span>
          <h1 className="heading-editorial text-4xl sm:text-5xl text-ink-white mt-3">
            Wishlist
          </h1>
          {!loading && items.length > 0 && (
            <p className="mt-3 text-[10px] uppercase tracking-editorial text-ink-dim">
              {items.length} saved {items.length === 1 ? 'piece' : 'pieces'}
            </p>
          )}
        </header>

        <AsyncBoundary
          loading={loading}
          error={error}
          isEmpty={items.length === 0}
          skeleton={
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <WishlistCardSkeleton key={i} />
              ))}
            </div>
          }
          onRetry={refresh}
          empty={
            <EmptyState
              icon={Heart}
              title="Your wishlist is empty"
              description="Save pieces you want to come back to."
              action={<Link to="/products"><Button>Explore Products</Button></Link>}
            />
          }
        >
          <ul className="space-y-4 list-none">
            {items.map((item) => (
              <li key={item.id}>
                <WishlistCard item={item} />
              </li>
            ))}
          </ul>
        </AsyncBoundary>
      </Container>
    </>
  );
}