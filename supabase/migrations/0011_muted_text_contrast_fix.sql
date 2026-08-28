-- ============================================================================
-- Phase 5-A — fix the site_design_settings default row's muted-text color
-- so it meets WCAG AA (4.5:1) for normal body text against the ivory
-- background, per Phase 4-I's known limitation (~3.10:1 with #8b8984).
--
-- Run this AFTER 0009_site_design_settings.sql (which created the table
-- and seeded row id=1). This migration doesn't edit that file (existing
-- migrations are never modified, only added to) — it just updates the
-- one column that changed, same pattern 0008/0009/0010 already used.
--
-- New value #696764 is the same warm neutral hue family as the original
-- #8b8984 (just darkened), not a different color direction — contrast is
-- 4.98:1 against #f4f1ea (background) and 5.64:1 against #ffffff
-- (surface), both comfortably above the 4.5:1 AA threshold for normal
-- text. src/styles/variables.css's --color-gray literal default was
-- updated to the same value in the same Phase 5-A change, so a fresh
-- checkout with no Supabase configured (or Supabase unreachable) already
-- renders this corrected color via the CSS fallback alone; this
-- migration brings an already-provisioned Production row in sync with
-- that same fallback value.
--
-- Guarded by `where color_text_muted = '#8b8984'`: if an admin has
-- already customized this color through Admin > Settings, their choice
-- is never overwritten — this only touches a row still holding the
-- original Phase 4-A seed value.
-- ============================================================================

update site_design_settings
set color_text_muted = '#696764'
where id = 1
  and color_text_muted = '#8b8984';
