import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { TableSkeleton } from '../../components/skeletons';
import EmptyState from '../../components/ui/EmptyState';
import { fetchAllSizes } from '../../lib/sizes';
import { createRow, updateRow, deleteRow } from '../../lib/admin';

export default function AdminSizes() {
  const [state, setState] = useState({ loading: true, data: [] });
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setState({ loading: true, data: [] });
    fetchAllSizes()
      .then((data) => setState({ loading: false, data }))
      .catch(() => setState({ loading: false, data: [] }));
  };

  useEffect(load, []);

  const handleSave = async (payload) => {
    setBusy(true);
    try {
      if (editing === 'new') {
        await createRow('sizes', {
          ...payload,
          slug: payload.slug || payload.name.toLowerCase().replace(/\s+/g, '-'),
        });
        toast.success('Size created');
      } else {
        await updateRow('sizes', editing.id, payload);
        toast.success('Size updated');
      }
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteRow('sizes', deleting.id);
      toast.success('Size deleted');
      setDeleting(null);
      load();
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
          <h1 className="heading-editorial text-2xl text-ink-white">Sizes</h1>
          <p className="mt-1 text-xs text-ink-dim">Manage product size options.</p>
        </div>
        <Button size="sm" onClick={() => setEditing('new')}>
          <Plus className="w-3.5 h-3.5" /> New Size
        </Button>
      </div>

      <div className="border border-ink-line bg-ink-card">
        {state.loading ? (
          <TableSkeleton rows={7} columns={5} />
        ) : state.data.length === 0 ? (
          <EmptyState title="No sizes yet" description="Add your first size." />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-ink-line">
                <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim">Name</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim">Slug</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim w-20">Order</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim w-24">Status</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {state.data.map((s) => (
                <tr key={s.id} className="border-b border-ink-line last:border-b-0 hover:bg-ink-surface">
                  <td className="px-4 py-3 text-xs text-ink-white">{s.name}</td>
                  <td className="px-4 py-3 text-xs text-ink-dim font-mono">{s.slug}</td>
                  <td className="px-4 py-3 text-xs text-ink-text tabular-nums">{s.display_order}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`text-[9px] uppercase tracking-editorial px-2 py-1 border ${
                      s.is_active ? 'border-ink-white text-ink-white' : 'border-ink-line text-ink-muted'
                    }`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(s)} className="text-ink-dim hover:text-ink-white mr-3" aria-label="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleting(s)} className="text-ink-dim hover:text-ink-white" aria-label="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New Size' : 'Edit Size'}
        size="sm"
      >
        {editing && (
          <SizeForm
            initial={editing === 'new' ? null : editing}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
            busy={busy}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={busy}
        title="Delete Size"
        message="Products using this size will lose it. Cart items with this size will be removed."
      />
    </div>
  );
}

function SizeForm({ initial, onSubmit, onCancel, busy }) {
  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [order, setOrder] = useState(initial?.display_order ?? 0);
  const [active, setActive] = useState(initial?.is_active ?? true);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      slug: (slug || name.toLowerCase().replace(/\s+/g, '-')).trim(),
      display_order: Number(order),
      is_active: active,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name" />
      <Input label="Display Order" type="number" min={0} value={order} onChange={(e) => setOrder(e.target.value)} required />
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 accent-ink-white" />
        <span className="text-xs uppercase tracking-nav text-ink-text">Active</span>
      </label>
      <div className="flex justify-end gap-3 pt-4 border-t border-ink-line">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" loading={busy}>
          <Save className="w-3.5 h-3.5" /> Save
        </Button>
      </div>
    </form>
  );
}