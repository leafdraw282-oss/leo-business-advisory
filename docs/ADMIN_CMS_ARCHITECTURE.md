# Admin CMS Architecture (Phase 2-A design)

This document is the architecture design for turning the current
static, `profile.js`-driven site into one an admin can edit through a
`/admin` page — without ever risking the public site breaking. **Phase
2-A is design and foundation only.** No admin login screen, content-edit
UI, or image-upload UI exists yet, no Supabase project has been created,
and no real credentials exist anywhere in this repo. See
`docs/PROJECT_STATUS.md` for what Phase 2-A actually built versus what's
designed here for a later phase.

## Why Supabase

GitHub Pages only serves static files — there's no server to run admin
logic on, and nothing in `public/` can be edited by a visitor's browser
and persist. Supabase provides three things this needs, all from one
managed project with a generous free tier: a Postgres database (content),
Storage (images), and Auth (admin login) — with Row Level Security
enforcing "anyone can read, only the admin can write" directly at the
database level, so the frontend never has to be trusted to enforce that
itself.

## Architecture overview

```
                     ┌─────────────────────────┐
                     │   Founder Profile doc     │  (source of truth for facts)
                     └────────────┬─────────────┘
                                  │ already migrated into
                                  ▼
                     ┌─────────────────────────┐
                     │  src/data/profile.js      │  (fallback content, always kept)
                     └────────────┬─────────────┘
                                  │ used as fallback value by
                                  ▼
┌──────────────┐    ┌─────────────────────────────┐    ┌─────────────────────┐
│ Public Website│───▶│ Content Data Layer           │───▶│ Supabase Database    │
│ (this site,   │    │ src/lib/content/              │    │ (Postgres + RLS,     │
│  React/Vite)  │◀───│ fetchWithFallback())          │◀───│  public read)        │
└──────────────┘    └─────────────────────────────┘    └─────────────────────┘
                                                                    ▲
                                                                    │ writes (admin only)
┌──────────────┐    ┌─────────────────────────────┐               │
│  Admin Page   │───▶│ Supabase Auth                │───────────────┘
│  (/admin,     │    │ (email/password login,       │
│  future phase)│◀───│  admin_users allowlist)      │
└──────────────┘    └──────────────┬──────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────┐
                     │   Supabase Storage        │  bucket: site-images
                     │   (uploaded photos)       │  public read / admin write
                     └─────────────────────────┘
```

Read path (every visitor, all the time): a section component asks the
content layer for its data → the content layer tries Supabase (if
configured) → on any failure it returns the matching `profile.js` value
instead. **The public site never talks to Supabase Auth and never
depends on it being reachable.**

Write path (admin only, future phase): admin signs in via Supabase Auth
→ RLS checks their user id against `admin_users` → allowed writes go to
the Database and/or Storage → the next time any visitor loads the site,
the content layer sees the updated row.

## Source of truth stays layered, not replaced

- The **Founder Profile document** (KR/EN `.docx`) remains the ultimate
  source of truth for every fact — name, titles, company names, career
  years, revenue/growth/EBITDA/P&L/market-count figures. That doesn't
  change with this CMS work.
- **`src/data/profile.js` is preserved exactly as the site's original
  content and permanent fallback** — never deleted, never made
  second-class. It's what the site already renders today, and it's what
  the site keeps rendering if Supabase is unreachable, misconfigured, or
  simply not set up yet (e.g. this exact repo checkout, right now).
- **Supabase becomes the live, admin-editable copy of that same
  content** — seeded from `profile.js` when it's set up (a Phase 2-B
  migration step, not built yet), not a competing source of facts. An
  admin editing "Career" in the future admin UI is editing this layer,
  not the original document or `profile.js`.

This means no fact-accuracy work from Phase 1 is at risk: `profile.js`
keeps being exactly as correct as it is today, and the CMS is additive.

## Database design

Full DDL lives in `supabase/migrations/` (see that folder's `README.md`
for how to apply it — nothing in this repo has been run against a real
project). Summary:

