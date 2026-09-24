import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import Container from '../components/ui/Container';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import CartLine from '../components/cart/CartLine';
import CartSummary from '../components/cart/CartSummary';
import CartSkeleton from '../components/cart/CartSkeleton';
import AsyncBoundary from '../components/ui/AsyncBoundary';
import Seo from '../components/seo/Seo';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, loading, error, refresh } = useCart();

  return (
    <>
     <Seo title="Cart" noIndex />  
      <Container className="py-16">
        <header className="mb-12">
          <span className="text-[10px] uppercase tracking-editorial text-ink-dim">Selection</span>
          <h1 className="heading-editorial text-4xl sm:text-5xl text-ink-white mt-3">Shopping Cart</h1>
        </header>

        <AsyncBoundary
          loading={loading}
          error={error}
          isEmpty={items.length === 0}
          skeleton={<CartSkeleton />}
          onRetry={refresh}
          empty={
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Explore the latest drops and add something you love."
              action={<Link to="/products"><Button>Browse Products</Button></Link>}
            />
          }
        >
          <div className="grid lg:grid-cols-[1fr_360px] gap-10">
            <div className="space-y-6">
              {items.map((it) => <CartLine key={it.id} item={it} />)}
            </div>
            <CartSummary />
          </div>
        </AsyncBoundary>
      </Container>
    </>
  );
}