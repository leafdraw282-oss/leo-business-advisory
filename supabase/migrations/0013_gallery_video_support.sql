-- ============================================================================
-- Gallery ("비주얼 스토리") video support — allow MP4 uploads into the
-- existing `site-images` Storage bucket alongside photos.
--
-- Run this AFTER 0010_storage_size_limit.sql. This migration doesn't edit
-- 0003/0010 (existing migrations are never modified, only added to) — it
-- re-runs the same bucket upsert those did, with the new mime type/limit,
-- same pattern 0008/0009/0010/0011/0012 already used.
--
-- Two things change together, matching the client-side update in the same
-- change (src/admin/content/supabaseStorage.js's new ALLOWED_GALLERY_TYPES/
-- MAX_VIDEO_BYTES, used only by src/admin/content/useGalleryImages.js —
-- every other upload path, Hero/About/Case Studies, still validates
-- against the original ALLOWED_IMAGE_TYPES/MAX_IMAGE_BYTES, completely
-- unaffected by this file):
--
-- 1. `allowed_mime_types` gains 'video/mp4'.
-- 2. `file_size_limit` rises from 2MB to 20MB (MAX_VIDEO_BYTES) — this is
--    a single bucket-wide ceiling (Storage has no per-mime-type limit), so
--    it becomes the outer bound for every upload into this bucket,
--    photos included. The tighter 2MB photo limit is still enforced by
--    the client (validateGalleryFile/validateImageFile) — same "client is
--    the real per-type gate, server is a hard ceiling against a direct API
--    call" layering 0003's own comment already describes; a non-image,
--    non-video-mp4 file is still rejected outright by allowed_mime_types
--    regardless of size.
-- ============================================================================

update storage.buckets
set file_size_limit = 20971520, -- 20 MB, matches MAX_VIDEO_BYTES
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4']
where id = 'site-images';
