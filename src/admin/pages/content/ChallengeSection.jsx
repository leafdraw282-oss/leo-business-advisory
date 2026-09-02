import { challenge } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton, fetchList, saveListRow } from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

function headingFallback() {
  return {
    eyebrowKo: challenge.eyebrowKo,
    eyebrowEn: challenge.eyebrowEn,
    titleKo: challenge.titleKo,
    titleEn: challenge.titleEn,
    statementKo: challenge.statementKo,
    statementEn: challenge.statementEn,
    statementSubKo: challenge.statementSubKo,
    statementSubEn: challenge.statementSubEn,
  };
}

function itemsFallback() {
  return challenge.items.map((item) => ({ id: null, textKo: item.ko, textEn: item.en }));
}

async function load() {
  if (!isSupabaseConfigured) return { heading: headingFallback(), items: itemsFallback() };

  const row = await fetchSingleton('challenge_section');
  const heading = row
    ? {
        eyebrowKo: row.eyebrow_ko,
        eyebrowEn: row.eyebrow_en,
        titleKo: row.title_ko,
        titleEn: row.title_en,
        statementKo: row.statement_ko,
        statementEn: row.statement_en,
        statementSubKo: row.statement_sub_ko,
        statementSubEn: row.statement_sub_en,
      }
    : headingFallback();

  const itemRows = await fetchList('challenge_items');
  const items =
    itemRows.length > 0 ? itemRows.map((r) => ({ id: r.id, textKo: r.text_ko, textEn: r.text_en })) : itemsFallback();

  return { heading, items };
}

async function save(values) {
  requireFilled([
    { label: 'Section eyebrow', ko: values.heading.eyebrowKo, en: values.heading.eyebrowEn },
    { label: 'Section title', ko: values.heading.titleKo, en: values.heading.titleEn },
    { label: 'Statement', ko: values.heading.statementKo, en: values.heading.statementEn },
    { label: 'Statement sub-line', ko: values.heading.statementSubKo, en: values.heading.statementSubEn },
    ...values.items.map((item, i) => ({ label: `Challenge item ${i + 1}`, ko: item.textKo, en: item.textEn })),
  ]);

  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured — cannot save. See supabase/README.md.');
  }

  await upsertSingleton('challenge_section', {
    eyebrow_ko: values.heading.eyebrowKo,
    eyebrow_en: values.heading.eyebrowEn,
    title_ko: values.heading.titleKo,
    title_en: values.heading.titleEn,
    statement_ko: values.heading.statementKo,
    statement_en: values.heading.statementEn,
    statement_sub_ko: values.heading.statementSubKo,
    statement_sub_en: values.heading.statementSubEn,
  });

  for (const [index, item] of values.items.entries()) {
    await saveListRow('challenge_items', item.id, {
      text_ko: item.textKo,
      text_en: item.textEn,
      sort_order: index,
    });
  }

  return load();
}

function ChallengeSection() {
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
      <h2>Challenge (이런 고민이 있으신가요)</h2>
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
            label="Challenge 섹션 소제목"
            ko={values.heading.eyebrowKo}
            en={values.heading.eyebrowEn}
            onKoChange={(v) => updateHeading({ eyebrowKo: v })}
            onEnChange={(v) => updateHeading({ eyebrowEn: v })}
          />
          <BilingualField
            label="Challenge 섹션 제목"
            ko={values.heading.titleKo}
            en={values.heading.titleEn}
            onKoChange={(v) => updateHeading({ titleKo: v })}
            onEnChange={(v) => updateHeading({ titleEn: v })}
          />

          <h3>고민 목록</h3>
          {values.items.map((item, index) => (
            <div className="admin-list-row" key={item.id ?? `new-${index}`}>
              <BilingualField
                label={`고민 ${index + 1}`}
                ko={item.textKo}
                en={item.textEn}
                onKoChange={(v) => updateItem(index, { textKo: v })}
                onEnChange={(v) => updateItem(index, { textEn: v })}
              />
            </div>
          ))}

          <h3>마무리 문구</h3>
          <BilingualField
            label="핵심 메시지"
            ko={values.heading.statementKo}
            en={values.heading.statementEn}
            onKoChange={(v) => updateHeading({ statementKo: v })}
            onEnChange={(v) => updateHeading({ statementEn: v })}
          />
          <BilingualField
            label="보조 메시지"
            ko={values.heading.statementSubKo}
            en={values.heading.statementSubEn}
            onKoChange={(v) => updateHeading({ statementSubKo: v })}
            onEnChange={(v) => updateHeading({ statementSubEn: v })}
          />
        </>
      )}
    </section>
  );
}

export default ChallengeSection;
