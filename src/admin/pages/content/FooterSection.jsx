import { footer } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton } from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

function fallbackValues() {
  return {
    copyrightKo: footer.copyrightKo,
    copyrightEn: footer.copyrightEn,
    backToTopKo: footer.backToTopKo,
    backToTopEn: footer.backToTopEn,
  };
}

function rowToFormValues(row) {
  if (!row) return fallbackValues();
  return {
    copyrightKo: row.copyright_ko,
    copyrightEn: row.copyright_en,
    backToTopKo: row.back_to_top_ko,
    backToTopEn: row.back_to_top_en,
  };
}

async function load() {
  if (!isSupabaseConfigured) return fallbackValues();
  const row = await fetchSingleton('footer_content');
  return rowToFormValues(row);
}

async function save(values) {
  requireFilled([
    { label: 'Copyright', ko: values.copyrightKo, en: values.copyrightEn },
    { label: 'Back to top', ko: values.backToTopKo, en: values.backToTopEn },
  ]);
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured — cannot save. See supabase/README.md.');
  }

  await upsertSingleton('footer_content', {
    copyright_ko: values.copyrightKo,
    copyright_en: values.copyrightEn,
    back_to_top_ko: values.backToTopKo,
    back_to_top_en: values.backToTopEn,
  });

  return load();
}

function FooterSection() {
  const { status, loadError, values, update, isDirty, saveState, saveError, save: runSave, reload } =
    useAdminForm({ load, save });

  return (
    <section className="admin-section-form">
      <h2>Footer (하단 영역)</h2>
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
          <BilingualField
            label="Footer 저작권 문구"
            ko={values.copyrightKo}
            en={values.copyrightEn}
            onKoChange={(v) => update({ copyrightKo: v })}
            onEnChange={(v) => update({ copyrightEn: v })}
          />
          <BilingualField
            label="맨 위로 버튼 문구"
            ko={values.backToTopKo}
            en={values.backToTopEn}
            onKoChange={(v) => update({ backToTopKo: v })}
            onEnChange={(v) => update({ backToTopEn: v })}
          />
        </>
      )}
    </section>
  );
}

export default FooterSection;
