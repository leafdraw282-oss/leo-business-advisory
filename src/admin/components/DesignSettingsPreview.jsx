// A small, fully self-contained preview (Phase 4-C, requirement 7) —
// every style below is computed from `settings` via inline style props on
// its own isolated DOM nodes, so it can never leak into or be affected by
// the rest of the admin UI's own stylesheet (admin.css), and never
// touches document.documentElement — only the real Save button does that,
// via the Public Website itself. Kept intentionally simple: no attempt to
// reproduce the actual site's layout, just enough to judge a color/
// spacing/font change before committing to it.
function DesignSettingsPreview({ settings }) {
  const headingScale = Number(settings.headingScale) > 0 ? Number(settings.headingScale) : 1.333;
  const bodyFontSize = settings.bodyFontSize || '1rem';

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
    fontSize: `calc(${bodyFontSize} * ${headingScale})`,
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

  return (
    <div className="admin-design-preview" style={wrapStyle}>
      <p className="admin-design-preview-label">미리보기 (저장 전, 실제 사이트에는 아직 반영되지 않음)</p>
      <div style={cardStyle}>
        <p style={eyebrowStyle}>Sample Eyebrow</p>
        <h4 style={headingStyle}>Sample Heading 예시 제목</h4>
        <p style={bodyStyle}>본문 예시 텍스트입니다. Sample body copy shown with the current settings above.</p>
        <span style={buttonStyle}>Sample Button</span>
      </div>
    </div>
  );
}

export default DesignSettingsPreview;
