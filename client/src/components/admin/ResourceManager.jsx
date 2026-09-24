import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import ErrorState from '../ui/ErrorState';
import ResourceForm from './ResourceForm';
import { TableSkeleton } from '../skeletons';
import { useAdminResource } from '../../hooks/useAdminResource';

export default function ResourceManager({
    table, select, orderBy, searchKeys = [], filters,
    title, description, columns, formFields, defaultValues, rowLabel = 'row',
    mapInitialValues, onSaved,
}) {
    const { data, total, loading, error, search, setSearch, refresh, create, update, remove } =
        useAdminResource({ table, select, orderBy, searchKeys, filters });

    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [busy, setBusy] = useState(false);

    const isNew = editing === 'new';

    const handleSubmit = async (values) => {
        try {
            const allowedKeys = new Set(formFields.map((f) => f.name));
            const sizes = values.sizes;
            const clean = {};
            const dateFields = formFields.filter((f) => f.type === 'date').map((f) => f.name);
            for (const k of dateFields) {
                if (clean[k]) {
                    try { clean[k] = new Date(clean[k]).toISOString(); }
                    catch { clean[k] = null; }
                } else {
                    clean[k] = null;
                }
            }
            for (const [k, v] of Object.entries(values)) {
                if (allowedKeys.has(k) && k !== 'sizes') clean[k] = v;
            }
            if ('category_id' in clean && clean.category_id === '') clean.category_id = null;

            const savedRow = isNew ? await create(clean) : await update(editing.id, clean);


            const rowId = savedRow?.id ?? (isNew ? null : editing.id);

            if (Array.isArray(sizes) && rowId) {
                const { saveProductSizes } = await import('../../lib/sizes');
                await saveProductSizes(rowId, sizes);
            }

            toast.success(`${rowLabel} ${isNew ? 'created' : 'updated'}`);

            await Promise.all([
                refresh?.(),
                onSaved?.(rowId),
            ]);

            setEditing(null);
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleDelete = async () => {
        setBusy(true);
        try {
            await remove(deleting.id);
            toast.success(`${rowLabel} deleted`);
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
                    <h1 className="heading-editorial text-2xl text-ink-white">{title}</h1>
                    {description && <p className="mt-1 text-xs text-ink-dim">{description}</p>}
                </div>
                <div className="flex items-center gap-3">
                    {searchKeys.length > 0 && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-dim" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search…"
                                className="h-9 pl-9 pr-3 bg-ink-surface border border-ink-line text-ink-white text-xs placeholder:text-ink-muted focus:border-ink-text focus:outline-none w-56"
                            />
                        </div>
                    )}
                    <Button size="sm" onClick={() => setEditing('new')}>
                        <Plus className="w-3.5 h-3.5" /> New
                    </Button>
                </div>
            </div>

            <div className="border border-ink-line bg-ink-card" aria-busy={loading}>
                {loading ? (
                    <TableSkeleton rows={6} columns={columns.length + 1} />
                ) : error ? (
                    <ErrorState onRetry={refresh} />
                ) : data.length === 0 ? (
                    <EmptyState
                        title={total === 0 ? `No ${rowLabel}s yet` : 'No matches'}
                        description={total === 0 ? `Create your first ${rowLabel}.` : 'Try another search term.'}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-ink-line">
                                    {columns.map((c) => (
                                        <th key={c.key} className={`px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim ${c.width || ''}`}>
                                            {c.label}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 w-24 text-[10px] uppercase tracking-editorial text-ink-dim text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row) => (
                                    <tr key={row.id} className="border-b border-ink-line last:border-b-0 hover:bg-ink-surface">
                                        {columns.map((c) => (
                                            <td key={c.key} className={`px-4 py-3 text-xs text-ink-text ${c.width || ''}`}>
                                                {c.render ? c.render(row) : String(row[c.key] ?? '—')}
                                            </td>
                                        ))}
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <button onClick={() => setEditing(row)} aria-label="Edit"
                                                className="text-ink-dim hover:text-ink-white mr-3">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => setDeleting(row)} aria-label="Delete"
                                                className="text-ink-dim hover:text-ink-white">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                open={!!editing}
                onClose={() => setEditing(null)}
                title={isNew ? `New ${rowLabel}` : `Edit ${rowLabel}`}
                size="lg"
            >
                {editing && (
                    <ResourceForm
                        key={isNew ? 'new' : editing.id}
                        fields={formFields}
                        defaultValues={defaultValues}
                        initialValues={
                            isNew ? undefined : (mapInitialValues ? mapInitialValues(editing) : editing)
                        }
                        onSubmit={handleSubmit}
                        onCancel={() => setEditing(null)}
                        submitLabel={isNew ? 'Create' : 'Save'}
                    />
                )}
            </Modal>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                loading={busy}
                title={`Delete ${rowLabel}`}
                message="This action cannot be undone."
            />
        </div>
    );
}