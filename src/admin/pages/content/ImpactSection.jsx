import { impactSection, impact } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton, fetchList, saveListRow } from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

function headingFallback() {
  return {
    eyebrowKo: impactSection.eyebrowKo,
    eyebrowEn: impactSection.eyebrowEn,
    titleKo: impactSection.titleKo,
    titleEn: impactSection.titleEn,
  };
}

function metricsFallback() {
  return impact.map((m) => ({ id: null, valueKo: m.valueKo, valueEn: m.valueEn, labelKo: m.labelKo, labelEn: m.labelEn }));
}

async function load() {
  if (!isSupabaseConfigured) {
    return { heading: headingFallback(), metrics: metricsFallback() };
  }

  const headingRow = await fetchSingleton('impact_section');
  const heading = headingRow
    ? {
        eyebrowKo: headingRow.eyebrow_ko,
        eyebrowEn: headingRow.eyebrow_en,
        titleKo: headingRow.title_ko,
        titleEn: headingRow.title_en,
      }
    : headingFallback();

  const metricRows = await fetchList('impact_metrics');
  const metrics =
    metricRows.length > 0
      ? metricRows.map((r) => ({ id: r.id, valueKo: r.value_ko, valueEn: r.value_en, labelKo: r.label_ko, labelEn: r.label_en }))
      : metricsFallback();

  return { heading, metrics };
}

async function save(values) {
  requireFilled([
    { label: 'Section eyebrow', ko: values.heading.eyebrowKo, en: values.heading.eyebrowEn },
    { label: 'Section title', ko: values.heading.titleKo, en: values.heading.titleEn },
    ...values.metrics.map((m, i) => ({ label: `Metric ${i + 1} value`, ko: m.valueKo, en: m.valueEn })),
    ...values.metrics.map((m, i) => ({ label: `Metric ${i + 1} label`, ko: m.labelKo, en: m.labelEn })),
  ]);

  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured — cannot save. See supabase/README.md.');
  }

  await upsertSingleton('impact_section', {
    eyebrow_ko: values.heading.eyebrowKo,
    eyebrow_en: values.heading.eyebrowEn,
    title_ko: values.heading.titleKo,
    title_en: values.heading.titleEn,
  });

  for (const [index, metric] of values.metrics.entries()) {
    await saveListRow('impact_metrics', metric.id, {
      value_ko: metric.valueKo,
      value_en: metric.valueEn,
      label_ko: metric.labelKo,
      label_en: metric.labelEn,
      sort_order: index,
    });
  }

  return load();
}

function ImpactSection() {
  const { status, loadError, values, update, isDirty, saveState, saveError, save: runSave, reset, reload } =
    useAdminForm({ load, save });

  function updateHeading(patch) {
    update((prev) => ({ ...prev, heading: { ...prev.heading, ...patch } }));
  }

  function updateMetric(index, patch) {
    update((prev) => ({
      ...prev,
      metrics: prev.metrics.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  }

  return (
    <section className="admin-section-form">
      <h2>Impact (숫자로 보는 성과)</h2>
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
            label="Impact 섹션 소제목"
            ko={values.heading.eyebrowKo}
            en={values.heading.eyebrowEn}
            onKoChange={(v) => updateHeading({ eyebrowKo: v })}
            onEnChange={(v) => updateHeading({ eyebrowEn: v })}
          />
          <BilingualField
            label="Impact 섹션 제목"
            ko={values.heading.titleKo}
            en={values.heading.titleEn}
            onKoChange={(v) => updateHeading({ titleKo: v })}
            onEnChange={(v) => updateHeading({ titleEn: v })}
          />

          <h3>성과 지표 (숫자 4가지)</h3>
          {values.metrics.map((metric, index) => (
            <div className="admin-list-row" key={metric.id ?? `new-${index}`}>
              <p className="admin-list-row-title">성과 지표 {index + 1}</p>
              <BilingualField
                label="지표 숫자 (예: 8×, KRW 100B+)"
                ko={metric.valueKo}
                en={metric.valueEn}
                onKoChange={(v) => updateMetric(index, { valueKo: v })}
                onEnChange={(v) => updateMetric(index, { valueEn: v })}
              />
              <BilingualField
                label="지표 설명"
                ko={metric.labelKo}
                en={metric.labelEn}
                onKoChange={(v) => updateMetric(index, { labelKo: v })}
                onEnChange={(v) => updateMetric(index, { labelEn: v })}
              />
            </div>
          ))}
        </>
      )}
    </section>
  );
}

export default ImpactSection;
