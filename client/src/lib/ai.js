import { supabase } from './supabase';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const TIMEOUT_MS = 45000;

function codedError(code) {
  const err = new Error(code);
  err.code = code;
  return err;
}

async function getAccessToken() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch {
    return null;
  }
}

export async function sendChat({ message, history = [] }) {
  const token = await getAccessToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${API_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, history }),
      signal: controller.signal,
    });
  } catch (err) {
    throw codedError(err?.name === 'AbortError' ? 'AI_TIMEOUT' : 'NETWORK_ERROR');
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw codedError(data?.error || 'AI_UNAVAILABLE');

  return {
    message: data.message || '',
    products: Array.isArray(data.products) ? data.products : [],
    cart: data.cart || null,
    quickReplies: Array.isArray(data.quickReplies) ? data.quickReplies : [],
    action: data.action || null,
    actions: Array.isArray(data.actions) ? data.actions : data.action ? [data.action] : [],
  };
}