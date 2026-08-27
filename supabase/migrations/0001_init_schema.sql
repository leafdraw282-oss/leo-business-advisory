-- ============================================================================
-- LEO Business Advisory — Admin CMS schema (Phase 2-A design)
--
-- Mirrors src/data/profile.js field-for-field, so a future migration can
-- map values across 1:1 with minimal risk of introducing fact drift.
-- Every bilingual field uses the same _ko/_en column-pair convention
-- already used throughout profile.js — see
-- docs/ADMIN_CMS_ARCHITECTURE.md for the full rationale.
--
-- This file is NOT applied to any real Supabase project yet — no project
-- exists. Run it yourself in the Supabase SQL Editor (or `supabase db
-- push`) once you've created one. See supabase/README.md.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Media library — every uploaded image lives here once; content tables
-- reference it by id instead of duplicating storage paths. storage_path
-- is the object path inside the "site-images" bucket (see
-- 0003_storage_setup.sql).
-- ---------------------------------------------------------------------------
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt_ko text,
  alt_en text,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Singleton content tables — exactly one row each (id fixed to 1 via the
-- check constraint, so there's never an "which row is live?" ambiguity).
-- ---------------------------------------------------------------------------

create table if not exists site_settings (
  id integer primary key default 1 check (id = 1),
  name text not null,
  title_tag text not null,
  description_en text not null,
  updated_at timestamptz not null default now()
);

create table if not exists person (
  id integer primary key default 1 check (id = 1),
  name_ko text not null,
  name_ko_formatted text not null,
  name_en text not null,
  name_en_display text not null,
  title_ko text not null,
  title_en text not null,
  positioning_ko text not null,
  positioning_en text not null,
  portrait_label_ko text not null,
  portrait_label_en text not null,
  updated_at timestamptz not null default now()
);

-- mailto:/tel: hrefs are derived from email/phone_display in application
-- code, not stored here, so they can never drift out of sync with the
-- displayed value.
create table if not exists contact_info (
  id integer primary key default 1 check (id = 1),
  location_ko text not null,
  location_en text not null,
  email text not null,
  phone_display text not null,
  info_label_ko text not null,
  info_label_en text not null,
  updated_at timestamptz not null default now()
);

create table if not exists hero_content (
  id integer primary key default 1 check (id = 1),
  eyebrow_ko text not null,
  eyebrow_en text not null,
  headline_ko jsonb not null, -- array of lines, e.g. ["Building Brands.", "Scaling Businesses.", ...]
  headline_en jsonb not null,
  subhead_ko text not null,
  subhead_en text not null,
  cta_primary_ko text not null,
  cta_primary_en text not null,
  cta_primary_target text not null, -- target section id, e.g. "impact"
  cta_secondary_ko text not null,
  cta_secondary_en text not null,
  cta_secondary_target text not null,
  hero_image_id uuid references media(id),
  updated_at timestamptz not null default now()
);

create table if not exists about_content (
  id integer primary key default 1 check (id = 1),
  eyebrow_ko text not null,
  eyebrow_en text not null,
  headline_ko text not null,
  headline_en text not null,
  bio_ko text not null,
  bio_en text not null,
  portrait_image_id uuid references media(id),
  updated_at timestamptz not null default now()
);

-- Section heading copy (eyebrow + title) for the sections whose body
-- content is a list, rendered from the list tables below. Kept separate
-- from those lists so editing a heading never risks touching list rows.
create table if not exists impact_section (
  id integer primary key default 1 check (id = 1),
  eyebrow_ko text not null, eyebrow_en text not null,
  title_ko text not null, title_en text not null
);

create table if not exists case_studies_section (
  id integer primary key default 1 check (id = 1),
  eyebrow_ko text not null, eyebrow_en text not null,
  title_ko text not null, title_en text not null
);

create table if not exists advisory_section (
  id integer primary key default 1 check (id = 1),
  eyebrow_ko text not null, eyebrow_en text not null,
  title_ko text not null, title_en text not null
);

create table if not exists career_section (
  id integer primary key default 1 check (id = 1),
  eyebrow_ko text not null, eyebrow_en text not null,
  title_ko text not null, title_en text not null
);

create table if not exists gallery_section (
  id integer primary key default 1 check (id = 1),
  eyebrow_ko text not null, eyebrow_en text not null,
  title_ko text not null, title_en text not null,
  empty_ko text not null, empty_en text not null -- shown when gallery_items has 0 rows
);

create table if not exists contact_cta (
  id integer primary key default 1 check (id = 1),
  headline_ko text not null, headline_en text not null,
  button_ko text not null, button_en text not null
);

-- `labels` shape: { "name": {"ko":"이름","en":"Name"}, "company": {...},
-- "email": {...}, "inquiryType": {...}, "message": {...} } — mirrors
-- profile.js contactForm.labels exactly.
create table if not exists contact_form_content (
  id integer primary key default 1 check (id = 1),
  labels jsonb not null,
  inquiry_placeholder_ko text not null,
  inquiry_placeholder_en text not null,
  submit_ko text not null,
  submit_en text not null,
  note_ko text not null,
  note_en text not null
);

create table if not exists footer_content (
  id integer primary key default 1 check (id = 1),
  copyright_ko text not null, copyright_en text not null,
  back_to_top_ko text not null, back_to_top_en text not null
);

-- ---------------------------------------------------------------------------
-- List content — ordered via sort_order (lets the admin UI reorder rows
-- without changing any other data).
-- ---------------------------------------------------------------------------

create table if not exists impact_metrics (
  id uuid primary key default gen_random_uuid(),
  value_ko text not null, label_ko text not null,
  value_en text not null, label_en text not null,
  sort_order integer not null default 0
);

create table if not exists case_studies (
  id uuid primary key default gen_random_uuid(),
  case_key text not null unique, -- stable slug, matches profile.js caseStudies[].id (e.g. "samsonite-korea")
  tag text not null, -- e.g. "CASE 01"
  title_ko text not null, title_en text not null,
  summary_ko text not null, summary_en text not null,
  image_id uuid references media(id),
  sort_order integer not null default 0
);

create table if not exists case_study_metrics (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references case_studies(id) on delete cascade,
  value_ko text not null, label_ko text not null,
  value_en text not null, label_en text not null,
  sort_order integer not null default 0
);

create table if not exists case_study_highlights (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references case_studies(id) on delete cascade,
  label_ko text not null, label_en text not null,
  sort_order integer not null default 0
);

create table if not exists advisory_items (
  id uuid primary key default gen_random_uuid(),
  item_key text not null unique, -- matches profile.js advisory.items[].id
  label_ko text not null, label_en text not null,
  sort_order integer not null default 0
);

create table if not exists career_entries (
  id uuid primary key default gen_random_uuid(),
  period text not null, -- e.g. "2013–2015"
  role_ko text not null, role_en text not null,
  company_ko text not null, company_en text not null,
  sort_order integer not null default 0
);

create table if not exists education_entries (
  id uuid primary key default gen_random_uuid(),
  text_ko text not null, text_en text not null,
  sort_order integer not null default 0
);

create table if not exists inquiry_types (
  id uuid primary key default gen_random_uuid(),
  label_ko text not null, label_en text not null,
  sort_order integer not null default 0
);

create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  item_key text not null unique, -- matches profile.js gallery[].id
  caption_ko text not null, caption_en text not null,
  image_id uuid references media(id),
  aspect_ratio text not null default '4 / 3', -- CSS aspect-ratio value
  is_wide boolean not null default false,
  sort_order integer not null default 0
);
