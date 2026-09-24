
export function sanitizeSearch(input, maxLen = 80) {
  return String(input ?? '')
    .replace(/[%_,()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function sanitizeText(input, maxLen = 5000) {
  return String(input ?? '').trim().slice(0, maxLen);
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? ''));
}

export function isValidUrl(url) {
  try {
    const u = new URL(String(url));
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}