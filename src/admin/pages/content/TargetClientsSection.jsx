import { targetClientsSection, targetClients, peAdvisory } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton, fetchList, saveListRow } from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

function headingFallback() {
  return {
    eyebrowKo: targetClientsSection.eyebrowKo,
    eyebrowEn: targetClientsSection.eyebrowEn,
    titleKo: targetClientsSection.titleKo,
    titleEn: targetClientsSection.titleEn,
  };
}

function clientsFallback() {
  return targetClients.map((c) => ({ id: null, textKo: c.ko, textEn: c.en }));
}

function peFallback() {
  return {
    labelKo: peAdvisory.labelKo,
    labelEn: peAdvisory.labelEn,
    introKo: peAdvisory.introKo,
    introEn: peAdvisory.introEn,
  };
}

function peItemsFallback() {
  return peAdvisory.items.map((item) => ({ id: null, textKo: item.ko, textEn: item.en }));
}

async function load() {
  if (!isSupabaseConfigured) {
    return { heading: headingFallback(), clients: clientsFallback(), pe: peFallback(), peItems: peItemsFallback() };
  }

  const headingRow = await fetchSingleton('target_clients_section');
  const heading = headingRow
    ? {
        eyebrowKo: headingRow.eyebrow_ko,
        eyebrowEn: headingRow.eyebrow_en,
        titleKo: headingRow.title_ko,
        titleEn: headingRow.title_en,
      }
    : headingFallback();

  const clientRows = await fetchList('target_client_items');
  const clients =
    clientRows.length > 0 ? clientRows.map((r) => ({ id: r.id, textKo: r.text_ko, textEn: r.text_en })) : clientsFallback();

  const peRow = await fetchSingleton('pe_advisory');
  const pe = peRow
    ? { labelKo: peRow.label_ko, labelEn: peRow.label_en, introKo: peRow.intro_ko, introEn: peRow.intro_en }
    : peFallback();

  const peItemRows = await fetchList('pe_advisory_items');
  const peItems =
    peItemRows.length > 0 ? peItemRows.map((r) => ({ id: r.id, textKo: r.text_ko, textEn: r.text_en })) : peItemsFallback();

  return { heading, clients, pe, peItems };
}

async function save(values) {
  requireFilled([
    { label: 'Section eyebrow', ko: values.heading.eyebrowKo, en: values.heading.eyebrowEn },
    { label: 'Section title', ko: values.heading.titleKo, en: values.heading.titleEn },
    ...values.clients.map((c, i) => ({ label: `Target client ${i + 1}`, ko: c.textKo, en: c.textEn })),
    { label: 'PE Advisory label', ko: values.pe.labelKo, en: values.pe.labelEn },
    { label: 'PE Advisory intro', ko: values.pe.introKo, en: values.pe.introEn },
    ...values.peItems.map((item, i) => ({ label: `PE Advisory item ${i + 1}`, ko: item.textKo, en: item.textEn })),
  ]);

  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured — cannot save. See supabase/README.md.');
  }

  await upsertSingleton('target_clients_section', {
    eyebrow_ko: values.heading.eyebrowKo,
    eyebrow_en: values.heading.eyebrowEn,
    title_ko: values.heading.titleKo,
    title_en: values.heading.titleEn,
  });

  for (const [index, client] of values.clients.entries()) {
    await saveListRow('target_client_items', client.id, {
      text_ko: client.textKo,
      text_en: client.textEn,
      sort_order: index,
    });
  }

  await upsertSingleton('pe_advisory', {
    label_ko: values.pe.labelKo,
    label_en: values.pe.labelEn,
    intro_ko: values.pe.introKo,
    intro_en: values.pe.introEn,
  });

  for (const [index, item] of values.peItems.entries()) {
    await saveListRow('pe_advisory_items', item.id, {
      text_ko: item.textKo,
      text_en: item.textEn,
      sort_order: index,
    });
  }

  return load();
}

function TargetClientsSection() {
  const { status, loadError, values, update, isDirty, saveState, saveError, save: runSave, reset, reload } =
    useAdminForm({ load, save });

  function updateHeading(patch) {
    update((prev) => ({ ...prev, heading: { ...prev.heading, ...patch } }));
  }

  function updateClient(index, patch) {
    update((prev) => ({ ...prev, clients: prev.clients.map((c, i) => (i === index ? { ...c, ...patch } : c)) }));
  }

  function updatePe(patch) {
    update((prev) => ({ ...prev, pe: { ...prev.pe, ...patch } }));
  }

  function updatePeItem(index, patch) {
    update((prev) => ({ ...prev, peItems: prev.peItems.map((it, i) => (i === index ? { ...it, ...patch } : it)) }));
  }

  return (
    <section className="admin-section-form">
      <h2>Target Clients (이런 분들과 함께합니다)</h2>
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

          <h3>고객 유형 목록</h3>
          {values.clients.map((client, index) => (
            <div className="admin-list-row" key={client.id ?? `new-${index}`}>
              <BilingualField
                label={`고객 유형 ${index + 1}`}
                ko={client.textKo}
                en={client.textEn}
                onKoChange={(v) => updateClient(index, { textKo: v })}
                onEnChange={(v) => updateClient(index, { textEn: v })}
              />
            </div>
          ))}

          <h3>PE Portfolio Advisory 강조 영역</h3>
          <BilingualField
            label="라벨"
            ko={values.pe.labelKo}
            en={values.pe.labelEn}
            onKoChange={(v) => updatePe({ labelKo: v })}
            onEnChange={(v) => updatePe({ labelEn: v })}
          />
          <BilingualField
            label="소개 문구"
            ko={values.pe.introKo}
            en={values.pe.introEn}
            onKoChange={(v) => updatePe({ introKo: v })}
            onEnChange={(v) => updatePe({ introEn: v })}
          />
          {values.peItems.map((item, index) => (
            <div className="admin-list-row" key={item.id ?? `new-${index}`}>
              <BilingualField
                label={`PE Advisory 항목 ${index + 1}`}
                ko={item.textKo}
                en={item.textEn}
                onKoChange={(v) => updatePeItem(index, { textKo: v })}
                onEnChange={(v) => updatePeItem(index, { textEn: v })}
              />
            </div>
          ))}
        </>
      )}
    </section>
  );
}

export default TargetClientsSection;
