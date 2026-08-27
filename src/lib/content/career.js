import { career, careerSection } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow, fetchListRows } from './publicTable.js';

export function careerFallback() {
  return {
    eyebrowKo: careerSection.eyebrowKo,
    eyebrowEn: careerSection.eyebrowEn,
    titleKo: careerSection.titleKo,
    titleEn: careerSection.titleEn,
    entries: career.map((e) => ({ period: e.period, roleKo: e.roleKo, roleEn: e.roleEn, companyKo: e.companyKo, companyEn: e.companyEn })),
  };
}

export async function fetchCareer() {
  return fetchWithFallback(async () => {
    const sectionRow = await fetchSingletonRow('career_section');
    const entryRows = await fetchListRows('career_entries');
    if (!sectionRow && entryRows.length === 0) return null;

    const fallback = careerFallback();
    return {
      eyebrowKo: sectionRow?.eyebrow_ko ?? fallback.eyebrowKo,
      eyebrowEn: sectionRow?.eyebrow_en ?? fallback.eyebrowEn,
      titleKo: sectionRow?.title_ko ?? fallback.titleKo,
      titleEn: sectionRow?.title_en ?? fallback.titleEn,
      entries:
        entryRows.length > 0
          ? entryRows.map((r) => ({ period: r.period, roleKo: r.role_ko, roleEn: r.role_en, companyKo: r.company_ko, companyEn: r.company_en }))
          : fallback.entries,
    };
  }, careerFallback());
}
