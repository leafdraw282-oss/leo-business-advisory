// A small, fully self-contained preview — every style below is computed
// from `settings` via inline style props on its own isolated DOM nodes,
// so it can never leak into or be affected by the rest of the admin
// UI's own stylesheet (admin.css), and never touches
// document.documentElement — only the real Save button does that, via
// the Public Website itself. Kept intentionally simple: no attempt to
// reproduce the actual site's layout, just enough to judge a change
// before committing to it.
//
// Phase 4-E: mirrors the same --heading-scale-factor formula
// variables.css actually uses (clamp(0.9, 1 + (scale-1.333)*0.4, 1.15))
// so the heading size shown here matches what the real site will do,
// and adds a Content Width bar + a Section Spacing rhythm strip —
// scaled-down, proportional representations, not literal pixel copies
// (the preview panel itself is nowhere near 1280px wide).
function headingScaleFactor(headingScale) {
  const scale = Number(headingScale);
  if (!Number.isFinite(scale) || scale <= 0) return 1;
  return Math.min(1.15, Math.max(0.9, 1 + (scale - 1.333) * 0.4));
}

// Reference points only used to size the two schematic bars below —
// 1440px content width and 8rem spacing are this site's own widest
// presets (see layoutPresets.js), so every preset renders at a
// meaningfully different, but always in-bounds, bar size.
const MAX_REFERENCE_WIDTH_PX = 1440;
const MAX_REFERENCE_SPACING_REM = 8;

function DesignSettingsPreview({ settings }) {
  const bodyFontSize = settings.bodyFontSize || '1rem';
  const scaleFactor = headingScaleFactor(settings.headingScale);

  const contentWidthPx = parseFloat(settings.contentMaxWidth) || 1280;
  const widthBarPercent = Math.min(100, Math.max(12, (contentWidthPx / MAX_REFERENCE_WIDTH_PX) * 100));

  const spacingRem = parseFloat(settings.sectionSpacing) || 6;
  const spacingBarPercent = Math.min(100, Math.max(15, (spacingRem / MAX_REFERENCE_SPACING_REM) * 100));

  const wrapStyle = {
    background: settings.colorBackground || '#f4f1ea',
    padding: '1.5rem',
    borderRadius: '4px',
  };
  const cardStyle = {
    background: settings.colorSurface || '#ffffff',
    color: settings.colorText || '#222222',
    border: `1px solid ${settings.colorBorder || 'rgba(0,0,0,0.12)'}`,
    borderRadius: settings.cardRadius || '2px',
    padding: '1.5rem',
    maxWidth: '22rem',
    fontFamily: settings.fontEn || undefined,
  };
  const eyebrowStyle = {
    color: settings.colorAccent || '#a4865c',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    margin: '0 0 0.4rem',
  };
  const headingStyle = {
    color: settings.colorPrimary || '#0b1625',
    fontSize: `calc(1.75rem * ${scaleFactor})`,
    margin: '0 0 0.6rem',
    lineHeight: 1.2,
  };
  const bodyStyle = {
    fontSize: bodyFontSize,
    lineHeight: settings.lineHeight || 1.75,
    letterSpacing: settings.letterSpacing || 'normal',
    color: settings.colorTextMuted || '#8b8984',
    margin: 0,
  };
  const buttonStyle = {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.6rem 1.2rem',
    background: settings.colorPrimary || '#0b1625',
    color: settings.colorSurface || '#ffffff',
    borderRadius: settings.cardRadius || '2px',
    fontSize: '0.85rem',
  };
  const imageSwatchStyle = {
    marginTop: '1rem',
    width: '100%',
    height: '3.5rem',
    background: settings.colorPrimary || '#0b1625',
    borderRadius: settings.imageRadius || '2px',
    opacity: 0.85,
  };

  return (
    <div className="admin-design-preview" style={wrapStyle}>
      <p className="admin-design-preview-label">미리보기 (저장 전, 실제 사이트에는 아직 반영되지 않음)</p>

      <div className="admin-design-preview-schematic">
        <div className="admin-design-preview-bar-row">
          <span className="admin-design-preview-bar-label">Content Width ({settings.contentMaxWidth})</span>
          <div className="admin-design-preview-bar-track">
            <div className="admin-design-preview-bar-fill" style={{ width: `${widthBarPercent}%` }} />
          </div>
        </div>
        <div className="admin-design-preview-bar-row">
          <span className="admin-design-preview-bar-label">Section Spacing ({settings.sectionSpacing})</span>
          <div className="admin-design-preview-bar-track admin-design-preview-bar-track--spacing">
            <div className="admin-design-preview-spacing-block" />
            <div className="admin-design-preview-spacing-gap" style={{ height: `${spacingBarPercent}%` }} />
            <div className="admin-design-preview-spacing-block" />
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <p style={eyebrowStyle}>Sample Eyebrow</p>
        <h4 style={headingStyle}>Sample Heading 예시 제목</h4>
        <p style={bodyStyle}>본문 예시 텍스트입니다. Sample body copy shown with the current settings above.</p>
        <span style={buttonStyle}>Sample Button</span>
        <div style={imageSwatchStyle} aria-hidden="true" />
      </div>
    </div>
  );
}

export default DesignSettingsPreview;
