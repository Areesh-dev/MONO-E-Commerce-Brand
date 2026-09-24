import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { admin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateCouponSchema } from '../schemas/coupons.js';

const router = Router();

const couponLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: 'RATE_LIMITED' }),
});

router.post('/validate', requireAuth, couponLimiter, validate(validateCouponSchema), async (req, res) => {
  try {
    const { data: cart } = await admin
      .from('cart_items')
      .select('quantity, product:products(price,status)')
      .eq('user_id', req.user.id);

    const subtotal = (cart || [])
      .filter((i) => i.product?.status === 'active')
      .reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);

    if (subtotal <= 0) {
      return res.json({ valid: false, error_code: 'EMPTY_CART' });
    }

    const { data, error } = await admin.rpc('validate_coupon', {
      p_code: req.body.code,
      p_subtotal: subtotal,
      p_user_id: req.user.id,
    });

    if (error) return res.status(500).json({ error: 'VALIDATION_FAILED' });

    const r = Array.isArray(data) ? data[0] : data;
    if (!r) return res.status(500).json({ error: 'VALIDATION_FAILED' });

    return res.json({
      valid: r.is_valid,
      error_code: r.error_code,
      code: r.code,
      description: r.description,
      discount_type: r.discount_type,
      discount_value: Number(r.discount_value || 0),
      discount_amount: Number(r.discount_amount || 0),
      subtotal,
    });
  } catch (e) {
    console.error('[coupons] validate failed:', e?.message);
    res.status(500).json({ error: 'VALIDATION_FAILED' });
  }
});

export default router;