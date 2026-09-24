import { useEffect, useState } from 'react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import AsyncBoundary from '../ui/AsyncBoundary';
import FaqAccordion from './FaqAccordion';
import { FaqSkeleton } from '../skeletons';
import { fetchFaqs } from '../../lib/api';

export default function FaqSection() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });

  useEffect(() => {
    let active = true;
    setState({ loading: true, error: null, data: [] });
    fetchFaqs()
      .then((data) => active && setState({ loading: false, error: null, data }))
      .catch(() => active && setState({ loading: false, error: null, data: [] }));
    return () => { active = false; };
  }, []);

  if (!state.loading && !state.error && state.data.length === 0) return null;

  return (
    <AsyncBoundary
      loading={state.loading}
      error={state.error}
      isEmpty={false}
      skeleton={
        <section className="py-20 border-t border-ink-line" aria-hidden="true">
          <Container size="narrow">
            <SectionHeading eyebrow="Support" title="Frequently Asked" align="center" className="mb-12" />
            <FaqSkeleton />
          </Container>
        </section>
      }
    >
      <section className="py-20 border-t border-ink-line">
        <Container size="narrow">
          <SectionHeading eyebrow="Support" title="Frequently Asked" align="center" className="mb-12" />
          <FaqAccordion items={state.data} />
        </Container>
      </section>
    </AsyncBoundary>
  );
}