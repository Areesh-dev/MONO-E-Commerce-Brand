import ResourceManager from '../../components/admin/ResourceManager';

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed (PKR)' },
];

const fmt = (n) =>
  n == null ? '—' : new Intl.NumberFormat('en-PK', {
    style: 'currency', currency: 'PKR', maximumFractionDigits: 0,
  }).format(Number(n));

const fmtDate = (iso) =>
  iso ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso)) : '—';

export default function AdminCoupons() {
  return (
    <ResourceManager
      table="coupons"
      title="Coupons"
      description="Manage discount codes and usage limits."
      searchKeys={['code', 'description']}
      orderBy={{ column: 'created_at', ascending: false }}
      rowLabel="coupon"
      columns={[
        {
          key: 'code', label: 'Code',
          render: (r) => <span className="text-ink-white font-mono">{r.code}</span>,
        },
        {
          key: 'description', label: 'Description',
          render: (r) => <span className="text-ink-dim line-clamp-1">{r.description || '—'}</span>,
        },
        {
          key: 'discount_value', label: 'Discount', width: 'w-32',
          render: (r) => (
            <span className="text-ink-white tabular-nums">
              {r.discount_type === 'percentage' ? `${r.discount_value}%` : fmt(r.discount_value)}
            </span>
          ),
        },
        {
          key: 'usage_count', label: 'Usage', width: 'w-28',
          render: (r) => (
            <span className="text-ink-text tabular-nums">
              {r.usage_count}
              {r.usage_limit ? ` / ${r.usage_limit}` : ''}
            </span>
          ),
        },
        {
          key: 'expires_at', label: 'Expires', width: 'w-32',
          render: (r) => <span className="text-ink-dim">{fmtDate(r.expires_at)}</span>,
        },
        {
          key: 'is_active', label: 'Status', width: 'w-24',
          render: (r) => (
            <span className={`text-[9px] uppercase tracking-editorial px-2 py-1 border ${
              r.is_active ? 'border-ink-white text-ink-white' : 'border-ink-line text-ink-muted'
            }`}>
              {r.is_active ? 'Active' : 'Inactive'}
            </span>
          ),
        },
      ]}
      formFields={[
        { name: 'code', label: 'Coupon Code (auto-uppercase)', type: 'text', required: true, placeholder: 'MONO10' },
        { name: 'description', label: 'Description', type: 'text', placeholder: '10% off all orders' },
        { name: 'discount_type', label: 'Discount Type', type: 'select', required: true, options: DISCOUNT_TYPES },
        { name: 'discount_value', label: 'Discount Value', type: 'number', required: true, min: 0, step: 0.01 },
        { name: 'minimum_order_amount', label: 'Minimum Order (PKR)', type: 'number', min: 0, step: 0.01, nullable: true },
        { name: 'maximum_discount_amount', label: 'Maximum Discount (PKR)', type: 'number', min: 0, step: 0.01, nullable: true },
        { name: 'starts_at', label: 'Starts At', type: 'date' },
        { name: 'expires_at', label: 'Expires At', type: 'date' },
        { name: 'usage_limit', label: 'Total Usage Limit', type: 'number', min: 1, nullable: true },
        { name: 'per_user_limit', label: 'Per-User Limit', type: 'number', min: 1, nullable: true },
        { name: 'is_active', label: 'Active', type: 'toggle' },
      ]}
      defaultValues={{
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        minimum_order_amount: null,
        maximum_discount_amount: null,
        starts_at: null,
        expires_at: null,
        usage_limit: null,
        per_user_limit: null,
        is_active: true,
      }}
    />
  );
}