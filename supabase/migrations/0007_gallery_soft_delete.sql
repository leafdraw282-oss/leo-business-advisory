-- ============================================================================
-- Phase 3-G — Gallery soft delete
--
-- Deleting a gallery photo from the admin no longer immediately and
-- permanently removes its row (or the underlying media/storage file) —
-- it's marked `deleted_at`, disappears from both the public site and the
-- admin's main Gallery list, but can be restored from the admin's Trash
-- view. A separate, explicit "영구 삭제" (permanent delete) action is
-- still available in that Trash view for real cleanup — this migration
-- only changes what the everyday "삭제" action does.
--
-- The public read policy is tightened to match: a soft-deleted photo was
-- never meant to be visible again, unlike is_active
-- (0004_gallery_active_flag.sql), which is a temporary show/hide toggle.
-- src/lib/content/gallery.js additionally filters `deleted_at` client-side
-- as a second, independently-testable layer — see docs/PROJECT_STATUS.md's
-- Phase 3-G entry.
-- ============================================================================

alter table gallery_items
  add column if not exists deleted_at timestamptz;

drop policy if exists "gallery_items_public_read" on gallery_items;
create policy "gallery_items_public_read" on gallery_items
  for select using (deleted_at is null);

-- gallery_items_admin_write (`for all using (is_admin())`) already grants
-- the admin full select/insert/update/delete regardless of deleted_at —
-- unaffected by the policy above, which only replaces the *public* read
-- policy. No change needed there.
