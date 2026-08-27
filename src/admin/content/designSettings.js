import { fetchSingleton, upsertSingleton } from './supabaseTable.js';
import { designSettingsFallback } from '../../lib/content/designSettings.js';

/**
 * Phase 4-B — admin-side read/write helpers for `site_design_settings`.
 * Mirrors the fetchSingleton/upsertSingleton pattern every other admin
 * content page (e.g. src/admin/pages/content/HeroSection.jsx) already
 * uses. No admin page imports this yet — Phase 4-B is data-access-layer
 * only, per its own scope; a future phase's admin UI can call these two
 * functions directly instead of reaching for fetchSingleton/upsertSingleton
 * itself, so it never has to re-derive the snake_case<->camelCase mapping.
 */

function rowToSettings(row) {
  if (!row) return designSettingsFallback();
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

/** Loads the active design settings row for editing. Never throws for a
 *  missing row — an unconfigured/never-seeded project just gets the same
 *  Phase 4-A defaults the public site's fallback also uses. */
export async function loadDesignSettings() {
  const row = await fetchSingleton('site_design_settings');
  return rowToSettings(row);
}

/** Saves a full settings object (camelCase, see rowToSettings' shape). */
export async function saveDesignSettings(settings) {
  const row = await upsertSingleton('site_design_settings', {
    font_ko: settings.fontKo,
    font_en: settings.fontEn,
    body_font_size: settings.bodyFontSize,
    heading_scale: settings.headingScale,
    line_height: settings.lineHeight,
    letter_spacing: settings.letterSpacing,
    color_primary: settings.colorPrimary,
    color_secondary: settings.colorSecondary,
    color_accent: settings.colorAccent,
    color_background: settings.colorBackground,
    color_surface: settings.colorSurface,
    color_text: settings.colorText,
    color_text_muted: settings.colorTextMuted,
    color_border: settings.colorBorder,
    content_max_width: settings.contentMaxWidth,
    section_spacing: settings.sectionSpacing,
    card_radius: settings.cardRadius,
    image_radius: settings.imageRadius,
    motion_level: settings.motionLevel,
    image_motion_style: settings.imageMotionStyle,
  });
  return rowToSettings(row);
}
