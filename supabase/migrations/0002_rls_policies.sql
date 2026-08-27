-- ============================================================================
-- Row Level Security — public read, admin-only write.
--
-- Run this AFTER 0001_init_schema.sql. admin_users lists which Supabase
-- Auth users are allowed to write content — nobody can just sign up and
-- get write access. After creating your admin login (Supabase Dashboard
-- → Authentication → Users → Add user, or have them sign up once), find
-- their id in that same screen and run:
--
--   insert into admin_users (user_id) values ('<uuid from auth.users>');
-- ============================================================================

create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table admin_users enable row level security;
-- Deliberately no public policies on admin_users — nobody reads/writes it
-- from the client at all; membership is managed directly in the SQL
-- editor by whoever has Supabase project access.

-- `set search_path` pins this security-definer function to the `public`
-- schema (plus pg_temp, needed for temp objects) so a caller can't shadow
-- `admin_users` by creating a same-named table/function earlier in their
-- own search_path — the standard hardening for SECURITY DEFINER
-- functions (Phase 2-G security pass).
create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$;

-- Every content table: anyone (including a signed-out visitor) can read;
-- only a row in admin_users can write. Run each pair after its table
-- exists (i.e. after 0001_init_schema.sql).

alter table site_settings enable row level security;
create policy "site_settings_public_read" on site_settings for select using (true);
create policy "site_settings_admin_write" on site_settings for all using (is_admin()) with check (is_admin());

alter table person enable row level security;
create policy "person_public_read" on person for select using (true);
create policy "person_admin_write" on person for all using (is_admin()) with check (is_admin());

alter table contact_info enable row level security;
create policy "contact_info_public_read" on contact_info for select using (true);
create policy "contact_info_admin_write" on contact_info for all using (is_admin()) with check (is_admin());

alter table hero_content enable row level security;
create policy "hero_content_public_read" on hero_content for select using (true);
create policy "hero_content_admin_write" on hero_content for all using (is_admin()) with check (is_admin());

alter table about_content enable row level security;
create policy "about_content_public_read" on about_content for select using (true);
create policy "about_content_admin_write" on about_content for all using (is_admin()) with check (is_admin());

alter table impact_section enable row level security;
create policy "impact_section_public_read" on impact_section for select using (true);
create policy "impact_section_admin_write" on impact_section for all using (is_admin()) with check (is_admin());

alter table case_studies_section enable row level security;
create policy "case_studies_section_public_read" on case_studies_section for select using (true);
create policy "case_studies_section_admin_write" on case_studies_section for all using (is_admin()) with check (is_admin());

alter table advisory_section enable row level security;
create policy "advisory_section_public_read" on advisory_section for select using (true);
create policy "advisory_section_admin_write" on advisory_section for all using (is_admin()) with check (is_admin());

alter table career_section enable row level security;
create policy "career_section_public_read" on career_section for select using (true);
create policy "career_section_admin_write" on career_section for all using (is_admin()) with check (is_admin());

alter table gallery_section enable row level security;
create policy "gallery_section_public_read" on gallery_section for select using (true);
create policy "gallery_section_admin_write" on gallery_section for all using (is_admin()) with check (is_admin());

alter table contact_cta enable row level security;
create policy "contact_cta_public_read" on contact_cta for select using (true);
create policy "contact_cta_admin_write" on contact_cta for all using (is_admin()) with check (is_admin());

alter table contact_form_content enable row level security;
create policy "contact_form_content_public_read" on contact_form_content for select using (true);
create policy "contact_form_content_admin_write" on contact_form_content for all using (is_admin()) with check (is_admin());

alter table footer_content enable row level security;
create policy "footer_content_public_read" on footer_content for select using (true);
create policy "footer_content_admin_write" on footer_content for all using (is_admin()) with check (is_admin());

alter table media enable row level security;
create policy "media_public_read" on media for select using (true);
create policy "media_admin_write" on media for all using (is_admin()) with check (is_admin());

alter table impact_metrics enable row level security;
create policy "impact_metrics_public_read" on impact_metrics for select using (true);
create policy "impact_metrics_admin_write" on impact_metrics for all using (is_admin()) with check (is_admin());

alter table case_studies enable row level security;
create policy "case_studies_public_read" on case_studies for select using (true);
create policy "case_studies_admin_write" on case_studies for all using (is_admin()) with check (is_admin());

alter table case_study_metrics enable row level security;
create policy "case_study_metrics_public_read" on case_study_metrics for select using (true);
create policy "case_study_metrics_admin_write" on case_study_metrics for all using (is_admin()) with check (is_admin());

alter table case_study_highlights enable row level security;
create policy "case_study_highlights_public_read" on case_study_highlights for select using (true);
create policy "case_study_highlights_admin_write" on case_study_highlights for all using (is_admin()) with check (is_admin());

alter table advisory_items enable row level security;
create policy "advisory_items_public_read" on advisory_items for select using (true);
create policy "advisory_items_admin_write" on advisory_items for all using (is_admin()) with check (is_admin());

alter table career_entries enable row level security;
create policy "career_entries_public_read" on career_entries for select using (true);
create policy "career_entries_admin_write" on career_entries for all using (is_admin()) with check (is_admin());

alter table education_entries enable row level security;
create policy "education_entries_public_read" on education_entries for select using (true);
create policy "education_entries_admin_write" on education_entries for all using (is_admin()) with check (is_admin());

alter table inquiry_types enable row level security;
create policy "inquiry_types_public_read" on inquiry_types for select using (true);
create policy "inquiry_types_admin_write" on inquiry_types for all using (is_admin()) with check (is_admin());

alter table gallery_items enable row level security;
create policy "gallery_items_public_read" on gallery_items for select using (true);
create policy "gallery_items_admin_write" on gallery_items for all using (is_admin()) with check (is_admin());
