import { supabase } from './supabase';

export async function fetchSiteSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key,value');
  if (error) throw error;
  const map = {};
  for (const row of data || []) map[row.key] = row.value ?? '';
  return map;
}

export async function updateSetting(key, value) {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value: value ?? '' }, { onConflict: 'key' });
  if (error) throw error;
}

export async function updateSettings(patch) {
  const rows = Object.entries(patch).map(([key, value]) => ({
    key,
    value: value ?? '',
  }));
  if (!rows.length) return;
  const { error } = await supabase
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' });
  if (error) throw error;
}