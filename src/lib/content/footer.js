import { footer } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow } from './publicTable.js';

export function footerFallback() {
  return {
    copyrightKo: footer.copyrightKo,
    copyrightEn: footer.copyrightEn,
    backToTopKo: footer.backToTopKo,
    backToTopEn: footer.backToTopEn,
  };
}

export async function fetchFooter() {
  return fetchWithFallback(async () => {
    const row = await fetchSingletonRow('footer_content');
    if (!row) return null;
    return {
      copyrightKo: row.copyright_ko,
      copyrightEn: row.copyright_en,
      backToTopKo: row.back_to_top_ko,
      backToTopEn: row.back_to_top_en,
    };
  }, footerFallback());
}
