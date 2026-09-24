const required = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_API_URL',
];

const missing = required.filter((k) => !import.meta.env[k]);
if (missing.length > 0) {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}

if (!import.meta.env.VITE_SUPABASE_URL.startsWith('https://')) {
  throw new Error('VITE_SUPABASE_URL must be HTTPS');
}

export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  apiUrl: import.meta.env.VITE_API_URL.replace(/\/$/, ''),
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL,
  isProd: import.meta.env.PROD,
};