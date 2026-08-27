// A single (non-bilingual) input — for values that aren't translated
// content, like an email address, phone number, or a "CASE 01" tag.
function PlainField({ label, value, onChange, type = 'text', readOnly = false }) {
  return (
    <div className="admin-field">
      <label className="admin-field-label">
        {label}
        <input
          type={type}
          value={value}
          onChange={readOnly ? undefined : (event) => onChange(event.target.value)}
          readOnly={readOnly}
        />
      </label>
    </div>
  );
}

export default PlainField;
