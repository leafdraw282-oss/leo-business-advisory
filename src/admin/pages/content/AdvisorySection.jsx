import { advisory } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton, fetchList, upsertByNaturalKey } from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

function headingFallback() {
  return {
    eyebrowKo: advisory.eyebrowKo,
    eyebrowEn: advisory.eyebrowEn,
    titleKo: advisory.titleKo,
    titleEn: advisory.titleEn,
  };
}

function itemsFallback() {
  return advisory.items.map((item) => ({ itemKey: item.id, labelKo: item.ko, labelEn: item.en }));
}

async function load() {
  if (!isSupabaseConfigured) {
    return { heading: headingFallback(), items: itemsFallback() };
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

  const itemRows = await fetchList('advisory_items');
  const items =
    itemRows.length > 0
      ? itemRows.map((r) => ({ itemKey: r.item_key, labelKo: r.label_ko, labelEn: r.label_en }))
      : itemsFallback();

  return { heading, items };
}

async function save(values) {
  requireFilled([
    { label: 'Section eyebrow', ko: values.heading.eyebrowKo, en: values.heading.eyebrowEn },
    { label: 'Section title', ko: values.heading.titleKo, en: values.heading.titleEn },
    ...values.items.map((item) => ({ label: item.itemKey, ko: item.labelKo, en: item.labelEn })),
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

  for (const [index, item] of values.items.entries()) {
    await upsertByNaturalKey('advisory_items', 'item_key', {
      item_key: item.itemKey,
      label_ko: item.labelKo,
      label_en: item.labelEn,
      sort_order: index,
    });
  }

  return load();
}

function AdvisorySection() {
  const { status, loadError, values, update, isDirty, saveState, saveError, save: runSave, reload } =
    useAdminForm({ load, save });

  function updateHeading(patch) {
    update((prev) => ({ ...prev, heading: { ...prev.heading, ...patch } }));
  }

  function updateItem(index, patch) {
    update((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  return (
    <section className="admin-section-form">
      <h2>Advisory (자문 영역)</h2>
      <SectionStatus
        status={status}
        loadError={loadError}
        isDirty={isDirty}
        saveState={saveState}
        saveError={saveError}
        onSave={runSave}
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

          <h3>자문 영역 목록</h3>
          {values.items.map((item, index) => (
            <div className="admin-list-row" key={item.itemKey}>
              <p className="admin-list-row-title">자문 항목 {index + 1}</p>
              <BilingualField
                label="자문 항목명"
                ko={item.labelKo}
                en={item.labelEn}
                onKoChange={(v) => updateItem(index, { labelKo: v })}
                onEnChange={(v) => updateItem(index, { labelEn: v })}
              />
            </div>
          ))}
        </>
      )}
    </section>
  );
}

export default AdvisorySection;
