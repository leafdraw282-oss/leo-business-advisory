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
