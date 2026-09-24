export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
  as: Heading = 'h2',
  showRule = false,
  size = 'default',
}) {
  const alignCls =
    align === 'center'
      ? 'text-center items-center'
      : 'text-left items-start';

  const titleSizes = {
    sm: 'text-xl sm:text-2xl md:text-3xl',
    default: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
    lg: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  };

  return (
    <div className={`flex flex-col ${alignCls} ${className}`}>
      {eyebrow && (
        <div
          className={`flex items-center gap-3 mb-4 ${
            align === 'center' ? 'justify-center' : 'justify-start'
          }`}
        >
          <span className="block w-6 h-px bg-ink-line" aria-hidden="true" />
          <span className="text-[10px] uppercase tracking-editorial text-ink-dim">
            {eyebrow}
          </span>
          {align === 'center' && (
            <span className="block w-6 h-px bg-ink-line" aria-hidden="true" />
          )}
        </div>
      )}

      {title && (
        <Heading
          className={`heading-editorial ${titleSizes[size]} text-ink-white max-w-3xl ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {title}
        </Heading>
      )}

      {showRule && (
        <div
          className={`mt-6 h-px w-12 bg-ink-white/30 ${
            align === 'center' ? 'mx-auto' : ''
          }`}
          aria-hidden="true"
        />
      )}

      {description && (
        <p
          className={`mt-5 text-sm text-ink-dim leading-relaxed max-w-2xl ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}