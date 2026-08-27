import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow } from './publicTable.js';

/**
 * Phase 4-B — data access layer for `site_design_settings`
 * (supabase/migrations/0009_site_design_settings.sql).
 *
 * This module only reads/shapes data — nothing here is wired into page
 * rendering yet (no component calls fetchDesignSettings() or
 * applyDesignSettings() today). That wiring, and any admin UI to edit
 * these values, is out of scope for Phase 4-B on purpose; see
 * docs/PROJECT_STATUS.md's Phase 4-B entry.
 *
 * `designSettingsFallback()` is the safety net: its values are the exact
 * literals src/styles/variables.css already resolves to (Phase 4-A). A
 * missing Supabase project, a network error, an empty table, or an RLS
 * rejection all resolve the same way through fetchWithFallback — quietly
 * falling back to these, never to a blank/broken design. A future phase
 * that wires applyDesignSettings() into page load inherits this guarantee
 * for free, the same way every other src/lib/content/*.js module does.
 */

/** camelCase key -> the CSS custom property it drives (see variables.css). */
export const DESIGN_TOKEN_MAP = {
  fontKo: '--font-ko',
  fontEn: '--font-en',
  bodyFontSize: '--font-size-body',
  headingScale: '--heading-scale',
  lineHeight: '--line-height-body',
  letterSpacing: '--letter-spacing-body',
  colorPrimary: '--color-primary',
  colorSecondary: '--color-secondary',
  colorAccent: '--color-accent',
  colorBackground: '--color-background',
  colorSurface: '--color-surface',
  colorText: '--color-text',
  colorTextMuted: '--color-text-muted',
  colorBorder: '--color-border',
  contentMaxWidth: '--content-max-width',
  sectionSpacing: '--section-spacing',
  cardRadius: '--card-radius',
  imageRadius: '--image-radius',
};

/**
 * Phase 4-A's literal current values — must stay in sync with
 * src/styles/variables.css and supabase/migrations/0009's seed row.
 * `motionLevel`/`imageMotionStyle` have no CSS variable yet (Phase 4-A
 * didn't define motion *behavior* tokens beyond duration/distance/easing);
 * they're carried here so the shape already matches the DB row ahead of
 * whichever future phase adds the motion-behavior wiring.
 */
export function designSettingsFallback() {
  return {
    fontKo: "'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    fontEn: "'Inter', 'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    bodyFontSize: '1rem',
    headingScale: 1.333,
    lineHeight: 1.75,
    letterSpacing: 'normal',
    colorPrimary: '#0b1625',
    colorSecondary: '#f4f1ea',
    colorAccent: '#a4865c',
    colorBackground: '#f4f1ea',
    colorSurface: '#ffffff',
    colorText: '#222222',
    colorTextMuted: '#8b8984',
    colorBorder: 'rgba(34, 34, 34, 0.12)',
    contentMaxWidth: '1280px',
    sectionSpacing: '6rem',
    cardRadius: '2px',
    imageRadius: '2px',
    motionLevel: 'standard',
    imageMotionStyle: 'none',
  };
}

function rowToSettings(row) {
  return {
    fontKo: row.font_ko,
    fontEn: row.font_en,
    bodyFontSize: row.body_font_size,
    headingScale: row.heading_scale,
    lineHeight: row.line_height,
    letterSpacing: row.letter_spacing,
    colorPrimary: row.color_primary,
    colorSecondary: row.color_secondary,
    colorAccent: row.color_accent,
    colorBackground: row.color_background,
    colorSurface: row.color_surface,
    colorText: row.color_text,
    colorTextMuted: row.color_text_muted,
    colorBorder: row.color_border,
    contentMaxWidth: row.content_max_width,
    sectionSpacing: row.section_spacing,
    cardRadius: row.card_radius,
    imageRadius: row.image_radius,
    motionLevel: row.motion_level,
    imageMotionStyle: row.image_motion_style,
  };
}

/**
 * Fetches the active design settings row, falling back to
 * designSettingsFallback() on any failure — same contract as every other
 * fetchX() in src/lib/content/. Not called anywhere yet (see module doc).
 */
export async function fetchDesignSettings() {
  return fetchWithFallback(async () => {
    const row = await fetchSingletonRow('site_design_settings');
    if (!row) return null;
    return rowToSettings(row);
  }, designSettingsFallback());
}

/**
 * Applies a settings object to :root as CSS custom properties, via
 * DESIGN_TOKEN_MAP. Pure DOM side effect, safe to call with either a
 * fetched row's shape or designSettingsFallback()'s. Not invoked from
 * anywhere yet — kept ready for the phase that wires live design
 * overrides into page load.
 */
export function applyDesignSettings(settings, root = document.documentElement) {
  for (const [key, cssVar] of Object.entries(DESIGN_TOKEN_MAP)) {
    const value = settings?.[key];
    if (value === undefined || value === null || value === '') continue;
    root.style.setProperty(cssVar, String(value));
  }
}
