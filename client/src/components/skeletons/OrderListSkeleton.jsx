import OrderSkeleton from './OrderSkeleton';

export default function OrderListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => <OrderSkeleton key={i} />)}
    </div>
  );
}