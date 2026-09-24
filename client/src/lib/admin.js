import { supabase } from './supabase';

export const slugify = (s = '') =>
  s.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const REVIEW_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
];

export async function listTable(table, { select = '*', orderBy, search, searchKeys, filters } = {}) {
  let q = supabase.from(table).select(select);
  if (orderBy) q = q.order(orderBy.column, { ascending: orderBy.ascending ?? true });
  if (filters) for (const [k, v] of Object.entries(filters)) if (v != null) q = q.eq(k, v);
  if (search && searchKeys?.length) {
    const escaped = search.replace(/[%,]/g, '');
    q = q.or(searchKeys.map((k) => `${k}.ilike.%${escaped}%`).join(','));
  }
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function createRow(table, payload) {
  const { data, error } = await supabase.from(table).insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateRow(table, id, payload) {
  const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function fetchDashboardStats() {
  const since = new Date();
  since.setDate(since.getDate() - 29);
  const sinceIso = since.toISOString();

  const [users, products, categories, orders, reviews, pending] = await Promise.all([
    supabase.from('profiles').select('id, created_at'),
    supabase.from('products').select('id, category_id, status'),
    supabase.from('categories').select('id, name'),
    supabase.from('orders').select('id, total_amount, status, created_at'),
    supabase.from('reviews').select('id, rating, status'),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  const userRows = users.data || [];
  const productRows = products.data || [];
  const categoryRows = categories.data || [];
  const orderRows = orders.data || [];
  const reviewRows = reviews.data || [];

  const revenue = orderRows
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.total_amount), 0);

  const dayBuckets = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayBuckets[key] = { date: key, orders: 0, revenue: 0, users: 0 };
  }
  for (const o of orderRows) {
    const key = (o.created_at || '').slice(0, 10);
    if (dayBuckets[key]) {
      dayBuckets[key].orders += 1;
      if (o.status !== 'cancelled') dayBuckets[key].revenue += Number(o.total_amount);
    }
  }
  for (const u of userRows) {
    const key = (u.created_at || '').slice(0, 10);
    if (dayBuckets[key]) dayBuckets[key].users += 1;
  }
  const series = Object.values(dayBuckets);

  const catCounts = {};
  for (const p of productRows) {
    const id = p.category_id || 'uncategorized';
    catCounts[id] = (catCounts[id] || 0) + 1;
  }
  const distribution = Object.entries(catCounts).map(([id, value]) => ({
    name: categoryRows.find((c) => c.id === id)?.name || 'Uncategorized',
    value,
  }));

  const recentOrders = orderRows
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return {
    totals: {
      users: userRows.length,
      products: productRows.length,
      categories: categoryRows.length,
      orders: orderRows.length,
      pendingOrders: orderRows.filter((o) => o.status === 'pending').length,
      reviews: reviewRows.length,
      pendingReviews: pending.count || 0,
      revenue,
    },
    series,
    distribution,
    recentOrders,
  };
}