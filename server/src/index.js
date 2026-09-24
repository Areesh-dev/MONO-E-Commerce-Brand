import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import ordersRouter from './routes/orders.js';
import sizesRouter from './routes/sizes.js';
import aiRouter from './routes/ai.js';
import { admin } from './lib/supabase.js';
import { requireAuth, requireAdmin } from './middleware/auth.js';
import { globalLimiter } from './middleware/rateLimit.js';
import couponsRouter from './routes/coupons.js';
import analyticsRouter from './routes/analytics.js';
import productsRouter from './routes/products.js';


const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
  referrerPolicy: { policy: 'no-referrer' },
}));

app.use(express.json({ limit: '200kb' }));

const origins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (origins.length === 0 && process.env.NODE_ENV === 'production') {
  throw new Error('CORS_ORIGIN must be set in production');
}

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origins.includes(origin)) return cb(null, true);
    cb(new Error('CORS_BLOCKED'));
  },
  credentials: false,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/api', globalLimiter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/orders', ordersRouter);
app.use('/api/sizes', sizesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/admin/analytics', analyticsRouter);
app.use('/api/products', productsRouter);

app.get('/api/admin/stats', requireAuth, requireAdmin, async (_req, res) => {
  const [users, products, orders, reviews, pendingReviews] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('products').select('id', { count: 'exact', head: true }),
    admin.from('orders').select('id,total_amount,status,created_at'),
    admin.from('reviews').select('id', { count: 'exact', head: true }),
    admin.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);
  const rows = orders.data || [];
  res.json({
    users: users.count || 0,
    products: products.count || 0,
    orders: rows.length,
    pendingOrders: rows.filter((o) => o.status === 'pending').length,
    reviews: reviews.count || 0,
    pendingReviews: pendingReviews.count || 0,
    revenue: rows.filter((o) => o.status !== 'cancelled')
      .reduce((s, o) => s + Number(o.total_amount), 0),
  });
});

app.use((err, _req, res, _next) => {
  if (err?.message === 'CORS_BLOCKED') {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  console.error('[server]', err?.message);
  res.status(500).json({ error: 'SERVER_ERROR' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API listening on :${port}`));