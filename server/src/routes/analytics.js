import { Router } from 'express';
import { admin } from '../lib/supabase.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };

function rangeToFrom(range) {
  const days = RANGE_DAYS[range] || 30;
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return d.toISOString();
}

function parseRange(q) {
  const range = RANGE_DAYS[q] ? q : '30d';
  return { range, from: rangeToFrom(range) };
}

const LIVE_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const REVENUE_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered'];

router.get('/overview', requireAuth, requireAdmin, async (req, res) => {
  const { range, from } = parseRange(req.query.range);

  const [ordersRes, usersRes, lowStockRes, couponsRes] = await Promise.all([
    admin.from('orders')
      .select('id,status,total_amount,subtotal,discount_amount,coupon_code,created_at')
      .gte('created_at', from),
    admin.from('profiles')
      .select('id,created_at')
      .gte('created_at', from),
    admin.from('products')
      .select('id,stock,status')
      .eq('status', 'active')
      .lt('stock', 5),
    admin.from('coupon_usages')
      .select('id,discount_amount,used_at')
      .gte('used_at', from),
  ]);

  const orders = ordersRes.data || [];
  const users = usersRes.data || [];
  const lowStock = lowStockRes.data || [];
  const couponUsages = couponsRes.data || [];

  const revenueOrders = orders.filter((o) => REVENUE_STATUSES.includes(o.status));
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');
  const pendingOrders = orders.filter((o) => o.status === 'pending');

  const grossRevenue = revenueOrders.reduce(
    (s, o) => s + Number(o.subtotal ?? o.total_amount ?? 0), 0
  );
  const netRevenue = revenueOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
  const totalDiscount = revenueOrders.reduce((s, o) => s + Number(o.discount_amount || 0), 0);
  const aov = revenueOrders.length ? netRevenue / revenueOrders.length : 0;

  const couponDiscount = couponUsages.reduce((s, u) => s + Number(u.discount_amount || 0), 0);

  res.json({
    range,
    from,
    revenue: {
      gross: grossRevenue,
      net: netRevenue,
      discount: totalDiscount,
      aov,
    },
    orders: {
      total: orders.length,
      pending: pendingOrders.length,
      cancelled: cancelledOrders.length,
      completed: revenueOrders.length,
    },
    users: {
      new: users.length,
    },
    coupons: {
      usages: couponUsages.length,
      total_discount: couponDiscount,
    },
    low_stock_count: lowStock.length,
  });
});

router.get('/sales', requireAuth, requireAdmin, async (req, res) => {
  const { range, from } = parseRange(req.query.range);

  const { data, error } = await admin
    .from('orders')
    .select('id,total_amount,status,created_at')
    .gte('created_at', from)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: 'FETCH_FAILED' });

  const days = RANGE_DAYS[range];
  const buckets = {};
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { date: key, revenue: 0, orders: 0 };
  }

  for (const o of data || []) {
    const key = (o.created_at || '').slice(0, 10);
    if (!buckets[key]) continue;
    buckets[key].orders += 1;
    if (REVENUE_STATUSES.includes(o.status)) {
      buckets[key].revenue += Number(o.total_amount || 0);
    }
  }

  res.json({ range, series: Object.values(buckets) });
});

router.get('/status', requireAuth, requireAdmin, async (req, res) => {
  const { range, from } = parseRange(req.query.range);

  const { data, error } = await admin
    .from('orders')
    .select('status')
    .gte('created_at', from);

  if (error) return res.status(500).json({ error: 'FETCH_FAILED' });

  const counts = {
    pending: 0, confirmed: 0, processing: 0,
    shipped: 0, delivered: 0, cancelled: 0,
  };
  for (const o of data || []) {
    if (counts[o.status] !== undefined) counts[o.status] += 1;
  }

  const series = Object.entries(counts).map(([status, value]) => ({ status, value }));
  res.json({ range, counts, series });
});

