import { matchPreset } from '../content/layoutPresets.js';

// A <select> of curated preset values instead of a free-text/number
// input — the whole point (Phase 4-E) is that an admin can't type an
// arbitrary CSS value that breaks the site. If the currently stored
// value doesn't match any known preset (e.g. it was set directly via
// SQL, or came from before this phase), an extra "현재 값 유지" option is
// added and pre-selected so the real value is never silently changed —
// only picking a different preset actually changes anything.
function PresetField({ label, value, presets, onChange }) {
  const matched = matchPreset(presets, value);
  const options = matched ? presets : [...presets, { value, label: `현재 값 유지 (${value})` }];

  return (
    <label className="admin-field">
      <span className="admin-field-label">{label}</span>
      <select
        value={String(value)}
        onChange={(event) => {
          const chosen = options.find((option) => String(option.value) === event.target.value);
          if (chosen) onChange(chosen.value);
        }}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default PresetField;
