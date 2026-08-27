# Backup & Recovery (Phase 3-G)

What happens when an admin changes or deletes something they shouldn't
have — and how to get it back. This is a **minimal, rolling safety net**,
not a version-control system: no branching, no diffing, no full history
browser. It exists to make the common mistake ("I typed over the wrong
field and saved," "I deleted the wrong photo") recoverable in a minute or
two, by the admin themselves, without needing Supabase support or a
database restore.

## Two layers, not one

**Layer 1 — Supabase's own backups (infrastructure-level, outside this
codebase).** Every Supabase project (even the free tier) keeps automatic
daily backups; paid tiers add Point-in-Time Recovery (PITR), letting you
restore the whole database to any moment in the last several days. This
is the layer that protects against catastrophic loss — the database
itself gets corrupted, a migration goes wrong, something truly
unexpected happens. **This repo cannot configure or trigger this layer
from code** — it's a Supabase Dashboard setting and, for an actual
restore, a support request or a Dashboard action on Supabase's side. See
**User Action Required** below.

**Layer 2 — `content_revisions` (this phase, self-service).** A single
admin mistake — an overwritten field, a wrong value saved — doesn't
justify a full database restore, and waiting on one is slow. This layer
lets the admin undo it themselves, immediately, from the admin UI. It's
a rolling window of recent snapshots, not a full history, and it only
covers admin-authored content (see Revision System below) — it is not a
substitute for Layer 1, just a much faster tool for the much more common
case.

## Revision System

**Schema** (`supabase/migrations/0006_content_revisions.sql`):

```sql
create table content_revisions (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  row_id text not null,
  snapshot jsonb not null,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
```

One generic table, not one revision table per content table — the
schema has 8 singleton tables and 6 admin-editable list tables under
Hero/Profile/Impact/Case Studies/Advisory/Career/Contact alone; a
per-table revision system would be 14 near-identical tables for no real
benefit. `table_name`/`row_id` identify which row a snapshot belongs to;
`snapshot` is that row's full previous state as jsonb.

**How it's populated.** `src/admin/content/supabaseTable.js`'s three
generic write functions — `upsertSingleton`, `saveListRow` (its update
path), `upsertByNaturalKey` — every admin content section is built out
of these, none of them talk to Supabase directly. Each one now fetches
the row's *current* state and snapshots it into `content_revisions`
**before** applying the write. This means every one of Hero, About,
Impact (heading + metrics), Case Studies (heading + each case + its
metrics/highlights), Advisory (heading + items), Career (heading +
entries), and Contact (info, CTA, form labels, inquiry types) is covered
automatically — as a side effect of being centralized, Education and
Footer are covered too, even though they weren't named in this phase's
explicit list.

Recording a snapshot is **best-effort and never blocks the real save** —
wrapped in its own try/catch that only logs a warning on failure. A
backup mechanism must never become a new way for a legitimate save to
fail.

**Retention.** A `content_revisions_prune` trigger (SECURITY DEFINER,
same pattern as `is_admin()`) runs after every insert and keeps only the
10 most recent snapshots per `(table_name, row_id)` pair, deleting older
ones. This is the one deliberate limit in the whole system: no
configurable window, no archival tier — just "keep the last 10." Chosen
because it comfortably covers "I made a mistake within my last few
edits" without letting the table grow unbounded from years of routine
saves.

**What's deliberately excluded:**
- `gallery_items`/`media` — a different shape of problem (a whole
  photo+caption unit being added/removed, not a field being edited), and
  soft delete already gives them the safety net that fits their shape.
  See Delete Protection below.
- `inquiries` — visitor-submitted, not admin-authored. RLS
  (`supabase/migrations/0005_inquiries.sql`) already makes these
  effectively append-only from the visitor's side; the only writes an
  admin makes are status changes, which aren't the kind of "accidental
  content loss" this phase is about.

## Delete Protection

Confirmation dialogs already existed everywhere deletion happens
(Gallery, Inquiries, image-slot clearing) before this phase — that part
of the requirement was already met. This phase adds real **recoverability**
on top, for the one place deletion previously meant permanent, immediate
loss:

**Gallery photos — soft delete.** `gallery_items` gained a `deleted_at`
column (`supabase/migrations/0007_gallery_soft_delete.sql`). Clicking
"휴지통으로 이동" (move to trash) in the admin no longer deletes the row —
it sets `deleted_at`, which:
- Removes it from the public site immediately (RLS's public read policy
  is now `using (deleted_at is null)` — tightened at the database level,
  not just in application code — and `src/lib/content/gallery.js`
  additionally filters `deleted_at` client-side as a second,
  independently-testable layer, since RLS itself can't be exercised
  against this repo's local mock-backend test setup).
- Removes it from the admin's main Gallery list.
- Adds it to a new Trash section in the admin Gallery screen, where it
  can be **복원**'d (restored — `deleted_at` set back to `null`, it
  reappears in the main list) or **영구 삭제**'d (permanently deleted —
  the actual row *and* its media row/storage file, for real cleanup).

