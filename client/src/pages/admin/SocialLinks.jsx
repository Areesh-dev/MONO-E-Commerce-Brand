import ResourceManager from '../../components/admin/ResourceManager';
import { STATUS_OPTIONS } from '../../lib/admin';

const ICON_OPTIONS = ['Instagram', 'Twitter', 'Youtube', 'Facebook', 'Linkedin', 'Music2', 'Github', 'Globe', 'Mail']
  .map((n) => ({ value: n, label: n }));

export default function AdminSocialLinks() {
  return (
    <ResourceManager
      table="social_links"
      title="Social Links"
      description="Rendered in the site footer."
      searchKeys={['platform', 'url']}
      orderBy={{ column: 'display_order', ascending: true }}
      rowLabel="link"
      columns={[
        { key: 'platform', label: 'Platform', render: (r) => <span className="text-ink-white">{r.platform}</span> },
        { key: 'url', label: 'URL', render: (r) => <a href={r.url} target="_blank" rel="noreferrer" className="text-ink-dim hover:text-ink-white truncate inline-block max-w-xs">{r.url}</a> },
        { key: 'icon', label: 'Icon' },
        { key: 'status', label: 'Status' },
        { key: 'display_order', label: 'Order', width: 'w-20' },
      ]}
      formFields={[
        { name: 'platform', label: 'Platform', type: 'text', required: true, placeholder: 'Instagram' },
        { name: 'url', label: 'URL', type: 'text', required: true, placeholder: 'https://instagram.com/…' },
        { name: 'icon', label: 'Icon (Lucide name)', type: 'select', options: [{ value: '', label: 'None' }, ...ICON_OPTIONS] },
        { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
        { name: 'display_order', label: 'Display Order', type: 'number', required: true, min: 0 },
      ]}
      defaultValues={{ status: 'active', display_order: 0, icon: '' }}
    />
  );
}