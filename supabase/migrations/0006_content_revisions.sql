-- ============================================================================
-- Phase 3-G — Content revision history (minimal, not Git-like)
--
-- One generic table covers every admin-editable content table at once —
-- Hero, About/Profile, Impact, Case Studies, Advisory, Career, Contact,
-- and (as a side effect of being generic rather than per-table) Education
-- and Footer too. Before every admin save, the CURRENT row is snapshotted
-- here as jsonb; the actual write then proceeds normally. This is a
-- rolling "undo my last edit(s)" safety net, not a version-control
-- system: no branching, no diffing, no commit graph — just "what did this
-- row look like a moment ago, and can I put that back."
--
-- Deliberately excludes gallery_items/media (see 0007_gallery_soft_delete.sql
-- for that table's own, differently-shaped recovery mechanism) and
-- inquiries (visitor-submitted, not admin-authored content — Phase 3-C's
-- RLS already makes those effectively append-only from the public side).
-- ============================================================================

create table if not exists content_revisions (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  row_id text not null, -- text so it fits both singleton tables (id=1) and uuid-keyed list tables
  snapshot jsonb not null,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists content_revisions_lookup_idx
  on content_revisions (table_name, row_id, created_at desc);

alter table content_revisions enable row level security;

-- Same admin-only shape as every content table's write policy — nobody
-- but an admin session can ever read or write a revision. No update
-- policy at all: revisions are write-once from the client (append,
-- never edited). No client-facing delete policy either — pruning old
-- revisions happens only via the SECURITY DEFINER trigger below, which
-- bypasses RLS the same way is_admin() itself does.
create policy "content_revisions_admin_select" on content_revisions
  for select using (is_admin());

create policy "content_revisions_admin_insert" on content_revisions
  for insert with check (is_admin());

-- Retention cap — keeps at most the 10 most recent snapshots per
-- (table_name, row_id), so this table can't grow unbounded from repeated
-- edits over time. This is the one piece of "policy" here, and it's
-- intentionally simple: no configurable retention window, no archival
-- tier, just "keep the last 10, drop the rest."
create or replace function prune_content_revisions()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from content_revisions
  where table_name = new.table_name
    and row_id = new.row_id
    and id not in (
      select id from content_revisions
      where table_name = new.table_name and row_id = new.row_id
      order by created_at desc
      limit 10
    );
  return new;
end;
$$;

drop trigger if exists content_revisions_prune on content_revisions;
create trigger content_revisions_prune
  after insert on content_revisions
  for each row execute function prune_content_revisions();
