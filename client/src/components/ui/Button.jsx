import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
    primary: 'bg-ink-white text-ink border border-ink-white hover:bg-ink hover:text-ink-white',
    secondary: 'bg-transparent text-ink-white border border-ink-line hover:border-ink-white',
    ghost: 'bg-transparent text-ink-text hover:text-ink-white',
    danger: 'bg-ink-card text-ink-white border border-ink-line hover:border-ink-white',
};

const sizes = {
    sm: 'h-9 px-4 text-[11px]',
    md: 'h-11 px-6 text-xs',
    lg: 'h-14 px-8 text-sm',
};

const Button = forwardRef(function Button(
    { children, variant = 'primary', size = 'md', loading, disabled, className = '', as: As = 'button', ...props },
    ref
) {
    return (
        <As
            ref={ref}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={`inline-flex items-center justify-center gap-2 uppercase tracking-nav font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {children}
        </As>
    );
});

export default Button;