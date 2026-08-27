import { hero } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton } from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

// cta_primary_target / cta_secondary_target (e.g. "impact", "contact")
// bind to nav section ids, not display copy — out of scope for this
// text-content phase, left untouched at their profile.js value on save.

function fallbackValues() {
  return {
    eyebrowKo: hero.eyebrowKo,
    eyebrowEn: hero.eyebrowEn,
    headlineKo: hero.headlineKo.join('\n'),
    headlineEn: hero.headlineEn.join('\n'),
    subheadKo: hero.subheadKo,
    subheadEn: hero.subheadEn,
    ctaPrimaryKo: hero.ctaPrimaryKo,
    ctaPrimaryEn: hero.ctaPrimaryEn,
    ctaSecondaryKo: hero.ctaSecondaryKo,
    ctaSecondaryEn: hero.ctaSecondaryEn,
  };
}

function rowToFormValues(row) {
  if (!row) return fallbackValues();
  return {
    eyebrowKo: row.eyebrow_ko,
    eyebrowEn: row.eyebrow_en,
    headlineKo: (row.headline_ko ?? []).join('\n'),
    headlineEn: (row.headline_en ?? []).join('\n'),
    subheadKo: row.subhead_ko,
    subheadEn: row.subhead_en,
    ctaPrimaryKo: row.cta_primary_ko,
    ctaPrimaryEn: row.cta_primary_en,
    ctaSecondaryKo: row.cta_secondary_ko,
    ctaSecondaryEn: row.cta_secondary_en,
  };
}

async function load() {
  if (!isSupabaseConfigured) return fallbackValues();
  const row = await fetchSingleton('hero_content');
  return rowToFormValues(row);
}

async function save(values) {
  requireFilled([
    { label: 'Eyebrow', ko: values.eyebrowKo, en: values.eyebrowEn },
    { label: 'Headline', ko: values.headlineKo, en: values.headlineEn },
    { label: 'Subhead', ko: values.subheadKo, en: values.subheadEn },
    { label: 'Primary CTA', ko: values.ctaPrimaryKo, en: values.ctaPrimaryEn },
    { label: 'Secondary CTA', ko: values.ctaSecondaryKo, en: values.ctaSecondaryEn },
  ]);
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured — cannot save. See supabase/README.md.');
  }

  await upsertSingleton('hero_content', {
    eyebrow_ko: values.eyebrowKo,
    eyebrow_en: values.eyebrowEn,
    headline_ko: values.headlineKo
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    headline_en: values.headlineEn
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    subhead_ko: values.subheadKo,
    subhead_en: values.subheadEn,
    cta_primary_ko: values.ctaPrimaryKo,
    cta_primary_en: values.ctaPrimaryEn,
    cta_primary_target: hero.ctaPrimaryTarget,
    cta_secondary_ko: values.ctaSecondaryKo,
    cta_secondary_en: values.ctaSecondaryEn,
    cta_secondary_target: hero.ctaSecondaryTarget,
  });

  return load();
}

function HeroSection() {
  const { status, loadError, values, update, isDirty, saveState, saveError, save: runSave, reset, reload } =
    useAdminForm({ load, save });

  return (
    <section className="admin-section-form">
      <h2>Hero (첫 화면)</h2>
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
            label="Hero 상단 소개 문구"
            ko={values.eyebrowKo}
            en={values.eyebrowEn}
            onKoChange={(v) => update({ eyebrowKo: v })}
            onEnChange={(v) => update({ eyebrowEn: v })}
          />
          <BilingualField
            label="Hero 메인 문구 (줄바꿈으로 줄 구분)"
            ko={values.headlineKo}
            en={values.headlineEn}
            onKoChange={(v) => update({ headlineKo: v })}
            onEnChange={(v) => update({ headlineEn: v })}
            multiline
          />
          <BilingualField
            label="Hero 부제목"
            ko={values.subheadKo}
            en={values.subheadEn}
            onKoChange={(v) => update({ subheadKo: v })}
            onEnChange={(v) => update({ subheadEn: v })}
          />
          <BilingualField
            label="Hero 주요 버튼 문구"
            ko={values.ctaPrimaryKo}
            en={values.ctaPrimaryEn}
            onKoChange={(v) => update({ ctaPrimaryKo: v })}
            onEnChange={(v) => update({ ctaPrimaryEn: v })}
          />
          <BilingualField
            label="Hero 보조 버튼 문구"
            ko={values.ctaSecondaryKo}
            en={values.ctaSecondaryEn}
            onKoChange={(v) => update({ ctaSecondaryKo: v })}
            onEnChange={(v) => update({ ctaSecondaryEn: v })}
          />
        </>
      )}
    </section>
  );
}

export default HeroSection;
