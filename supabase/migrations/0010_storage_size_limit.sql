-- ============================================================================
-- Phase 4-H — lower the site-images Storage bucket's file_size_limit to
-- match the tightened client-side MAX_IMAGE_BYTES
-- (src/admin/content/supabaseStorage.js).
--
-- Run this AFTER 0003_storage_setup.sql (which created the bucket).
--
-- 0003 already made this exact insert idempotent via `on conflict (id) do
-- update` — this migration doesn't edit that file (existing migrations
-- are never modified, only added to), it just re-runs the same upsert
-- with the new value, same as how 0008 added GRANTs and 0009 added a new
-- table rather than rewriting an earlier file.
--
-- 2 MB is still generous for a correctly-sized web photo (see
-- src/admin/content/imageGuidelines.js's recommended pixel dimensions —
-- the largest recommended slot is 1600x1200) — this only stops a
-- dramatically oversized/unoptimized upload, most importantly onto the
-- LCP-critical Hero slot. This is a validation-ceiling change only: it
-- does NOT touch, recompress, or delete any file already sitting in the
-- bucket — an existing upload larger than 2MB stays exactly as it is and
-- keeps being served normally; only a NEW upload is now checked against
-- the lower limit (both client-side and here, server-side).
-- ============================================================================

update storage.buckets
set file_size_limit = 2097152 -- 2 MB, matches MAX_IMAGE_BYTES
where id = 'site-images';
