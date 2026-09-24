import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import OrderCard from '../components/order/OrderCard';
import AsyncBoundary from '../components/ui/AsyncBoundary';
import { OrderListSkeleton } from '../components/skeletons';
import { fetchMyOrders } from '../lib/orders';
import Seo from '../components/seo/Seo';

export default function Orders() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });

  const load = () => {
    setState({ loading: true, error: null, data: [] });
    fetchMyOrders()
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((e) => setState({ loading: false, error: e, data: [] }));
  };

  useEffect(load, []);

  return (
    <>
      <Seo title="My Orders" noIndex />
      <Container className="py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-[10px] uppercase tracking-editorial text-ink-dim">Account</span>
            <h1 className="heading-editorial text-4xl sm:text-5xl text-ink-white mt-3">My Orders</h1>
          </div>
          <Link to="/profile" className="text-[11px] uppercase tracking-nav text-ink-dim hover:text-ink-white">
            ← Back to profile
          </Link>
        </div>

        <AsyncBoundary
          loading={state.loading}
          error={state.error}
          isEmpty={state.data.length === 0}
          skeleton={<OrderListSkeleton count={3} />}
          onRetry={load}
          empty={
            <EmptyState
              icon={Package}
              title="No orders yet"
              description="Your future orders will appear here."
              action={<Link to="/products"><Button>Start Shopping</Button></Link>}
            />
          }
        >
          <ul className="space-y-4 list-none">
            {state.data.map((o) => (
              <li key={o.id}><OrderCard order={o} /></li>
            ))}
          </ul>
        </AsyncBoundary>
      </Container>
    </>
  );
}