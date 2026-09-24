import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle className="w-10 h-10 text-ink-soft mb-4" strokeWidth={1.2} />
      <h3 className="text-sm uppercase tracking-nav text-ink-white">{title}</h3>
      {description && <p className="mt-2 text-sm text-ink-dim max-w-sm">{description}</p>}
      {onRetry && <Button variant="secondary" size="sm" className="mt-6" onClick={onRetry}>Retry</Button>}
    </div>
  );
}