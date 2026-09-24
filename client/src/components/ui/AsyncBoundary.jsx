import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

export default function AsyncBoundary({
  loading,
  error,
  isEmpty,
  skeleton,
  empty,
  onRetry,
  errorTitle,
  errorDescription,
  children,
}) {
  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-busy="true" aria-label="Loading content">
        {skeleton}
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title={errorTitle || 'Something went wrong'}
        description={errorDescription}
        onRetry={onRetry}
      />
    );
  }

  if (isEmpty) {
    return empty || <EmptyState />;
  }

  return children;
}