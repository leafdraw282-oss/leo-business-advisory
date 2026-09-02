import { insightsSection, insights } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow, fetchListRows } from './publicTable.js';

export function insightsFallback() {
  return {
    section: {
      eyebrowKo: insightsSection.eyebrowKo,
      eyebrowEn: insightsSection.eyebrowEn,
      titleKo: insightsSection.titleKo,
      titleEn: insightsSection.titleEn,
      comingSoonKo: insightsSection.comingSoonKo,
      comingSoonEn: insightsSection.comingSoonEn,
    },
    items: insights.map((item) => ({ id: item.id, titleKo: item.titleKo, titleEn: item.titleEn })),
  };
}

export async function fetchInsights() {
  return fetchWithFallback(async () => {
    const [sectionRow, itemRows] = await Promise.all([
      fetchSingletonRow('insights_section'),
      fetchListRows('insights_items'),
    ]);
    if (!sectionRow && itemRows.length === 0) return null;

    const fallback = insightsFallback();
    return {
      section: sectionRow
        ? {
            eyebrowKo: sectionRow.eyebrow_ko,
            eyebrowEn: sectionRow.eyebrow_en,
            titleKo: sectionRow.title_ko,
            titleEn: sectionRow.title_en,
            comingSoonKo: sectionRow.coming_soon_ko,
            comingSoonEn: sectionRow.coming_soon_en,
          }
        : fallback.section,
      items:
        itemRows.length > 0
          ? itemRows.map((r) => ({ id: r.id, titleKo: r.title_ko, titleEn: r.title_en }))
          : fallback.items,
    };
  }, insightsFallback());
}
