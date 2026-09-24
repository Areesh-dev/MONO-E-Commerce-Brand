import { Eye, EyeOff } from 'lucide-react';

// Eye button that sits inside a password input (via the input's endAdornment)
export default function PasswordToggle({ visible, onToggle, className = '' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      // Keep focus (and the cursor position) in the input when clicking the eye
      onMouseDown={(e) => e.preventDefault()}
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
      title={visible ? 'Hide password' : 'Show password'}
      className={`flex h-8 w-8 items-center justify-center text-ink-dim transition-colors hover:text-ink-white focus-visible:text-ink-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink-white ${className}`}
    >
      {visible ? (
        <EyeOff className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      )}
    </button>
  );
}