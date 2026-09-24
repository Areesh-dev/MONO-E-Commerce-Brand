import { useEffect, useMemo, useState } from 'react';
import { Check, X, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import Select from '../../components/ui/Select';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import StarRating from '../../components/reviews/StarRating';
import { ReviewGridSkeleton } from '../../components/skeletons';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { listTable, updateRow, deleteRow, REVIEW_STATUS_OPTIONS } from '../../lib/admin';

const fmtDate = (iso) =>
    new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));

const SELECT = 'id,rating,review_text,status,created_at,product_id,user_id, profiles(name,email), products(name,slug)';

export default function AdminReviews() {
    const [state, setState] = useState({ loading: true, error: null, data: [] });
    const [statusFilter, setStatusFilter] = useState('pending');
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = () => {
        setState({ loading: true, error: null, data: [] });
        listTable('reviews', { select: SELECT, orderBy: { column: 'created_at', ascending: false } })
            .then((data) => setState({ loading: false, error: null, data }))
            .catch((e) => setState({ loading: false, error: e, data: [] }));
    };

    useEffect(load, []);

    const filtered = useMemo(() => {
        let rows = state.data;
        if (statusFilter) rows = rows.filter((r) => r.status === statusFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            rows = rows.filter((r) =>
                r.review_text?.toLowerCase().includes(q) ||
                r.profiles?.name?.toLowerCase().includes(q) ||
                r.products?.name?.toLowerCase().includes(q)
            );
        }
        return rows;
    }, [state.data, statusFilter, search]);

    const setStatus = async (review, status) => {
        try {
            await updateRow('reviews', review.id, { status });
            setState((s) => ({ ...s, data: s.data.map((r) => r.id === review.id ? { ...r, status } : r) }));
            toast.success(`Review ${status}`);
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleDelete = async () => {
        setBusy(true);
        try {
            await deleteRow('reviews', deleting.id);
            setState((s) => ({ ...s, data: s.data.filter((r) => r.id !== deleting.id) }));
            toast.success('Review deleted');
            setDeleting(null);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="heading-editorial text-2xl text-ink-white">Reviews</h1>
                    <p className="mt-1 text-xs text-ink-dim">{filtered.length} shown · {state.data.length} total</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-dim" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews…"
                            className="h-9 pl-9 pr-3 bg-ink-surface border border-ink-line text-ink-white text-xs placeholder:text-ink-muted focus:border-ink-text focus:outline-none w-56" />
                    </div>
                    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        options={[{ value: '', label: 'All statuses' }, ...REVIEW_STATUS_OPTIONS]} className="min-w-[160px]" />
                </div>
            </div>

            {state.loading ? (
                <div className="space-y-4" aria-busy="true">
                    <ReviewGridSkeleton count={4} />
                </div>
            ) : state.error ? (
                <ErrorState onRetry={load} />
            ) : filtered.length === 0 ? (
                <EmptyState title="No reviews" description={statusFilter ? `No ${statusFilter} reviews.` : 'Nothing here yet.'} />
            ) : (
                <div className="space-y-4">
                    {filtered.map((r) => (
                        <article key={r.id} className="border border-ink-line bg-ink-card p-5">
                            <header className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <p className="text-xs text-ink-white uppercase tracking-nav">{r.profiles?.name || 'Anonymous'}</p>
                                        <StarRating value={r.rating} />
                                    </div>
                                    <p className="text-[10px] uppercase tracking-editorial text-ink-dim mt-1">
                                        {r.profiles?.email} · {fmtDate(r.created_at)}
                                    </p>
                                    {r.products?.name && (
                                        <p className="text-[10px] uppercase tracking-editorial text-ink-dim mt-1">
                                            Product: <span className="text-ink-text">{r.products.name}</span>
                                        </p>
                                    )}
                                </div>
                                <span className={`text-[9px] uppercase tracking-editorial px-2 py-1 border ${r.status === 'approved' ? 'border-ink-white text-ink-white'
                                        : r.status === 'declined' ? 'border-ink-line text-ink-muted line-through'
                                            : 'border-ink-line text-ink-dim'
                                    }`}>
                                    {r.status}
                                </span>
                            </header>

                            <p className="text-sm text-ink-text leading-relaxed">{r.review_text}</p>

                            <div className="mt-5 pt-4 border-t border-ink-line flex items-center justify-end gap-2">
                                {r.status !== 'approved' && (
                                    <button onClick={() => setStatus(r, 'approved')}
                                        className="inline-flex items-center gap-2 h-8 px-3 border border-ink-line text-[10px] uppercase tracking-editorial text-ink-white hover:border-ink-white">
                                        <Check className="w-3.5 h-3.5" /> Approve
                                    </button>
                                )}
                                {r.status !== 'declined' && (
                                    <button onClick={() => setStatus(r, 'declined')}
                                        className="inline-flex items-center gap-2 h-8 px-3 border border-ink-line text-[10px] uppercase tracking-editorial text-ink-dim hover:text-ink-white">
                                        <X className="w-3.5 h-3.5" /> Decline
                                    </button>
                                )}
                                <button onClick={() => setDeleting(r)}
                                    className="inline-flex items-center gap-2 h-8 px-3 border border-ink-line text-[10px] uppercase tracking-editorial text-ink-dim hover:text-ink-white">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                loading={busy}
                title="Delete review"
                message="This review will be permanently removed."
            />
        </div>
    );
}