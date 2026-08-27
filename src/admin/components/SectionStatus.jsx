// Shared toolbar for every Content/Images section: load state, an
// explicit distinction between 현재 저장값 (idle/success) / 수정 중인 값
// (dirty) / 저장되지 않은 변경사항 (the dirty badge itself), save
// success/failure, and Reset/Reload/Save actions. Every section renders
// this the same way so the admin always knows, unambiguously, whether
// what's on screen matches what's saved — the toolbar's own background
// color changes with the state (neutral / amber / green / red), not just
// its text, so the distinction reads at a glance without needing to read
// English.
function SectionStatus({ status, loadError, isDirty, saveState, saveError, onSave, onReset, onReload }) {
  if (status === 'loading') {
    return <p className="admin-section-status">불러오는 중…</p>;
  }

  if (status === 'load-error') {
    return (
      <p className="admin-section-status admin-status-error" role="alert">
        불러오기 실패: {loadError}
      </p>
    );
  }

  const toolbarState = saveState === 'error' ? 'error' : isDirty ? 'dirty' : saveState === 'success' ? 'success' : 'idle';

  return (
    <div className={`admin-section-toolbar admin-section-toolbar--${toolbarState}`}>
      <div className="admin-section-toolbar-status">
        {isDirty && <span className="admin-dirty-badge">✎ 수정 중 — 저장되지 않은 변경사항이 있습니다</span>}
        {!isDirty && saveState === 'success' && <span className="admin-save-ok">✓ 저장 완료 — 현재 저장된 값입니다</span>}
        {saveState === 'error' && (
          <span className="admin-save-error" role="alert">
            ✕ 저장 실패: {saveError}
          </span>
        )}
        {!isDirty && saveState === 'idle' && <span className="admin-save-neutral">현재 저장된 값을 보고 있습니다 (변경 없음)</span>}
      </div>
      <div className="admin-section-toolbar-actions">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={saveState === 'saving' || !isDirty}
            title="수정 중인 내용을 지우고 현재 저장된 값으로 되돌립니다. (Founder Profile 원본으로 초기화하지 않습니다.)"
          >
            되돌리기
          </button>
        )}
        <button type="button" onClick={onReload} disabled={saveState === 'saving'}>
          다시 불러오기
        </button>
        <button type="button" onClick={onSave} disabled={saveState === 'saving' || !isDirty}>
          {saveState === 'saving' ? '저장 중…' : '저장'}
        </button>
      </div>
    </div>
  );
}

export default SectionStatus;
