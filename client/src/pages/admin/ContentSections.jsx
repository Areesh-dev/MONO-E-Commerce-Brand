import ResourceManager from '../../components/admin/ResourceManager';
import { STATUS_OPTIONS } from '../../lib/admin';

const POSITION_OPTIONS = [
  { value: 'right', label: 'Image on right' },
  { value: 'left', label: 'Image on left' },
];

export default function AdminContentSections() {
  return (
    <ResourceManager
      table="content_sections"
      title="Mission & Vision"
      description="Editorial content blocks shown on the homepage after popular products."
      searchKeys={['title', 'eyebrow', 'key']}
      orderBy={{ column: 'display_order', ascending: true }}
      rowLabel="section"
      columns={[
        {
          key: 'image_url', label: '', width: 'w-16',
          render: (r) => r.image_url
            ? <img src={r.image_url} alt="" className="w-10 h-10 object-cover border border-ink-line" />
            : <div className="w-10 h-10 bg-ink-surface border border-ink-line" />,
        },
        {
          key: 'eyebrow', label: 'Eyebrow',
          render: (r) => <span className="text-ink-white">{r.eyebrow || '—'}</span>,
        },
        {
          key: 'title', label: 'Title',
          render: (r) => <span className="text-ink-dim line-clamp-1 whitespace-pre-line">{r.title}</span>,
        },
        {
          key: 'image_position', label: 'Image', width: 'w-24',
          render: (r) => (
            <span className="text-[10px] uppercase tracking-editorial text-ink-dim">
              {r.image_position}
            </span>
          ),
        },
        { key: 'status', label: 'Status', width: 'w-20' },
        { key: 'display_order', label: 'Order', width: 'w-16' },
      ]}
      formFields={[
        {
          name: 'eyebrow',
          label: 'Eyebrow (auto-fills key)',
          type: 'text',
          placeholder: 'Our Mission',
          slugFrom: 'key',
        },
        {
          name: 'key',
          label: 'Key (unique, lowercase)',
          type: 'text',
          required: true,
          placeholder: 'mission',
        },
        {
          name: 'title',
          label: 'Title (use ↵ for line breaks)',
          type: 'textarea',
          rows: 3,
          required: true,
          placeholder: 'Crafted with intention.\nWorn with confidence.',
        },
        {
          name: 'content',
          label: 'Content',
          type: 'textarea',
          rows: 6,
        },
        {
          name: 'image_url',
          label: 'Image',
          type: 'image',
          bucket: 'hero-images',
        },
        {
          name: 'image_position',
          label: 'Image Position',
          type: 'select',
          options: POSITION_OPTIONS,
          required: true,
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: STATUS_OPTIONS,
          required: true,
        },
        {
          name: 'display_order',
          label: 'Display Order',
          type: 'number',
          required: true,
          min: 0,
        },
      ]}
      defaultValues={{
        status: 'active',
        display_order: 0,
        image_position: 'right',
        eyebrow: '',
        key: '',
      }}
    />
  );
}