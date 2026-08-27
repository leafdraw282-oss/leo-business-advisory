import { education } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchList, saveListRow } from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

// No dedicated heading table exists for Education (education_entries is a
// plain list — see supabase/migrations/0001_init_schema.sql), matching
// profile.js's own `education` shape, which likewise has no eyebrow/title.

function entriesFallback() {
  return education.ko.map((ko, index) => ({ id: null, textKo: ko, textEn: education.en[index] }));
}

async function load() {
  if (!isSupabaseConfigured) return { entries: entriesFallback() };

  const rows = await fetchList('education_entries');
  const entries =
    rows.length > 0
      ? rows.map((r) => ({ id: r.id, textKo: r.text_ko, textEn: r.text_en }))
      : entriesFallback();

  return { entries };
}

async function save(values) {
  requireFilled(values.entries.map((e, i) => ({ label: `Entry ${i + 1}`, ko: e.textKo, en: e.textEn })));

  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured — cannot save. See supabase/README.md.');
  }

  for (const [index, entry] of values.entries.entries()) {
    await saveListRow('education_entries', entry.id, {
      text_ko: entry.textKo,
      text_en: entry.textEn,
      sort_order: index,
    });
  }

  return load();
}

function EducationSection() {
  const { status, loadError, values, update, isDirty, saveState, saveError, save: runSave, reset, reload } =
    useAdminForm({ load, save });

  function updateEntry(index, patch) {
    update((prev) => ({
      ...prev,
      entries: prev.entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    }));
  }

  return (
    <section className="admin-section-form">
      <h2>Education (학력 및 어학)</h2>
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
          {values.entries.map((entry, index) => (
            <div className="admin-list-row" key={entry.id ?? `new-${index}`}>
              <p className="admin-list-row-title">학력/어학 항목 {index + 1}</p>
              <BilingualField
                label="내용"
                ko={entry.textKo}
                en={entry.textEn}
                onKoChange={(v) => updateEntry(index, { textKo: v })}
                onEnChange={(v) => updateEntry(index, { textEn: v })}
              />
            </div>
          ))}
        </>
      )}
    </section>
  );
}

export default EducationSection;
