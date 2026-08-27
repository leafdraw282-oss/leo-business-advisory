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

function extensionFor(file) {
  const fromName = file.name?.split('.').pop();
  if (fromName && fromName.length <= 5 && /^[a-zA-Z0-9]+$/.test(fromName)) return fromName.toLowerCase();
  return file.type.split('/').pop();
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
