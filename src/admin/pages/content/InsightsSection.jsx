import { insightsSection, insights } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton, fetchList, saveListRow } from '../../content/supabaseTable.js';
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

function itemsFallback() {
  return insights.map((item) => ({
    id: null,
    titleKo: item.titleKo,
    titleEn: item.titleEn,
    linkUrl: '',
    linkLabelKo: '',
    linkLabelEn: '',
  }));
}

async function load() {
  if (!isSupabaseConfigured) return { heading: headingFallback(), items: itemsFallback() };

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
          titleKo: r.title_ko,
          titleEn: r.title_en,
          linkUrl: r.link_url ?? '',
          linkLabelKo: r.link_label_ko ?? '',
          linkLabelEn: r.link_label_en ?? '',
        }))
      : itemsFallback();

  return { heading, items };
}

async function save(values) {
  requireFilled([
    { label: 'Section eyebrow', ko: values.heading.eyebrowKo, en: values.heading.eyebrowEn },
    { label: 'Section title', ko: values.heading.titleKo, en: values.heading.titleEn },
    { label: 'Coming soon label', ko: values.heading.comingSoonKo, en: values.heading.comingSoonEn },
    ...values.items.map((item, i) => ({ label: `Insight ${i + 1} title`, ko: item.titleKo, en: item.titleEn })),
    // Link URL/label are optional — a card can stay a "coming soon"
    // placeholder forever — but if a URL IS set, its button text can't
    // be blank (InsightsPreview.jsx already falls back to a generic
    // label at render time, but requiring it here means the admin sees
    // and fixes that themselves rather than relying on a silent default).
    ...values.items
      .filter((item) => item.linkUrl.trim())
      .map((item, i) => ({ label: `Insight ${i + 1} button text`, ko: item.linkLabelKo, en: item.linkLabelEn })),
  ]);

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

  for (const [index, item] of values.items.entries()) {
    const linkUrl = item.linkUrl.trim();
    await saveListRow('insights_items', item.id, {
      title_ko: item.titleKo,
      title_en: item.titleEn,
      sort_order: index,
      link_url: linkUrl || null,
      link_label_ko: linkUrl ? item.linkLabelKo.trim() : null,
      link_label_en: linkUrl ? item.linkLabelEn.trim() : null,
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
            label="'준비 중' 라벨 (실제 글이 없을 때 카드에 표시)"
            ko={values.heading.comingSoonKo}
            en={values.heading.comingSoonEn}
            onKoChange={(v) => updateHeading({ comingSoonKo: v })}
            onEnChange={(v) => updateHeading({ comingSoonEn: v })}
          />

          <h3>인사이트 카드</h3>
          <p className="admin-section-help">
            링크 URL을 비워두면 위 &quot;준비 중&quot; 라벨이 그대로 표시됩니다. URL을 입력하면 그 카드만
            버튼으로 바뀌어 새 창에서 링크가 열립니다 (네이버 블로그, 유튜브 등 외부 링크 가능). 버튼에 실제
            URL은 보이지 않고, 아래에서 입력한 문구만 보입니다.
          </p>
          {values.items.map((item, index) => (
            <div className="admin-list-row" key={item.id ?? `new-${index}`}>
              <BilingualField
                label={`카드 ${index + 1} 제목`}
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
              {item.linkUrl.trim() && (
                <BilingualField
                  label="버튼 문구 (예: 네이버 블로그에서 보기 / 유튜브에서 보기)"
                  ko={item.linkLabelKo}
                  en={item.linkLabelEn}
                  onKoChange={(v) => updateItem(index, { linkLabelKo: v })}
                  onEnChange={(v) => updateItem(index, { linkLabelEn: v })}
                />
              )}
            </div>
          ))}
        </>
      )}
    </section>
  );
}

export default InsightsSection;
