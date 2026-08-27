# Supabase schema

SQL migrations for the future admin CMS backend — designed in Phase 2-A,
not yet applied to any real project. See
`docs/ADMIN_CMS_ARCHITECTURE.md` for the full design rationale.

## Applying these migrations (when you're ready to set up the backend)

1. Create a Supabase project at [supabase.com](https://supabase.com) (free
   tier is enough to start).
2. Open your project's **SQL Editor** in the Supabase Dashboard.
3. Run the files in this folder **in order** — paste each one's contents
   in and click "Run":
   1. `0001_init_schema.sql` — creates every content table.
   2. `0002_rls_policies.sql` — locks writes to admin accounts only
      (public read stays open, matching the current public site).
   3. `0003_storage_setup.sql` — creates the `site-images` bucket.
   4. `0004_gallery_active_flag.sql` — adds an admin-only active/inactive
      flag to gallery photos.
   5. `0005_inquiries.sql` — creates the `inquiries` table (Contact Form
      submissions) with the opposite RLS shape from every other table:
      anyone can insert, only an admin can read/update/delete.
4. Add yourself as an admin: **Authentication → Users → Add user** (or
   have your admin account sign up once the login page exists in a later
   phase), copy that user's UUID, then in the SQL Editor run:
   ```sql
   insert into admin_users (user_id) values ('<paste the UUID here>');
   ```
5. Copy your project's URL and anon key from **Settings → API** into a
   local `.env.local` file (see `.env.example` at the repo root) — never
   commit this file.

None of this is required for the public site to keep working — until
these steps are done, the site reads entirely from `src/data/profile.js`,
same as today (see `src/lib/content/fetchWithFallback.js`).
