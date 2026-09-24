import { forwardRef, useId } from 'react';

const Select = forwardRef(function Select({ label, error, options = [], className = '', id, ...props }, ref) {
  const reactId = useId();
  const inputId = id || props.name || reactId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block mb-2 text-[10px] uppercase tracking-nav text-ink-dim">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        className={`w-full h-11 px-4 bg-ink-surface border border-ink-line text-ink-white text-sm focus:border-ink-text focus:outline-none transition-colors ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink-card">{o.label}</option>
        ))}
      </select>
      {error && <p id={errorId} className="mt-1.5 text-xs text-ink-soft">{error}</p>}
    </div>
  );
});

export default Select;