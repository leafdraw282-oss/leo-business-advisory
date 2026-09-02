import { advisorySection, advisoryProducts } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton, fetchList, upsertByNaturalKey } from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

// Advisory Sales repositioning: this now edits the 4 Advisory Products
// (advisory_products, supabase/migrations/0018_advisory_sales_cms_wiring.sql)
// that Advisory.jsx actually renders — previously this page edited
// advisory_items, a flat 8-item list nothing on the public site read
// anymore (see that migration's header comment). The 4 products are a
// fixed, named set (matched to profile.js by item_key, same pattern as
// Case Studies' case_key) rather than an admin-addable/removable list.

function headingFallback() {
  return {
    eyebrowKo: advisorySection.eyebrowKo,
    eyebrowEn: advisorySection.eyebrowEn,
    titleKo: advisorySection.titleKo,
    titleEn: advisorySection.titleEn,
  };
}

function fallbackProduct(fp) {
  return {
    itemKey: fp.id,
    nameKo: fp.nameKo,
    nameEn: fp.nameEn,
    targetKo: fp.targetKo,
    targetEn: fp.targetEn,
    focusKo: fp.focusKo.join('\n'),
    focusEn: fp.focusEn.join('\n'),
    deliverableKo: fp.deliverableKo,
    deliverableEn: fp.deliverableEn,
  };
}

function productsFallback() {
  return advisoryProducts.map(fallbackProduct);
}

async function load() {
  if (!isSupabaseConfigured) {
    return { heading: headingFallback(), products: productsFallback() };
  }

  const headingRow = await fetchSingleton('advisory_section');
  const heading = headingRow
    ? {
        eyebrowKo: headingRow.eyebrow_ko,
        eyebrowEn: headingRow.eyebrow_en,
        titleKo: headingRow.title_ko,
        titleEn: headingRow.title_en,
      }
    : headingFallback();

  const productRows = await fetchList('advisory_products');
  const products = advisoryProducts.map((fp) => {
    const dbRow = productRows.find((r) => r.item_key === fp.id);
    if (!dbRow) return fallbackProduct(fp);
    return {
      itemKey: fp.id,
      nameKo: dbRow.name_ko,
      nameEn: dbRow.name_en,
      targetKo: dbRow.target_ko,
      targetEn: dbRow.target_en,
      focusKo: (Array.isArray(dbRow.focus_ko) ? dbRow.focus_ko : fp.focusKo).join('\n'),
      focusEn: (Array.isArray(dbRow.focus_en) ? dbRow.focus_en : fp.focusEn).join('\n'),
      deliverableKo: dbRow.deliverable_ko,
      deliverableEn: dbRow.deliverable_en,
    };
  });

  return { heading, products };
}

async function save(values) {
  requireFilled([
    { label: 'Section eyebrow', ko: values.heading.eyebrowKo, en: values.heading.eyebrowEn },
    { label: 'Section title', ko: values.heading.titleKo, en: values.heading.titleEn },
    ...values.products.flatMap((p) => [
      { label: `${p.itemKey} name`, ko: p.nameKo, en: p.nameEn },
      { label: `${p.itemKey} target`, ko: p.targetKo, en: p.targetEn },
      { label: `${p.itemKey} focus`, ko: p.focusKo, en: p.focusEn },
      { label: `${p.itemKey} deliverable`, ko: p.deliverableKo, en: p.deliverableEn },
    ]),
  ]);

  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured — cannot save. See supabase/README.md.');
  }

  await upsertSingleton('advisory_section', {
    eyebrow_ko: values.heading.eyebrowKo,
    eyebrow_en: values.heading.eyebrowEn,
    title_ko: values.heading.titleKo,
    title_en: values.heading.titleEn,
  });

  for (const [index, product] of values.products.entries()) {
    await upsertByNaturalKey('advisory_products', 'item_key', {
      item_key: product.itemKey,
      name_ko: product.nameKo,
      name_en: product.nameEn,
      target_ko: product.targetKo,
      target_en: product.targetEn,
      focus_ko: product.focusKo.split('\n').map((line) => line.trim()).filter(Boolean),
      focus_en: product.focusEn.split('\n').map((line) => line.trim()).filter(Boolean),
      deliverable_ko: product.deliverableKo,
      deliverable_en: product.deliverableEn,
      sort_order: index,
    });
  }

  return load();
}

function AdvisorySection() {
  const { status, loadError, values, update, isDirty, saveState, saveError, save: runSave, reset, reload } =
    useAdminForm({ load, save });

  function updateHeading(patch) {
    update((prev) => ({ ...prev, heading: { ...prev.heading, ...patch } }));
  }

  function updateProduct(index, patch) {
    update((prev) => ({
      ...prev,
      products: prev.products.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
  }

  return (
    <section className="admin-section-form">
      <h2>Advisory (자문 서비스)</h2>
      <SectionStatus
        status={status}
        loadError={loadError}
        isDirty={isDirty}
        saveState={saveState}
        saveError={saveError}
        onSave={runSave}
        onReset={reset}
        onReload={reload}
      />
      {values && (
        <>
          <h3>섹션 제목 영역</h3>
          <BilingualField
            label="Advisory 섹션 소제목"
            ko={values.heading.eyebrowKo}
            en={values.heading.eyebrowEn}
            onKoChange={(v) => updateHeading({ eyebrowKo: v })}
            onEnChange={(v) => updateHeading({ eyebrowEn: v })}
          />
          <BilingualField
            label="Advisory 섹션 제목"
            ko={values.heading.titleKo}
            en={values.heading.titleEn}
            onKoChange={(v) => updateHeading({ titleKo: v })}
            onEnChange={(v) => updateHeading({ titleEn: v })}
          />

          <h3>자문 서비스 4가지</h3>
          {values.products.map((product, index) => (
            <div className="admin-list-row" key={product.itemKey}>
              <p className="admin-list-row-title">서비스 {index + 1}</p>
              <BilingualField
                label="서비스명"
                ko={product.nameKo}
                en={product.nameEn}
                onKoChange={(v) => updateProduct(index, { nameKo: v })}
                onEnChange={(v) => updateProduct(index, { nameEn: v })}
              />
              <BilingualField
                label="대상 (예: 성장이 정체된 기업)"
                ko={product.targetKo}
                en={product.targetEn}
                onKoChange={(v) => updateProduct(index, { targetKo: v })}
                onEnChange={(v) => updateProduct(index, { targetEn: v })}
              />
              <BilingualField
                label="핵심 영역 (줄바꿈으로 항목 구분)"
                ko={product.focusKo}
                en={product.focusEn}
                onKoChange={(v) => updateProduct(index, { focusKo: v })}
                onEnChange={(v) => updateProduct(index, { focusEn: v })}
                multiline
              />
              <BilingualField
                label="제공 결과물"
                ko={product.deliverableKo}
                en={product.deliverableEn}
                onKoChange={(v) => updateProduct(index, { deliverableKo: v })}
                onEnChange={(v) => updateProduct(index, { deliverableEn: v })}
              />
            </div>
          ))}
        </>
      )}
    </section>
  );
}

export default AdvisorySection;
