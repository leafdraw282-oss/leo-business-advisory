import { supabase } from '../../lib/supabase.js';

// Uploads go to the "site-images" public bucket created in
// supabase/migrations/0003_storage_setup.sql (public read, admin-only
// write via RLS on storage.objects). Every uploaded file is also recorded
// as one row in the `media` table (supabaseTable.js) — content tables
// reference media.id, never a raw storage path.

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
// Phase 4-H: measured against this site's real recommended upload
// dimensions (src/admin/content/imageGuidelines.js — the largest is
// 1600x1200) — a well-compressed JPEG/WebP/PNG at those sizes is
// typically well under 1MB, often a few hundred KB. 5MB (the original
// value) was ~10x more than any correctly-exported photo at the
// recommended size would ever need, so it did nothing to stop an admin
// from accidentally uploading an oversized, unoptimized file straight
// onto the LCP-critical Hero slot. 2MB stays generous — plenty of
// headroom above what a correctly-sized image needs — while actually
// catching that mistake. Existing already-uploaded files are completely
// unaffected; this only changes what a NEW upload accepts.
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

// Shown alongside the pixel-size guidance (ImageGuidelines.jsx) as a
// target, not a hard cap — MAX_IMAGE_BYTES above is the actual enforced
// ceiling. A well-exported photo at the recommended dimensions should
// comfortably land under this.
export const RECOMMENDED_MAX_KB = 500;

/** Returns an error message if the file fails type/size validation, or null if it's fine. */
export function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Unsupported file type (${file.type || 'unknown'}). Use JPEG, PNG, WebP, or SVG.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`;
  }
  return null;
}

// Gallery ("비주얼 스토리") only — every other image slot (Hero/About/Case
// Studies) still validates against ALLOWED_IMAGE_TYPES/MAX_IMAGE_BYTES
// above, completely unchanged. A real video is a different kind of asset
// from a still photo, so it gets its own, much larger size ceiling —
// MAX_IMAGE_BYTES' 2MB is sized for a correctly-compressed photo and would
// reject almost any real video clip. 20MB is generous for a short,
// web-optimized clip without being unbounded.
//
// WebM and MP4/H.264 play natively in every current browser; QuickTime
// (.mov, common straight off an iPhone) plays in Safari and most Chromium
// builds. AVI has never been a native web format — no major browser ships
// a demuxer/codec for it — so an uploaded .avi is accepted and stored like
// any other file, but ImagePlaceholder's <video> will very likely fail to
// play it client-side and fall back to the labeled placeholder, same as
// any other file a visitor's browser can't decode. Included because it
// was explicitly asked for, not because playback is guaranteed.
export const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
// GIF is an image (animated or not) — a browser renders it via a plain
// <img>, no <video> element involved, so it lives in ALLOWED_GALLERY_TYPES
// as just another accepted image type, not alongside VIDEO_MIME_TYPES.
export const ALLOWED_GALLERY_TYPES = [...ALLOWED_IMAGE_TYPES, 'image/gif', ...VIDEO_MIME_TYPES];
export const MAX_VIDEO_BYTES = 20 * 1024 * 1024; // 20 MB

/** Same as validateImageFile(), but also accepts GIF/MP4/WebM/MOV/AVI (Gallery only) — video formats get their own, larger size ceiling. */
export function validateGalleryFile(file) {
  if (!ALLOWED_GALLERY_TYPES.includes(file.type)) {
    return `Unsupported file type (${file.type || 'unknown'}). Use JPEG, PNG, WebP, SVG, GIF, MP4, WebM, MOV, or AVI.`;
  }
  const isVideo = VIDEO_MIME_TYPES.includes(file.type);
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is ${maxBytes / 1024 / 1024} MB.`;
  }
  return null;
}

// Only matters as a fallback when the source filename has no usable
// extension of its own (see below) — but two of the MIME types this file
// accepts don't produce a sensible one via the naive "part after the
// slash" fallback (`video/quicktime` -> "quicktime", `video/x-msvideo` ->
// "x-msvideo", `image/svg+xml` -> "svg+xml"), so those three are mapped
// explicitly to the extension a browser/OS actually expects.
const MIME_EXTENSIONS = {
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
  'image/svg+xml': 'svg',
};

function extensionFor(file) {
  const fromName = file.name?.split('.').pop();
  if (fromName && fromName.length <= 5 && /^[a-zA-Z0-9]+$/.test(fromName)) return fromName.toLowerCase();
  return MIME_EXTENSIONS[file.type] ?? file.type.split('/').pop();
}

/** Uploads a validated file under `folder/` with a generated unique name. Returns the storage path. */
export async function uploadImageFile(folder, file) {
  const path = `${folder}/${crypto.randomUUID()}.${extensionFor(file)}`;
  const { error } = await supabase.storage.from('site-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  return path;
}

export function publicUrlFor(storagePath) {
  const { data } = supabase.storage.from('site-images').getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function removeStorageFile(storagePath) {
  const { error } = await supabase.storage.from('site-images').remove([storagePath]);
  if (error) throw error;
}
