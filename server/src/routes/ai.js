import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { admin } from '../lib/supabase.js';
import { validate } from '../middleware/validate.js';
import { chatSchema } from '../schemas/ai.js';
import { runChat } from '../services/gemini.js';

const router = Router();

// NOTE: if your backend is behind a proxy (Render/Railway/Vercel), also add
// `app.set('trust proxy', 1)` in your main server file.
const aiLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: 'RATE_LIMITED' }),
});

async function optionalAuth(req, _res, next) {
  let timer;
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    if (!token) return next();

    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Auth timeout')), 3000);
    });

    const { data } = await Promise.race([admin.auth.getUser(token), timeout]);
    if (data?.user) req.user = data.user;
  } catch (err) {
    console.error('[auth] optionalAuth error:', err.message);
  } finally {
    clearTimeout(timer);
  }
  next(); // continue as guest if anything failed
}

function classifyAiError(err) {
  const status = err?.status;
  const text = `${err?.message || ''} ${JSON.stringify(err?.error || {})}`.toLowerCase();

  if (status === 429) {
    const daily = /per day|\(rpd\)|\(tpd\)|daily/.test(text);
    return daily ? [429, 'AI_QUOTA_EXCEEDED'] : [503, 'AI_BUSY'];
  }
  if (!status || status >= 500) return [503, 'AI_BUSY'];
  return [502, 'AI_UNAVAILABLE'];
}

router.post('/chat', aiLimiter, optionalAuth, validate(chatSchema), async (req, res) => {
  try {
    const result = await runChat({
      message: req.body.message,
      history: req.body.history,
      userId: req.user?.id || null,
    });
    res.json(result);
  } catch (err) {
    console.error('[ai] chat failed:', err?.status, err?.message);
    const [status, code] = classifyAiError(err);
    res.status(status).json({ error: code });
  }
});

export default router;
