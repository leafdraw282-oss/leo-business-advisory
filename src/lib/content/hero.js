import { hero, person, images } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow, resolveImageUrl } from './publicTable.js';
import { resolvePublicImage } from './imagePath.js';

export function heroFallback() {
  return {
    eyebrowKo: hero.eyebrowKo,
    eyebrowEn: hero.eyebrowEn,
    headlineKo: hero.headlineKo,
    headlineEn: hero.headlineEn,
    subheadKo: hero.subheadKo,
    subheadEn: hero.subheadEn,
    ctaPrimaryKo: hero.ctaPrimaryKo,
    ctaPrimaryEn: hero.ctaPrimaryEn,
    ctaPrimaryTarget: hero.ctaPrimaryTarget,
    ctaSecondaryKo: hero.ctaSecondaryKo,
    ctaSecondaryEn: hero.ctaSecondaryEn,
    ctaSecondaryTarget: hero.ctaSecondaryTarget,
    imageUrl: resolvePublicImage(images.hero),
    imageAltKo: person.portraitLabelKo,
    imageAltEn: person.portraitLabelEn,
  };
}

export async function fetchHero() {
  return fetchWithFallback(async () => {
    const row = await fetchSingletonRow('hero_content');
    if (!row) return null;

    const media = await resolveImageUrl(row.hero_image_id);

    // headline_ko/en are jsonb arrays (Hero.jsx maps over each line) — a
    // hand-edited row in the Supabase table editor could leave one as a
    // plain string or other non-array value, which would crash
    // `.map()` in Hero.jsx. Guard the type, not just presence.
    return {
      eyebrowKo: row.eyebrow_ko,
      eyebrowEn: row.eyebrow_en,
      headlineKo: Array.isArray(row.headline_ko) ? row.headline_ko : hero.headlineKo,
      headlineEn: Array.isArray(row.headline_en) ? row.headline_en : hero.headlineEn,
      subheadKo: row.subhead_ko,
      subheadEn: row.subhead_en,
      ctaPrimaryKo: row.cta_primary_ko,
      ctaPrimaryEn: row.cta_primary_en,
      ctaPrimaryTarget: row.cta_primary_target ?? hero.ctaPrimaryTarget,
      ctaSecondaryKo: row.cta_secondary_ko,
      ctaSecondaryEn: row.cta_secondary_en,
      ctaSecondaryTarget: row.cta_secondary_target ?? hero.ctaSecondaryTarget,
      imageUrl: media?.url ?? resolvePublicImage(images.hero),
      imageAltKo: media?.altKo ?? person.portraitLabelKo,
      imageAltEn: media?.altEn ?? person.portraitLabelEn,
    };
  }, heroFallback());
}
