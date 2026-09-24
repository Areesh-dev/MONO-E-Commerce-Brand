import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, Users, Tag, AlertCircle, ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import RangePicker from '../../components/admin/analytics/RangePicker';
import StatCard from '../../components/admin/analytics/StatCard';
import SalesChart from '../../components/admin/analytics/SalesChart';
import StatusDistribution from '../../components/admin/analytics/StatusDistribution';
import TopProductsTable from '../../components/admin/analytics/TopProductsTable';
import CategoryPerformance from '../../components/admin/analytics/CategoryPerformance';
import LowStockList from '../../components/admin/analytics/LowStockList';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import {
  fetchAnalyticsOverview, fetchAnalyticsSales, fetchAnalyticsStatus,
  fetchAnalyticsProducts, fetchAnalyticsCategories, fetchLowStock,
} from '../../lib/analytics';

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(new Date(iso));

const LOW_STOCK_THRESHOLD = 5;

export default function Dashboard() {
  const [range, setRange] = useState('30d');
  const [state, setState] = useState({
    loading: true,
    error: null,
    overview: null,
    series: [],
    status: { counts: {}, total: 0 },
    topProducts: [],
    categories: [],
    lowStock: [],
  });

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));

    Promise.all([
      fetchAnalyticsOverview(range),
      fetchAnalyticsSales(range),
      fetchAnalyticsStatus(range),
      fetchAnalyticsProducts(range, 8),
      fetchAnalyticsCategories(range),
      fetchLowStock(LOW_STOCK_THRESHOLD),
    ])
      .then(([overview, sales, status, products, categories, lowStock]) => {
        if (!active) return;
        setState({
          loading: false,
          error: null,
          overview,
          series: sales.series || [],
          status: {
            counts: status.counts || {},
            total: overview.orders?.total || 0,
          },
          topProducts: products.products || [],
          categories: categories.categories || [],
          lowStock: lowStock.items || [],
        });
      })
      .catch((e) => {
        if (!active) return;
        toast.error('Could not load analytics');
        setState((s) => ({ ...s, loading: false, error: e }));
      });

    return () => { active = false; };
  }, [range]);

  const { loading, overview } = state;
  const revenue = overview?.revenue || {};
  const orders = overview?.orders || {};
  const users = overview?.users || {};

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-editorial text-2xl text-ink-white">Dashboard</h1>
          <p className="mt-1 text-xs text-ink-dim">Live metrics across the store.</p>
        </div>
        <RangePicker value={range} onChange={setRange} />
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Net Revenue"
          value={revenue.net || 0}
          hint={`Gross ${fmtCurrency(revenue.gross || 0)}`}
          icon={TrendingUp}
          loading={loading}
          format="currency"
        />
        <StatCard
          label="Orders"
          value={orders.total || 0}
          hint={`${orders.completed || 0} completed`}
          icon={ShoppingBag}
          loading={loading}
        />
        <StatCard
          label="Avg Order Value"
          value={revenue.aov || 0}
          hint={`Discount ${fmtCurrency(revenue.discount || 0)}`}
          icon={Tag}
          loading={loading}
          format="currency"
        />
        <StatCard
          label="New Users"
          value={users.new || 0}
          hint={`${orders.pending || 0} pending orders`}
          icon={Users}
          loading={loading}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesChart series={state.series} loading={loading} />
        </div>
        <StatusDistribution
          counts={state.status.counts}
          total={state.status.total}
          loading={loading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <TopProductsTable products={state.topProducts} loading={loading} />
        <CategoryPerformance categories={state.categories} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <LowStockList
          items={state.lowStock}
          threshold={LOW_STOCK_THRESHOLD}
          loading={loading}
        />
        <RecentOrders loading={loading} />
      </div>
    </div>
  );
}

function RecentOrders({ loading }) {
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    if (loading) { setLoaded(false); return; }
    import('../../lib/admin').then(({ listTable }) =>
      listTable('orders', {
        select: 'id,total_amount,status,created_at',
        orderBy: { column: 'created_at', ascending: false },
      }).then((data) => {
        if (!active) return;
        setRows((data || []).slice(0, 5));
        setLoaded(true);
      }).catch(() => active && setLoaded(true))
    );
    return () => { active = false; };
  }, [loading]);

  return (
    <div className="border border-ink-line bg-ink-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[11px] uppercase tracking-editorial text-ink-white">Recent Orders</h3>
        <Link
          to="/admin/orders"
          className="text-[10px] uppercase tracking-editorial text-ink-dim hover:text-ink-white inline-flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {!loaded ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-full bg-ink-surface animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="py-10 flex flex-col items-center text-ink-dim text-xs">
          <AlertCircle className="w-6 h-6 mb-3" strokeWidth={1.5} />
          No orders yet
        </div>
      ) : (
        <ul className="divide-y divide-ink-line list-none">
          {rows.map((o) => (
            <li key={o.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-ink-white uppercase tracking-nav">
                  #{o.id.slice(0, 8)}
                </p>
                <p className="text-[10px] uppercase tracking-editorial text-ink-dim mt-0.5">
                  {fmtDate(o.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <OrderStatusBadge status={o.status} />
                <span className="text-xs text-ink-white tabular-nums">
                  {fmtCurrency(o.total_amount)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}