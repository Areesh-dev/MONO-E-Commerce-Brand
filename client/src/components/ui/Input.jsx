import { forwardRef, useId } from 'react';

const Input = forwardRef(function Input(
  { label, error, className = '', id, endAdornment, ...props },
  ref,
) {
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

      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          className={`w-full h-11 px-4 bg-ink-surface border border-ink-line text-ink-white placeholder:text-ink-muted text-sm focus:border-ink-text focus:outline-none transition-colors ${
            endAdornment ? 'pr-11' : ''
          } ${error ? 'border-ink-soft' : ''} ${className}`}
          {...props}
        />

        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
            {endAdornment}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-ink-soft">{error}</p>
      )}
    </div>
  );
});

export default Input;