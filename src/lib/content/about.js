import { about, person, images } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow, resolveImageUrl } from './publicTable.js';
import { resolvePublicImage } from './imagePath.js';

export function aboutFallback() {
  return {
    eyebrowKo: about.eyebrowKo,
    eyebrowEn: about.eyebrowEn,
    headlineKo: about.headlineKo,
    headlineEn: about.headlineEn,
    bioKo: about.bioKo,
    bioEn: about.bioEn,
    imageUrl: resolvePublicImage(images.portrait),
    imageAltKo: person.portraitLabelKo,
    imageAltEn: person.portraitLabelEn,
  };
}

/**
 * Same text content as aboutFallback(), but with no image src — used only
 * as useSectionContent()'s first-paint value (see Profile.jsx), before
 * fetchAbout() has resolved either way. Mirrors Hero's own heroInitial()
 * (src/lib/content/hero.js) and exists for the same reason: aboutFallback()'s
 * local fallback image path is guaranteed to 404 on this deployment (no
 * static photo file exists at it — real photos live in Supabase Storage
 * once configured), so using it as the *initial* render value meant every
 * page load fired that doomed request immediately, adding one wasted
 * network round trip and an extra placeholder repaint before the real
 * Supabase image (or, once fetchAbout() concludes there's no CMS image
 * either, the same local fallback path — still requested then, just no
 * longer wastefully first) ever has a chance to show. ImagePlaceholder
 * already renders `src: null` as an immediate placeholder with no request
 * at all, so this is a pure perceived-loading-speed win with no visual or
 * behavioral change otherwise.
 */
export function aboutInitial() {
  return { ...aboutFallback(), imageUrl: null };
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
      imageUrl: media?.url ?? resolvePublicImage(images.portrait),
      imageAltKo: media?.altKo ?? person.portraitLabelKo,
      imageAltEn: media?.altEn ?? person.portraitLabelEn,
    };
  }, aboutFallback());
}
