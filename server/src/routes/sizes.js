import { Router } from 'express';
import { admin } from '../lib/supabase.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createSizeSchema, updateSizeSchema, sizeIdSchema } from '../schemas/sizes.js';
import { z } from 'zod';

const router = Router();

router.get('/', async (_req, res) => {
  const { data, error } = await admin
    .from('sizes')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  if (error) return res.status(500).json({ error: 'FETCH_FAILED' });
  res.json({ sizes: data });
});

router.get('/all', requireAuth, requireAdmin, async (_req, res) => {
  const { data, error } = await admin.from('sizes').select('*').order('display_order');
  if (error) return res.status(500).json({ error: 'FETCH_FAILED' });
  res.json({ sizes: data });
});

router.post('/', requireAuth, requireAdmin, validate(createSizeSchema), async (req, res) => {
  const { data, error } = await admin.from('sizes').insert(req.body).select().single();
  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'SIZE_EXISTS' });
    return res.status(400).json({ error: error.message });
  }
  res.status(201).json({ size: data });
});

router.patch('/:id', requireAuth, requireAdmin, validate(sizeIdSchema, 'params'), validate(updateSizeSchema), async (req, res) => {
  const { data, error } = await admin.from('sizes').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ size: data });
});

router.delete('/:id', requireAuth, requireAdmin, validate(sizeIdSchema, 'params'), async (req, res) => {
  const { error } = await admin.from('sizes').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).end();
});

router.get('/product/:productId', validate(z.object({ productId: z.string().uuid() }), 'params'), async (req, res) => {
  const { data, error } = await admin
    .from('product_sizes')
    .select('id, stock, size:sizes(id, name, slug, display_order)')
    .eq('product_id', req.params.productId)
    .order('size(display_order)');
  if (error) return res.status(500).json({ error: 'FETCH_FAILED' });
  res.json({ sizes: data });
});

router.put('/product/:productId', requireAuth, requireAdmin, validate(z.object({ productId: z.string().uuid() }), 'params'), async (req, res) => {
  const { sizes } = req.body;
  if (!Array.isArray(sizes)) return res.status(400).json({ error: 'INVALID_INPUT' });

  await admin.from('product_sizes').delete().eq('product_id', req.params.productId);

  if (sizes.length > 0) {
    const rows = sizes.map((s) => ({
      product_id: req.params.productId,
      size_id: s.size_id,
      stock: Math.max(0, parseInt(s.stock, 10) || 0),
    }));
    const { error } = await admin.from('product_sizes').insert(rows);
    if (error) return res.status(400).json({ error: error.message });
  }

  res.json({ ok: true });
});

export default router;