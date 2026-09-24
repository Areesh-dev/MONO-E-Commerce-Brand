import { useEffect, useState, useMemo } from 'react';
import { Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import OrderTimeline from '../../components/order/OrderTimeline';
import { listTable, updateRow, ORDER_STATUS_OPTIONS } from '../../lib/admin';
import { TableSkeleton } from '../../components/skeletons';

const fmt = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));

const ORDER_SELECT = 'id,user_id,total_amount,status,created_at,profiles(name,email),order_items(id,product_id,product_name,quantity,price,size_id,size_name)';

export default function AdminOrders() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewing, setViewing] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const load = () => {
    setState({ loading: true, error: null, data: [] });
    listTable('orders', { select: ORDER_SELECT, orderBy: { column: 'created_at', ascending: false } })
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((e) => setState({ loading: false, error: e, data: [] }));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    let rows = state.data;
    if (statusFilter) rows = rows.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((o) =>
        o.id.toLowerCase().includes(q) ||
        o.profiles?.email?.toLowerCase().includes(q) ||
        o.profiles?.name?.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [state.data, search, statusFilter]);

  const handleStatusChange = async (order, status) => {
    if (status === order.status) return;
    setSavingStatus(true);
    try {
      await updateRow('orders', order.id, { status });
      toast.success('Status updated');
      setState((s) => ({
        ...s,
        data: s.data.map((o) => (o.id === order.id ? { ...o, status } : o)),
      }));
      setViewing((v) => (v?.id === order.id ? { ...v, status } : v));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="heading-editorial text-2xl text-ink-white">Orders</h1>
          <p className="mt-1 text-xs text-ink-dim">{filtered.length} of {state.data.length}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-dim" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name or email…"
              className="h-9 pl-9 pr-3 bg-ink-surface border border-ink-line text-ink-white text-xs placeholder:text-ink-muted focus:border-ink-text focus:outline-none w-64"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[{ value: '', label: 'All statuses' }, ...ORDER_STATUS_OPTIONS]}
            className="min-w-[160px]"
          />
        </div>
      </div>

      <div className="border border-ink-line bg-ink-card" aria-busy={state.loading}>
        {state.loading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : state.error ? (
          <ErrorState onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No orders found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink-line">
                  <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim">Order</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim">Customer</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim">Items</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim">Total</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim">Date</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim">Status</th>
                  <th className="px-4 py-3 w-16" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-ink-line last:border-b-0 hover:bg-ink-surface">
                    <td className="px-4 py-3 text-xs text-ink-white font-mono">#{o.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-ink-white">{o.profiles?.name || '—'}</p>
                      <p className="text-[10px] text-ink-dim mt-0.5">{o.profiles?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-text tabular-nums">
                      {o.order_items?.reduce((s, it) => s + it.quantity, 0) || 0}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-white tabular-nums">{fmt(o.total_amount)}</td>
                    <td className="px-4 py-3 text-xs text-ink-dim whitespace-nowrap">{fmtDate(o.created_at)}</td>
                    <td className="px-4 py-3">
                      <Select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o, e.target.value)}
                        options={ORDER_STATUS_OPTIONS}
                        disabled={savingStatus}
                        className="h-8 text-xs min-w-[130px]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setViewing(o)}
                        aria-label="View order"
                        className="text-ink-dim hover:text-ink-white"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? `Order #${viewing.id.slice(0, 8)}` : ''}
        size="xl"
      >
        {viewing && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-editorial text-ink-dim mb-5">
                Timeline
              </p>
              <OrderTimeline
                orderId={viewing.id}
                currentStatus={viewing.status}
                isAdmin
              />
            </div>

            <div className="space-y-6 min-w-0">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-editorial text-ink-dim mb-1">Customer</p>
                  <p className="text-ink-white">{viewing.profiles?.name || '—'}</p>
                  <p className="text-ink-dim">{viewing.profiles?.email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-editorial text-ink-dim mb-1">Placed</p>
                  <p className="text-ink-white">{fmtDate(viewing.created_at)}</p>
                  <div className="mt-2">
                    <OrderStatusBadge status={viewing.status} />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-editorial text-ink-dim mb-3">Items</p>
                <div className="border border-ink-line divide-y divide-ink-line">
                  {viewing.order_items?.map((it) => (
                    <div key={it.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-xs text-ink-white truncate">{it.product_name}</p>
                        <p className="text-[10px] uppercase tracking-editorial text-ink-dim mt-0.5">
                          {it.size_name && <span className="text-ink-text">Size {it.size_name} · </span>}
                          {fmt(it.price)} × {it.quantity}
                        </p>
                      </div>
                      <span className="text-xs text-ink-white tabular-nums whitespace-nowrap">
                        {fmt(Number(it.price) * it.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3 bg-ink-surface">
                    <span className="text-[10px] uppercase tracking-editorial text-ink-dim">Total</span>
                    <span className="text-sm text-ink-white tabular-nums">{fmt(viewing.total_amount)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[10px] uppercase tracking-nav text-ink-dim">
                  Update status
                </label>
                <Select
                  value={viewing.status}
                  onChange={(e) => handleStatusChange(viewing, e.target.value)}
                  options={ORDER_STATUS_OPTIONS}
                  disabled={savingStatus}
                />
                <p className="mt-2 text-[10px] uppercase tracking-editorial text-ink-muted">
                  Changing status appends a new event to the timeline.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}