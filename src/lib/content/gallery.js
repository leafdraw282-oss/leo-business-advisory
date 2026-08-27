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
    const rows = await fetchListRows('gallery_items');
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
