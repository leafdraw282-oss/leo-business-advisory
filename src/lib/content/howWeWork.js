import { howWeWork } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow } from './publicTable.js';

export function howWeWorkFallback() {
  return {
    eyebrowKo: howWeWork.eyebrowKo,
    eyebrowEn: howWeWork.eyebrowEn,
    titleKo: howWeWork.titleKo,
    titleEn: howWeWork.titleEn,
    traditionalLabelKo: howWeWork.traditionalLabelKo,
    traditionalLabelEn: howWeWork.traditionalLabelEn,
    traditionalStepsKo: howWeWork.traditionalStepsKo,
    traditionalStepsEn: howWeWork.traditionalStepsEn,
    leoLabelKo: howWeWork.leoLabelKo,
    leoLabelEn: howWeWork.leoLabelEn,
    leoStepsKo: howWeWork.leoStepsKo,
    leoStepsEn: howWeWork.leoStepsEn,
    quoteKo: howWeWork.quoteKo,
    quoteEn: howWeWork.quoteEn,
    taglineKo: howWeWork.taglineKo,
    taglineEn: howWeWork.taglineEn,
  };
}

export async function fetchHowWeWork() {
  return fetchWithFallback(async () => {
    const row = await fetchSingletonRow('how_we_work_section');
    if (!row) return null;

    const fallback = howWeWorkFallback();
    return {
      eyebrowKo: row.eyebrow_ko ?? fallback.eyebrowKo,
      eyebrowEn: row.eyebrow_en ?? fallback.eyebrowEn,
      titleKo: row.title_ko ?? fallback.titleKo,
      titleEn: row.title_en ?? fallback.titleEn,
      traditionalLabelKo: row.traditional_label_ko ?? fallback.traditionalLabelKo,
      traditionalLabelEn: row.traditional_label_en ?? fallback.traditionalLabelEn,
      traditionalStepsKo: Array.isArray(row.traditional_steps_ko) ? row.traditional_steps_ko : fallback.traditionalStepsKo,
      traditionalStepsEn: Array.isArray(row.traditional_steps_en) ? row.traditional_steps_en : fallback.traditionalStepsEn,
      leoLabelKo: row.leo_label_ko ?? fallback.leoLabelKo,
      leoLabelEn: row.leo_label_en ?? fallback.leoLabelEn,
      leoStepsKo: Array.isArray(row.leo_steps_ko) ? row.leo_steps_ko : fallback.leoStepsKo,
      leoStepsEn: Array.isArray(row.leo_steps_en) ? row.leo_steps_en : fallback.leoStepsEn,
      quoteKo: row.quote_ko ?? fallback.quoteKo,
      quoteEn: row.quote_en ?? fallback.quoteEn,
      taglineKo: row.tagline_ko ?? fallback.taglineKo,
      taglineEn: row.tagline_en ?? fallback.taglineEn,
    };
  }, howWeWorkFallback());
}
