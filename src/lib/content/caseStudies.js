import { caseStudies, caseStudiesSection, images } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow, fetchListRows, resolveImageUrl } from './publicTable.js';
import { resolvePublicImage } from './imagePath.js';

export function caseStudiesFallback() {
  return {
    section: {
      eyebrowKo: caseStudiesSection.eyebrowKo,
      eyebrowEn: caseStudiesSection.eyebrowEn,
      titleKo: caseStudiesSection.titleKo,
      titleEn: caseStudiesSection.titleEn,
    },
    items: caseStudies.map((fc) => fallbackCase(fc)),
  };
}

function fallbackCase(fc) {
  return {
    id: fc.id,
    tag: fc.tag,
    titleKo: fc.titleKo,
    titleEn: fc.titleEn,
    summaryKo: fc.summaryKo,
    summaryEn: fc.summaryEn,
    metrics: (fc.metrics ?? []).map((m) => ({ valueKo: m.valueKo, valueEn: m.valueEn, labelKo: m.labelKo, labelEn: m.labelEn })),
    highlights: (fc.highlights ?? []).map((h) => ({ ko: h.ko, en: h.en })),
    imageUrl: resolvePublicImage(images[fc.image]),
  };
}

export async function fetchCaseStudies() {
  return fetchWithFallback(async () => {
    // Phase 4-H: sectionRow/caseRows are independent (neither's result
    // shapes the other's query) — run concurrently.
    const [sectionRow, caseRows] = await Promise.all([
      fetchSingletonRow('case_studies_section'),
      fetchListRows('case_studies'),
    ]);
    if (!sectionRow && caseRows.length === 0) return null;

    const fallback = caseStudiesFallback();
    const section = sectionRow
      ? { eyebrowKo: sectionRow.eyebrow_ko, eyebrowEn: sectionRow.eyebrow_en, titleKo: sectionRow.title_ko, titleEn: sectionRow.title_en }
      : fallback.section;

    if (caseRows.length === 0) {
      return { section, items: fallback.items };
    }

    // Also independent of each other — still gated behind the caseRows
    // check above (unchanged: no point fetching either when there are no
    // case rows to attach them to).
    const [allMetrics, allHighlights] = await Promise.all([
      fetchListRows('case_study_metrics'),
      fetchListRows('case_study_highlights'),
    ]);

    const items = await Promise.all(
      caseStudies.map(async (fc) => {
        const dbCase = caseRows.find((r) => r.case_key === fc.id);
        if (!dbCase) return fallbackCase(fc);

        const metrics = allMetrics.filter((m) => m.case_study_id === dbCase.id);
        const highlights = allHighlights.filter((h) => h.case_study_id === dbCase.id);
        const media = await resolveImageUrl(dbCase.image_id);
        const fallbackItem = fallbackCase(fc);

        return {
          id: fc.id,
          tag: dbCase.tag,
          titleKo: dbCase.title_ko,
          titleEn: dbCase.title_en,
          summaryKo: dbCase.summary_ko,
          summaryEn: dbCase.summary_en,
          metrics:
            metrics.length > 0
              ? metrics.map((m) => ({ valueKo: m.value_ko, valueEn: m.value_en, labelKo: m.label_ko, labelEn: m.label_en }))
              : fallbackItem.metrics,
          highlights: highlights.length > 0 ? highlights.map((h) => ({ ko: h.label_ko, en: h.label_en })) : fallbackItem.highlights,
          imageUrl: media?.url ?? fallbackItem.imageUrl,
        };
      }),
    );

    return { section, items };
  }, caseStudiesFallback());
}
