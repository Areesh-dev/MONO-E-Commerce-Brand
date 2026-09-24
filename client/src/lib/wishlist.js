import { supabase } from './supabase';

const WISHLIST_EVENT = 'wishlist:changed';

const WISHLIST_SELECT = `
  id,
  product_id,
  created_at,
  product:products(
    id,name,slug,price,image_url,stock,status,
    category:categories(id,name,slug)
  )
`;

function notifyChanged() {
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT));
}

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  const id = data?.session?.user?.id;
  if (!id) throw new Error('Sign in required');
  return id;
}

export async function fetchWishlist() {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from('wishlist_items')
    .select(WISHLIST_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).filter((row) => row.product);
}

export async function fetchWishlistProductIds() {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('product_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((r) => r.product_id);
}

export async function addToWishlist(productId) {
  const userId = await currentUserId();

  const { error } = await supabase
    .from('wishlist_items')
    .insert({ user_id: userId, product_id: productId });

  if (error && error.code !== '23505') throw error;
  notifyChanged();
}

export async function removeFromWishlist(productId) {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
    .select('id');

  if (error) throw error;

  if (!data || data.length === 0) {
    console.warn('[wishlist] delete matched 0 rows', { userId, productId });
  }

  notifyChanged();
}