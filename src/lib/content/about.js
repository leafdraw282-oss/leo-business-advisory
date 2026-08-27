import { about, person, images } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow, resolveImageUrl } from './publicTable.js';

export function aboutFallback() {
  return {
    eyebrowKo: about.eyebrowKo,
    eyebrowEn: about.eyebrowEn,
    headlineKo: about.headlineKo,
    headlineEn: about.headlineEn,
    bioKo: about.bioKo,
    bioEn: about.bioEn,
    imageUrl: images.portrait,
    imageAltKo: person.portraitLabelKo,
    imageAltEn: person.portraitLabelEn,
  };
}

export async function fetchAbout() {
  return fetchWithFallback(async () => {
    const row = await fetchSingletonRow('about_content');
    if (!row) return null;

    const media = await resolveImageUrl(row.portrait_image_id);

    return {
      eyebrowKo: row.eyebrow_ko,
      eyebrowEn: row.eyebrow_en,
      headlineKo: row.headline_ko,
      headlineEn: row.headline_en,
      bioKo: row.bio_ko,
      bioEn: row.bio_en,
      imageUrl: media?.url ?? images.portrait,
      imageAltKo: media?.altKo ?? person.portraitLabelKo,
      imageAltEn: media?.altEn ?? person.portraitLabelEn,
    };
  }, aboutFallback());
}
