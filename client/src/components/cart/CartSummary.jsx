import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../lib/orders';

const fmt = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

function CouponInput() {
  const { appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    const value = code.trim();
    if (!value) return;
    setBusy(true);
    try {
      await applyCoupon(value);
      setCode('');
      toast.success('Coupon applied');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="mt-6 pt-6 border-t border-ink-line">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Tag className="w-3.5 h-3.5 text-ink-white flex-shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-nav text-ink-white truncate">
                {appliedCoupon.code}
              </p>
              {appliedCoupon.description && (
                <p className="text-[10px] uppercase tracking-editorial text-ink-dim truncate">
                  {appliedCoupon.description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={removeCoupon}
            aria-label="Remove coupon"
            className="text-ink-dim hover:text-ink-white flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-ink-line">
      <label htmlFor="coupon-code" className="block mb-2 text-[10px] uppercase tracking-nav text-ink-dim">
        Coupon Code
      </label>
      <form onSubmit={handleApply} className="flex gap-2">
        <input
          id="coupon-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          autoComplete="off"
          maxLength={40}
          className="flex-1 h-10 px-3 bg-ink-surface border border-ink-line text-ink-white placeholder:text-ink-muted text-xs uppercase tracking-editorial focus:border-ink-text focus:outline-none"
        />
        <Button type="submit" variant="secondary" size="sm" loading={busy} disabled={!code.trim()}>
          Apply
        </Button>
      </form>
    </div>
  );
}

export default function CartSummary() {
  const { subtotal, discountAmount, total, appliedCoupon, items, hasIssues, refresh } = useCart();
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();
  const blocked = items.length === 0 || hasIssues;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const { order } = await createOrder(appliedCoupon?.code || null);
      await refresh();
      toast.success(`Order ${order.id.slice(0, 8)} placed`);
      navigate(`/profile/orders/${order.id}`, { state: { justPlaced: true } });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <aside className="border border-ink-line bg-ink-card p-6 h-fit lg:sticky lg:top-24">
      <h3 className="text-[11px] uppercase tracking-editorial text-ink-white mb-6">Order Summary</h3>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between text-ink-dim">
          <dt>Subtotal</dt>
          <dd className="text-ink-white tabular-nums">{fmt(subtotal)}</dd>
        </div>

        {appliedCoupon && discountAmount > 0 && (
          <div className="flex justify-between text-ink-dim">
            <dt className="truncate">
              Discount
              <span className="text-ink-muted ml-1">({appliedCoupon.code})</span>
            </dt>
            <dd className="text-ink-white tabular-nums">−{fmt(discountAmount)}</dd>
          </div>
        )}

        <div className="flex justify-between text-ink-dim">
          <dt>Shipping</dt>
          <dd className="text-ink-white">Calculated at delivery</dd>
        </div>
      </dl>

      <CouponInput />

      <div className="mt-6 pt-6 border-t border-ink-line flex justify-between items-baseline">
        <span className="text-[11px] uppercase tracking-editorial text-ink-dim">Total</span>
        <span className="text-lg text-ink-white font-medium tabular-nums">{fmt(total)}</span>
      </div>

      <Button
        onClick={handlePlaceOrder}
        disabled={blocked}
        loading={placing}
        className="w-full mt-6"
        size="lg"
      >
        Place Order
      </Button>

      {hasIssues && (
        <p className="mt-3 text-[10px] uppercase tracking-editorial text-ink-soft">
          Remove unavailable items to continue
        </p>
      )}
    </aside>
  );
}