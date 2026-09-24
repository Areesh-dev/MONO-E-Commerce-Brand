import { useEffect, useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/skeletons';
import ErrorState from '../../components/ui/ErrorState';
import { listTable } from '../../lib/admin';

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));

function toCsv(rows) {
  const headers = ['ID', 'Name', 'Email', 'Role', 'Signup Date'];
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([r.id, r.name, r.email, r.role, r.created_at].map(escape).join(','));
  }
  return lines.join('\n');
}

export default function AdminUsers() {
  const [state, setState] = useState({ loading: true, error: null, data: [] });
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    listTable('profiles', { select: 'id,name,email,role,created_at', orderBy: { column: 'created_at', ascending: false } })
      .then((data) => active && setState({ loading: false, error: null, data }))
      .catch((e) => active && setState({ loading: false, error: e, data: [] }));
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return state.data;
    const q = search.toLowerCase();
    return state.data.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [state.data, search]);

  const handleExport = () => {
    if (!filtered.length) return toast.error('Nothing to export');
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} users`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="heading-editorial text-2xl text-ink-white">Users</h1>
          <p className="mt-1 text-xs text-ink-dim">{filtered.length} registered</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-dim" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…"
              className="h-9 pl-9 pr-3 bg-ink-surface border border-ink-line text-ink-white text-xs placeholder:text-ink-muted focus:border-ink-text focus:outline-none w-56" />
          </div>
          <Button size="sm" variant="secondary" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="border border-ink-line bg-ink-card">
        {state.loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : state.error ? (
          <ErrorState />
        ) : filtered.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink-line">
                  <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim">ID</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim">Name</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim">Email</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim">Role</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-editorial text-ink-dim">Signup Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-ink-line last:border-b-0 hover:bg-ink-surface">
                    <td className="px-4 py-3 text-[10px] text-ink-dim font-mono">{u.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-xs text-ink-white">{u.name}</td>
                    <td className="px-4 py-3 text-xs text-ink-text">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] uppercase tracking-editorial px-2 py-1 border ${u.role === 'admin' ? 'border-ink-white text-ink-white' : 'border-ink-line text-ink-dim'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-dim">{fmtDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}