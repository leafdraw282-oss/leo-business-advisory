-- ============================================================================
-- CMS wiring for the Advisory Sales IA sections added after Phase 2's
-- original schema — Challenge, Advisory Products (replacing the dead
-- advisory_items list), How We Work, Target Clients, PE Advisory, and
-- Insights. All five public sections currently read directly from
-- src/data/profile.js with no admin editor at all (see each section
-- component's own "not CMS-backed" comment, now removed alongside this
-- migration) — this closes that gap, following the exact singleton +
-- list-table pattern every other Content section already uses (see
-- 0001_init_schema.sql's hero_content/advisory_section/advisory_items
-- for the templates this mirrors).
--
-- advisory_items (0001_init_schema.sql) is NOT touched or dropped here —
-- it's now fully orphaned (Advisory.jsx has never read it since the
-- Advisory Sales repositioning), but dropping a live table is a separate,
-- more deliberate decision than this migration's scope; it's simply no
-- longer written to once src/admin/pages/content/AdvisorySection.jsx is
-- updated to edit advisory_products (below) instead.
--
-- Every new table starts empty. Exactly like every other Content
-- section, fetchWithFallback() (src/lib/content/fetchWithFallback.js)
-- returns the existing src/data/profile.js copy whenever a table/row
-- doesn't exist yet — so applying this migration changes NOTHING visible
-- on the public site until an admin actually edits and saves through the
-- new editor screens. No seed INSERTs needed, matching every other
-- content table's own convention.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Challenge ("이런 고민이 있으신가요", id: "challenge")
-- ---------------------------------------------------------------------------
create table if not exists challenge_section (
  id integer primary key default 1 check (id = 1),
  eyebrow_ko text not null, eyebrow_en text not null,
  title_ko text not null, title_en text not null,
  statement_ko text not null, statement_en text not null,
  statement_sub_ko text not null, statement_sub_en text not null
);

