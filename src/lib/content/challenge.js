import { challenge } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow, fetchListRows } from './publicTable.js';

export function challengeFallback() {
  return {
    eyebrowKo: challenge.eyebrowKo,
    eyebrowEn: challenge.eyebrowEn,
    titleKo: challenge.titleKo,
    titleEn: challenge.titleEn,
    items: challenge.items.map((item) => ({ ko: item.ko, en: item.en })),
    statementKo: challenge.statementKo,
    statementEn: challenge.statementEn,
    statementSubKo: challenge.statementSubKo,
    statementSubEn: challenge.statementSubEn,
  };
}

export async function fetchChallenge() {
  return fetchWithFallback(async () => {
    const [sectionRow, itemRows] = await Promise.all([
      fetchSingletonRow('challenge_section'),
      fetchListRows('challenge_items'),
    ]);
    if (!sectionRow && itemRows.length === 0) return null;

    const fallback = challengeFallback();
    return {
      eyebrowKo: sectionRow?.eyebrow_ko ?? fallback.eyebrowKo,
      eyebrowEn: sectionRow?.eyebrow_en ?? fallback.eyebrowEn,
      titleKo: sectionRow?.title_ko ?? fallback.titleKo,
      titleEn: sectionRow?.title_en ?? fallback.titleEn,
      items: itemRows.length > 0 ? itemRows.map((r) => ({ ko: r.text_ko, en: r.text_en })) : fallback.items,
      statementKo: sectionRow?.statement_ko ?? fallback.statementKo,
      statementEn: sectionRow?.statement_en ?? fallback.statementEn,
      statementSubKo: sectionRow?.statement_sub_ko ?? fallback.statementSubKo,
      statementSubEn: sectionRow?.statement_sub_en ?? fallback.statementSubEn,
    };
  }, challengeFallback());
}
