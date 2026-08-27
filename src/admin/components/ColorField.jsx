// Colors stored as a plain 6-digit hex get both a native color picker and
// a hex text input, kept in sync. A value that isn't hex (currently only
// colorBorder, stored as an rgba() string for its transparency — a
// native <input type="color"> can't represent alpha and would silently
// drop it) falls back to a text-only input with a swatch preview and an
// explanatory note, instead of quietly corrupting the value.
const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

function ColorField({ label, value, onChange }) {
  const isHex = HEX_PATTERN.test(value ?? '');

  return (
    <div className="admin-field admin-color-field">
      <span className="admin-field-label">{label}</span>
      <div className="admin-color-field-row">
        {isHex ? (
          <input
            type="color"
            className="admin-color-swatch"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label={`${label} 색상 선택`}
          />
        ) : (
          <span
            className="admin-color-swatch admin-color-swatch--preview"
            style={{ background: value || 'transparent' }}
            aria-hidden="true"
          />
        )}
        <input
          type="text"
          className="admin-color-hex-input"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
        />
      </div>
      {!isHex && (
        <p className="admin-field-hint">
          HEX(#RRGGBB) 형식이 아니라서 색상 선택기를 사용할 수 없습니다 — 직접 입력해주세요 (예: rgba(34, 34, 34, 0.12)).
        </p>
      )}
    </div>
  );
}

export default ColorField;
