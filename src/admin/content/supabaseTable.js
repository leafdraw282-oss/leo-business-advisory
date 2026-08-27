import { supabase } from '../../lib/supabase.js';

// Thin, generic CRUD helpers over the Phase 2-A schema
// (supabase/migrations/0001_init_schema.sql). Every admin content section
// (src/admin/pages/content/*.jsx) is built out of these — none of them
// talk to the Supabase client directly. Callers must check
// isSupabaseConfigured before calling any of these; they assume `supabase`
// is a real client.

// Phase 3-G: every write that goes through upsertSingleton/saveListRow's
// update path/upsertByNaturalKey snapshots the row's PRE-write state into
// content_revisions (0006_content_revisions.sql) first — a rolling "undo
// my last edit" safety net covering every content section at once,
// without each of them needing to know this exists. Recording a snapshot
// is always best-effort: if it fails for any reason, the real save still
// proceeds — a backup mechanism must never become a new way for a
// legitimate save to fail.
async function recordRevision(table, rowId, previousRow) {
  if (!previousRow) return; // nothing to snapshot on first-ever create
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from('content_revisions').insert({
      table_name: table,
      row_id: String(rowId),
      snapshot: previousRow,
      changed_by: user?.id ?? null,
    });
    if (error) throw error;
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    console.warn(`[admin] revision snapshot skipped for ${table}:${rowId} (save still proceeds):`, err);
  }
}

/** Singleton content tables (id=1). Returns null if the row doesn't exist yet. */
export async function fetchSingleton(table) {
  const { data, error } = await supabase.from(table).select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertSingleton(table, values) {
  const previous = await fetchSingleton(table).catch(() => null);
  await recordRevision(table, 1, previous);
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
    const { data: previous } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
    await recordRevision(table, id, previous);
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
  const { data: previous } = await supabase.from(table).select('*').eq(conflictColumn, values[conflictColumn]).maybeSingle();
  if (previous) await recordRevision(table, previous.id, previous);
  const { data, error } = await supabase
    .from(table)
    .upsert(values, { onConflict: conflictColumn })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Fetch a single row by its primary key (uuid or int). Returns null if id is falsy or no row matches. */
export async function fetchRowById(table, id) {
  if (!id) return null;
  const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

/** Permanently deletes one row by id (Phase 2-D: media rows; Phase 3-G: gallery_items permanent-delete only — everyday Gallery delete is a soft delete, see useGalleryImages.js). */
export async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

/**
 * Most recent content_revisions rows across every table, newest first —
 * backs the admin's "최근 변경 기록" (Revisions) screen. Not scoped to one
 * table/row, since the whole point is one place to see everything that
 * changed recently.
 */
export async function fetchRecentRevisions(limit = 50) {
  const { data, error } = await supabase
    .from('content_revisions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * Restores one revision's snapshot back onto its live row. Snapshots the
 * row's current (pre-restore) state first, through the same
 * recordRevision() used by every other write here — so restoring is
 * itself undoable, not a one-way trip.
 */
export async function restoreRevision(revision) {
  const { table_name: table, row_id: rowId, snapshot } = revision;
  const { data: current } = await supabase.from(table).select('*').eq('id', rowId).maybeSingle();
  await recordRevision(table, rowId, current);

  const fields = { ...snapshot };
  delete fields.id; // id is the update target (.eq below), never a field to write
  const { error } = await supabase.from(table).update(fields).eq('id', rowId);
  if (error) throw error;
}
