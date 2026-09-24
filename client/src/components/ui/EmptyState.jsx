import { PackageOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = PackageOpen, title = 'Nothing here', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon className="w-10 h-10 text-ink-line mb-4" strokeWidth={1.2} />
      <h3 className="text-sm uppercase tracking-nav text-ink-white">{title}</h3>
      {description && <p className="mt-2 text-sm text-ink-dim max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}