// One label + a KO input and an EN input side by side, always shown
// together — an editor can never see or edit one language without the
// other in view (see CLAUDE.md's "never a partial switch" rule).
function BilingualField({ label, ko, en, onKoChange, onEnChange, multiline = false }) {
  const Tag = multiline ? 'textarea' : 'input';

  return (
    <div className="admin-field">
      <span className="admin-field-label">{label}</span>
      <div className="admin-bilingual-row">
        <label className="admin-bilingual-cell">
          <span className="admin-lang-tag">KO</span>
          <Tag
            value={ko}
            onChange={(event) => onKoChange(event.target.value)}
            rows={multiline ? 4 : undefined}
          />
        </label>
        <label className="admin-bilingual-cell">
          <span className="admin-lang-tag">EN</span>
          <Tag
            value={en}
            onChange={(event) => onEnChange(event.target.value)}
            rows={multiline ? 4 : undefined}
          />
        </label>
      </div>
    </div>
  );
}

export default BilingualField;
