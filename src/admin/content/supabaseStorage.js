import { supabase } from '../../lib/supabase.js';

// Uploads go to the "site-images" public bucket created in
// supabase/migrations/0003_storage_setup.sql (public read, admin-only
// write via RLS on storage.objects). Every uploaded file is also recorded
// as one row in the `media` table (supabaseTable.js) — content tables
// reference media.id, never a raw storage path.

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB — generous for web photography, small enough to keep the bucket lean.

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
