import ResourceManager from '../../components/admin/ResourceManager';
import { STATUS_OPTIONS } from '../../lib/admin';

const ICON_OPTIONS = [
  'Truck', 'ShieldCheck', 'Sparkles', 'Award', 'Heart', 'Star', 'Package', 'RefreshCw', 'Headphones', 'Leaf',
].map((n) => ({ value: n, label: n }));

export default function AdminWhyChooseUs() {
  return (
    <ResourceManager
      table="why_choose_us"
      title="Why Choose Us"
      description="Trust badges shown on the homepage."
      searchKeys={['title']}
      orderBy={{ column: 'display_order', ascending: true }}
      rowLabel="item"
      columns={[
        { key: 'icon', label: 'Icon', render: (r) => <span className="text-ink-white text-xs">{r.icon || '—'}</span> },
        { key: 'title', label: 'Title', render: (r) => <span className="text-ink-white">{r.title}</span> },
        { key: 'description', label: 'Description', render: (r) => <span className="text-ink-dim line-clamp-1">{r.description}</span> },
        { key: 'status', label: 'Status' },
        { key: 'display_order', label: 'Order', width: 'w-20' },
      ]}
      formFields={[
        { name: 'icon', label: 'Icon (Lucide name)', type: 'select', options: [{ value: '', label: 'None' }, ...ICON_OPTIONS] },
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
        { name: 'display_order', label: 'Display Order', type: 'number', required: true, min: 0 },
      ]}
      defaultValues={{ status: 'active', display_order: 0, icon: '' }}
    />
  );
}