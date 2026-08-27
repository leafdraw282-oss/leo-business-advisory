import { about } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton } from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

function fallbackValues() {
  return {
    eyebrowKo: about.eyebrowKo,
    eyebrowEn: about.eyebrowEn,
    headlineKo: about.headlineKo,
    headlineEn: about.headlineEn,
    bioKo: about.bioKo,
    bioEn: about.bioEn,
  };
}

function rowToFormValues(row) {
  if (!row) return fallbackValues();
  return {
    eyebrowKo: row.eyebrow_ko,
    eyebrowEn: row.eyebrow_en,
    headlineKo: row.headline_ko,
    headlineEn: row.headline_en,
    bioKo: row.bio_ko,
    bioEn: row.bio_en,
  };
}

async function load() {
  if (!isSupabaseConfigured) return fallbackValues();
  const row = await fetchSingleton('about_content');
  return rowToFormValues(row);
}

async function save(values) {
  requireFilled([
    { label: 'Eyebrow', ko: values.eyebrowKo, en: values.eyebrowEn },
    { label: 'Headline', ko: values.headlineKo, en: values.headlineEn },
    { label: 'Bio', ko: values.bioKo, en: values.bioEn },
  ]);
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured — cannot save. See supabase/README.md.');
  }

  await upsertSingleton('about_content', {
    eyebrow_ko: values.eyebrowKo,
    eyebrow_en: values.eyebrowEn,
    headline_ko: values.headlineKo,
    headline_en: values.headlineEn,
    bio_ko: values.bioKo,
    bio_en: values.bioEn,
  });

  return load();
}

function AboutSection() {
  const { status, loadError, values, update, isDirty, saveState, saveError, save: runSave, reset, reload } =
    useAdminForm({ load, save });

  return (
    <section className="admin-section-form">
      <h2>About (소개)</h2>
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
            label="About 섹션 소제목"
            ko={values.eyebrowKo}
            en={values.eyebrowEn}
            onKoChange={(v) => update({ eyebrowKo: v })}
            onEnChange={(v) => update({ eyebrowEn: v })}
          />
          <BilingualField
            label="About 섹션 제목"
            ko={values.headlineKo}
            en={values.headlineEn}
            onKoChange={(v) => update({ headlineKo: v })}
            onEnChange={(v) => update({ headlineEn: v })}
          />
          <BilingualField
            label="소개 본문"
            ko={values.bioKo}
            en={values.bioEn}
            onKoChange={(v) => update({ bioKo: v })}
            onEnChange={(v) => update({ bioEn: v })}
            multiline
          />
        </>
      )}
    </section>
  );
}

export default AboutSection;
