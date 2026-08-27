-- ============================================================================
-- Phase 3-C — Business inquiries (Contact Form submissions)
--
-- A visitor-submitted table, unlike every other table in this schema
-- (which are all admin-authored site content). RLS here is the opposite
-- shape from 0002_rls_policies.sql's public-read/admin-write pattern:
-- anyone can INSERT (that's the whole point of a public contact form),
-- nobody but an admin can ever read, update, or delete a row.
--
-- `phone` is nullable and not currently collected by the public form
-- (src/components/ContactForm.jsx keeps only Name/Company/Email/Type of
-- Inquiry/Message, per this phase's explicit "don't add fields that
-- increase visitor input burden" instruction) — the column exists so a
-- future optional Phone field needs only a form change, not a migration.
-- ============================================================================

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 200),
  company text check (company is null or length(company) <= 200),
  email text not null check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' and length(email) <= 320),
  phone text check (phone is null or length(phone) <= 40),
  inquiry_type text not null check (length(inquiry_type) between 1 and 100),
  message text not null check (length(message) between 1 and 5000),
  status text not null default 'new' check (status in ('new', 'in_progress', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists inquiries_created_at_idx on inquiries (created_at desc);

alter table inquiries enable row level security;

-- Public: insert only, and only ever as a fresh 'new' inquiry — a direct
-- REST call can't plant a row that's already 'in_progress'/'completed'.
-- Column defaults (status, created_at, id) are applied before this check
-- runs, so a normal insert that omits `status` still satisfies it.
create policy "inquiries_public_insert" on inquiries
  for insert
  with check (status = 'new');

-- Admin: full read + status/management access. No public select/update/
-- delete policy exists at all, so those actions are unconditionally denied
-- to anyone who isn't in admin_users (RLS with no matching policy = deny).
create policy "inquiries_admin_select" on inquiries
  for select
  using (is_admin());

create policy "inquiries_admin_update" on inquiries
  for update
  using (is_admin())
  with check (is_admin());

create policy "inquiries_admin_delete" on inquiries
  for delete
  using (is_admin());
