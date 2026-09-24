import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import FaqAccordion from '../components/home/FaqAccordion';
import { fetchFaqs } from '../lib/api';
import Seo from '../components/seo/Seo';


export default function FAQ() {
    const [state, setState] = useState({ loading: true, data: [] });

    useEffect(() => {
        let active = true;
        fetchFaqs()
            .then((data) => active && setState({ loading: false, data }))
            .catch(() => active && setState({ loading: false, data: [] }));
        return () => { active = false; };
    }, []);

    return (
        <>
            <Seo
                title="FAQ"
                description="Answers about orders, shipping and returns."
                url="/faq"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: state.data.map((q) => ({
                        '@type': 'Question',
                        name: q.question,
                        acceptedAnswer: { '@type': 'Answer', text: q.answer },
                    })),
                }}
            />
            <Container size="narrow" className="py-16">
                <SectionHeading
                    eyebrow="Support"
                    title="Frequently Asked"
                    description="Everything you need to know about orders, shipping and returns."
                    className="mb-12"
                />

                {state.loading && (
                    <div className="space-y-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="border-b border-ink-line pb-6">
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        ))}
                    </div>
                )}

                {!state.loading && state.data.length === 0 && (
                    <EmptyState title="No FAQs yet" description="Check back soon." />
                )}

                {!state.loading && state.data.length > 0 && <FaqAccordion items={state.data} />}
            </Container>
        </>
    );
}