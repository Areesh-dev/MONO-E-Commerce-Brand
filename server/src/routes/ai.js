import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { admin } from '../lib/supabase.js';
import { runChat } from '../services/aiChat.js';

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: 'RATE_LIMITED' }),
});

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

router.post('/chat', aiLimiter, async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'INVALID_INPUT' });
  }

  const userId = await optionalUserId(req);

  try {
    const result = await runChat({
      message: parsed.data.message,
      history: parsed.data.history,
      userId,
    });
    return res.json(result);
  } catch (err) {
    const [status, code] = classifyAiError(err);
    console.error('[ai] chat failed:', err?.status ?? 'network', err?.message);
    return res.status(status).json({ error: code });
  }
});

export default router;