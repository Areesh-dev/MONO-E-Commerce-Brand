import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { fetchOrderTimeline, buildTimeline } from '../../lib/orderTimeline';
import OrderTimelineSkeleton from '../skeletons/OrderTimelineSkeleton';

const fmtDateTime = (iso) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

function StepDot({ state }) {
  if (state === 'completed') {
    return (
      <span
        className="relative z-10 flex-shrink-0 w-3 h-3 bg-ink-white flex items-center justify-center"
        aria-hidden="true"
      >
        <Check className="w-2 h-2 text-ink" strokeWidth={3.5} />
      </span>
    );
  }
  if (state === 'current') {
    return (
      <span
        className="relative z-10 flex-shrink-0 w-3 h-3 border-2 border-ink-white bg-ink"
        aria-hidden="true"
      >
        <span className="absolute inset-0 m-auto w-1 h-1 bg-ink-white" />
      </span>
    );
  }
  if (state === 'cancelled') {
    return (
      <span
        className="relative z-10 flex-shrink-0 w-3 h-3 border border-ink-soft bg-ink"
        aria-hidden="true"
      >
        <span className="absolute inset-0 m-auto w-2 h-px bg-ink-soft rotate-45" />
        <span className="absolute inset-0 m-auto w-2 h-px bg-ink-soft -rotate-45" />
      </span>
    );
  }
  return (
    <span
      className="relative z-10 flex-shrink-0 w-3 h-3 border border-ink-line bg-ink"
      aria-hidden="true"
    />
  );
}

function Step({ step, isLast, isAdmin }) {
  const isUpcoming = step.state === 'upcoming';
  const isCancelled = step.state === 'cancelled';
  const isCurrent = step.state === 'current';

  return (
    <li
      className="relative flex gap-4 pb-6 last:pb-0"
      aria-current={isCurrent ? 'step' : undefined}
    >
      <div className="flex flex-col items-center flex-shrink-0">
        <StepDot state={step.state} />
        {!isLast && (
          <span
            className={`w-px flex-1 mt-1 ${
              step.state === 'completed' ? 'bg-ink-white' : 'bg-ink-line'
            }`}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex-1 min-w-0 pb-2">
        <div className="flex items-baseline justify-between gap-3">
          <p
            className={`text-[11px] uppercase tracking-nav ${
              isUpcoming ? 'text-ink-muted' : isCancelled ? 'text-ink-soft line-through' : 'text-ink-white'
            }`}
          >
            {step.label}
          </p>
          {step.at && !isUpcoming && (
            <span className="text-[10px] uppercase tracking-editorial text-ink-dim whitespace-nowrap">
              {fmtDateTime(step.at)}
            </span>
          )}
        </div>

        {isAdmin && step.note && (
          <p className="mt-1.5 text-xs text-ink-dim leading-relaxed">{step.note}</p>
        )}

        {isCurrent && !step.note && (
          <p className="mt-1.5 text-[10px] uppercase tracking-editorial text-ink-muted">
            In progress
          </p>
        )}
      </div>
    </li>
  );
}

export default function OrderTimeline({ orderId, currentStatus, isAdmin = false }) {
  const [state, setState] = useState({ loading: true, error: null, steps: [] });

  useEffect(() => {
    let active = true;
    setState({ loading: true, error: null, steps: [] });

    fetchOrderTimeline(orderId)
      .then((history) => {
        if (!active) return;
        setState({
          loading: false,
          error: null,
          steps: buildTimeline(currentStatus, history),
        });
      })
      .catch(() => {
        if (!active) return;
        setState({
          loading: false,
          error: null,
          steps: buildTimeline(currentStatus, []),
        });
      });

    return () => { active = false; };
  }, [orderId, currentStatus]);

  if (state.loading) return <OrderTimelineSkeleton steps={5} />;
  if (state.steps.length === 0) return null;

  return (
    <ol className="relative list-none">
      {state.steps.map((step, i) => (
        <Step
          key={step.key}
          step={step}
          isLast={i === state.steps.length - 1}
          isAdmin={isAdmin}
        />
      ))}
    </ol>
  );
}