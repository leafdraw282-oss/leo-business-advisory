-- ============================================================================
-- Production fix — missing PostgreSQL table GRANTs for anon/authenticated
--
-- 0002_rls_policies.sql enables RLS and defines correct policies on every
-- content table, but never grants the underlying SQL table privileges
-- themselves. RLS only *further restricts* rows on an operation a role
-- already has base privilege for — it never grants that base privilege.
-- Supabase normally auto-provisions this via a platform-level default
-- privilege bootstrap, but on this project's real Production database that
-- bootstrap did not cover these tables, so every read (even against a
-- `for select using (true)` public-read policy) failed with a literal
-- PostgreSQL ACL error: "permission denied for table hero_content" (and
-- identically for every other CMS table) — a privilege-layer rejection,
-- distinct from and prior to any RLS policy evaluation.
--
-- This migration records the exact fix already applied and verified
-- directly against the real Production project's SQL Editor, so a future
-- fresh project (via PRODUCTION_INITIAL_SETUP.sql or `supabase db push`)
-- doesn't hit the same gap. RLS policies remain the actual per-row access
-- control layer, unchanged — this only opens the base privilege RLS needs
-- to be evaluated at all.
-- ============================================================================

grant usage on schema public to anon, authenticated;

grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;

alter default privileges in schema public
  grant select on tables to anon, authenticated;

alter default privileges in schema public
  grant insert, update, delete on tables to authenticated;
