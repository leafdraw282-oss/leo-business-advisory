// Shared toolbar for every Content section: load state, an explicit
// "unsaved changes" indicator, save success/failure, and Save/Reload
// actions. Every section renders this the same way so the admin always
// knows, unambiguously, whether what's on screen matches what's saved.
function SectionStatus({ status, loadError, isDirty, saveState, saveError, onSave, onReload }) {
  if (status === 'loading') {
    return <p className="admin-section-status">Loading…</p>;
  }

  if (status === 'load-error') {
    return (
      <p className="admin-section-status admin-status-error" role="alert">
        Failed to load: {loadError}
      </p>
    );
  }

  return (
    <div className="admin-section-toolbar">
      <div className="admin-section-toolbar-status">
        {isDirty && <span className="admin-dirty-badge">Unsaved changes</span>}
        {!isDirty && saveState === 'success' && <span className="admin-save-ok">Saved</span>}
        {saveState === 'error' && (
          <span className="admin-save-error" role="alert">
            Save failed: {saveError}
          </span>
        )}
      </div>
      <div className="admin-section-toolbar-actions">
        <button type="button" onClick={onReload} disabled={saveState === 'saving'}>
          Reload
        </button>
        <button type="button" onClick={onSave} disabled={saveState === 'saving' || !isDirty}>
          {saveState === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default SectionStatus;