create table if not exists challenge_items (
  id uuid primary key default gen_random_uuid(),
  text_ko text not null, text_en text not null,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Advisory Products ("실행까지 이어지는 4가지 자문 서비스", id: "advisory")
-- Replaces advisory_items as what Advisory.jsx actually renders.
-- focus_ko/en are jsonb arrays of short strings (e.g. ["성장 전략",
-- "사업 포트폴리오", ...]) — same jsonb-array-of-strings convention as
-- hero_content.headline_ko/en.
-- ---------------------------------------------------------------------------
create table if not exists advisory_products (
  id uuid primary key default gen_random_uuid(),
  item_key text not null unique, -- matches profile.js advisoryProducts[].id
  name_ko text not null, name_en text not null,
  target_ko text not null, target_en text not null,
  focus_ko jsonb not null, focus_en jsonb not null,
  deliverable_ko text not null, deliverable_en text not null,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- How We Work ("컨설팅펌과는 다르게 일합니다", id: "how-we-work")
-- traditional_steps_ko/en and leo_steps_ko/en are jsonb arrays of short
-- strings (the two step sequences shown side by side) — the two arrays
-- can differ in length (3 traditional steps vs. 4 Leo steps today), so
-- this is a singleton with jsonb columns rather than a shared list table.
-- ---------------------------------------------------------------------------
create table if not exists how_we_work_section (
  id integer primary key default 1 check (id = 1),
  eyebrow_ko text not null, eyebrow_en text not null,
  title_ko text not null, title_en text not null,
  traditional_label_ko text not null, traditional_label_en text not null,
  traditional_steps_ko jsonb not null, traditional_steps_en jsonb not null,
  leo_label_ko text not null, leo_label_en text not null,
  leo_steps_ko jsonb not null, leo_steps_en jsonb not null,
  quote_ko text not null, quote_en text not null,
  tagline_ko text not null, tagline_en text not null
);

-- ---------------------------------------------------------------------------
-- Target Clients ("이런 분들과 함께합니다", id: "clients") + the PE
-- Portfolio Advisory callout that section also renders.
-- ---------------------------------------------------------------------------
create table if not exists target_clients_section (
  id integer primary key default 1 check (id = 1),
  eyebrow_ko text not null, eyebrow_en text not null,
  title_ko text not null, title_en text not null
);

create table if not exists target_client_items (
  id uuid primary key default gen_random_uuid(),
  text_ko text not null, text_en text not null,
  sort_order integer not null default 0
);

create table if not exists pe_advisory (
  id integer primary key default 1 check (id = 1),
  label_ko text not null, label_en text not null,
  intro_ko text not null, intro_en text not null
);

create table if not exists pe_advisory_items (
  id uuid primary key default gen_random_uuid(),
  text_ko text not null, text_en text not null,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Insights ("인사이트" preview, id: "insights") — title-only placeholder
-- cards (no real posts/links exist yet, per profile.js's own comment);
-- no natural key needed since nothing links to an individual card.
-- ---------------------------------------------------------------------------
create table if not exists insights_section (
  id integer primary key default 1 check (id = 1),
  eyebrow_ko text not null, eyebrow_en text not null,
  title_ko text not null, title_en text not null,
  coming_soon_ko text not null, coming_soon_en text not null
);

create table if not exists insights_items (
  id uuid primary key default gen_random_uuid(),
  title_ko text not null, title_en text not null,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- RLS — the same public-read / admin-write pair every content table uses
-- (see 0002_rls_policies.sql). is_admin() already exists (0002).
-- ---------------------------------------------------------------------------
alter table challenge_section enable row level security;
create policy "challenge_section_public_read" on challenge_section for select using (true);
create policy "challenge_section_admin_write" on challenge_section for all using (is_admin()) with check (is_admin());

alter table challenge_items enable row level security;
create policy "challenge_items_public_read" on challenge_items for select using (true);
create policy "challenge_items_admin_write" on challenge_items for all using (is_admin()) with check (is_admin());

alter table advisory_products enable row level security;
create policy "advisory_products_public_read" on advisory_products for select using (true);
create policy "advisory_products_admin_write" on advisory_products for all using (is_admin()) with check (is_admin());

alter table how_we_work_section enable row level security;
create policy "how_we_work_section_public_read" on how_we_work_section for select using (true);
create policy "how_we_work_section_admin_write" on how_we_work_section for all using (is_admin()) with check (is_admin());

alter table target_clients_section enable row level security;
create policy "target_clients_section_public_read" on target_clients_section for select using (true);
create policy "target_clients_section_admin_write" on target_clients_section for all using (is_admin()) with check (is_admin());

alter table target_client_items enable row level security;
create policy "target_client_items_public_read" on target_client_items for select using (true);
create policy "target_client_items_admin_write" on target_client_items for all using (is_admin()) with check (is_admin());

alter table pe_advisory enable row level security;
create policy "pe_advisory_public_read" on pe_advisory for select using (true);
create policy "pe_advisory_admin_write" on pe_advisory for all using (is_admin()) with check (is_admin());

alter table pe_advisory_items enable row level security;
create policy "pe_advisory_items_public_read" on pe_advisory_items for select using (true);
create policy "pe_advisory_items_admin_write" on pe_advisory_items for all using (is_admin()) with check (is_admin());

alter table insights_section enable row level security;
create policy "insights_section_public_read" on insights_section for select using (true);
create policy "insights_section_admin_write" on insights_section for all using (is_admin()) with check (is_admin());

alter table insights_items enable row level security;
create policy "insights_items_public_read" on insights_items for select using (true);
create policy "insights_items_admin_write" on insights_items for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- GRANTs — explicit per-table, not relying solely on 0008's `alter default
-- privileges` (see that migration's own header comment on why: it only
-- covers objects created by the same role that ran it, and 0009 already
-- established the practice of granting explicitly and unconditionally on
-- every table added after 0008 for exactly that reason).
-- ---------------------------------------------------------------------------
grant select on challenge_section, challenge_items, advisory_products,
  how_we_work_section, target_clients_section, target_client_items,
  pe_advisory, pe_advisory_items, insights_section, insights_items
  to anon, authenticated;

grant insert, update, delete on challenge_section, challenge_items, advisory_products,
  how_we_work_section, target_clients_section, target_client_items,
  pe_advisory, pe_advisory_items, insights_section, insights_items
  to authenticated;
