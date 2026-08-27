import { supabase } from '../../lib/supabase.js';

// Thin, generic CRUD helpers over the Phase 2-A schema
// (supabase/migrations/0001_init_schema.sql). Every admin content section
// (src/admin/pages/content/*.jsx) is built out of these — none of them
// talk to the Supabase client directly. Callers must check
// isSupabaseConfigured before calling any of these; they assume `supabase`
// is a real client.

/** Singleton content tables (id=1). Returns null if the row doesn't exist yet. */
export async function fetchSingleton(table) {
  const { data, error } = await supabase.from(table).select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertSingleton(table, values) {
  const { data, error } = await supabase
    .from(table)
    .upsert({ id: 1, ...values })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** List content tables, ordered for stable display/edit order. */
export async function fetchList(table, { match } = {}) {
  let query = supabase.from(table).select('*').order('sort_order', { ascending: true });
  if (match) query = query.match(match);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * Insert-or-update a list row: updates by id when one is known (row
 * already exists in the database), otherwise inserts a new row. Used for
 * list tables with no natural unique key (impact_metrics, career_entries,
 * education_entries, inquiry_types, case_study_metrics,
 * case_study_highlights) — rows are matched to admin form state by
 * position instead, since this phase only edits existing values.
 */
export async function saveListRow(table, id, values) {
  if (id) {
    const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from(table).insert(values).select().single();
  if (error) throw error;
  return data;
}

/**
 * Insert-or-update by a natural unique key (advisory_items.item_key,
 * case_studies.case_key) instead of a database id — simpler than
 * saveListRow when the table already has a stable text key matching
 * src/data/profile.js's own id.
 */
export async function upsertByNaturalKey(table, conflictColumn, values) {
  const { data, error } = await supabase
    .from(table)
    .upsert(values, { onConflict: conflictColumn })
    .select()
    .single();
  if (error) throw error;
  return data;
}
