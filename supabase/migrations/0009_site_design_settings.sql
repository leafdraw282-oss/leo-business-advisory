-- ============================================================================
-- Phase 4-B — Site design settings (foundation for an admin-editable
-- Design System, built on top of Phase 4-A's CSS token layer)
--
-- Run this AFTER 0002_rls_policies.sql (is_admin()) and 0008_table_grants.sql.
--
-- Single-row "active design configuration" table, same id=1 singleton
-- shape as hero_content/about_content/etc. in 0001_init_schema.sql — one
-- config for the whole site, not per-section. Every column stores a
-- ready-to-use CSS value (a hex color, an rgba() string, a length like
-- "1280px", a plain unitless number) so a future runtime layer can apply
-- a row directly via `document.documentElement.style.setProperty('--x', v)`
-- with no per-field translation logic.
--
-- Defaults below are the exact literal values Phase 4-A's
-- src/styles/variables.css already resolves to today — connecting this
-- table to the site must not change how it looks. See
-- src/lib/content/designSettings.js for the read-side fallback that
-- guarantees the same thing if this table is ever missing/unreachable.
--
-- No admin UI reads or writes this table yet (Phase 4-B is data-layer
-- only) — src/lib/content/designSettings.js's fetch path is the only
-- consumer, and it isn't wired into page rendering yet either.
-- ============================================================================

create table if not exists site_design_settings (
  id integer primary key default 1 check (id = 1),

  -- Typography
  font_ko text not null,
  font_en text not null,
  body_font_size text not null,
  heading_scale numeric not null check (heading_scale > 0),
  line_height numeric not null check (line_height > 0),
  letter_spacing text not null,

  -- Colors
  color_primary text not null,
  color_secondary text not null,
  color_accent text not null,
  color_background text not null,
  color_surface text not null,
  color_text text not null,
  color_text_muted text not null,
  color_border text not null,

  -- Layout
  content_max_width text not null,
  section_spacing text not null,
  card_radius text not null,
  image_radius text not null,

  -- Motion
  motion_level text not null default 'standard'
    check (motion_level in ('minimal', 'standard', 'expressive')),
  image_motion_style text not null default 'none'
    check (image_motion_style in ('none', 'fade', 'zoom', 'parallax')),

  -- Metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table site_design_settings enable row level security;

-- Same public-read/admin-write shape as every other content table
-- (0002_rls_policies.sql): anyone — signed out, signed in, or an admin —
-- can read the active design config (the public site needs it); only a
-- row in admin_users can insert/update it. No delete policy at all —
-- this singleton is never deleted, only ever updated in place.
create policy "site_design_settings_public_read" on site_design_settings
  for select using (true);
create policy "site_design_settings_admin_write" on site_design_settings
  for all using (is_admin()) with check (is_admin());

-- Explicit table GRANTs, not just the RLS policies above — 0008 already
-- grants these broadly across the whole public schema (including via
-- `alter default privileges` for tables created after it), but this
-- table is granted again here explicitly and unconditionally, so its
-- access never depends on exactly which role/session created it. This
-- is the same class of bug 0008 fixed ("permission denied for table X"
-- from a missing GRANT, independent of correct RLS policies) — belt and
-- suspenders, not a reaction to an observed failure this time.
grant select on site_design_settings to anon, authenticated;
grant insert, update, delete on site_design_settings to authenticated;

-- Seed the single active row with Phase 4-A's current literal values.
-- `on conflict do nothing` — if this ever re-runs after a real admin has
-- already customized the row, their values are never clobbered.
insert into site_design_settings (
  id,
  font_ko, font_en, body_font_size, heading_scale, line_height, letter_spacing,
  color_primary, color_secondary, color_accent, color_background, color_surface,
  color_text, color_text_muted, color_border,
  content_max_width, section_spacing, card_radius, image_radius,
  motion_level, image_motion_style
) values (
  1,
  '''Pretendard'', ''Noto Sans KR'', -apple-system, BlinkMacSystemFont, sans-serif',
  '''Inter'', ''Pretendard'', ''Noto Sans KR'', -apple-system, BlinkMacSystemFont, sans-serif',
  '1rem', 1.333, 1.75, 'normal',
  '#0b1625', '#f4f1ea', '#a4865c', '#f4f1ea', '#ffffff',
  '#222222', '#8b8984', 'rgba(34, 34, 34, 0.12)',
  '1280px', '6rem', '2px', '2px',
  'standard', 'none'
)
on conflict (id) do nothing;
