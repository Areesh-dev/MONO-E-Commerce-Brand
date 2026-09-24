import { supabase } from './supabase';

const PUBLIC_SELECT = 'id,rating,review_text,reviewer_name,created_at';

export async function fetchApprovedReviews({ productId, limit = 20 } = {}) {
  let query = supabase
    .from('reviews')
    .select(PUBLIC_SELECT)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (productId) query = query.eq('product_id', productId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchReviewStats(productId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'approved');
  if (error) throw error;
  const rows = data || [];
  if (!rows.length) return { count: 0, average: 0 };
  const total = rows.reduce((s, r) => s + r.rating, 0);
  return { count: rows.length, average: total / rows.length };
}

export async function fetchMyReviewedProductIds() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('product_id')
    .eq('user_id', user.id);
  if (error) throw error;
  return (data || []).map((r) => r.product_id).filter(Boolean);
}

export async function fetchMyReviewForProduct(productId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('reviews')
    .select('id,rating,review_text,status,created_at')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function submitReview({ productId, rating, reviewText }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Please sign in to leave a review');
  if (!rating || rating < 1 || rating > 5) throw new Error('Select a rating');
  const text = (reviewText || '').trim();
  if (text.length < 10) throw new Error('Review must be at least 10 characters');
  if (text.length > 2000) throw new Error('Review is too long');

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      product_id: productId,
      rating,
      review_text: text,
      status: 'pending',
    })
    .select('id,status')
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('You have already reviewed this product');
    throw new Error(error.message);
  }
  return data;
}