import { insightsSection, insights } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { isValidHttpUrl } from '../../../lib/urlValidation.js';
import { fetchSingleton, upsertSingleton, fetchList, saveListRow, deleteRow } from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import PlainField from '../../components/PlainField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

function headingFallback() {
  return {
    eyebrowKo: insightsSection.eyebrowKo,
    eyebrowEn: insightsSection.eyebrowEn,
    titleKo: insightsSection.titleKo,
    titleEn: insightsSection.titleEn,
    comingSoonKo: insightsSection.comingSoonKo,
    comingSoonEn: insightsSection.comingSoonEn,
  };
}

// Card shape is deliberately just id/titleKo/titleEn/linkUrl — the button
// text fields (link_label_ko/en) that used to live here are gone from this
// form entirely (the public site now auto-generates the button's text from
// the current language, see InsightsPreview.jsx). Any link_label_ko/en
// already sitting in the database from before this change is left alone —
// save() below never writes those two columns, so existing values are
// neither read into this form nor overwritten by it.
function itemsFallback() {
  return insights.map((item) => ({
    id: item.id,
    clientKey: item.id,
    titleKo: item.titleKo,
    titleEn: item.titleEn,
    linkUrl: '',
  }));
}

async function load() {
  if (!isSupabaseConfigured) return { heading: headingFallback(), items: itemsFallback(), deletedIds: [] };

  const row = await fetchSingleton('insights_section');
  const heading = row
    ? {
        eyebrowKo: row.eyebrow_ko,
        eyebrowEn: row.eyebrow_en,
        titleKo: row.title_ko,
        titleEn: row.title_en,
        comingSoonKo: row.coming_soon_ko,
        comingSoonEn: row.coming_soon_en,
      }
    : headingFallback();

  const itemRows = await fetchList('insights_items');
  const items =
    itemRows.length > 0
      ? itemRows.map((r) => ({
          id: r.id,
          clientKey: r.id,
          titleKo: r.title_ko,
          titleEn: r.title_en,
          linkUrl: r.link_url ?? '',
        }))
      : itemsFallback();

  return { heading, items, deletedIds: [] };
}

async function save(values) {
  requireFilled([
    { label: 'Section eyebrow', ko: values.heading.eyebrowKo, en: values.heading.eyebrowEn },
    { label: 'Section title', ko: values.heading.titleKo, en: values.heading.titleEn },
    { label: 'Coming soon label', ko: values.heading.comingSoonKo, en: values.heading.comingSoonEn },
    ...values.items.map((item, i) => ({ label: `Insight ${i + 1} title`, ko: item.titleKo, en: item.titleEn })),
  ]);

  const invalidUrlItems = values.items.filter((item) => item.linkUrl.trim() && !isValidHttpUrl(item.linkUrl));
  if (invalidUrlItems.length > 0) {
    throw new Error('링크 URL은 http:// 또는 https://로 시작하는 형식이어야 합니다.');
  }

  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured — cannot save. See supabase/README.md.');
  }

  await upsertSingleton('insights_section', {
    eyebrow_ko: values.heading.eyebrowKo,
    eyebrow_en: values.heading.eyebrowEn,
    title_ko: values.heading.titleKo,
    title_en: values.heading.titleEn,
    coming_soon_ko: values.heading.comingSoonKo,
    coming_soon_en: values.heading.comingSoonEn,
  });

  for (const id of values.deletedIds) {
    await deleteRow('insights_items', id);
  }

  for (const [index, item] of values.items.entries()) {
    await saveListRow('insights_items', item.id, {
      title_ko: item.titleKo,
      title_en: item.titleEn,
      sort_order: index,
      link_url: item.linkUrl.trim() || null,
    });
  }

  return load();
}

function InsightsSection() {
  const { status, loadError, values, update, isDirty, saveState, saveError, save: runSave, reset, reload } =
    useAdminForm({ load, save });

  function updateHeading(patch) {
    update((prev) => ({ ...prev, heading: { ...prev.heading, ...patch } }));
  }

  function updateItem(index, patch) {
    update((prev) => ({ ...prev, items: prev.items.map((it, i) => (i === index ? { ...it, ...patch } : it)) }));
  }

  function addCard() {
    update((prev) => ({
      ...prev,
      items: [...prev.items, { id: null, clientKey: crypto.randomUUID(), titleKo: '', titleEn: '', linkUrl: '' }],
    }));
  }

  // A never-yet-saved card (no id) just disappears from the draft — nothing
  // was ever written, so there's nothing to delete. An already-saved card's
  // id is queued into deletedIds and only actually deleted from the
  // database when this whole form is saved (matching how every other edit
  // here works: nothing is written until Save is pressed).
  function removeCard(index) {
    const item = values.items[index];
    if (!window.confirm('이 인사이트 카드를 삭제하시겠습니까?')) return;
    update((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
      deletedIds: item.id ? [...prev.deletedIds, item.id] : prev.deletedIds,
    }));
  }

  return (
    <section className="admin-section-form">
      <h2>Insights (인사이트 미리보기)</h2>
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
          <BilingualField
            label="'준비 중' 라벨 (링크 URL이 없는 카드에 표시)"
            ko={values.heading.comingSoonKo}
            en={values.heading.comingSoonEn}
            onKoChange={(v) => updateHeading({ comingSoonKo: v })}
            onEnChange={(v) => updateHeading({ comingSoonEn: v })}
          />

          <h3>인사이트 카드</h3>
          <p className="admin-section-help">
            링크 URL을 비워두면 위 &quot;준비 중&quot; 라벨이 그대로 표시됩니다. URL을 입력하면 그 카드만
            버튼으로 바뀌어 새 창에서 링크가 열립니다 (네이버 블로그, 유튜브 등 외부 링크 가능). 버튼 문구는
            직접 입력할 필요 없이 한국어/영어 페이지에 맞게 자동으로 표시됩니다 (예: &quot;블로그에서
            보기&quot; / &quot;Read on the blog&quot;). 새 카드는 홈페이지의 가장 먼저 보이는 자리에
            자동으로 노출됩니다.
          </p>
          {values.items.map((item, index) => (
            <div className="admin-list-row" key={item.clientKey}>
              <p className="admin-list-row-title">카드 {index + 1}</p>
              <BilingualField
                label="제목"
                ko={item.titleKo}
                en={item.titleEn}
                onKoChange={(v) => updateItem(index, { titleKo: v })}
                onEnChange={(v) => updateItem(index, { titleEn: v })}
              />
              <PlainField
                label="링크 URL (선택사항 — 비워두면 '준비 중'으로 표시)"
                type="url"
                value={item.linkUrl}
                onChange={(v) => updateItem(index, { linkUrl: v })}
              />
              <button type="button" className="admin-image-reset" onClick={() => removeCard(index)}>
                카드 삭제
              </button>
            </div>
          ))}
          <button type="button" className="admin-gallery-add" onClick={addCard}>
            + 카드 추가
          </button>
        </>
      )}
    </section>
  );
}

export default InsightsSection;
