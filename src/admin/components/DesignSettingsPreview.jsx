import { useState } from 'react';

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

// Phase 4-F — the exact same distance/duration values global.css's
// [data-motion-level] rules use for the real Public Website (see the
// "Motion System" block there), duplicated here rather than shared,
// because this preview is deliberately isolated from document.
// documentElement (see the file-level note above) — it can never read the
// real CSS custom properties the live site uses, so it has to know its
// own copy of what each preset means. Values change rarely and only in
// this one other place, same tradeoff already made for headingScaleFactor
// above.
const MOTION_LEVEL_PREVIEW = {
  minimal: { distancePx: 0, durationMs: 1, description: '리빌 애니메이션 없음 — 모든 섹션이 즉시 표시됩니다.' },
  standard: { distancePx: 16, durationMs: 500, description: '짧고 절제된 fade + 살짝 위로 올라오는 리빌 (기본값).' },
  expressive: { distancePx: 24, durationMs: 650, description: 'Standard보다 조금 더 뚜렷한 fade + 리빌.' },
};

const IMAGE_MOTION_PREVIEW = {
  none: { scale: 1, description: '이미지에 별도 모션 없음.' },
  fade: { scale: 1, description: '스크롤 진입 시 opacity 중심으로 부드럽게 나타남.' },
  zoom: { scale: 1.04, description: '아주 미세한 확대(soft zoom)와 함께 나타남 — 과한 확대 없음.' },
  parallax: { scale: 1.04, description: 'Soft Zoom과 동일하게 매우 절제된 형태로 적용됩니다 (연속적으로 움직이는 효과는 사용하지 않습니다).' },
};

// A one-shot "play" replay, never an auto-looping animation — an admin
// panel that keeps moving on its own is exactly the kind of "과도하게
// 움직이는" preview the spec asks to avoid. The sample starts fully
// visible (never hidden on load, so this panel is never mistaken for a
// rendering bug) and only transitions when the admin explicitly clicks
// Play: it drops to its "not yet revealed" state for one frame, then
// transitions back — the same hidden -> visible motion the real site
// plays once per section, on demand instead of on scroll.
function MotionPreview({ settings }) {
  const [revealed, setRevealed] = useState(true);
  const level = MOTION_LEVEL_PREVIEW[settings.motionLevel] ?? MOTION_LEVEL_PREVIEW.standard;
  const imageMotion = IMAGE_MOTION_PREVIEW[settings.imageMotionStyle] ?? IMAGE_MOTION_PREVIEW.none;

  function playPreview() {
    setRevealed(false);
    // Two nested rAFs guarantee the browser has actually painted the
    // "hidden" frame before we transition back — otherwise React could
    // batch both state updates into a single render and the CSS
    // transition would never visibly play.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setRevealed(true));
    });
  }

  const sectionSampleStyle = {
    marginTop: '0.75rem',
    padding: '0.75rem 1rem',
    background: settings.colorSurface || '#ffffff',
    border: `1px dashed ${settings.colorBorder || 'rgba(0,0,0,0.12)'}`,
    borderRadius: settings.cardRadius || '2px',
    fontSize: '0.8rem',
    color: settings.colorText || '#222222',
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'none' : `translateY(${level.distancePx}px)`,
    transition: `opacity ${level.durationMs}ms ease, transform ${level.durationMs}ms ease`,
  };

  const imageSampleStyle = {
    marginTop: '0.5rem',
    width: '100%',
    height: '2.5rem',
    background: settings.colorPrimary || '#0b1625',
    borderRadius: settings.imageRadius || '2px',
    opacity: revealed ? 0.85 : 0,
    transform: revealed ? 'scale(1)' : `scale(${imageMotion.scale})`,
    transition: `opacity ${level.durationMs}ms ease, transform ${level.durationMs}ms ease`,
  };

  return (
    <div className="admin-design-preview-motion">
      <div className="admin-design-preview-bar-row">
        <span className="admin-design-preview-bar-label">Motion Level: {settings.motionLevel}</span>
      </div>
      <p style={{ fontSize: '0.75rem', color: settings.colorTextMuted || '#696764', margin: '0.2rem 0 0' }}>
        {level.description}
      </p>
      <div className="admin-design-preview-bar-row" style={{ marginTop: '0.5rem' }}>
        <span className="admin-design-preview-bar-label">Image Motion Style: {settings.imageMotionStyle}</span>
      </div>
      <p style={{ fontSize: '0.75rem', color: settings.colorTextMuted || '#696764', margin: '0.2rem 0 0' }}>
        {imageMotion.description}
      </p>
      <button type="button" className="admin-design-preview-motion-play" onClick={playPreview}>
        ▶ 리빌 미리보기 재생
      </button>
      <div style={sectionSampleStyle}>Sample Section</div>
      <div style={imageSampleStyle} aria-hidden="true" />
    </div>
  );
}

// Phase 5-A — the 8 color roles Admin > Settings actually exposes, in the
// same order the form lists them, each labeled with its role name so an
// admin can see how Primary/Secondary/Accent/Background/Surface/Text/
// Muted Text/Border relate to each other before saving. Text/Muted Text
// swatches show their sample text set IN that color, on the current
// Surface color, so a contrast problem is visible directly in the
// preview rather than only inferable from hex values.
const COLOR_ROLES = [
  { key: 'colorPrimary', label: 'Primary' },
  { key: 'colorSecondary', label: 'Secondary' },
  { key: 'colorAccent', label: 'Accent' },
  { key: 'colorBackground', label: 'Background' },
  { key: 'colorSurface', label: 'Surface' },
  { key: 'colorText', label: 'Text' },
  { key: 'colorTextMuted', label: 'Muted Text' },
  { key: 'colorBorder', label: 'Border' },
];

function ColorRoleSwatches({ settings }) {
  return (
    <div className="admin-design-preview-swatches">
      {COLOR_ROLES.map(({ key, label }) => (
        <div className="admin-design-preview-swatch" key={key}>
          <span
            className="admin-design-preview-swatch-chip"
            style={{ background: settings[key] || 'transparent' }}
            aria-hidden="true"
          />
          <span className="admin-design-preview-swatch-text">
            <span className="admin-design-preview-swatch-role">{label}</span>
            <span className="admin-design-preview-swatch-hex">{settings[key] || '—'}</span>
          </span>
        </div>
      ))}
    </div>
  );
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
    color: settings.colorTextMuted || '#696764',
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

      <ColorRoleSwatches settings={settings} />

      <div style={cardStyle}>
        <p style={eyebrowStyle}>Sample Eyebrow</p>
        <h4 style={headingStyle}>Sample Heading 예시 제목</h4>
        <p style={bodyStyle}>본문 예시 텍스트입니다. Sample body copy shown with the current settings above.</p>
        <span style={buttonStyle}>Sample Button</span>
        <div style={imageSwatchStyle} aria-hidden="true" />
      </div>

      <MotionPreview settings={settings} />
    </div>
  );
}

export default DesignSettingsPreview;
