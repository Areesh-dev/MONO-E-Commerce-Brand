import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL;

async function authedFetch(path) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'Request failed');
  return body;
}

export const fetchAnalyticsOverview = (range) =>
  authedFetch(`/api/admin/analytics/overview?range=${range}`);

export const fetchAnalyticsSales = (range) =>
  authedFetch(`/api/admin/analytics/sales?range=${range}`);

export const fetchAnalyticsStatus = (range) =>
  authedFetch(`/api/admin/analytics/status?range=${range}`);

export const fetchAnalyticsProducts = (range, limit = 10) =>
  authedFetch(`/api/admin/analytics/products?range=${range}&limit=${limit}`);

export const fetchAnalyticsCategories = (range) =>
  authedFetch(`/api/admin/analytics/categories?range=${range}`);

export const fetchLowStock = (threshold = 5) =>
  authedFetch(`/api/admin/analytics/low-stock?threshold=${threshold}`);

export async function fetchRelatedProducts(productId, limit = 4) {
  const res = await fetch(`${API_URL}/api/products/${productId}/related?limit=${limit}`);
  if (!res.ok) return [];
  const body = await res.json().catch(() => ({}));
  return body.products || [];
}