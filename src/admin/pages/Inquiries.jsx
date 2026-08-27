import { useState } from 'react';
import { useInquiries, STATUS_OPTIONS } from '../content/useInquiries.js';

const STATUS_LABELS = { new: '신규', in_progress: '진행 중', completed: '완료' };

function formatDate(iso) {
  return new Date(iso).toLocaleString('ko-KR');
}

// Contact Form submissions (supabase/migrations/0005_inquiries.sql),
// admin-only per RLS. Status changes and deletes write immediately — no
// draft/Save step, since each is a single-field action rather than a form
// with several fields to accumulate before saving (see useInquiries.js).
function Inquiries() {
  const { status, loadError, items, rowState, updateStatus, remove, reload } = useInquiries();
  const [expandedId, setExpandedId] = useState(null);

  return (
    <section className="admin-section-form">
      <h2>Inquiries (문의 관리)</h2>
      <p className="admin-section-help">Contact Form으로 접수된 문의입니다. 항목을 눌러 상세 내용을 확인하고, 상태를 변경할 수 있습니다.</p>

      {status === 'loading' && <p className="admin-section-status">불러오는 중…</p>}

      {status === 'unconfigured' && (
        <p className="admin-section-status">Supabase가 설정되지 않아 문의 내역을 불러올 수 없습니다.</p>
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
              <span className="admin-save-neutral">총 {items.length}건</span>
            </div>
            <div className="admin-section-toolbar-actions">
              <button type="button" onClick={reload}>
                다시 불러오기
              </button>
            </div>
          </div>

          {items.length === 0 && <p className="admin-section-help">아직 접수된 문의가 없습니다.</p>}

          {items.map((item) => {
            const expanded = expandedId === item.id;
            const rs = rowState[item.id];
            return (
              <div className="admin-inquiry-item" key={item.id}>
                <button
                  type="button"
                  className="admin-inquiry-summary"
                  onClick={() => setExpandedId(expanded ? null : item.id)}
                  aria-expanded={expanded}
                >
                  <span className={`admin-inquiry-status admin-inquiry-status--${item.status}`}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </span>
                  <span className="admin-inquiry-name">{item.name}</span>
                  <span className="admin-inquiry-type">{item.inquiry_type}</span>
                  <span className="admin-inquiry-date">{formatDate(item.created_at)}</span>
                </button>

                {expanded && (
                  <div className="admin-inquiry-detail">
                    <dl className="admin-inquiry-fields">
                      <dt>이름</dt>
                      <dd>{item.name}</dd>
                      <dt>회사</dt>
                      <dd>{item.company || '—'}</dd>
                      <dt>이메일</dt>
                      <dd>
                        <a href={`mailto:${item.email}`}>{item.email}</a>
                      </dd>
                      <dt>문의 유형</dt>
                      <dd>{item.inquiry_type}</dd>
                      <dt>접수 일시</dt>
                      <dd>{formatDate(item.created_at)}</dd>
                    </dl>
                    <p className="admin-inquiry-message">{item.message}</p>

                    <div className="admin-inquiry-actions">
                      <label className="admin-field admin-inquiry-status-field">
                        <span className="admin-field-label">상태</span>
                        <select
                          value={item.status}
                          onChange={(event) => updateStatus(item.id, event.target.value)}
                          disabled={rs?.action === 'updating'}
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {STATUS_LABELS[option]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="admin-image-reset"
                        disabled={rs?.action === 'deleting'}
                        onClick={() => {
                          if (window.confirm('이 문의를 삭제할까요? 되돌릴 수 없습니다.')) remove(item.id);
                        }}
                      >
                        {rs?.action === 'deleting' ? '삭제 중…' : '삭제'}
                      </button>
                    </div>
                    {rs?.error && (
                      <p className="admin-status-error" role="alert">
                        {rs.error}
                      </p>
                    )}
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

export default Inquiries;
