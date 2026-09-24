import { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import Container from '../ui/Container';
import AsyncBoundary from '../ui/AsyncBoundary';
import SectionHeading from '../ui/SectionHeading';
import { PageSectionSkeleton } from '../skeletons';
import { fetchWhyChooseUs } from '../../lib/api';

function DynamicIcon({ name, className }) {
    const Icon = name && Icons[name] ? Icons[name] : Icons.Sparkles;
    return <Icon className={className} strokeWidth={1.2} aria-hidden="true" />;
}

export default function WhyChooseUs() {
    const [state, setState] = useState({ loading: true, error: null, data: [] });

    useEffect(() => {
        let active = true;
        setState({ loading: true, error: null, data: [] });
        fetchWhyChooseUs()
            .then((data) => active && setState({ loading: false, error: null, data }))
            .catch(() => active && setState({ loading: false, error: null, data: [] }));
        return () => { active = false; };
    }, []);

    const isEmpty = !state.loading && !state.error && state.data.length === 0;
    if (isEmpty) return null;

    return (
        <AsyncBoundary
            loading={state.loading}
            error={state.error}
            isEmpty={false}
            skeleton={<PageSectionSkeleton showGrid gridColumns={4} />}
        >
            <section className="py-16 sm:py-24 border-t border-ink-line bg-ink">
                <Container>
                    <div className="flex items-end justify-between gap-4 mb-10 sm:mb-12">
                        <SectionHeading eyebrow="Promise" title="Why Choose Us" />

                    </div>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 list-none">
                        {state.data.map((item, i) => {
                            const number = String(i + 1).padStart(2, '0');
                            return (
                                <li
                                    key={item.id}
                                    className="group relative pt-6 border-t border-ink-line hover:border-ink-white transition-colors duration-500"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-8">
                                        <span className="text-[10px] uppercase tracking-editorial text-ink-muted tabular-nums">
                                            {number}
                                        </span>
                                        <div className="w-11 h-11 flex items-center justify-center border border-ink-line bg-ink-card group-hover:border-ink-soft transition-colors duration-500">
                                            <DynamicIcon
                                                name={item.icon}
                                                className="w-5 h-5 text-ink-text group-hover:text-ink-white transition-colors duration-500"
                                            />
                                        </div>
                                    </div>

                                    <h3 className="heading-editorial text-lg sm:text-xl text-ink-white leading-tight">
                                        {item.title}
                                    </h3>

                                    {item.description && (
                                        <p className="mt-4 text-sm text-ink-dim leading-relaxed">
                                            {item.description}
                                        </p>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </Container>
            </section>
        </AsyncBoundary>
    );
}