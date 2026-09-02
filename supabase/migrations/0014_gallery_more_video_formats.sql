-- ============================================================================
-- Gallery ("비주얼 스토리") — accept more video/animated-image formats
-- beyond the MP4-only support 0013 added: GIF, WebM, QuickTime (.mov), and
-- AVI.
--
-- Run this AFTER 0013_gallery_video_support.sql. This migration doesn't
-- edit that file (existing migrations are never modified, only added to)
-- — it re-runs the same bucket upsert with the expanded mime type list,
-- same pattern 0008/.../0013 already used.
--
-- file_size_limit is unchanged (20MB, still MAX_VIDEO_BYTES) — only the
-- allowed_mime_types list grows. Client-side, src/admin/content/
-- supabaseStorage.js's matching change (VIDEO_MIME_TYPES gains webm/
-- quicktime/x-msvideo, ALLOWED_GALLERY_TYPES gains image/gif) is what
-- validateGalleryFile() actually enforces per-type; every other upload
-- path (Hero/About/Case Studies) is untouched. See that file's own
-- comment on AVI specifically: accepted and stored like any other file,
-- but no major browser ships a native AVI demuxer/codec, so playback
-- through ImagePlaceholder's <video> is not guaranteed the way MP4/WebM/
-- MOV playback is.
-- ============================================================================

update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
]
where id = 'site-images';
