import { hero, about, caseStudies } from '../../data/profile.js';

// hero_content / about_content / case_studies all have NOT NULL text
// columns beyond the image FK this phase adds (eyebrow, headline, bio,
// title, summary, ...). If an admin attaches an image to a slot before
// its own text has ever been saved through the Phase 2-C Content editor,
// a bare `{ id: 1, hero_image_id: ... }` upsert would fail its NOT NULL
// constraints on first insert. These builders always return a complete,
// valid row: the table's *current* values when a row already exists,
// falling back to src/data/profile.js's own text (unmodified, same as
// Phase 2-C's own fallback) when it doesn't — so an image can always be
// attached first, saved first, or in any order relative to the text.

export function heroRowDefaults(existingRow) {
  return {
    eyebrow_ko: existingRow?.eyebrow_ko ?? hero.eyebrowKo,
    eyebrow_en: existingRow?.eyebrow_en ?? hero.eyebrowEn,
    headline_ko: existingRow?.headline_ko ?? hero.headlineKo,
    headline_en: existingRow?.headline_en ?? hero.headlineEn,
    subhead_ko: existingRow?.subhead_ko ?? hero.subheadKo,
    subhead_en: existingRow?.subhead_en ?? hero.subheadEn,
    cta_primary_ko: existingRow?.cta_primary_ko ?? hero.ctaPrimaryKo,
    cta_primary_en: existingRow?.cta_primary_en ?? hero.ctaPrimaryEn,
    cta_primary_target: existingRow?.cta_primary_target ?? hero.ctaPrimaryTarget,
    cta_secondary_ko: existingRow?.cta_secondary_ko ?? hero.ctaSecondaryKo,
    cta_secondary_en: existingRow?.cta_secondary_en ?? hero.ctaSecondaryEn,
    cta_secondary_target: existingRow?.cta_secondary_target ?? hero.ctaSecondaryTarget,
    hero_image_id: existingRow?.hero_image_id ?? null,
  };
}

export function aboutRowDefaults(existingRow) {
  return {
    eyebrow_ko: existingRow?.eyebrow_ko ?? about.eyebrowKo,
    eyebrow_en: existingRow?.eyebrow_en ?? about.eyebrowEn,
    headline_ko: existingRow?.headline_ko ?? about.headlineKo,
    headline_en: existingRow?.headline_en ?? about.headlineEn,
    bio_ko: existingRow?.bio_ko ?? about.bioKo,
    bio_en: existingRow?.bio_en ?? about.bioEn,
    portrait_image_id: existingRow?.portrait_image_id ?? null,
  };
}

export function caseStudyRowDefaults(caseKey, existingRow) {
  const fallback = caseStudies.find((c) => c.id === caseKey);
  const fallbackIndex = caseStudies.findIndex((c) => c.id === caseKey);
  return {
    case_key: caseKey,
    tag: existingRow?.tag ?? fallback.tag,
    title_ko: existingRow?.title_ko ?? fallback.titleKo,
    title_en: existingRow?.title_en ?? fallback.titleEn,
    summary_ko: existingRow?.summary_ko ?? fallback.summaryKo,
    summary_en: existingRow?.summary_en ?? fallback.summaryEn,
    sort_order: existingRow?.sort_order ?? fallbackIndex,
    image_id: existingRow?.image_id ?? null,
  };
}