**Singleton tables** (exactly one row each — a page section's own copy):
`site_settings`, `person`, `contact_info`, `hero_content`, `about_content`,
`impact_section`, `case_studies_section`, `advisory_section`,
`career_section`, `gallery_section`, `contact_cta`,
`contact_form_content`, `footer_content`.

**List tables** (many rows, ordered by `sort_order` for future
drag-to-reorder in the admin UI): `impact_metrics`, `case_studies` (+
child tables `case_study_metrics`, `case_study_highlights`),
`advisory_items`, `career_entries`, `education_entries`, `inquiry_types`,
`gallery_items`.

**`media`**: one row per uploaded image (its Storage path + alt text);
every content table that has an image references `media.id` by foreign
key instead of duplicating a path string.

Every table maps to an existing `profile.js` export by name and field —
see the comments in `supabase/migrations/0001_init_schema.sql` for the
exact correspondence (e.g. `hero_content.headline_ko` ↔
`profile.js`'s `hero.headlineKo`).

## KR / EN data management

Every bilingual field is stored as a `_ko`/`_en` column pair on the same
row (e.g. `title_ko text, title_en text`) — **the same convention
`profile.js` already uses everywhere** (`titleKo`/`titleEn`, etc.), not a
locale-keyed JSON blob or separate rows per language. Reasons:

- **Matches what already exists.** Every field in `profile.js` today is
  already exactly this shape, so a future migration script maps 1:1
  with no restructuring and no new risk of the KR and EN text drifting
  apart from what's already been fact-checked across Phases 1-A–1-G.
- **One row = one complete bilingual record.** No joins, no "which
  locale is this row" filtering, and — most importantly for CLAUDE.md's
  "never a partial switch" rule — a future admin edit form can show both
  languages on screen at once, so an editor can't save Korean text
  without also reviewing the English (or vice versa).
- **Simple queries.** `select * from hero_content` returns everything
  needed for both languages in one round trip.

## Image storage design

- One Supabase Storage bucket: **`site-images`**, public-read /
  admin-write (see `supabase/migrations/0003_storage_setup.sql`).
- Public read means visitor page loads never need signed URLs — fine for
  a public marketing site with no private images.
- The `media` table is the single place an image's Storage path is
  recorded; content rows reference `media.id`, never a raw path, so
  renaming/reorganizing files in Storage only ever requires updating one
  `media` row.
- This is a **direct replacement for `public/images/` + `profile.js`'s
  `images` map**, once it's live — not an addition to it. Until then,
  `public/images/` and the `images` map keep working exactly as they do
  today (see Fallback strategy below).

## Fallback strategy

Implemented now (Phase 2-A), not just designed: `src/lib/supabase.js` +
`src/lib/content/fetchWithFallback.js`.

- `isSupabaseConfigured` is `false` whenever `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` aren't set at build time (true for this repo
  right now) — in that case `fetchWithFallback` returns the given
  `profile.js` value **without attempting any network call at all.**
- If Supabase *is* configured but a query fails — network error, RLS
  denial, the row doesn't exist yet — the failure is caught and the same
  `profile.js` value is returned. A `console.warn` records why, for
  debugging; nothing throws, nothing renders blank.
- Net effect: **the public site cannot break because of a backend
  problem**, at any point from today through full CMS rollout. This is
  also why `profile.js` must never be deleted, even after every table
  above is fully populated and in daily editorial use.
- Not wired into any page component yet — see "What Phase 2-A
  deliberately did not build," below.

## Environment variables

`.env.example` (committed, no real values) documents:

- `VITE_SUPABASE_URL` — the project's API URL.
- `VITE_SUPABASE_ANON_KEY` — the public **anon** key only. Vite bakes
  every `VITE_*` variable into the published JS bundle at build time, so
  nothing that must stay secret can use that prefix. The anon key is
  designed to be public — Row Level Security (not secrecy) is what
  actually protects writes.
- The Supabase **`service_role`** key (which bypasses RLS entirely) must
  **never** appear in this repo, in any `VITE_*` variable, or in the
  GitHub Actions workflow — it has no legitimate use in a static
  frontend. If a future phase ever needs it (e.g. a Supabase Edge
  Function), it belongs only in Supabase's own server-side config.
- Real values go in a local `.env.local` (gitignored — see the updated
  `.gitignore`), or, once deployment needs them, in **GitHub repo
  secrets** consumed by `.github/workflows/deploy.yml`'s build step —
  not built in this phase, since there's no real project to point at
  yet.

## What Phase 2-A deliberately did not build

Per this phase's explicit scope, none of the following exist yet:

- Any `/admin` route, login screen, or content-edit UI.
- Any image-upload UI.
- A real Supabase project, or any real URL/key anywhere in this repo.
- `fetchWithFallback` being called from any section component —
  `Hero.jsx`, `Impact.jsx`, etc. still import directly and synchronously
  from `profile.js`, exactly as before. Wiring this in requires each
  component to handle an async/loading state without introducing layout
  shift or a flash of empty content, which is real design work for
  Phase 2-B, not a Phase 2-A "prepare the foundation" change.
- A script to migrate `profile.js`'s current content into the new
  Supabase tables (Phase 2-B, once a real project exists to migrate
  into).
- Any change to `.github/workflows/deploy.yml` (it would need Supabase
  values injected as build-time env vars from GitHub repo secrets, once
  those secrets exist).

## Next: Phase 2-B (not started)

1. Create the real Supabase project (user action — see
   `docs/PROJECT_STATUS.md`'s "User action required").
2. A one-time script to seed the tables above from `profile.js`'s
   current values (not hand-retyped — copied programmatically, so there
   is zero risk of introducing a fact error during migration).
3. Wire `fetchWithFallback` into each section component behind a
   loading-safe pattern (content visible by default, per CLAUDE.md's
   "Animation Enhancement" philosophy — no spinners blocking first paint).
4. `/admin` route + Supabase Auth login screen.
5. Content-edit UI, one form per section, each showing KR and EN fields
   together (never allow saving one language without the other in view).
6. Image-upload UI against the `site-images` bucket.
7. `.github/workflows/deploy.yml` updated to inject the real Supabase URL
   /anon key as build-time env vars from GitHub repo secrets.
