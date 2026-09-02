import { insightsSection, insights } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton, fetchList, saveListRow } from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

function headingFallback() {
  return {
    eyebrowKo: insightsSection.eyebrowKo,
    eyebrowEn: insightsSection.eyebrowEn,
    titleKo: insightsSection.titleKo,
    titleEn: insightsSection.titleEn,
    comingSoonKo: insightsSection.comingSoonKo,
    comingSoonEn: insightsSection.comingSoonEn,
  };
}

function itemsFallback() {
  return insights.map((item) => ({ id: null, titleKo: item.titleKo, titleEn: item.titleEn }));
}

async function load() {
  if (!isSupabaseConfigured) return { heading: headingFallback(), items: itemsFallback() };

  const row = await fetchSingleton('insights_section');
  const heading = row
    ? {
        eyebrowKo: row.eyebrow_ko,
        eyebrowEn: row.eyebrow_en,
        titleKo: row.title_ko,
        titleEn: row.title_en,
        comingSoonKo: row.coming_soon_ko,
        comingSoonEn: row.coming_soon_en,
      }
    : headingFallback();

  const itemRows = await fetchList('insights_items');
  const items =
    itemRows.length > 0 ? itemRows.map((r) => ({ id: r.id, titleKo: r.title_ko, titleEn: r.title_en })) : itemsFallback();

  return { heading, items };
}

async function save(values) {
  requireFilled([
    { label: 'Section eyebrow', ko: values.heading.eyebrowKo, en: values.heading.eyebrowEn },
    { label: 'Section title', ko: values.heading.titleKo, en: values.heading.titleEn },
    { label: 'Coming soon label', ko: values.heading.comingSoonKo, en: values.heading.comingSoonEn },
    ...values.items.map((item, i) => ({ label: `Insight ${i + 1} title`, ko: item.titleKo, en: item.titleEn })),
  ]);

  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured — cannot save. See supabase/README.md.');
  }

  await upsertSingleton('insights_section', {
    eyebrow_ko: values.heading.eyebrowKo,
    eyebrow_en: values.heading.eyebrowEn,
    title_ko: values.heading.titleKo,
    title_en: values.heading.titleEn,
    coming_soon_ko: values.heading.comingSoonKo,
    coming_soon_en: values.heading.comingSoonEn,
  });

  for (const [index, item] of values.items.entries()) {
    await saveListRow('insights_items', item.id, {
      title_ko: item.titleKo,
      title_en: item.titleEn,
      sort_order: index,
    });
  }

  return load();
}

function InsightsSection() {
  const { status, loadError, values, update, isDirty, saveState, saveError, save: runSave, reset, reload } =
    useAdminForm({ load, save });

  function updateHeading(patch) {
    update((prev) => ({ ...prev, heading: { ...prev.heading, ...patch } }));
  }

  function updateItem(index, patch) {
    update((prev) => ({ ...prev, items: prev.items.map((it, i) => (i === index ? { ...it, ...patch } : it)) }));
  }

  return (
    <section className="admin-section-form">
      <h2>Insights (인사이트 미리보기)</h2>
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
            label="섹션 소제목"
            ko={values.heading.eyebrowKo}
            en={values.heading.eyebrowEn}
            onKoChange={(v) => updateHeading({ eyebrowKo: v })}
            onEnChange={(v) => updateHeading({ eyebrowEn: v })}
          />
          <BilingualField
            label="섹션 제목"
            ko={values.heading.titleKo}
            en={values.heading.titleEn}
            onKoChange={(v) => updateHeading({ titleKo: v })}
            onEnChange={(v) => updateHeading({ titleEn: v })}
          />
          <BilingualField
            label="'준비 중' 라벨 (실제 글이 없을 때 카드에 표시)"
            ko={values.heading.comingSoonKo}
            en={values.heading.comingSoonEn}
            onKoChange={(v) => updateHeading({ comingSoonKo: v })}
            onEnChange={(v) => updateHeading({ comingSoonEn: v })}
          />

          <h3>인사이트 카드 (제목만, 실제 글 없음)</h3>
          {values.items.map((item, index) => (
            <div className="admin-list-row" key={item.id ?? `new-${index}`}>
              <BilingualField
                label={`카드 ${index + 1} 제목`}
                ko={item.titleKo}
                en={item.titleEn}
                onKoChange={(v) => updateItem(index, { titleKo: v })}
                onEnChange={(v) => updateItem(index, { titleEn: v })}
              />
            </div>
          ))}
        </>
      )}
    </section>
  );
}

export default InsightsSection;
