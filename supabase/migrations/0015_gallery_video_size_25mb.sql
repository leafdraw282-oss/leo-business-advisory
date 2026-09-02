-- ============================================================================
-- Gallery ("비주얼 스토리") — raise the video upload ceiling from 20MB to
-- 25MB.
--
-- Run this AFTER 0013_gallery_video_support.sql (which first set
-- file_size_limit to 20MB alongside allowed_mime_types). This migration
-- doesn't edit 0013/0014 (existing migrations are never modified, only
-- added to) — it re-runs the same bucket upsert with the new limit, same
-- pattern 0008/.../0014 already used.
--
-- file_size_limit is a single bucket-wide ceiling (Storage has no
-- per-mime-type limit), so this also nominally raises the outer bound for
-- photo uploads — but the tighter 2MB photo ceiling (MAX_IMAGE_BYTES) is,
-- and always was, enforced client-side only; nothing here changes that.
-- src/admin/content/supabaseStorage.js's MAX_VIDEO_BYTES was updated to
-- the same 25MB in the same change.
-- ============================================================================

update storage.buckets
set file_size_limit = 26214400 -- 25 MB, matches MAX_VIDEO_BYTES
where id = 'site-images';
