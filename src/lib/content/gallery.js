import { gallery } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchListRows, resolveImageUrl } from './publicTable.js';

export function galleryFallback() {
  return gallery.map((item) => ({
    id: item.id,
    src: item.src,
    captionKo: item.captionKo,
    captionEn: item.captionEn,
    aspect: item.aspect,
    wide: Boolean(item.wide),
  }));
}

export async function fetchGallery() {
  return fetchWithFallback(async () => {
    const allRows = await fetchListRows('gallery_items');
    // Soft-deleted rows (Phase 3-G, supabase/migrations/0007_gallery_soft_delete.sql)
    // are already excluded by RLS's public read policy — this filter is a
    // second, independently-testable layer, not the only thing standing
    // between a deleted photo and the public site.
    //
    // is_active (Phase 3-B, 0004_gallery_active_flag.sql) is NOT enforced
    // by RLS at all — the public read policy only checks deleted_at, so
    // an inactive-but-not-deleted row is still fully readable by anyone;
    // this client-side check is the only thing hiding it. `!== false`
    // (not a strict `=== true`) treats a missing/null value as visible,
    // matching the column's own `not null default true`.
    const rows = allRows.filter((row) => !row.deleted_at && row.is_active !== false);
    if (rows.length === 0) return null;

    return Promise.all(
      rows.map(async (row) => {
        const media = await resolveImageUrl(row.image_id);
        return {
          id: row.item_key,
          src: media?.url ?? undefined,
          captionKo: row.caption_ko,
          captionEn: row.caption_en,
          aspect: row.aspect_ratio,
          wide: row.is_wide,
        };
      }),
    );
  }, galleryFallback());
}
