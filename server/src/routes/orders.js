import { Router } from 'express';
import { admin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { orderLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, orderIdSchema } from '../schemas/orders.js';

const router = Router();

const ERROR_MESSAGES = {
  CART_EMPTY: 'Your cart is empty.',
  AUTH_REQUIRED: 'Please sign in.',
  INVALID_TOKEN: 'Session expired. Please sign in again.',
};


const COUPON_ERRORS = {
  NOT_FOUND: 'Coupon not found.',
  INACTIVE: 'This coupon is no longer available.',
  NOT_STARTED: 'This coupon is not active yet.',
  EXPIRED: 'This coupon has expired.',
  MIN_ORDER: 'Your order does not meet the minimum for this coupon.',
  USAGE_LIMIT: 'This coupon has reached its usage limit.',
  USER_LIMIT: 'You have already used this coupon.',
  INVALID_CODE: 'Invalid coupon code.',
  UNKNOWN: 'Coupon could not be applied.',
};

function humanize(msg = '') {
  if (msg.startsWith('COUPON_INVALID:')) {
    return COUPON_ERRORS[msg.split(':')[1]] || COUPON_ERRORS.UNKNOWN;
  }
  if (msg.startsWith('INSUFFICIENT_STOCK:')) {
    const parts = msg.split(':');
    return parts.length === 3
      ? `Insufficient stock for ${parts[1]} (${parts[2]}).`
      : `Insufficient stock for ${parts[1]}.`;
  }
  if (msg.startsWith('UNAVAILABLE:')) return `${msg.split(':')[1]} is no longer available.`;
  if (msg.startsWith('SIZE_UNAVAILABLE:')) return `${msg.split(':')[1]} — selected size is unavailable.`;
  return ERROR_MESSAGES[msg] || 'Could not place order.';
}

router.post('/', requireAuth, orderLimiter, async (req, res) => {
  const couponCode = typeof req.body?.coupon_code === 'string' && req.body.coupon_code.trim()
    ? req.body.coupon_code.trim()
    : null;

  const { data: orderId, error } = await admin.rpc('create_order_from_cart', {
    p_user_id: req.user.id,
    p_coupon_code: couponCode,
  });

  if (error) return res.status(400).json({ error: humanize(error.message) });

  const { data: order, error: fetchErr } = await admin
    .from('orders')
    .select('id, total_amount, subtotal, discount_amount, coupon_code, status, created_at, order_items(id, product_id, product_name, quantity, price, size_id, size_name)')
    .eq('id', orderId)
    .single();

  if (fetchErr) return res.status(500).json({ error: 'ORDER_FETCH_FAILED' });

  res.status(201).json({ order });
});

router.get(
  '/:id',
  requireAuth,
  validate(orderIdSchema, 'params'),
  async (req, res) => {
    const { data, error } = await admin
      .from('orders')
      .select('id, user_id, total_amount, status, created_at, order_items(id, product_id, product_name, quantity, price)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'NOT_FOUND' });
    if (data.user_id !== req.user.id) return res.status(404).json({ error: 'NOT_FOUND' });

    const { user_id: _omit, ...safe } = data;
    res.json({ order: safe });
  }
);

export default router;