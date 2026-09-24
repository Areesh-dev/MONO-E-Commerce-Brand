import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { brand } from '../../config/brand';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return reduced;
}

function SweepLine({ width = 'w-40' }) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className={`relative h-px ${width} overflow-hidden bg-ink-line`}>
      {reduced ? (
        <div className="absolute inset-y-0 left-0 w-1/2 bg-ink-white" />
      ) : (
        <motion.div
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-ink-white to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
        />
      )}
    </div>
  );
}

function Monogram() {
  const reduced = usePrefersReducedMotion();
  const letters = brand.name.split('');
  return (
    <span className="inline-flex" aria-hidden="true">
      {letters.map((ch, i) => (
        <motion.span
          key={i}
          className="heading-editorial text-3xl sm:text-4xl tracking-editorial text-ink-white"
          animate={reduced ? { opacity: 1 } : { opacity: [0.15, 1, 0.15] }}
          transition={
            reduced
              ? {}
              : { duration: 2.2, repeat: Infinity, delay: i * 0.14, ease: 'easeInOut' }
          }
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

function PulseDot() {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.span
      className="inline-block w-1 h-1 bg-ink-white"
      animate={reduced ? { opacity: 1 } : { opacity: [0.2, 1, 0.2] }}
      transition={reduced ? {} : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    />
  );
}

export default function LoadingSpinner({
  label = 'Loading',
  variant = 'line',
  className = '',
  hideLabel = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 py-10 ${className}`}
      role="status"
      aria-live="polite"
    >
      {variant === 'line' && <SweepLine />}
      {variant === 'monogram' && <Monogram />}

      {!hideLabel && (
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-editorial text-ink-dim">
          <PulseDot />
          {label}
        </span>
      )}

      <span className="sr-only">{label}</span>
    </div>
  );
}

export function FullPageLoader({ label = 'Loading' }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-ink flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="status"
      aria-live="polite"
    >
      <Monogram />

      <div className="mt-8 relative h-px w-48 overflow-hidden bg-ink-line">
        {reduced ? (
          <div className="absolute inset-y-0 left-0 w-1/2 bg-ink-white" />
        ) : (
          <motion.div
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-ink-white to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
          />
        )}
      </div>

      <p className="mt-8 text-[10px] uppercase tracking-editorial text-ink-muted">
        {brand.tagline || label}
      </p>

      <span className="sr-only">{label}</span>
    </motion.div>
  );
}