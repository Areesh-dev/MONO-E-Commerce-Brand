import { supabase } from './supabase';

export async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').eq('status','active').order('display_order');
  if (error) throw error;
  return data;
}

export async function fetchCategoryBySlug(slug) {
  const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).eq('status','active').single();
  if (error) throw error;
  return data;
}

export async function fetchProducts({ categoryId, popular, search, sort = 'newest', page = 1, pageSize = 12 } = {}) {
  let query = supabase.from('products').select('*, category:categories(id,name,slug)', { count: 'exact' }).eq('status','active');
  if (categoryId) query = query.eq('category_id', categoryId);
  if (popular) query = query.eq('is_popular', true);
  if (search) query = query.ilike('name', `%${search}%`);
  switch (sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'name': query = query.order('name', { ascending: true }); break;
    default: query = query.order('created_at', { ascending: false });
  }
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function fetchProductBySlug(slug) {
  const { data, error } = await supabase.from('products').select('*, category:categories(id,name,slug)').eq('slug', slug).eq('status','active').single();
  if (error) throw error;
  return data;
}

export async function fetchHeroSlides() {
  const { data, error } = await supabase.from('hero_slides').select('*').eq('status','active').order('display_order');
  if (error) throw error;
  return data;
}

export async function fetchWhyChooseUs() {
  const { data, error } = await supabase.from('why_choose_us').select('*').eq('status','active').order('display_order');
  if (error) throw error;
  return data;
}

export async function fetchBrands() {
  const { data, error } = await supabase.from('brands').select('*').eq('status','active').order('display_order');
  if (error) throw error;
  return data;
}

export async function fetchFaqs() {
  const { data, error } = await supabase.from('faqs').select('*').eq('status','active').order('display_order');
  if (error) throw error;
  return data;
}

export async function fetchApprovedReviews(limit = 8) {
  const { data, error } = await supabase.from('reviews').select('id,rating,review_text,created_at,profiles(name)').eq('status','approved').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}


export async function fetchContentSections() {
  const { data, error } = await supabase
    .from('content_sections')
    .select('*')
    .eq('status', 'active')
    .order('display_order');
  if (error) throw error;
  return data || [];
}