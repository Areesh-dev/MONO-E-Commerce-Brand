import { useCallback, useEffect, useMemo, useState } from 'react';
import { createRow, deleteRow, listTable, updateRow } from '../lib/admin';

export function useAdminResource({ table, select = '*', orderBy, searchKeys = [], filters }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const filterKey = JSON.stringify(filters || {});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listTable(table, {
        select,
        orderBy,
        filters: JSON.parse(filterKey),
      });
      setData(rows);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [table, select, orderBy?.column, orderBy?.ascending, filterKey]);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = useMemo(() => {
    if (!search.trim() || !searchKeys.length) return data;
    const needle = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(needle))
    );
  }, [data, search, searchKeys]);

  const create = useCallback(async (payload) => {
    const row = await createRow(table, payload);
    await refresh();
    return row;
  }, [table, refresh]);

  const update = useCallback(async (id, payload) => {
    const row = await updateRow(table, id, payload);
    await refresh();
    return row;
  }, [table, refresh]);

  const remove = useCallback(async (id) => {
    await deleteRow(table, id);
    await refresh();
  }, [table, refresh]);

  return { data: filtered, total: data.length, loading, error, search, setSearch, refresh, create, update, remove };
}