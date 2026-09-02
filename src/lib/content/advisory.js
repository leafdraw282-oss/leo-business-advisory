import { advisorySection, advisoryProducts } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow, fetchListRows } from './publicTable.js';

// Advisory Sales repositioning: this now serves the section heading
// (advisory_section — unchanged table, previously written but never
// actually read by Advisory.jsx) plus the 4 Advisory Products
// (advisory_products, supabase/migrations/0018_advisory_sales_cms_wiring.sql)
// that replaced the old flat advisory_items list as what the public
// section renders. advisory_items itself is untouched and simply no
// longer read anywhere (see that migration's own header comment).
export function advisoryFallback() {
  return {
    section: {
      eyebrowKo: advisorySection.eyebrowKo,
      eyebrowEn: advisorySection.eyebrowEn,
      titleKo: advisorySection.titleKo,
      titleEn: advisorySection.titleEn,
    },
    products: advisoryProducts.map((p) => ({
      id: p.id,
      nameKo: p.nameKo,
      nameEn: p.nameEn,
      targetKo: p.targetKo,
      targetEn: p.targetEn,
      focusKo: p.focusKo,
      focusEn: p.focusEn,
      deliverableKo: p.deliverableKo,
      deliverableEn: p.deliverableEn,
    })),
  };
}

export async function fetchAdvisory() {
  return fetchWithFallback(async () => {
    const [sectionRow, productRows] = await Promise.all([
      fetchSingletonRow('advisory_section'),
      fetchListRows('advisory_products'),
    ]);
    if (!sectionRow && productRows.length === 0) return null;

    const fallback = advisoryFallback();
    return {
      section: sectionRow
        ? {
            eyebrowKo: sectionRow.eyebrow_ko,
            eyebrowEn: sectionRow.eyebrow_en,
            titleKo: sectionRow.title_ko,
            titleEn: sectionRow.title_en,
          }
        : fallback.section,
      products:
        productRows.length > 0
          ? productRows.map((r) => ({
              id: r.item_key,
              nameKo: r.name_ko,
              nameEn: r.name_en,
              targetKo: r.target_ko,
              targetEn: r.target_en,
              focusKo: r.focus_ko,
              focusEn: r.focus_en,
              deliverableKo: r.deliverable_ko,
              deliverableEn: r.deliverable_en,
            }))
          : fallback.products,
    };
  }, advisoryFallback());
}
