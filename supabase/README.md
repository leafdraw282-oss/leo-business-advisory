# Supabase schema

SQL migrations for the admin CMS backend — first designed in Phase 2-A
(see `docs/ADMIN_CMS_ARCHITECTURE.md` for that original design rationale),
now built out through `0010` and **applied to the real Production
project** (this repo's own sessions never connect to it directly — every
migration here has been run manually against Supabase's SQL Editor by the
project owner). See `docs/FOUNDATION.md` for the current-state schema/RLS/
GRANT/Storage reference; this file only covers how to apply the SQL.

## Applying these migrations (fresh project, or catching up an existing one)

1. Create a Supabase project at [supabase.com](https://supabase.com) (free
   tier is enough to start) — skip if you already have one.
2. Open your project's **SQL Editor** in the Supabase Dashboard.
3. Run the files in this folder **in order** — paste each one's contents
   in and click "Run" (on an existing project, only run the migrations you
   haven't applied yet; `PRODUCTION_INITIAL_SETUP.sql` in this same folder
   concatenates all of them for a one-shot fresh-project setup instead):
   1. `0001_init_schema.sql` — creates every content table.
   2. `0002_rls_policies.sql` — locks writes to admin accounts only
      (public read stays open, matching the current public site).
   3. `0003_storage_setup.sql` — creates the `site-images` bucket.
   4. `0004_gallery_active_flag.sql` — adds an admin-only active/inactive
      flag to gallery photos.
   5. `0005_inquiries.sql` — creates the `inquiries` table (Contact Form
      submissions) with the opposite RLS shape from every other table:
      anyone can insert, only an admin can read/update/delete.
   6. `0006_content_revisions.sql` — adds the rolling revision-snapshot
      table behind the admin Revisions/undo screen.
   7. `0007_gallery_soft_delete.sql` — adds Gallery's Trash
      (`deleted_at`), independent of `0004`'s active/inactive flag — see
      `docs/FOUNDATION.md` for how the two differ.
   8. `0008_table_grants.sql` — fixes a real GRANT gap every earlier
      migration was missing (RLS alone isn't a substitute for the base
      Postgres table privilege).
   9. `0009_site_design_settings.sql` — adds the Design Settings table
      (Colors/Typography/Layout/Motion) behind the admin Settings screen.
   10. `0010_storage_size_limit.sql` — lowers the Storage bucket's
       server-side upload size limit to match the admin UI's client-side
       check.
4. Add yourself as an admin: **Authentication → Users → Add user** (or
   have your admin account sign up via the real `/admin` login screen,
   which already exists), copy that user's UUID, then in the SQL Editor
   run:
   ```sql
   insert into admin_users (user_id) values ('<paste the UUID here>');
   ```
5. Copy your project's URL and anon key from **Settings → API** into a
   local `.env.local` file (see `.env.example` at the repo root) — never
   commit this file.

None of this is required for the public site to keep working — until
these steps are done, the site reads entirely from `src/data/profile.js`,
same as today (see `src/lib/content/fetchWithFallback.js`).
