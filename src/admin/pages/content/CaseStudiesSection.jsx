import { caseStudiesSection, caseStudies } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import {
  fetchSingleton,
  upsertSingleton,
  fetchList,
  saveListRow,
  upsertByNaturalKey,
} from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import PlainField from '../../components/PlainField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

function headingFallback() {
  return {
    eyebrowKo: caseStudiesSection.eyebrowKo,
    eyebrowEn: caseStudiesSection.eyebrowEn,
    titleKo: caseStudiesSection.titleKo,
    titleEn: caseStudiesSection.titleEn,
  };
}

function fallbackCase(fc) {
  return {
    caseId: null,
    caseKey: fc.id,
    tag: fc.tag,
    titleKo: fc.titleKo,
    titleEn: fc.titleEn,
    summaryKo: fc.summaryKo,
    summaryEn: fc.summaryEn,
    metrics: (fc.metrics ?? []).map((m) => ({ id: null, valueKo: m.valueKo, valueEn: m.valueEn, labelKo: m.labelKo, labelEn: m.labelEn })),
    highlights: (fc.highlights ?? []).map((h) => ({ id: null, labelKo: h.ko, labelEn: h.en })),
  };
}

function casesFallback() {
  return caseStudies.map(fallbackCase);
}

async function load() {
  if (!isSupabaseConfigured) {
    return { heading: headingFallback(), cases: casesFallback() };
  }

  const headingRow = await fetchSingleton('case_studies_section');
  const heading = headingRow
    ? {
        eyebrowKo: headingRow.eyebrow_ko,
        eyebrowEn: headingRow.eyebrow_en,
        titleKo: headingRow.title_ko,
        titleEn: headingRow.title_en,
      }
    : headingFallback();

  const caseRows = await fetchList('case_studies');
  if (caseRows.length === 0) {
    return { heading, cases: casesFallback() };
  }

  const allMetrics = await fetchList('case_study_metrics');
  const allHighlights = await fetchList('case_study_highlights');

  const cases = caseStudies.map((fc) => {
    const dbCase = caseRows.find((r) => r.case_key === fc.id);
    if (!dbCase) return fallbackCase(fc);

    const metrics = allMetrics.filter((m) => m.case_study_id === dbCase.id);
    const highlights = allHighlights.filter((h) => h.case_study_id === dbCase.id);

    return {
      caseId: dbCase.id,
      caseKey: fc.id,
      tag: dbCase.tag,
      titleKo: dbCase.title_ko,
      titleEn: dbCase.title_en,
      summaryKo: dbCase.summary_ko,
      summaryEn: dbCase.summary_en,
      metrics:
        metrics.length > 0
          ? metrics.map((m) => ({ id: m.id, valueKo: m.value_ko, valueEn: m.value_en, labelKo: m.label_ko, labelEn: m.label_en }))
          : (fc.metrics ?? []).map((m) => ({ id: null, valueKo: m.valueKo, valueEn: m.valueEn, labelKo: m.labelKo, labelEn: m.labelEn })),
      highlights:
        highlights.length > 0
          ? highlights.map((h) => ({ id: h.id, labelKo: h.label_ko, labelEn: h.label_en }))
          : (fc.highlights ?? []).map((h) => ({ id: null, labelKo: h.ko, labelEn: h.en })),
    };
  });

  return { heading, cases };
}

async function save(values) {
  requireFilled([
    { label: 'Section eyebrow', ko: values.heading.eyebrowKo, en: values.heading.eyebrowEn },
    { label: 'Section title', ko: values.heading.titleKo, en: values.heading.titleEn },
    ...values.cases.flatMap((c) => [
      { label: `${c.caseKey} title`, ko: c.titleKo, en: c.titleEn },
      { label: `${c.caseKey} summary`, ko: c.summaryKo, en: c.summaryEn },
      ...c.metrics.map((m, i) => ({ label: `${c.caseKey} metric ${i + 1} value`, ko: m.valueKo, en: m.valueEn })),
      ...c.metrics.map((m, i) => ({ label: `${c.caseKey} metric ${i + 1} label`, ko: m.labelKo, en: m.labelEn })),
      ...c.highlights.map((h, i) => ({ label: `${c.caseKey} highlight ${i + 1}`, ko: h.labelKo, en: h.labelEn })),
    ]),
  ]);

  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured — cannot save. See supabase/README.md.');
  }

  await upsertSingleton('case_studies_section', {
    eyebrow_ko: values.heading.eyebrowKo,
    eyebrow_en: values.heading.eyebrowEn,
    title_ko: values.heading.titleKo,
    title_en: values.heading.titleEn,
  });

  for (const [index, c] of values.cases.entries()) {
    const parentRow = await upsertByNaturalKey('case_studies', 'case_key', {
      case_key: c.caseKey,
      tag: c.tag,
      title_ko: c.titleKo,
      title_en: c.titleEn,
      summary_ko: c.summaryKo,
      summary_en: c.summaryEn,
      sort_order: index,
    });

    for (const [mIndex, metric] of c.metrics.entries()) {
      await saveListRow('case_study_metrics', metric.id, {
        case_study_id: parentRow.id,
        value_ko: metric.valueKo,
        value_en: metric.valueEn,
        label_ko: metric.labelKo,
        label_en: metric.labelEn,
        sort_order: mIndex,
      });
    }

    for (const [hIndex, highlight] of c.highlights.entries()) {
      await saveListRow('case_study_highlights', highlight.id, {
        case_study_id: parentRow.id,
        label_ko: highlight.labelKo,
        label_en: highlight.labelEn,
        sort_order: hIndex,
      });
    }
  }

  return load();
}

