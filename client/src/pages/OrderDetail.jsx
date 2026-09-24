import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, CheckCircle2, PenLine } from 'lucide-react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import OrderStatusBadge from '../components/order/OrderStatusBadge';
import OrderTimeline from '../components/order/OrderTimeline';
import ReviewForm from '../components/reviews/ReviewForm';
import { fetchMyOrder } from '../lib/orders';
import { fetchMyReviewedProductIds } from '../lib/reviews';

const fmt = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;
  const [state, setState] = useState({ loading: true, error: null, order: null });
  const [reviewedIds, setReviewedIds] = useState([]);
  const [reviewTarget, setReviewTarget] = useState(null);

  useEffect(() => {
    let active = true;
    setState({ loading: true, error: null, order: null });
    Promise.all([fetchMyOrder(id), fetchMyReviewedProductIds().catch(() => [])])
      .then(([order, ids]) => {
        if (!active) return;
        setState({ loading: false, error: null, order });
        setReviewedIds(ids);
      })
      .catch((e) => active && setState({ loading: false, error: e, order: null }));
    return () => { active = false; };
  }, [id]);

  if (state.loading) {
    return (
      <Container className="py-16 max-w-4xl" aria-busy="true">
        <Skeleton className="h-3 w-32 mb-10" />
        <Skeleton className="h-24 w-full mb-6" />
        <Skeleton className="h-40 w-full" />
        <span className="sr-only">Loading order</span>
      </Container>
    );
  }

  if (state.error || !state.order) {
    return (
      <Container className="py-16 max-w-4xl">
        <ErrorState title="Order not found" description="This order doesn't exist or you don't have access." />
      </Container>
    );
  }

  const { order } = state;

  return (
    <>
      <Helmet><title>Order #{order.id.slice(0, 8)}</title></Helmet>
      <Container className="py-16 max-w-4xl">
        <Link
          to="/profile/orders"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-editorial text-ink-dim hover:text-ink-white"
        >
          <ArrowLeft className="w-3 h-3" aria-hidden="true" /> All orders
        </Link>

        {justPlaced && (
          <div className="mt-8 flex items-center gap-3 border border-ink-line bg-ink-card px-5 py-4">
            <CheckCircle2 className="w-5 h-5 text-ink-white" strokeWidth={1.5} />
            <div>
              <p className="text-xs uppercase tracking-nav text-ink-white">Order placed</p>
              <p className="text-[10px] uppercase tracking-editorial text-ink-dim mt-0.5">
                We'll notify you when it ships.
              </p>
            </div>
          </div>
        )}

        <header className="mt-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-editorial text-ink-dim">Order</span>
            <h1 className="heading-editorial text-3xl sm:text-4xl text-ink-white mt-2">
              #{order.id.slice(0, 8)}
            </h1>
            <p className="mt-3 text-[10px] uppercase tracking-editorial text-ink-dim">
              Placed {fmtDate(order.created_at)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </header>

        <section className="mt-12 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 lg:gap-14">
          <div>
            <h2 className="text-[10px] uppercase tracking-editorial text-ink-dim mb-5">
              Order Timeline
            </h2>
            <OrderTimeline orderId={order.id} currentStatus={order.status} />
          </div>

          <div>
            <h2 className="text-[10px] uppercase tracking-editorial text-ink-dim mb-5">
              Items
            </h2>
            <div className="border-t border-ink-line">
              {order.order_items.map((it) => {
                const alreadyReviewed = it.product_id && reviewedIds.includes(it.product_id);
                return (
                  <div
                    key={it.id}
                    className="flex items-start justify-between gap-6 py-5 border-b border-ink-line"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-nav text-ink-white truncate">
                        {it.product_name}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-editorial text-ink-dim">
                        {it.size_name && (
                          <span className="text-ink-text">Size {it.size_name} · </span>
                        )}
                        {fmt(it.price)} × {it.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {it.product_id && (
                        alreadyReviewed ? (
                          <span className="text-[10px] uppercase tracking-editorial text-ink-muted">
                            Reviewed
                          </span>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setReviewTarget({ productId: it.product_id, productName: it.product_name })}
                          >
                            <PenLine className="w-3.5 h-3.5" /> Review
                          </Button>
                        )
                      )}
                      <span className="text-sm text-ink-white tabular-nums">
                        {fmt(Number(it.price) * it.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

                        <dl className="mt-8 ml-auto w-full sm:w-72 space-y-3">
              <div className="flex justify-between text-sm text-ink-dim">
                <dt>Subtotal</dt>
                <dd className="text-ink-white tabular-nums">
                  {fmt(order.subtotal ?? order.total_amount)}
                </dd>
              </div>

              {order.coupon_code && Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-sm text-ink-dim">
                  <dt className="truncate">
                    Discount
                    <span className="text-ink-muted ml-1">({order.coupon_code})</span>
                  </dt>
                  <dd className="text-ink-white tabular-nums">−{fmt(order.discount_amount)}</dd>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t border-ink-line items-baseline">
                <dt className="text-[11px] uppercase tracking-editorial text-ink-dim">Total</dt>
                <dd className="text-lg text-ink-white font-medium tabular-nums">
                  {fmt(order.total_amount)}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </Container>

      <ReviewForm
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        productId={reviewTarget?.productId}
        productName={reviewTarget?.productName}
        onSubmitted={() => {
          if (reviewTarget?.productId) {
            setReviewedIds((ids) => [...ids, reviewTarget.productId]);
          }
        }}
      />
    </>
  );
}