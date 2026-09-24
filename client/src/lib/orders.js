import { supabase } from './supabase';
import { env } from './env';

const API_URL = env.apiUrl;
const ORDER_SELECT = 'id, total_amount, subtotal, discount_amount, coupon_code, status, created_at, order_items(id, product_id, product_name, quantity, price, size_id, size_name)';

async function authedFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...(options.headers || {}),
    },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || 'Request failed');
  return payload;
}

export function createOrder(couponCode = null) {
  return authedFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(couponCode ? { coupon_code: couponCode } : {}),
  });
}

export async function fetchMyOrders() {
  const { data, error } = await supabase
    .from('orders').select(ORDER_SELECT)
    .order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return data || [];
}

export async function fetchMyOrder(id) {
  const { data, error } = await supabase
    .from('orders').select(ORDER_SELECT).eq('id', id).single();
  if (error) throw error;
  return data;
}