router.get('/products', requireAuth, requireAdmin, async (req, res) => {
  const { range, from } = parseRange(req.query.range);
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const { data: orders, error: ordersErr } = await admin
    .from('orders')
    .select('id')
    .in('status', REVENUE_STATUSES)
    .gte('created_at', from);

  if (ordersErr) return res.status(500).json({ error: 'FETCH_FAILED' });
  const orderIds = (orders || []).map((o) => o.id);
  if (orderIds.length === 0) return res.json({ range, products: [] });

  const { data: items, error: itemsErr } = await admin
    .from('order_items')
    .select('product_id, product_name, quantity, price')
    .in('order_id', orderIds);

  if (itemsErr) return res.status(500).json({ error: 'FETCH_FAILED' });

  const map = new Map();
  for (const it of items || []) {
    const key = it.product_id || `deleted:${it.product_name}`;
    const entry = map.get(key) || {
      product_id: it.product_id || null,
      product_name: it.product_name,
      units: 0,
      revenue: 0,
    };
    entry.units += Number(it.quantity || 0);
    entry.revenue += Number(it.quantity || 0) * Number(it.price || 0);
    map.set(key, entry);
  }

  const products = [...map.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  res.json({ range, products });
});

router.get('/categories', requireAuth, requireAdmin, async (req, res) => {
  const { range, from } = parseRange(req.query.range);

  const { data: orders, error: ordersErr } = await admin
    .from('orders')
    .select('id')
    .in('status', REVENUE_STATUSES)
    .gte('created_at', from);

  if (ordersErr) return res.status(500).json({ error: 'FETCH_FAILED' });
  const orderIds = (orders || []).map((o) => o.id);
  if (orderIds.length === 0) return res.json({ range, categories: [] });

  const { data: items, error: itemsErr } = await admin
    .from('order_items')
    .select('product_id, quantity, price')
    .in('order_id', orderIds);

  if (itemsErr) return res.status(500).json({ error: 'FETCH_FAILED' });

  const productIds = [...new Set((items || []).map((i) => i.product_id).filter(Boolean))];
  if (productIds.length === 0) return res.json({ range, categories: [] });

  const { data: products } = await admin
    .from('products')
    .select('id, category_id, category:categories(name)')
    .in('id', productIds);

  const byProduct = new Map((products || []).map((p) => [p.id, p]));

  const map = new Map();
  for (const it of items || []) {
    const p = byProduct.get(it.product_id);
    if (!p) continue;
    const key = p.category_id || 'uncategorized';
    const name = p.category?.name || 'Uncategorized';
    const entry = map.get(key) || { category_id: p.category_id || null, name, units: 0, revenue: 0 };
    entry.units += Number(it.quantity || 0);
    entry.revenue += Number(it.quantity || 0) * Number(it.price || 0);
    map.set(key, entry);
  }

  const categories = [...map.values()].sort((a, b) => b.revenue - a.revenue);
  res.json({ range, categories });
});

router.get('/low-stock', requireAuth, requireAdmin, async (req, res) => {
  const threshold = Math.max(1, parseInt(req.query.threshold, 10) || 5);

  const [productsRes, sizesRes] = await Promise.all([
    admin.from('products')
      .select('id,name,slug,stock,image_url,category:categories(name)')
      .eq('status', 'active')
      .lt('stock', threshold)
      .order('stock', { ascending: true })
      .limit(30),
    admin.from('product_sizes')
      .select('product_id, stock, size:sizes(name), product:products(name,slug,status,image_url,category:categories(name))')
      .lt('stock', threshold)
      .limit(60),
  ]);

  const items = [];

  for (const p of productsRes.data || []) {
    const hasSizes = (sizesRes.data || []).some((s) => s.product_id === p.id);
    if (hasSizes) continue;
    items.push({
      key: `p:${p.id}`,
      product_id: p.id,
      product_name: p.name,
      product_slug: p.slug,
      image_url: p.image_url,
      category: p.category?.name || null,
      size_name: null,
      stock: p.stock,
    });
  }

  for (const s of sizesRes.data || []) {
    if (!s.product || s.product.status !== 'active') continue;
    items.push({
      key: `s:${s.product_id}:${s.size?.name || ''}`,
      product_id: s.product_id,
      product_name: s.product?.name,
      product_slug: s.product?.slug,
      image_url: s.product?.image_url,
      category: s.product?.category?.name || null,
      size_name: s.size?.name || null,
      stock: s.stock,
    });
  }

  items.sort((a, b) => a.stock - b.stock);
  res.json({ threshold, items: items.slice(0, 40) });
});

export default router;