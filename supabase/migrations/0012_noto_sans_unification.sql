-- ============================================================================
-- Typography unification — the whole site now renders a single font
-- family: Noto Sans, with Noto Sans KR as its Korean-glyph companion
-- (loaded via Google Fonts — see index.html). This replaces the previous
-- Pretendard-led Korean stack and Inter-led English stack in the
-- site_design_settings default row's font_ko/font_en columns.
--
-- Run this AFTER 0009_site_design_settings.sql (which created the table
-- and seeded row id=1). This migration doesn't edit that file (existing
-- migrations are never modified, only added to) — it just updates the two
-- columns that changed, same pattern 0008/0009/0010/0011 already used.
--
-- src/styles/variables.css's --font-kr/--font-heading/--font-body literal
-- defaults, and src/lib/content/designSettings.js's designSettingsFallback()
-- / FONT_SAFETY_FALLBACK, were updated to the same new stack in the same
-- change, so a fresh checkout with no Supabase configured (or Supabase
-- unreachable) already renders Noto Sans via the CSS fallback alone; this
-- migration brings an already-provisioned Production row in sync with
-- that same fallback value.
--
-- Guarded by `where font_ko = '...' and font_en = '...'` (the exact
-- literals 0009 seeded): if an admin has already customized either font
-- through Admin > Settings, their choice is never overwritten — this only
-- touches a row still holding the original Phase 4-A seed values.
-- ============================================================================

update site_design_settings
set font_ko = '''Noto Sans KR'', ''Noto Sans'', sans-serif',
    font_en = '''Noto Sans'', ''Noto Sans KR'', sans-serif'
where id = 1
  and font_ko = '''Pretendard'', ''Noto Sans KR'', -apple-system, BlinkMacSystemFont, sans-serif'
  and font_en = '''Inter'', ''Pretendard'', ''Noto Sans KR'', -apple-system, BlinkMacSystemFont, sans-serif';
