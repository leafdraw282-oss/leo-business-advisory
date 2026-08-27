// Shared toolbar for every Content/Images section: load state, an
// explicit "unsaved changes" indicator, save success/failure, and
// Save/Reload actions. Every section renders this the same way so the
// admin always knows, unambiguously, whether what's on screen matches
// what's saved — the toolbar's own background color changes with the
// state (neutral / amber / green / red), not just its text, so the
// distinction reads at a glance without needing to read English.
function SectionStatus({ status, loadError, isDirty, saveState, saveError, onSave, onReload }) {
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
        {isDirty && <span className="admin-dirty-badge">● 저장되지 않은 변경사항이 있습니다</span>}
        {!isDirty && saveState === 'success' && <span className="admin-save-ok">✓ 저장되었습니다</span>}
        {saveState === 'error' && (
          <span className="admin-save-error" role="alert">
            저장 실패: {saveError}
          </span>
        )}
        {!isDirty && saveState === 'idle' && <span className="admin-save-neutral">현재 저장된 값을 보고 있습니다</span>}
      </div>
      <div className="admin-section-toolbar-actions">
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