function CaseStudiesSection() {
  const { status, loadError, values, update, isDirty, saveState, saveError, save: runSave, reload } =
    useAdminForm({ load, save });

  function updateHeading(patch) {
    update((prev) => ({ ...prev, heading: { ...prev.heading, ...patch } }));
  }

  function updateCase(caseIndex, patch) {
    update((prev) => ({
      ...prev,
      cases: prev.cases.map((c, i) => (i === caseIndex ? { ...c, ...patch } : c)),
    }));
  }

  function updateMetric(caseIndex, metricIndex, patch) {
    update((prev) => ({
      ...prev,
      cases: prev.cases.map((c, i) =>
        i === caseIndex
          ? { ...c, metrics: c.metrics.map((m, mi) => (mi === metricIndex ? { ...m, ...patch } : m)) }
          : c,
      ),
    }));
  }

  function updateHighlight(caseIndex, highlightIndex, patch) {
    update((prev) => ({
      ...prev,
      cases: prev.cases.map((c, i) =>
        i === caseIndex
          ? {
              ...c,
              highlights: c.highlights.map((h, hi) => (hi === highlightIndex ? { ...h, ...patch } : h)),
            }
          : c,
      ),
    }));
  }

  return (
    <section className="admin-section-form">
      <h2>Case Studies (경영 성과 사례)</h2>
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
            label="Case Studies 섹션 소제목"
            ko={values.heading.eyebrowKo}
            en={values.heading.eyebrowEn}
            onKoChange={(v) => updateHeading({ eyebrowKo: v })}
            onEnChange={(v) => updateHeading({ eyebrowEn: v })}
          />
          <BilingualField
            label="Case Studies 섹션 제목"
            ko={values.heading.titleKo}
            en={values.heading.titleEn}
            onKoChange={(v) => updateHeading({ titleKo: v })}
            onEnChange={(v) => updateHeading({ titleEn: v })}
          />

          {values.cases.map((c, caseIndex) => (
            <div className="admin-case-study" key={c.caseKey}>
              <h3>{c.tag} — {c.titleKo || c.titleEn}</h3>
              <PlainField label="사례 번호 (예: CASE 01)" value={c.tag} onChange={(v) => updateCase(caseIndex, { tag: v })} />
              <BilingualField
                label="사례 제목"
                ko={c.titleKo}
                en={c.titleEn}
                onKoChange={(v) => updateCase(caseIndex, { titleKo: v })}
                onEnChange={(v) => updateCase(caseIndex, { titleEn: v })}
              />
              <BilingualField
                label="사례 요약 문구"
                ko={c.summaryKo}
                en={c.summaryEn}
                onKoChange={(v) => updateCase(caseIndex, { summaryKo: v })}
                onEnChange={(v) => updateCase(caseIndex, { summaryEn: v })}
                multiline
              />

              {c.metrics.length > 0 && (
                <>
                  <p className="admin-list-row-title">성과 수치</p>
                  {c.metrics.map((metric, metricIndex) => (
                    <div className="admin-list-row" key={metric.id ?? `new-metric-${metricIndex}`}>
                      <BilingualField
                        label="수치 (예: KRW 30B → 240B)"
                        ko={metric.valueKo}
                        en={metric.valueEn}
                        onKoChange={(v) => updateMetric(caseIndex, metricIndex, { valueKo: v })}
                        onEnChange={(v) => updateMetric(caseIndex, metricIndex, { valueEn: v })}
                      />
                      <BilingualField
                        label="수치 설명"
                        ko={metric.labelKo}
                        en={metric.labelEn}
                        onKoChange={(v) => updateMetric(caseIndex, metricIndex, { labelKo: v })}
                        onEnChange={(v) => updateMetric(caseIndex, metricIndex, { labelEn: v })}
                      />
                    </div>
                  ))}
                </>
              )}

              {c.highlights.length > 0 && (
                <>
                  <p className="admin-list-row-title">핵심 키워드</p>
                  {c.highlights.map((highlight, highlightIndex) => (
                    <div className="admin-list-row" key={highlight.id ?? `new-highlight-${highlightIndex}`}>
                      <BilingualField
                        label="키워드"
                        ko={highlight.labelKo}
                        en={highlight.labelEn}
                        onKoChange={(v) => updateHighlight(caseIndex, highlightIndex, { labelKo: v })}
                        onEnChange={(v) => updateHighlight(caseIndex, highlightIndex, { labelEn: v })}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </>
      )}
    </section>
  );
}

export default CaseStudiesSection;
