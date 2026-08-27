import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow } from './publicTable.js';

/**
 * Data access layer for `site_design_settings`
 * (supabase/migrations/0009_site_design_settings.sql), wired into the
 * public site's rendering by Phase 4-C — see src/App.jsx's
 * useApplyDesignSettings() call.
 *
 * `designSettingsFallback()` is the safety net: its values are the exact
 * literals src/styles/variables.css already resolves to (Phase 4-A). A
 * missing Supabase project, a network error, an empty table, or an RLS
 * rejection all resolve the same way through fetchWithFallback — quietly
 * falling back to these, never to a blank/broken design. applyDesignSettings()
 * additionally re-validates every value it's handed (see isUsableValue
 * below) before writing it to :root, so even a malformed row fetched
 * successfully from the database can't break rendering — only individual
 * out-of-range fields are skipped, falling back to whatever variables.css
 * already defines for that one token.
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

// The two truly numeric columns (heading_scale, line_height are
// Postgres `numeric`, checked > 0 at the database) get a real type/range
// check here too — defense in depth, not trust in the DB constraint
// alone. Every other column is already a ready-to-use CSS value string;
// CSS custom properties accept arbitrary text, and an individual
// malformed one (e.g. "1280xyz" for a length) simply makes the one
// specific declaration that reads it invalid — the browser falls back to
// that property's normal cascade instead of crashing or blanking the
// page, so no further validation is needed for those.
const NUMERIC_KEYS = new Set(['headingScale', 'lineHeight']);

function isUsableValue(key, value) {
  if (value === undefined || value === null || value === '') return false;
  if (NUMERIC_KEYS.has(key)) return typeof value === 'number' && Number.isFinite(value) && value > 0;
  return true;
}

// Always appended after whatever font-family value ends up in --font-en/
// --font-ko, so even a bare/unsafe custom font name (no fallback names
// of its own) still degrades to this site's proven default stack instead
// of an unstyled system font or invisible text — see composeFontBody().
const FONT_SAFETY_FALLBACK = "'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif";

function composeFontBody(fontEn, fontKo) {
  const parts = [fontEn, fontKo, FONT_SAFETY_FALLBACK].filter((part) => typeof part === 'string' && part.trim());
  return parts.join(', ');
}

/**
 * Applies a settings object to :root as CSS custom properties, via
 * DESIGN_TOKEN_MAP — plus one composed value: --font-body (the token
 * global.css's `body { font-family }` actually reads) is rebuilt from
 * --font-en/--font-ko so a font change is actually visible, without
 * needing global.css itself to change. Each value is checked by
 * isUsableValue() first; anything that fails is skipped, leaving
 * variables.css's own default for that one token in place — this can
 * never throw, so it's always safe to call from a page-load effect.
 */
export function applyDesignSettings(settings, root = document.documentElement) {
  if (!settings || !root) return;

  for (const [key, cssVar] of Object.entries(DESIGN_TOKEN_MAP)) {
    const value = settings[key];
    if (!isUsableValue(key, value)) continue;
    root.style.setProperty(cssVar, String(value));
  }

  if (isUsableValue('fontEn', settings.fontEn) || isUsableValue('fontKo', settings.fontKo)) {
    root.style.setProperty('--font-body', composeFontBody(settings.fontEn, settings.fontKo));
  }
}
