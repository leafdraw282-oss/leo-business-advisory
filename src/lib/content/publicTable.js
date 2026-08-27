import { supabase } from '../supabase.js';

// Read-only query helpers for the public site's content layer
// (src/lib/content/*.js). Deliberately separate from the admin's
// src/admin/content/supabaseTable.js — the public bundle never imports
// anything from src/admin/, keeping the two entry points' dependency
// graphs fully independent (see docs/PROJECT_STATUS.md Phase 2-B).
// Callers are expected to run these only through fetchWithFallback.js,
// which already guards on isSupabaseConfigured and catches errors.

export async function fetchSingletonRow(table) {
  const { data, error } = await supabase.from(table).select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchListRows(table, { match } = {}) {
  let query = supabase.from(table).select('*').order('sort_order', { ascending: true });
  if (match) query = query.match(match);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Resolves a media.id FK to its public Storage URL, or null if unset/missing. */
export async function resolveImageUrl(mediaId) {
  if (!mediaId) return null;
  const { data, error } = await supabase.from('media').select('storage_path, alt_ko, alt_en').eq('id', mediaId).maybeSingle();
  if (error || !data) return null;
  return {
    url: supabase.storage.from('site-images').getPublicUrl(data.storage_path).data.publicUrl,
    altKo: data.alt_ko,
    altEn: data.alt_en,
  };
}
