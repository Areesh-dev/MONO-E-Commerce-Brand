import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { admin } from '../lib/supabase.js';
import { validate } from '../middleware/validate.js';
import { chatSchema } from '../schemas/ai.js';
import { runChat } from '../services/gemini.js';

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: 'RATE_LIMITED' }),
});

async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();

    // Add a 3-second timeout to prevent hanging if Supabase is slow
    const authPromise = admin.auth.getUser(token);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 3000));

    const { data } = await Promise.race([authPromise, timeoutPromise]);
    if (data?.user) req.user = data.user;
    next();
  } catch (err) {
    console.error('[auth] middleware error:', err.message);
    next(); // Proceed as guest rather than crashing
  }
}

const bodySchema = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(4000),
      }),
    )
    .max(20)
    .optional()
    .default([]),
});

async function optionalUserId(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  try {
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
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
    // Return a proper JSON error instead of letting the server crash
    if (err?.status === 429) {
      return res.status(429).json({ error: 'AI_QUOTA_EXCEEDED' });
    }
    res.status(502).json({ error: 'AI_UNAVAILABLE' });
  }
});

export default router;