import { targetClientsSection, targetClients, peAdvisory } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow, fetchListRows } from './publicTable.js';

export function targetClientsFallback() {
  return {
    section: {
      eyebrowKo: targetClientsSection.eyebrowKo,
      eyebrowEn: targetClientsSection.eyebrowEn,
      titleKo: targetClientsSection.titleKo,
      titleEn: targetClientsSection.titleEn,
    },
    clients: targetClients.map((c) => ({ ko: c.ko, en: c.en })),
    pe: {
      labelKo: peAdvisory.labelKo,
      labelEn: peAdvisory.labelEn,
      introKo: peAdvisory.introKo,
      introEn: peAdvisory.introEn,
      items: peAdvisory.items.map((item) => ({ ko: item.ko, en: item.en })),
    },
  };
}

export async function fetchTargetClients() {
  return fetchWithFallback(async () => {
    const [sectionRow, clientRows, peRow, peItemRows] = await Promise.all([
      fetchSingletonRow('target_clients_section'),
      fetchListRows('target_client_items'),
      fetchSingletonRow('pe_advisory'),
      fetchListRows('pe_advisory_items'),
    ]);
    if (!sectionRow && clientRows.length === 0 && !peRow && peItemRows.length === 0) return null;

    const fallback = targetClientsFallback();
    return {
      section: sectionRow
        ? {
            eyebrowKo: sectionRow.eyebrow_ko,
            eyebrowEn: sectionRow.eyebrow_en,
            titleKo: sectionRow.title_ko,
            titleEn: sectionRow.title_en,
          }
        : fallback.section,
      clients: clientRows.length > 0 ? clientRows.map((r) => ({ ko: r.text_ko, en: r.text_en })) : fallback.clients,
      pe: {
        labelKo: peRow?.label_ko ?? fallback.pe.labelKo,
        labelEn: peRow?.label_en ?? fallback.pe.labelEn,
        introKo: peRow?.intro_ko ?? fallback.pe.introKo,
        introEn: peRow?.intro_en ?? fallback.pe.introEn,
        items: peItemRows.length > 0 ? peItemRows.map((r) => ({ ko: r.text_ko, en: r.text_en })) : fallback.pe.items,
      },
    };
  }, targetClientsFallback());
}
