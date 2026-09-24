import ResourceManager from '../../components/admin/ResourceManager';
import { STATUS_OPTIONS, slugify } from '../../lib/admin';

export default function AdminCategories() {
  return (
    <ResourceManager
      table="categories"
      title="Categories"
      description="Organize your catalog."
      searchKeys={['name', 'slug']}
      orderBy={{ column: 'display_order', ascending: true }}
      rowLabel="category"
      columns={[
        { key: 'image_url', label: '', width: 'w-16', render: (r) => r.image_url
          ? <img src={r.image_url} alt="" className="w-10 h-10 object-cover border border-ink-line" />
          : <div className="w-10 h-10 bg-ink-surface border border-ink-line" /> },
        { key: 'name', label: 'Name', render: (r) => <span className="text-ink-white">{r.name}</span> },
        { key: 'slug', label: 'Slug', render: (r) => <span className="text-ink-dim">{r.slug}</span> },
        { key: 'status', label: 'Status' },
        { key: 'display_order', label: 'Order', width: 'w-20' },
      ]}
      formFields={[
        { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Hoodies', slugFrom: 'slug' },
        { name: 'slug', label: 'Slug', type: 'slug', required: true, placeholder: 'hoodies' },
        { name: 'image_url', label: 'Image', type: 'image', bucket: 'category-images' },
        { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
        { name: 'display_order', label: 'Display Order', type: 'number', required: true, min: 0 },
      ]}
      defaultValues={{ status: 'active', display_order: 0 }}
    />
  );
}