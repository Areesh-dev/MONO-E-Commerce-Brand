import rateLimit from 'express-rate-limit';

const base = {
  windowMs: 60_000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: 'RATE_LIMITED' }),
};

export const globalLimiter = rateLimit({ ...base, max: 120 });

export const authLimiter = rateLimit({ ...base, max: 10, skipSuccessfulRequests: true });

export const orderLimiter = rateLimit({ ...base, max: 10 });

export const writeLimiter = rateLimit({ ...base, max: 30 });

export const readLimiter = rateLimit({ ...base, max: 100 });

export const aiLimiter = rateLimit({ ...base, max: 12 });