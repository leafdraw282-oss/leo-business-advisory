import { howWeWork } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton } from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

function fallbackValues() {
  return {
    eyebrowKo: howWeWork.eyebrowKo,
    eyebrowEn: howWeWork.eyebrowEn,
    titleKo: howWeWork.titleKo,
    titleEn: howWeWork.titleEn,
    traditionalLabelKo: howWeWork.traditionalLabelKo,
    traditionalLabelEn: howWeWork.traditionalLabelEn,
    traditionalStepsKo: howWeWork.traditionalStepsKo.join('\n'),
    traditionalStepsEn: howWeWork.traditionalStepsEn.join('\n'),
    leoLabelKo: howWeWork.leoLabelKo,
    leoLabelEn: howWeWork.leoLabelEn,
    leoStepsKo: howWeWork.leoStepsKo.join('\n'),
    leoStepsEn: howWeWork.leoStepsEn.join('\n'),
    quoteKo: howWeWork.quoteKo,
    quoteEn: howWeWork.quoteEn,
    taglineKo: howWeWork.taglineKo,
    taglineEn: howWeWork.taglineEn,
  };
}

function rowToFormValues(row) {
  if (!row) return fallbackValues();
  return {
    eyebrowKo: row.eyebrow_ko,
    eyebrowEn: row.eyebrow_en,
    titleKo: row.title_ko,
    titleEn: row.title_en,
    traditionalLabelKo: row.traditional_label_ko,
    traditionalLabelEn: row.traditional_label_en,
    traditionalStepsKo: (Array.isArray(row.traditional_steps_ko) ? row.traditional_steps_ko : howWeWork.traditionalStepsKo).join('\n'),
    traditionalStepsEn: (Array.isArray(row.traditional_steps_en) ? row.traditional_steps_en : howWeWork.traditionalStepsEn).join('\n'),
    leoLabelKo: row.leo_label_ko,
    leoLabelEn: row.leo_label_en,
    leoStepsKo: (Array.isArray(row.leo_steps_ko) ? row.leo_steps_ko : howWeWork.leoStepsKo).join('\n'),
    leoStepsEn: (Array.isArray(row.leo_steps_en) ? row.leo_steps_en : howWeWork.leoStepsEn).join('\n'),
    quoteKo: row.quote_ko,
    quoteEn: row.quote_en,
    taglineKo: row.tagline_ko,
    taglineEn: row.tagline_en,
  };
}

async function load() {
  if (!isSupabaseConfigured) return fallbackValues();
  const row = await fetchSingleton('how_we_work_section');
  return rowToFormValues(row);
}

function splitLines(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

async function save(values) {
  requireFilled([
    { label: 'Eyebrow', ko: values.eyebrowKo, en: values.eyebrowEn },
    { label: 'Title', ko: values.titleKo, en: values.titleEn },
    { label: 'Traditional label', ko: values.traditionalLabelKo, en: values.traditionalLabelEn },
    { label: 'Traditional steps', ko: values.traditionalStepsKo, en: values.traditionalStepsEn },
    { label: 'Leo label', ko: values.leoLabelKo, en: values.leoLabelEn },
    { label: 'Leo steps', ko: values.leoStepsKo, en: values.leoStepsEn },
    { label: 'Quote', ko: values.quoteKo, en: values.quoteEn },
    { label: 'Tagline', ko: values.taglineKo, en: values.taglineEn },
  ]);
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured — cannot save. See supabase/README.md.');
  }

  await upsertSingleton('how_we_work_section', {
    eyebrow_ko: values.eyebrowKo,
    eyebrow_en: values.eyebrowEn,
    title_ko: values.titleKo,
    title_en: values.titleEn,
    traditional_label_ko: values.traditionalLabelKo,
    traditional_label_en: values.traditionalLabelEn,
    traditional_steps_ko: splitLines(values.traditionalStepsKo),
    traditional_steps_en: splitLines(values.traditionalStepsEn),
    leo_label_ko: values.leoLabelKo,
    leo_label_en: values.leoLabelEn,
    leo_steps_ko: splitLines(values.leoStepsKo),
    leo_steps_en: splitLines(values.leoStepsEn),
    quote_ko: values.quoteKo,
    quote_en: values.quoteEn,
    tagline_ko: values.taglineKo,
    tagline_en: values.taglineEn,
  });

  return load();
}

function HowWeWorkSection() {
  const { status, loadError, values, update, isDirty, saveState, saveError, save: runSave, reset, reload } =
    useAdminForm({ load, save });

  return (
    <section className="admin-section-form">
      <h2>How We Work (일하는 방식)</h2>
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
          <BilingualField
            label="섹션 소제목"
            ko={values.eyebrowKo}
            en={values.eyebrowEn}
            onKoChange={(v) => update({ eyebrowKo: v })}
            onEnChange={(v) => update({ eyebrowEn: v })}
          />
          <BilingualField
            label="섹션 제목"
            ko={values.titleKo}
            en={values.titleEn}
            onKoChange={(v) => update({ titleKo: v })}
            onEnChange={(v) => update({ titleEn: v })}
          />

          <h3>일반적인 컨설팅</h3>
          <BilingualField
            label="라벨"
            ko={values.traditionalLabelKo}
            en={values.traditionalLabelEn}
            onKoChange={(v) => update({ traditionalLabelKo: v })}
            onEnChange={(v) => update({ traditionalLabelEn: v })}
          />
          <BilingualField
            label="단계 (줄바꿈으로 구분, 예: 분석 → 제안 → 보고서는 3줄)"
            ko={values.traditionalStepsKo}
            en={values.traditionalStepsEn}
            onKoChange={(v) => update({ traditionalStepsKo: v })}
            onEnChange={(v) => update({ traditionalStepsEn: v })}
            multiline
          />

          <h3>LEO BUSINESS ADVISORY</h3>
          <BilingualField
            label="라벨"
            ko={values.leoLabelKo}
            en={values.leoLabelEn}
            onKoChange={(v) => update({ leoLabelKo: v })}
            onEnChange={(v) => update({ leoLabelEn: v })}
          />
          <BilingualField
            label="단계 (줄바꿈으로 구분)"
            ko={values.leoStepsKo}
            en={values.leoStepsEn}
            onKoChange={(v) => update({ leoStepsKo: v })}
            onEnChange={(v) => update({ leoStepsEn: v })}
            multiline
          />

          <h3>인용구</h3>
          <BilingualField
            label="인용 문구"
            ko={values.quoteKo}
            en={values.quoteEn}
            onKoChange={(v) => update({ quoteKo: v })}
            onEnChange={(v) => update({ quoteEn: v })}
          />
          <BilingualField
            label="태그라인"
            ko={values.taglineKo}
            en={values.taglineEn}
            onKoChange={(v) => update({ taglineKo: v })}
            onEnChange={(v) => update({ taglineEn: v })}
          />
        </>
      )}
    </section>
  );
}

export default HowWeWorkSection;
