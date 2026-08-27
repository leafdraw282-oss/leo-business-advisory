import { loadDesignSettings, saveDesignSettings } from '../content/designSettings.js';
import { useAdminForm } from '../content/useAdminForm.js';
import {
  CONTENT_WIDTH_PRESETS,
  SECTION_SPACING_PRESETS,
  RADIUS_PRESETS,
  HEADING_SCALE_PRESETS,
} from '../content/layoutPresets.js';
import SectionStatus from '../components/SectionStatus.jsx';
import ColorField from '../components/ColorField.jsx';
import PresetField from '../components/PresetField.jsx';
import DesignSettingsPreview from '../components/DesignSettingsPreview.jsx';

// Phase 4-C — the single `site_design_settings` row (id=1), editable
// here. Every field below maps 1:1 to a real column added in
// supabase/migrations/0009_site_design_settings.sql — no new columns are
// invented on the UI side. load()/save() reuse the exact same
// fetchSingleton/upsertSingleton-backed helpers
// (src/admin/content/designSettings.js) every other Content section
// already uses, so this gets the same dirty-tracking / save-state
// toolbar (SectionStatus) for free.
async function load() {
  return loadDesignSettings();
}

async function save(values) {
  return saveDesignSettings(values);
}

function TextField({ label, hint, value, onChange }) {
  return (
    <label className="admin-field">
      <span className="admin-field-label">
        {label}
        {hint && <span className="admin-field-unit-hint"> — {hint}</span>}
      </span>
      <input type="text" value={value ?? ''} onChange={(event) => onChange(event.target.value)} spellCheck={false} />
    </label>
  );
}

function NumberField({ label, hint, value, min = 0.01, step = 0.001, onChange }) {
  return (
    <label className="admin-field">
      <span className="admin-field-label">
        {label}
        {hint && <span className="admin-field-unit-hint"> — {hint}</span>}
      </span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : ''}
        min={min}
        step={step}
        onChange={(event) => {
          const next = event.target.value === '' ? '' : Number(event.target.value);
          if (next !== '' && !Number.isFinite(next)) return;
          onChange(next);
        }}
      />
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="admin-field">
      <span className="admin-field-label">{label}</span>
      <select value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Settings() {
  const {
    status,
    loadError,
    values,
    update,
    isDirty,
    saveState,
    saveError,
    save: runSave,
    reset,
    reload,
  } = useAdminForm({ load, save });

  return (
    <section className="admin-section-form admin-settings">
      <h2>Design Settings</h2>
      <p className="admin-section-help">
        사이트 전체 색상·폰트·레이아웃·모션 값을 관리합니다. 저장하면 Public Website에 반영됩니다. Supabase에
        연결할 수 없거나 값을 불러오지 못하면 기존 기본 디자인 값이 그대로 사용되며, 사이트가 깨지지 않습니다.
      </p>
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
        <div className="admin-settings-grid">
          <div className="admin-settings-form">
            <h3>Colors</h3>
            <ColorField label="Primary Color" value={values.colorPrimary} onChange={(v) => update({ colorPrimary: v })} />
            <ColorField
              label="Secondary Color"
              value={values.colorSecondary}
              onChange={(v) => update({ colorSecondary: v })}
            />
            <ColorField label="Accent Color" value={values.colorAccent} onChange={(v) => update({ colorAccent: v })} />
            <ColorField
              label="Background Color"
              value={values.colorBackground}
              onChange={(v) => update({ colorBackground: v })}
            />
            <ColorField label="Surface Color" value={values.colorSurface} onChange={(v) => update({ colorSurface: v })} />
            <ColorField label="Text Color" value={values.colorText} onChange={(v) => update({ colorText: v })} />
            <ColorField
              label="Muted Text Color"
              value={values.colorTextMuted}
              onChange={(v) => update({ colorTextMuted: v })}
            />
            <ColorField label="Border Color" value={values.colorBorder} onChange={(v) => update({ colorBorder: v })} />

            <h3>Typography</h3>
            <TextField
              label="Korean Font"
              hint="CSS font-family 값"
              value={values.fontKo}
              onChange={(v) => update({ fontKo: v })}
            />
            <TextField
              label="English Font"
              hint="CSS font-family 값"
              value={values.fontEn}
              onChange={(v) => update({ fontEn: v })}
            />
            <TextField
              label="본문 Font Size"
              hint="예: 1rem, 16px"
              value={values.bodyFontSize}
              onChange={(v) => update({ bodyFontSize: v })}
            />
            <PresetField
              label="Heading Scale"
              value={values.headingScale}
              presets={HEADING_SCALE_PRESETS}
              onChange={(v) => update({ headingScale: v })}
            />
            <NumberField
              label="본문 Line Height"
              hint="배수 (단위 없음), 예: 1.75"
              min={0.5}
              step={0.05}
              value={values.lineHeight}
              onChange={(v) => update({ lineHeight: v })}
            />
            <TextField
              label="본문 Letter Spacing"
              hint="예: normal, 0.02em"
              value={values.letterSpacing}
              onChange={(v) => update({ letterSpacing: v })}
            />

            <h3>Layout</h3>
            <PresetField
              label="Content Width"
              value={values.contentMaxWidth}
              presets={CONTENT_WIDTH_PRESETS}
              onChange={(v) => update({ contentMaxWidth: v })}
            />
            <PresetField
              label="Section Spacing"
              value={values.sectionSpacing}
              presets={SECTION_SPACING_PRESETS}
              onChange={(v) => update({ sectionSpacing: v })}
            />
            <PresetField
              label="Card Radius"
              value={values.cardRadius}
              presets={RADIUS_PRESETS}
              onChange={(v) => update({ cardRadius: v })}
            />
            <PresetField
              label="Image Radius"
              value={values.imageRadius}
              presets={RADIUS_PRESETS}
              onChange={(v) => update({ imageRadius: v })}
            />

            <h3>Motion</h3>
            <SelectField
              label="Motion Level"
              value={values.motionLevel}
              onChange={(v) => update({ motionLevel: v })}
              options={[
                { value: 'minimal', label: 'Minimal' },
                { value: 'standard', label: 'Standard (기본값)' },
                { value: 'expressive', label: 'Expressive' },
              ]}
            />
            <SelectField
              label="Image Motion Style"
              value={values.imageMotionStyle}
              onChange={(v) => update({ imageMotionStyle: v })}
              options={[
                { value: 'none', label: 'None (기본값)' },
                { value: 'fade', label: 'Fade' },
                { value: 'zoom', label: 'Zoom' },
                { value: 'parallax', label: 'Parallax' },
              ]}
            />
          </div>

          <div className="admin-settings-preview-column">
            <DesignSettingsPreview settings={values} />
          </div>
        </div>
      )}
    </section>
  );
}

export default Settings;
