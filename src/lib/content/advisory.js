import { advisory } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow, fetchListRows } from './publicTable.js';

export function advisoryFallback() {
  return {
    eyebrowKo: advisory.eyebrowKo,
    eyebrowEn: advisory.eyebrowEn,
    titleKo: advisory.titleKo,
    titleEn: advisory.titleEn,
    items: advisory.items.map((item) => ({ id: item.id, ko: item.ko, en: item.en })),
  };
}

export async function fetchAdvisory() {
  return fetchWithFallback(async () => {
    // Phase 4-H: neither query depends on the other's result, so run them
    // concurrently instead of one-after-another — same two requests, but
    // this section's total fetch latency is now bounded by the slower of
    // the two instead of their sum.
    const [sectionRow, itemRows] = await Promise.all([
      fetchSingletonRow('advisory_section'),
      fetchListRows('advisory_items'),
    ]);
    if (!sectionRow && itemRows.length === 0) return null;

    const fallback = advisoryFallback();
    const items =
      itemRows.length > 0
        ? advisory.items.map((fallbackItem) => {
            const dbItem = itemRows.find((r) => r.item_key === fallbackItem.id);
            return dbItem
              ? { id: fallbackItem.id, ko: dbItem.label_ko, en: dbItem.label_en }
              : { id: fallbackItem.id, ko: fallbackItem.ko, en: fallbackItem.en };
          })
        : fallback.items;

    return {
      eyebrowKo: sectionRow?.eyebrow_ko ?? fallback.eyebrowKo,
      eyebrowEn: sectionRow?.eyebrow_en ?? fallback.eyebrowEn,
      titleKo: sectionRow?.title_ko ?? fallback.titleKo,
      titleEn: sectionRow?.title_en ?? fallback.titleEn,
      items,
    };
  }, advisoryFallback());
}
