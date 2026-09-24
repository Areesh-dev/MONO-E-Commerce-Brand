import ResourceManager from '../../components/admin/ResourceManager';
import { STATUS_OPTIONS } from '../../lib/admin';

export default function AdminBrands() {
  return (
    <ResourceManager
      table="brands"
      title="Brands"
      description="Logo strip shown on the homepage."
      searchKeys={['name']}
      orderBy={{ column: 'display_order', ascending: true }}
      rowLabel="brand"
      columns={[
        { key: 'logo_url', label: 'Logo', width: 'w-20', render: (r) => r.logo_url
          ? <img src={r.logo_url} alt="" className="h-8 w-auto object-contain grayscale border border-ink-line p-1" />
          : <div className="w-14 h-8 bg-ink-surface border border-ink-line" /> },
        { key: 'name', label: 'Name', render: (r) => <span className="text-ink-white">{r.name}</span> },
        { key: 'status', label: 'Status' },
        { key: 'display_order', label: 'Order', width: 'w-20' },
      ]}
      formFields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'logo_url', label: 'Logo', type: 'image', bucket: 'brand-images' },
        { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
        { name: 'display_order', label: 'Display Order', type: 'number', required: true, min: 0 },
      ]}
      defaultValues={{ status: 'active', display_order: 0 }}
    />
  );
}