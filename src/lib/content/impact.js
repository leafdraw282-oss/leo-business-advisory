import { impact, impactSection } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow, fetchListRows } from './publicTable.js';

export function impactFallback() {
  return {
    section: {
      eyebrowKo: impactSection.eyebrowKo,
      eyebrowEn: impactSection.eyebrowEn,
      titleKo: impactSection.titleKo,
      titleEn: impactSection.titleEn,
    },
    metrics: impact.map((m) => ({ valueKo: m.valueKo, valueEn: m.valueEn, labelKo: m.labelKo, labelEn: m.labelEn })),
  };
}

export async function fetchImpact() {
  return fetchWithFallback(async () => {
    // Phase 4-H: independent queries, run concurrently — see advisory.js
    // for the same fix with a fuller explanation.
    const [sectionRow, metricRows] = await Promise.all([
      fetchSingletonRow('impact_section'),
      fetchListRows('impact_metrics'),
    ]);
    if (!sectionRow && metricRows.length === 0) return null;

    const fallback = impactFallback();
    return {
      section: sectionRow
        ? {
            eyebrowKo: sectionRow.eyebrow_ko,
            eyebrowEn: sectionRow.eyebrow_en,
            titleKo: sectionRow.title_ko,
            titleEn: sectionRow.title_en,
          }
        : fallback.section,
      metrics:
        metricRows.length > 0
          ? metricRows.map((r) => ({ valueKo: r.value_ko, valueEn: r.value_en, labelKo: r.label_ko, labelEn: r.label_en }))
          : fallback.metrics,
    };
  }, impactFallback());
}
