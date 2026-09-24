import ResourceManager from '../../components/admin/ResourceManager';
import { STATUS_OPTIONS } from '../../lib/admin';


export default function AdminFaqs() {
  return (
    <ResourceManager
      table="faqs"
      title="FAQs"
      description="Support content shown on the homepage and /faq."
      searchKeys={['question']}
      orderBy={{ column: 'display_order', ascending: true }}
      rowLabel="FAQ"
      columns={[
        { key: 'question', label: 'Question', render: (r) => <span className="text-ink-white">{r.question}</span> },
        { key: 'answer', label: 'Answer', render: (r) => <span className="text-ink-dim line-clamp-1">{r.answer}</span> },
        { key: 'status', label: 'Status' },
        { key: 'display_order', label: 'Order', width: 'w-20' },
      ]}
      formFields={[
        { name: 'question', label: 'Question', type: 'text', required: true },
        { name: 'answer', label: 'Answer', type: 'textarea', rows: 4, required: true },
        { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
        { name: 'display_order', label: 'Display Order', type: 'number', required: true, min: 0 },
      ]}
      defaultValues={{ status: 'active', display_order: 0 }}
    />
  );
}