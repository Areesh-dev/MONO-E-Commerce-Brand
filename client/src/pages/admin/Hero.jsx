import ResourceManager from '../../components/admin/ResourceManager';
import { STATUS_OPTIONS } from '../../lib/admin';

export default function AdminHero() {
  return (
    <ResourceManager
      table="hero_slides"
      title="Hero Slider"
      description="Homepage hero carousel. Display order controls sequencing."
      searchKeys={['title']}
      orderBy={{ column: 'display_order', ascending: true }}
      rowLabel="slide"
      columns={[
        { key: 'image_url', label: '', width: 'w-20', render: (r) => r.image_url
          ? <img src={r.image_url} alt="" className="w-14 h-10 object-cover border border-ink-line" />
          : <div className="w-14 h-10 bg-ink-surface border border-ink-line" /> },
        { key: 'title', label: 'Title', render: (r) => <span className="text-ink-white whitespace-pre-line">{r.title}</span> },
        { key: 'button_text', label: 'CTA' },
        { key: 'status', label: 'Status' },
        { key: 'display_order', label: 'Order', width: 'w-20' },
      ]}
      formFields={[
        { name: 'title', label: 'Title (use \\n for line breaks)', type: 'textarea', rows: 3, required: true },
        { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { name: 'image_url', label: 'Background Image', type: 'image', bucket: 'hero-images', required: true },
        { name: 'button_text', label: 'Button Text', type: 'text' },
        { name: 'button_url', label: 'Button URL', type: 'text', placeholder: '/products' },
        { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
        { name: 'display_order', label: 'Display Order', type: 'number', required: true, min: 0 },
      ]}
      defaultValues={{ status: 'active', display_order: 0 }}
    />
  );
}