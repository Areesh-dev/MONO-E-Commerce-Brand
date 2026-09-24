import { admin } from '../lib/supabase.js';

const MAX_TOKEN_LENGTH = 4096;

function extractToken(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  if (!token || token.length > MAX_TOKEN_LENGTH) return null;
  return token;
}

async function userFromToken(token) {
  const { data, error } = await admin.auth.getUser(token);
  if (error) {
    if (error.status && error.status < 500) return null;
    throw error;
  }
  return data?.user || null;
}

export async function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'AUTH_REQUIRED' });

  try {
    const user = await userFromToken(token);
    if (!user) return res.status(401).json({ error: 'INVALID_TOKEN' });
    req.user = user;
    return next();
  } catch (err) {
    console.error('[auth] token check failed:', err?.message);
    return res.status(503).json({ error: 'AUTH_UNAVAILABLE' });
  }
}

export async function optionalAuth(req, _res, next) {
  req.user = null;
  const token = extractToken(req);
  if (!token) return next();
  try {
    req.user = await userFromToken(token);
  } catch (err) {
    console.error('[auth] optional token check failed:', err?.message);
  }
  return next();
}

export async function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'AUTH_REQUIRED' });

  try {
    const { data, error } = await admin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) {
      console.error('[auth] role lookup failed:', error.message);
      return res.status(503).json({ error: 'AUTH_UNAVAILABLE' });
    }
    if (data?.role !== 'admin') {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    req.isAdmin = true;
    return next();
  } catch (err) {
    console.error('[auth] role lookup crashed:', err?.message);
    return res.status(503).json({ error: 'AUTH_UNAVAILABLE' });
  }
}