import { careerSection, career } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton, fetchList, saveListRow } from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import PlainField from '../../components/PlainField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

function headingFallback() {
  return {
    eyebrowKo: careerSection.eyebrowKo,
    eyebrowEn: careerSection.eyebrowEn,
    titleKo: careerSection.titleKo,
    titleEn: careerSection.titleEn,
  };
}

function entriesFallback() {
  return career.map((entry) => ({
    id: null,
    period: entry.period,
    roleKo: entry.roleKo,
    roleEn: entry.roleEn,
    companyKo: entry.companyKo,
    companyEn: entry.companyEn,
  }));
}

async function load() {
  if (!isSupabaseConfigured) {
    return { heading: headingFallback(), entries: entriesFallback() };
  }

  const headingRow = await fetchSingleton('career_section');
  const heading = headingRow
    ? {
        eyebrowKo: headingRow.eyebrow_ko,
        eyebrowEn: headingRow.eyebrow_en,
        titleKo: headingRow.title_ko,
        titleEn: headingRow.title_en,
      }
    : headingFallback();

  const entryRows = await fetchList('career_entries');
  const entries =
    entryRows.length > 0
      ? entryRows.map((r) => ({
          id: r.id,
          period: r.period,
          roleKo: r.role_ko,
          roleEn: r.role_en,
          companyKo: r.company_ko,
          companyEn: r.company_en,
        }))
      : entriesFallback();

  return { heading, entries };
}

async function save(values) {
  requireFilled([
    { label: 'Section eyebrow', ko: values.heading.eyebrowKo, en: values.heading.eyebrowEn },
    { label: 'Section title', ko: values.heading.titleKo, en: values.heading.titleEn },
    ...values.entries.map((e) => ({ label: `${e.period} role`, ko: e.roleKo, en: e.roleEn })),
    ...values.entries.map((e) => ({ label: `${e.period} company`, ko: e.companyKo, en: e.companyEn })),
  ]);

  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured — cannot save. See supabase/README.md.');
  }

  await upsertSingleton('career_section', {
    eyebrow_ko: values.heading.eyebrowKo,
    eyebrow_en: values.heading.eyebrowEn,
    title_ko: values.heading.titleKo,
    title_en: values.heading.titleEn,
  });

  for (const [index, entry] of values.entries.entries()) {
    await saveListRow('career_entries', entry.id, {
      period: entry.period,
      role_ko: entry.roleKo,
      role_en: entry.roleEn,
      company_ko: entry.companyKo,
      company_en: entry.companyEn,
      sort_order: index,
    });
  }

  return load();
}

function CareerSection() {
  const { status, loadError, values, update, isDirty, saveState, saveError, save: runSave, reload } =
    useAdminForm({ load, save });

  function updateHeading(patch) {
    update((prev) => ({ ...prev, heading: { ...prev.heading, ...patch } }));
  }

  function updateEntry(index, patch) {
    update((prev) => ({
      ...prev,
      entries: prev.entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    }));
  }

  return (
    <section className="admin-section-form">
      <h2>Career</h2>
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
          <h3>Section heading</h3>
          <BilingualField
            label="Eyebrow"
            ko={values.heading.eyebrowKo}
            en={values.heading.eyebrowEn}
            onKoChange={(v) => updateHeading({ eyebrowKo: v })}
            onEnChange={(v) => updateHeading({ eyebrowEn: v })}
          />
          <BilingualField
            label="Title"
            ko={values.heading.titleKo}
            en={values.heading.titleEn}
            onKoChange={(v) => updateHeading({ titleKo: v })}
            onEnChange={(v) => updateHeading({ titleEn: v })}
          />

          <h3>Career entries</h3>
          {values.entries.map((entry, index) => (
            <div className="admin-list-row" key={entry.id ?? `new-${index}`}>
              <PlainField label="Period" value={entry.period} onChange={(v) => updateEntry(index, { period: v })} />
              <BilingualField
                label="Role"
                ko={entry.roleKo}
                en={entry.roleEn}
                onKoChange={(v) => updateEntry(index, { roleKo: v })}
                onEnChange={(v) => updateEntry(index, { roleEn: v })}
              />
              <BilingualField
                label="Company"
                ko={entry.companyKo}
                en={entry.companyEn}
                onKoChange={(v) => updateEntry(index, { companyKo: v })}
                onEnChange={(v) => updateEntry(index, { companyEn: v })}
              />
            </div>
          ))}
        </>
      )}
    </section>
  );
}

export default CareerSection;
