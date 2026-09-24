import { Router } from 'express';
import { admin } from '../lib/supabase.js';

const router = Router();

const SELECT = 'id,name,slug,price,image_url,is_popular,stock,category:categories(id,name,slug)';

function shape(p) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    image_url: p.image_url,
    is_popular: !!p.is_popular,
    stock: Number(p.stock ?? 0),
    category: p.category || null,
  };
}

router.get('/:id/related', async (req, res) => {
  const { id } = req.params;
  const limit = Math.min(8, Math.max(1, parseInt(req.query.limit, 10) || 4));

  const { data: product } = await admin
    .from('products')
    .select('id, category_id')
    .eq('id', id)
    .maybeSingle();

  if (!product) return res.json({ products: [] });

  const picked = [];
  const seen = new Set([id]);

  async function fill(query, remaining) {
    if (remaining <= 0) return;
    let q = query.limit(remaining);
    if (seen.size) q = q.not('id', 'in', `(${[...seen].join(',')})`);
    const { data } = await q;
    for (const p of data || []) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      picked.push(p);
    }
  }

  if (product.category_id) {
    await fill(
      admin.from('products').select(SELECT)
        .eq('status', 'active')
        .eq('category_id', product.category_id)
        .eq('is_popular', true)
        .order('created_at', { ascending: false }),
      limit - picked.length
    );

    await fill(
      admin.from('products').select(SELECT)
        .eq('status', 'active')
        .eq('category_id', product.category_id)
        .order('created_at', { ascending: false }),
      limit - picked.length
    );
  }

  await fill(
    admin.from('products').select(SELECT)
      .eq('status', 'active')
      .eq('is_popular', true)
      .order('created_at', { ascending: false }),
    limit - picked.length
  );

  await fill(
    admin.from('products').select(SELECT)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    limit - picked.length
  );

  res.json({ products: picked.slice(0, limit).map(shape) });
});

export default router;