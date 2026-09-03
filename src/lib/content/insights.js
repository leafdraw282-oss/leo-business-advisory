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
    // linkUrl/linkLabel have no profile.js counterpart — they're purely
    // admin-authored (see supabase/migrations/0019_insights_item_links.sql),
    // so the fallback always has them unset, matching a fresh/empty row.
    items: insights.map((item) => ({
      id: item.id,
      titleKo: item.titleKo,
      titleEn: item.titleEn,
      linkUrl: null,
      linkLabelKo: null,
      linkLabelEn: null,
    })),
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
          ? itemRows.map((r) => ({
              id: r.id,
              titleKo: r.title_ko,
              titleEn: r.title_en,
              linkUrl: r.link_url ?? null,
              linkLabelKo: r.link_label_ko ?? null,
              linkLabelEn: r.link_label_en ?? null,
            }))
          : fallback.items,
    };
  }, insightsFallback());
}
