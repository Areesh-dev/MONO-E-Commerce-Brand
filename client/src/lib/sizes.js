import { supabase } from './supabase';

export async function fetchActiveSizes() {
  const { data, error } = await supabase
    .from('sizes')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  if (error) throw error;
  return data || [];
}

export async function fetchAllSizes() {
  const { data, error } = await supabase.from('sizes').select('*').order('display_order');
  if (error) throw error;
  return data || [];
}

export async function fetchProductSizes(productId) {
  const { data, error } = await supabase
    .from('product_sizes')
    .select('id, stock, size:sizes(id, name, slug, display_order, is_active)')
    .eq('product_id', productId);
  if (error) throw error;
  return (data || [])
    .filter((r) => r.size?.is_active)
    .sort((a, b) => a.size.display_order - b.size.display_order);
}

export async function saveProductSizes(productId, sizes) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sizes/product/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ sizes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save sizes');
  }
}