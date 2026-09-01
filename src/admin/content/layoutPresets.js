// Phase 4-E — preset-based Layout controls for Design Settings.
//
// site_design_settings still stores plain CSS values (text/numeric) —
// no schema change. These presets are just a curated set of safe values
// for each column, mapped to a friendly label; the admin picks a label,
// the underlying column gets the matching value. Each "Standard" preset
// below is deliberately set to the exact literal Phase 4-A/4-B already
// used as that column's default, so any project's existing stored value
// (including everything already deployed to Production) is recognized
// as a real preset, not shown as "custom" — see matchPreset().

export const CONTENT_WIDTH_PRESETS = [
  { value: '1080px', label: 'Compact (1080px)' },
  { value: '1280px', label: 'Standard (1280px, 기본값)' },
  { value: '1440px', label: 'Wide (1440px)' },
];

export const SECTION_SPACING_PRESETS = [
  { value: '4rem', label: 'Compact (4rem)' },
  { value: '6rem', label: 'Standard (6rem, 기본값)' },
  { value: '8rem', label: 'Spacious (8rem)' },
];

// Shared by both card_radius and image_radius — same three steps, same
// meaning ("어느 정도 둥글게"), just applied to a different element.
export const RADIUS_PRESETS = [
  { value: '2px', label: 'Square (2px, 기본값)' },
  { value: '8px', label: 'Soft (8px)' },
  { value: '16px', label: 'Rounded (16px)' },
];

// Values stay in the same unitless "ratio" space heading_scale always
// used (Standard is the exact literal every existing row already has —
// 1.333 — so this is a zero-risk default). variables.css's
// --heading-scale-factor formula translates these into a small, clamped
// multiplier (±15% max) applied to every heading level together, so
// hierarchy is preserved and layout can't break regardless of which
// preset is picked.
export const HEADING_SCALE_PRESETS = [
  { value: 1.15, label: 'Compact' },
  { value: 1.333, label: 'Standard (기본값)' },
  { value: 1.6, label: 'Large' },
];

/** Finds the preset matching `value` (string/number-safe comparison),
 *  or null if `value` doesn't match any known preset — the caller should
 *  then offer a "현재 값 유지" option instead of silently changing it. */
export function matchPreset(presets, value) {
  return presets.find((preset) => String(preset.value) === String(value)) ?? null;
}

// Phase 5-B — font_ko/font_en/body_font_size/letter_spacing were previously
// free-text inputs: an admin could type any CSS font-family/size/spacing
// string, including one that renders badly or means nothing. site_design_
// settings still stores a plain string/CSS value in these columns (no
// schema change) — these are just a curated, safe set of values per
// column, same pattern as CONTENT_WIDTH_PRESETS etc. above.
//
// Typography unification — the whole site now renders one family only
// (Noto Sans / Noto Sans KR, loaded via Google Fonts — see index.html),
// so both presets per field are Noto Sans stacks: "기본값" requests the
// webfont, "시스템 폴백" is the same choice with the webfont request
// dropped (falls straight to the OS's own sans-serif) for an admin who
// wants to avoid the extra font request entirely. Neither preset can pick
// a different typeface — see variables.css, where --font-heading (the
// previous editorial-serif-for-English token) now just aliases --font-kr.
export const FONT_KO_PRESETS = [
  {
    value: "'Noto Sans KR', 'Noto Sans', sans-serif",
    label: 'Noto Sans (기본값)',
  },
  {
    value: "-apple-system, BlinkMacSystemFont, 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
    label: 'System UI (시스템 기본 글꼴)',
  },
];

export const FONT_EN_PRESETS = [
  {
    value: "'Noto Sans', 'Noto Sans KR', sans-serif",
    label: 'Noto Sans (기본값)',
  },
  {
    value: '-apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif',
    label: 'System UI (시스템 기본 글꼴)',
  },
];

export const BODY_FONT_SIZE_PRESETS = [
  { value: '0.9375rem', label: 'Compact (15px)' },
  { value: '1rem', label: 'Standard (16px, 기본값)' },
  { value: '1.0625rem', label: 'Large (17px)' },
];

export const LETTER_SPACING_PRESETS = [
  { value: 'normal', label: 'Standard (기본값)' },
  { value: '-0.01em', label: 'Tight (약간 좁게)' },
];
