import { useState } from 'react';
import { useRevisions } from '../content/useRevisions.js';

// table_name -> a plain Korean label a non-developer can recognize,
// matching the section names used elsewhere in the admin (Content.jsx,
// Dashboard.jsx). Anything not in this map (there shouldn't be any, but a
// future table added to supabaseTable.js's generic writers would still
// show up here) falls back to the raw table name.
const TABLE_LABELS = {
  hero_content: 'Hero',
  about_content: 'About (소개)',
  impact_section: 'Impact 제목',
  impact_metrics: 'Impact 수치',
  case_studies_section: 'Case Studies 제목',
  case_studies: 'Case Study',
  case_study_metrics: 'Case Study 수치',
  case_study_highlights: 'Case Study 하이라이트',
  advisory_section: 'Advisory 제목',
  advisory_items: 'Advisory 항목',
  career_section: 'Career 제목',
  career_entries: 'Career 경력',
  education_entries: 'Education 학력',
  contact_info: 'Contact 연락처 정보',
  contact_cta: 'Contact 문의 유도 문구',
  contact_form_content: 'Contact 문의 폼 문구',
  inquiry_types: 'Contact 문의 유형',
  footer_content: 'Footer',
};

const HIDDEN_SNAPSHOT_KEYS = new Set(['id', 'created_at', 'updated_at']);

function formatDate(iso) {
  return new Date(iso).toLocaleString('ko-KR');
}

function formatSnapshotValue(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function Revisions() {
  const { status, loadError, revisions, rowState, restore, reload } = useRevisions();
  const [expandedId, setExpandedId] = useState(null);

  return (
    <section className="admin-section-form">
      <h2>Revisions (최근 변경 기록)</h2>
      <p className="admin-section-help">
        Hero, About, Impact, Case Studies, Advisory, Career, Contact 등 콘텐츠를 저장할 때마다 저장 직전 값이 자동으로
        기록됩니다. 실수로 잘못 수정했다면 아래에서 이전 값으로 되돌릴 수 있습니다. Gallery 사진 삭제는 이 화면이
        아니라 Images → Gallery의 휴지통에서 복원합니다.
      </p>

      {status === 'loading' && <p className="admin-section-status">불러오는 중…</p>}
      {status === 'unconfigured' && (
        <p className="admin-section-status">Supabase가 설정되지 않아 변경 기록을 불러올 수 없습니다.</p>
      )}
      {status === 'load-error' && (
        <div className="admin-section-toolbar admin-section-toolbar--error">
          <div className="admin-section-toolbar-status">
            <span className="admin-save-error" role="alert">
              불러오기 실패: {loadError}
            </span>
          </div>
          <div className="admin-section-toolbar-actions">
            <button type="button" onClick={reload}>
              다시 불러오기
            </button>
          </div>
        </div>
      )}

      {status === 'ready' && (
        <>
          <div className="admin-section-toolbar admin-section-toolbar--idle">
            <div className="admin-section-toolbar-status">
              <span className="admin-save-neutral">최근 {revisions.length}건 (항목별 최대 10건까지 보관됩니다)</span>
            </div>
            <div className="admin-section-toolbar-actions">
              <button type="button" onClick={reload}>
                다시 불러오기
              </button>
            </div>
          </div>

          {revisions.length === 0 && <p className="admin-section-help">아직 기록된 변경 이력이 없습니다.</p>}

          {revisions.map((revision) => {
            const expanded = expandedId === revision.id;
            const rs = rowState[revision.id];
            const label = TABLE_LABELS[revision.table_name] ?? revision.table_name;
            const fields = Object.entries(revision.snapshot ?? {}).filter(([key]) => !HIDDEN_SNAPSHOT_KEYS.has(key));

            return (
              <div className="admin-inquiry-item" key={revision.id}>
                <button
                  type="button"
                  className="admin-inquiry-summary admin-revision-summary"
                  onClick={() => setExpandedId(expanded ? null : revision.id)}
                  aria-expanded={expanded}
                >
                  <span className="admin-inquiry-name">{label}</span>
                  <span className="admin-inquiry-date">저장 전 값 — {formatDate(revision.created_at)}</span>
                </button>

                {expanded && (
                  <div className="admin-inquiry-detail">
                    <dl className="admin-inquiry-fields admin-revision-fields">
                      {fields.map(([key, value]) => (
                        <div key={key} className="admin-revision-field">
                          <dt>{key}</dt>
                          <dd>{formatSnapshotValue(value)}</dd>
                        </div>
                      ))}
                    </dl>

                    {rs?.done && !rs?.error && <p className="admin-save-ok">✓ 복원되었습니다.</p>}
                    {rs?.error && (
                      <p className="admin-status-error" role="alert">
                        복원 실패: {rs.error}
                      </p>
                    )}

                    <div className="admin-inquiry-actions">
                      <button
                        type="button"
                        disabled={rs?.action === 'restoring'}
                        onClick={() => {
                          if (
                            window.confirm(
                              `${label} 항목을 ${formatDate(revision.created_at)} 시점의 값으로 되돌릴까요?\n\n현재 값은 새로운 변경 기록으로 저장되어, 필요하면 다시 되돌릴 수 있습니다.`,
                            )
                          ) {
                            restore(revision);
                          }
                        }}
                      >
                        {rs?.action === 'restoring' ? '복원 중…' : '이 값으로 복원'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}

export default Revisions;
