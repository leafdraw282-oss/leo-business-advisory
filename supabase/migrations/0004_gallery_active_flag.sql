-- ============================================================================
-- Phase 3-B — Gallery active/inactive flag
--
-- Lets an admin temporarily hide a gallery photo (e.g. a photo pending
-- replacement, or one that no longer fits) without deleting its row —
-- deleting also permanently removes the underlying Storage file and media
-- row, which isn't reversible. Adding a boolean flag instead makes hiding
-- a photo a safe, undoable action.
--
-- `default true` so every existing gallery_items row (and any inserted by
-- older client code that doesn't know about this column yet) stays visible
-- with no migration-time data change needed.
--
-- Admin-side only in this phase: src/admin/pages/images/GalleryImages.jsx
-- reads and writes this column, but the public site's gallery query
-- (src/lib/content/gallery.js) is intentionally left untouched — see
-- docs/PROJECT_STATUS.md's Phase 3-B entry for why, and Phase 3-C for the
-- planned follow-up.
-- ============================================================================

alter table gallery_items
  add column if not exists is_active boolean not null default true;
