import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { brand } from '../../config/brand';
import Logo from '../ui/Logo';


export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  crosslink,
}) {
  const titleLines = title.split('\n');

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <header className="border-b border-ink-line">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="h-14 sm:h-16 flex items-center justify-between">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-editorial text-ink-dim hover:text-ink-white transition-colors"
            >
              <ArrowLeft className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
              <span className="hidden sm:inline">Back to store</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <Logo size="md" />

            <span className="text-[10px] uppercase tracking-editorial text-ink-muted tabular-nums hidden sm:block">
              EST. {new Date().getFullYear()}
            </span>
            <span className="sm:hidden text-[10px] text-ink-muted">·</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

            <div className="lg:col-span-7 lg:pt-4">
              <div className="flex items-center gap-3 mb-6 lg:mb-10">
                <span className="block w-6 h-px bg-ink-line" aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-editorial text-ink-dim">
                  {eyebrow}
                </span>
              </div>

              <h1 className="heading-editorial text-[clamp(3rem,10vw,7rem)] leading-[0.85] text-ink-white">
                {titleLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h1>

              {subtitle && (
                <p className="mt-8 lg:mt-10 text-sm sm:text-base text-ink-dim leading-relaxed max-w-md">
                  {subtitle}
                </p>
              )}

              <div className="hidden lg:flex items-center gap-4 mt-12 lg:mt-20" aria-hidden="true">
                <span className="block w-12 h-px bg-ink-line" />
                <span className="block w-2 h-2 bg-ink-white" />
                <span className="block w-12 h-px bg-ink-line" />
              </div>
            </div>

            <div className="lg:col-span-5 lg:border-l lg:border-ink-line lg:pl-16">
              {children}

              {crosslink && (
                <div className="mt-12 pt-8 border-t border-ink-line">
                  {crosslink}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-ink-line">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="h-14 flex items-center justify-between text-[10px] uppercase tracking-editorial text-ink-muted">
            <div className="flex items-center gap-5">
              <Link to="/privacy-policy" className="hover:text-ink-white transition-colors">
                Privacy
              </Link>
              <span className="w-px h-3 bg-ink-line" aria-hidden="true" />
              <Link to="/terms" className="hover:text-ink-white transition-colors">
                Terms
              </Link>
            </div>
            <span>© {new Date().getFullYear()} {brand.name}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


export function Field({
  id,
  number,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  error,
  registration,
  rightSlot,
  endAdornment,
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label
          htmlFor={id}
          className="flex items-center gap-2.5 text-[10px] uppercase tracking-editorial"
        >
          <span className="text-ink-muted tabular-nums">{number}</span>
          <span className="text-ink-white">{label}</span>
        </label>
        {rightSlot}
      </div>

      <div className="relative">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          {...registration}
          className={`w-full h-12 bg-transparent border-0 border-b text-ink-white placeholder:text-ink-muted text-base sm:text-[15px] focus:outline-none transition-colors duration-200 ${
            endAdornment ? 'pr-10' : ''
          } ${
            error
              ? 'border-ink-soft focus:border-ink-white'
              : 'border-ink-line focus:border-ink-white'
          }`}
        />

        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-2 text-[11px] uppercase tracking-editorial text-ink-soft">
          {error}
        </p>
      )}
    </div>
  );
}


export function EditorialSubmit({ children, loading, disabled, ...rest }) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className="group w-full h-14 bg-ink-white text-ink flex items-center justify-between px-6 sm:px-7 text-[11px] uppercase tracking-editorial font-medium hover:bg-transparent hover:text-ink-white border border-ink-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      {...rest}
    >
      <span>{loading ? 'Please wait…' : children}</span>
      <ArrowUpRight
        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </button>
  );
}