This soft-delete/restore/permanent-delete cycle writes immediately, the
same "no draft step" pattern already used for Inquiries' status changes
— each is a single, self-contained action, not a field accumulating
into a batch save.

**Content list rows** (case studies, career entries, advisory items,
etc.) — none of these currently have a delete control in the admin at
all (confirmed by grep: nothing outside Gallery/Inquiries/image-slots
ever calls the underlying delete function); this phase didn't add one.
If a future phase adds row deletion to these sections, extending them
with the same `deleted_at` pattern (or, since they're already covered by
`content_revisions`, simply relying on that) would be the natural next
step — not built now, since there's no delete UI for these yet to
protect.

## Restore Flow

New admin screen: **Revisions** (`src/admin/pages/Revisions.jsx`,
Dashboard nav item + "변경 기록" shortcut card). Meets exactly the
"minimum" this phase asked for and nothing more:

- **최근 변경 기록 (recent changes)** — every `content_revisions` row,
  newest first, labeled with a plain Korean section name (e.g. "Hero",
  "Case Study", "Contact 연락처 정보") instead of the raw table name.
- **변경 시각 (when)** — each entry's `created_at`, localized.
- **복원 (restore)** — expands to a simple field-by-field preview of the
  snapshot (skips `id`/`created_at`/`updated_at`; renders object/array
  values via `JSON.stringify` rather than building bespoke rendering per
  table shape — intentionally plain, not a diff view), then a confirm
  dialog, then writes immediately.

Restoring itself snapshots the row's *pre-restore* state through the
same `content_revisions` mechanism first — so restoring is itself
undoable, not a one-way trip. There's no dedicated "undo my restore"
button; you'd restore again from the new snapshot the same way.

## Storage Strategy

**The question this phase asked to review:** does immediately deleting
the previous image on replacement hurt recoverability? **Yes, and this
phase changes it.**

Before this phase, replacing an image (Hero, About/Profile, any Case
Study, or a Gallery photo) or clearing an image slot immediately deleted
the *old* media row and its Storage file, right after the new one was
confirmed live. That old image was completely unrecoverable the moment
the save succeeded — no revision history, no trash, nothing.

**New policy: stop deleting it.** `src/admin/content/useImageSlot.js`'s
`save()` and `resetSlot()`, and `src/admin/content/useGalleryImages.js`'s
per-item save loop, no longer call `removeStorageFile`/`deleteRow` on
the previous image at all. The old media row and its file become
**orphaned** (nothing references them any more) but stay fully intact —
recoverable by re-attaching them via direct Supabase access if ever
needed. Verified live: replacing a Hero image and a Gallery photo both
leave the old `media` row exactly as it was, with the parent row now
pointing at the new one.

**The tradeoff, stated plainly:** Storage usage grows a little with
every image replacement instead of staying flat — an admin who
re-uploads a Hero photo ten times over a year keeps all ten files. This
phase's instruction was explicit: pick "simple and safe" over
"automatically reclaims space." Simple here means *doing nothing extra*
— no new orphan-tracking table, no scheduled cleanup job, no "are you
sure, this will free up space" UI. Safe means nothing is ever lost as a
side effect of an ordinary content edit.

**What this doesn't include (by design, not by oversight):** there is no
admin screen to browse or clean up orphaned images. For a site this
size, manual periodic cleanup via the Supabase Dashboard's Storage
browser (cross-referenced against which `storage_path` values are still
referenced by a `media` row that's still referenced by a content table)
is a reasonable occasional chore, not something worth building UI for
yet. If Storage usage becomes a real concern later, that's the natural
next feature — not built now.

## User Action Required

1. **Enable/confirm Supabase's own backup settings** once a real project
   exists — this is a Supabase Dashboard setting (Project Settings →
   Database → Backups), not something in this repository. Consider
   whether Point-in-Time Recovery (a paid-tier feature) is worth it for
   your risk tolerance.
2. **No code change can guarantee a restore actually works** — the
   revision system and Gallery trash in this phase were verified against
   a local mock backend (no real Supabase project exists for this repo
   yet), including the actual restore/soft-delete/permanent-delete flows
   working end-to-end. The retention-cap trigger (SQL, PL/pgSQL) was
   hand-reviewed for correctness but could not be exercised against real
   Postgres in this environment — re-verify it fires correctly (insert
   11+ revisions for one row, confirm only the latest 10 remain) once a
   real project exists.
3. **Periodic Storage cleanup** (see Storage Strategy above) is a manual
   task, not automated by this phase — revisit if/when Storage usage
   noticeably grows.
