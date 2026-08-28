# LEO Business Advisory — Foundation Reference (Phase 4-J: Foundation Freeze)

**Status: current-state reference, frozen at the end of Phase 4-I (Production
Final QA — no blockers found).** This document describes the system **as it
actually exists in this repository today**, verified directly against the
code and `supabase/migrations/` — not a plan, not a design doc. Where
something is genuinely not built yet, it's labeled "not implemented," never
described as if it existed.

This is the document to read before touching this codebase — whether you're
a future Claude session or a human developer. It supersedes
`docs/ADMIN_CMS_ARCHITECTURE.md` as the current-state reference for the
areas that document only *designed* (that file is Phase 2-A's original
design doc, written before the admin CMS was built — kept as historical
record, not updated). `docs/PROJECT_STATUS.md` remains the phase-by-phase
build history if you need to know *how* something came to be; this document
only describes *what is true right now*.

---

## 1. 프로젝트 구조 (Project Structure)

Vite + React 19 (JavaScript, no TypeScript), two independent HTML entry
points built from one `vite.config.js`:

- **Public site** — `index.html` → `src/main.jsx` → `src/App.jsx`. Deployed
  to the site root.
- **Admin CMS** — `admin/index.html` → `src/admin/main.jsx` →
  `src/admin/AdminApp.jsx`. Deployed under `/admin/`.

The two share **no runtime render tree** (admin never imports `App.jsx` or
vice versa) but do share some library code (React, `@supabase/supabase-js`,
`src/components/ImagePlaceholder.jsx`, `src/lib/supabase.js`) — Rollup's
default chunking already dedupes this into one shared chunk between the two
bundles, so nothing is downloaded twice (see `vite.config.js`'s own comment
for the measured numbers behind that decision).

```
src/
  main.jsx, App.jsx          public site entry + root component
  admin/
    main.jsx, AdminApp.jsx   admin entry + auth gate (see §3, §6)
    pages/                   Dashboard, Content, Images, Inquiries, Revisions, Settings, Login
    pages/content/           one editor per Content sub-section (Hero/Impact/About/CaseStudies/
                              Advisory/Career/Education/Contact/Footer)
    pages/images/            one editor per Images sub-section (Hero/AboutImage/CaseStudyImages/GalleryImages)
    components/              admin-only UI (BilingualField, ColorField, PresetField,
                              ImageGuidelines, ImageSlotEditor, SectionStatus, ...)
    content/                 admin-only data-access helpers (supabaseTable.js, supabaseStorage.js,
                              useGalleryImages.js, useAdminForm.js, dirtyTracker.js, lastSaved.js, ...)
  sections/                  one file per public page section, each mounted in App.jsx
                              (Hero, Impact, Profile[=About], CaseStudies, Advisory, Career, Gallery, Contact)
  components/                shared public UI (Header, Footer, LanguageToggle, SectionTitle,
                              ImpactMetric, CaseStudy, ContactForm, ImagePlaceholder, SectionErrorBoundary)
  lib/
    supabase.js               the Supabase client + isSupabaseConfigured flag (§4)
    inquiries.js               Contact Form submission
    analytics.js               GA4, only loads if VITE_GA_MEASUREMENT_ID is set
    content/                   PUBLIC-ONLY data-access layer — one fetchX()/xFallback() pair per
                                section, all built on fetchWithFallback.js + publicTable.js (§11, §16)
  context/                    LanguageContext.jsx — site-wide KR/EN state (§15)
  data/
    profile.js                 ALL page copy + facts (KR & EN) — permanent fallback content (§16)
    navigation.js               header nav items (id/labelKo/labelEn) — NOT every section is a nav
                                 item (Hero/Case Studies/Gallery have no nav entry; see the file itself)
  hooks/
    useSectionContent.js        fallback-first async content hook, used by every public section
    useApplyDesignSettings.js   applies site_design_settings to :root once on mount (§12)
    useReveal.js                shared scroll-reveal hook (§14)
  styles/
    variables.css                design tokens (§12)
    global.css                   resets, .btn/.container, skip-link, Motion System CSS (§14)
    responsive.css               breakpoint-level tweaks
supabase/
  migrations/                  0001–0010, append-only (§20, "DO NOT BREAK")
  PRODUCTION_INITIAL_SETUP.sql  all migrations concatenated, for a fresh project only
public/
  images/                       local fallback image files (mostly empty — see §16)
  404.html, robots.txt, sitemap.xml, og-image.png, favicon.svg
docs/                          this file, ADMIN_CMS_ARCHITECTURE.md (historical),
                                BACKUP_RECOVERY.md, CUSTOM_DOMAIN_SETUP.md, PROJECT_STATUS.md (full history)
CLAUDE.md                      permanent working rules — read this too, it is not superseded by this file
.github/workflows/deploy.yml   GitHub Pages CI/CD (§17, §22)
```

---

## 2. Public Website 구조

`App.jsx` mounts, in order: `Header`, then every section inside `<main
id="main-content">` — `Hero`, `Impact`, `Profile` (About), `CaseStudies`,
`Advisory`, `Career`, `Gallery`, `Contact` — then `Footer`. Each section
(except `Header`) is wrapped in its own `SectionErrorBoundary`
(`src/components/SectionErrorBoundary.jsx`): if malformed CMS data crashes
one section, the rest of the page keeps rendering instead of going blank.

Every section follows the same pattern:

```js
const content = useSectionContent(fetchX, xFallback());
```

`useSectionContent` (`src/hooks/useSectionContent.js`) renders `xFallback()`
immediately on first paint (no loading state, no flash of empty content),
then swaps in whatever `fetchX()` resolves to. `fetchX()` never rejects —
see §16.

`App.jsx` also calls `useApplyDesignSettings()` once (§12) and renders a
skip-to-content link as the very first element (accessibility — jumps
keyboard focus past the header to `#main-content`).

Section ids (`Hero`→`#top`, `Impact`→`#impact`, `Profile`→`#about`,
`CaseStudies`→`#case-studies`, `Advisory`→`#advisory`, `Career`→`#career`,
`Gallery`→`#gallery`, `Contact`→`#contact`) are hardcoded per-section but
must match `navigation.js` wherever a nav link points at them — see §1's
note that not every section has a nav entry.

---

## 3. Admin CMS 구조

Served at `/admin/`, entirely separate React tree from the public site.

`AdminApp.jsx` is the auth gate:
- `isSupabaseConfigured === false` → "Admin not configured" notice (no
  backend to talk to at all).
- Configured but no session → `Login.jsx` (Supabase Auth email/password).
- Configured and session present → `Dashboard.jsx`, wrapped in
  `AdminErrorBoundary`.

`Dashboard.jsx` is a tab switcher (not a router) between `Content`,
`Images`, `Inquiries`, `Revisions`, `Settings` (plus its own home view).
Both `Content` and `Images` are themselves sub-nav switchers:

- **Content** sub-sections: Hero, Impact, About, Case Studies, Advisory,
  Career, Education, Contact, Footer — each is its own file under
  `src/admin/pages/content/`, each independently `load()`s and `save()`s
  via `useAdminForm.js` + `supabaseTable.js` helpers.
- **Images** sub-sections: Hero, About / Profile, Case Studies, Gallery —
  under `src/admin/pages/images/`. Hero/About/each Case Study use the
  single-image `ImageSlotEditor.jsx` pattern; Gallery has its own
  variable-length list UI (`GalleryImages.jsx` + `useGalleryImages.js`) —
  see §9, §10.

Switching sub-sections (or tabs, or logging out) while a section has
unsaved changes prompts for confirmation first
(`src/admin/content/dirtyTracker.js`'s `isAnyDirty()` +
`UNSAVED_CHANGES_MESSAGE`).

**The admin bundle never imports anything from `src/lib/content/`** (the
public-only fetch layer) and the public bundle never imports anything from
`src/admin/`. Admin code calls `supabase.from(...)` directly through its own
helpers (`supabaseTable.js`, `supabaseStorage.js`) — it has no fallback
layer, because if you're looking at `/admin`, Supabase not being configured
is the actual problem, not something to paper over. See §20's "DO NOT
BREAK" item on this separation.

---

## 4. Supabase 연결 구조

One file owns the client: `src/lib/supabase.js`.

```js
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
```

Both the public site and admin import `supabase`/`isSupabaseConfigured`
from this one file — there is no second client anywhere, and no
`service_role` key is ever used (see §19). `import.meta.env.VITE_*` values
are read and baked in at **build time** by Vite (§18) — changing them
requires a rebuild, not just a page reload.

---

## 5. 주요 DB table 역할

27 tables total, all created across `supabase/migrations/0001`–`0009`
(0010 alters an existing Storage bucket setting, not a table). All 27 have
Row Level Security enabled — verified directly, not assumed (§7).

**Singleton content tables** (`id = 1`, one row = the whole section's
current copy): `site_settings`, `person`, `contact_info`, `hero_content`,
`about_content`, `impact_section`, `case_studies_section`,
`advisory_section`, `career_section`, `gallery_section`, `contact_cta`,
`contact_form_content`, `footer_content`, `site_design_settings`.

**List tables** (many rows, `sort_order`-ordered where applicable):
`impact_metrics`, `case_studies` (+ child tables `case_study_metrics`,
`case_study_highlights`), `advisory_items`, `career_entries`,
`education_entries`, `inquiry_types`, `gallery_items`.

**`media`** — one row per uploaded image (Storage path + KO/EN alt text).
Every content row with an image references `media.id` by foreign key, never
a raw path — see §9.

**`admin_users`** — the admin allowlist (§6). **Never publicly readable or
writable** — RLS is enabled with zero policies, which means PostgREST
denies every operation on it to `anon`/`authenticated`; only the
`SECURITY DEFINER` function `is_admin()` can read it.

**`inquiries`** — Contact Form submissions. Public can `INSERT` only
(`with check (status = 'new')`); only an admin can `SELECT`/`UPDATE`/
`DELETE`. No public read policy exists — a submission is never visible to
anyone but an admin, not even the person who submitted it.

**`content_revisions`** — a rolling snapshot log. `saveListRow()` and
`upsertByNaturalKey()` (`src/admin/content/supabaseTable.js`) record the
*previous* row here before every update — this is what powers the admin
Revisions screen's undo (see `docs/BACKUP_RECOVERY.md` for the full
recovery-flow writeup; this document only states that it exists and where).

---

## 6. Auth / admin_users 구조

Admin login is plain Supabase Auth (email + password) — see `Login.jsx`.
There is no separate "admin role" flag on the Postgres role level; instead:

```sql
create table admin_users (
  user_id uuid primary key references auth.users(id)
);

create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$;
```

Anyone can create a Supabase Auth account (email/password) if the project
allows sign-ups, but **having an account grants nothing** — every write
policy on every content table checks `is_admin()`, i.e. whether that
specific `auth.uid()` has a row in `admin_users`. Making someone an admin is
a manual step: `insert into admin_users (user_id) values ('<uuid>');` — not
exposed anywhere in the UI, deliberately (see `docs/ADMIN_CMS_ARCHITECTURE.md`'s
original setup note, still accurate on this point).

`is_admin()` is `SECURITY DEFINER` with `search_path` pinned to
`public, pg_temp` — this is what lets it read `admin_users` (which
`anon`/`authenticated` themselves cannot, per §5) while remaining safe
against search-path-injection attacks.

---

## 7. RLS / GRANT 개요

Two independent layers, both required, neither alone sufficient
(`0008_table_grants.sql`'s own comment documents this distinction, learned
the hard way against real Production — see `docs/PROJECT_STATUS.md`):

1. **GRANT** (Postgres table-level ACL, checked first) —
   `0008_table_grants.sql` grants `select` on every table in `public` to
   `anon, authenticated`, and `insert/update/delete` to `authenticated`
   only, plus matching `alter default privileges` so any table created
   *after* 0008 is automatically covered. `0009_site_design_settings.sql`
   also grants explicitly on its own new table, belt-and-suspenders.
2. **RLS** (row-level, checked second, after GRANT already allows the
   operation in principle) — every content table's policy pair is public
   `select using (true)`, admin-only `for all using (is_admin()) with
   check (is_admin())`. `admin_users` itself is the one exception: RLS
   enabled, zero policies, meaning `anon`/`authenticated` (who technically
   hold the base GRANT via the blanket statement above) are still denied
   by RLS on every operation — GRANT opens the door, RLS keeps it locked.
   `inquiries` is the other deliberate exception: public `INSERT` only
   (Contact Form), gated by `with check (status = 'new')`; every other
   operation on it is admin-only.

**A table created without both layers reproduces a real bug this project
already hit once**: GRANT-only-missing looks like `permission denied for
table X` (an ACL rejection, before RLS is ever evaluated); RLS-only-missing
looks like silently empty results, not an error. See §20's "DO NOT BREAK"
item on adding new tables.

---

## 8. Image / Storage 구조

One Supabase Storage bucket: **`site-images`**, public-read / admin-write
(`0003_storage_setup.sql`'s `storage.objects` policies, gated by
`is_admin()` for insert/update/delete). Suggested (not enforced) folder
layout: `site-images/hero/`, `about/`, `case-studies/`, `gallery/`.

Upload path (`src/admin/content/supabaseStorage.js`):

- `ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']`
- `MAX_IMAGE_BYTES = 2 * 1024 * 1024` (2MB, tightened from an original 5MB
  in Phase 4-H — see that phase's commit for the reasoning) — enforced
  client-side by `validateImageFile()` **and** server-side by the bucket's
  own `file_size_limit` column (`0010_storage_size_limit.sql` — see §24's
  USER ACTION note if this migration hasn't been applied to the real
  Production project yet).
- `RECOMMENDED_MAX_KB = 500` — a soft target shown in the admin UI
  (`ImageGuidelines.jsx`), not enforced.
- `uploadImageFile(folder, file)` writes to Storage under a
  `crypto.randomUUID()`-based filename, then the caller inserts/updates a
  `media` row pointing at that path — Storage and the `media` table are
  always written together, never one without the other, from the save
  paths that exist today.

**Replacing an image never deletes the old Storage file or `media` row** —
by design (`docs/BACKUP_RECOVERY.md`'s Storage Strategy), a replaced image
stays recoverable. Only the Gallery Trash's "영구 삭제" (permanent delete)
action ever actually removes a Storage file + `media` row — see §10.

---

## 9. Hero / About / Case Studies / Gallery 이미지 데이터 흐름

All four go through the **same shared component**,
`src/components/ImagePlaceholder.jsx` — this is the *only* way an image
should ever be rendered on the public site. It shows a labeled placeholder
(never a broken-image icon) whenever `src` is falsy or the image fails to
load, keyed by `src` itself so a stale `error` event from a superseded URL
can never be misattributed to a newer one (see the component's own doc
comment for the exact race this protects against).

Read path, per section (`src/lib/content/hero.js`, `about.js`,
`caseStudies.js`, `gallery.js`):

1. Fetch the content row (e.g. `hero_content`).
2. If it has an image reference (`*_image_id`), call
   `resolveImageUrl(mediaId)` (`src/lib/content/publicTable.js`) — looks up
   `media.storage_path`, returns `supabase.storage.from('site-images').getPublicUrl(...)`.
3. If no image reference, or the resolve fails, fall back to the local
   `profile.js` path via `resolvePublicImage()` (§16).

**Hero is the one deliberate exception in loading strategy**, not in data
flow: its first-paint value (`heroInitial()`) has `imageUrl: null` (not the
local fallback path), specifically so the browser never fires a guaranteed
first request against a local file that almost certainly doesn't exist once
Supabase is the real source — that request only ever happens from
`fetchHero()`'s own catch-all fallback, once a CMS image has genuinely been
ruled out. Hero's `<img>` also gets `loading="eager"` `fetchPriority="high"`
`decoding="async"` (it's the LCP-critical, above-the-fold image) and a
`fadeInOnLoad` opacity transition on real successful load — no other
`ImagePlaceholder` caller uses any of these three props. About/Case
Studies/Gallery images are `loading="lazy"` (the component's own default)
and pass `revealMotion` instead (§14) — never combined with `fadeInOnLoad`
on the same instance.

---

## 10. Gallery active/inactive와 Trash 차이

Two genuinely independent mechanisms on `gallery_items`, both real columns,
never conflated by any code path that exists today:

|  | `is_active` | `deleted_at` |
|---|---|---|
| Meaning | Public-visibility toggle | Soft delete |
| Set by | Admin's "활성 (공개)" checkbox, saved via the normal Save button (batched with other field edits) | Admin's "휴지통으로 이동" button — writes **immediately**, no Save step |
| Checked by public RLS read policy? | **No** — `0007_gallery_soft_delete.sql`'s public policy only checks `deleted_at is null` | **Yes** |
| Checked by Public fetch? | **Yes** — client-side filter in `src/lib/content/gallery.js`: `!row.deleted_at && row.is_active !== false` (this client-side check is the *only* thing hiding an inactive-but-not-deleted row; RLS doesn't) | Yes (both RLS and the same client-side filter) |
| Admin's own list shows it? | Yes, always (checkbox just unchecked) | No — moves to the separate Trash section |
| Storage file / `media` row / caption / order / aspect ratio preserved? | Always (nothing is touched) | Always, until "영구 삭제" |
| Reversible? | Yes, re-check the box | Yes, "복원" — until "영구 삭제" (`permanentlyDelete()`), which is the one genuinely irreversible action: deletes the `gallery_items` row, the `media` row, and the Storage file for real |

**Toggling one must never touch the other** — `removeItem()`/
`restoreFromTrash()` in `src/admin/content/useGalleryImages.js` only ever
write `deleted_at`; the Save-button batch save only ever writes `is_active`
(among other fields) — see §20's "DO NOT BREAK" item.

---

## 11. Content CMS 데이터 흐름

**Public read** — `src/lib/content/*.js`, one `fetchX()`/`xFallback()` pair
per section, all built on `fetchWithFallback()` (§16) +
`fetchSingletonRow()`/`fetchListRows()` (`publicTable.js`). Independent
queries within one section's fetch are run with `Promise.all` where the
data has no dependency between them (e.g. `advisory.js`'s section-row and
items-row queries) — a genuine, measured latency fix from Phase 4-H, not
incidental. `contactInfo.js` additionally caches its own resolved promise
at module scope, since both `Contact.jsx` and `Footer.jsx` independently
need the same data — the second caller reuses the first's in-flight
request instead of firing a duplicate query.

**Admin write** — `src/admin/content/supabaseTable.js`'s shared helpers:
`fetchSingleton`/`upsertSingleton` (singleton tables), `fetchList`/
`saveListRow`/`upsertByNaturalKey`/`deleteRow` (list tables). Every
`saveListRow`/`upsertByNaturalKey` call **first reads the row's current
value and records it into `content_revisions`** before overwriting it —
this is unconditional, not opt-in, and is what powers undo (§5, §6 of
`docs/BACKUP_RECOVERY.md`).

Each admin Content sub-page owns its own `load()`/`save()` pair
(`useAdminForm.js` gives every one of them the same dirty-tracking /
save-state UI for free) — there is no single generic "save everything"
call; each section table is independently read/written.

---

## 12. Design Settings 구조

Singleton table `site_design_settings` (id=1) — every column is a
**ready-to-use CSS value** (a hex color, a length like `"1280px"`, a plain
number), not a value needing unit composition on the client. Columns:
`font_ko`, `font_en`, `body_font_size`, `heading_scale` (numeric),
`line_height` (numeric), `letter_spacing`, `color_primary/secondary/accent/
background/surface/text/text_muted/border`, `content_max_width`,
`section_spacing`, `card_radius`, `image_radius`, `motion_level`,
`image_motion_style`.

`DESIGN_TOKEN_MAP` (`src/lib/content/designSettings.js`) maps each camelCase
field to the CSS custom property it drives (e.g. `colorPrimary` →
`--color-primary`). `applyDesignSettings()`:

1. Validates every value (`isUsableValue()` — type/range checks; an
   individual bad value is skipped, never applied) before writing anything.
2. Writes each valid value via
   `document.documentElement.style.setProperty(cssVar, value)`.
3. Recomposes `--font-body` from `--font-en`/`--font-ko` plus a hardcoded
   safety-fallback font stack, so an admin-entered font name without its
   own fallback still degrades safely.
4. Sets `data-motion-level` / `data-image-motion` attributes on `<html>`
   (validated against the exact DB enum — §14), separately from the CSS
   variable writes above.

`useApplyDesignSettings()` (`src/hooks/useApplyDesignSettings.js`) calls
this once on mount in `App.jsx`. **First paint always uses `variables.css`'s
own literal defaults** (this effect only runs after mount); any fetch
failure or invalid value falls back the same way — the public site can
never blank or break from this table being missing, empty, or malformed.

The admin editor (`src/admin/pages/Settings.jsx`) is one page with four
groups — Colors, Typography, Layout, Motion — each field a thin wrapper
(`ColorField`, `PresetField`, plain `<select>`) around the same
`useAdminForm` load/save pattern as Content. `DesignSettingsPreview.jsx` is
a fully self-contained preview panel (inline styles only, never touches
`document.documentElement`) — it shows the admin what a change would look
like *before* saving, without affecting the live site.

---

## 13. Layout Presets

`content_max_width`, `section_spacing`, `card_radius`, `image_radius`, and
`heading_scale` are still stored as plain CSS-value/numeric columns (§12)
— **no schema change** for presets. `src/admin/content/layoutPresets.js`
defines a curated `{value, label}` list per field
(`CONTENT_WIDTH_PRESETS`, `SECTION_SPACING_PRESETS`, `RADIUS_PRESETS`
[shared by card/image radius], `HEADING_SCALE_PRESETS`), and the admin UI
(`PresetField.jsx`) renders these as a `<select>` instead of free text.

Each preset's "Standard" option is deliberately set to the exact literal
value Phase 4-A's defaults (and every already-deployed row) already use —
so an existing/Production value is always recognized as a real preset, via
`matchPreset()`, never silently overwritten. If a stored value matches
*none* of the presets, `PresetField` offers a "현재 값 유지 (value)"
fallback option instead of guessing.

`--heading-scale-factor` (`variables.css`) is the formula that actually
applies `heading_scale`:
`clamp(0.9, 1 + (var(--heading-scale) - 1.333) * 0.4, 1.15)` — 1.333 (the
historical/default value) maps to factor `1` (zero visual change for
existing data), and the whole thing is clamped to ±15% so no admin-entered
value can break heading hierarchy or layout. It multiplies
`--font-size-h1/h2/h3` together, so relative heading sizes are always
preserved.

`--section-spacing-mobile` is computed as `calc(var(--section-spacing) * 2
/ 3)` — one admin-facing desktop value, no separate mobile DB column.

---

## 14. Motion System

`motion_level` (enum: `minimal` / `standard` / `expressive`, DB default
`standard`) and `image_motion_style` (enum: `none` / `fade` / `zoom` /
`parallax`, DB default `none`) are the two Motion columns on
`site_design_settings` — unchanged schema, admin `<select>` controls
existed since Phase 4-C but had no runtime effect until Phase 4-F wired
them up.

**Section Reveal** — `src/hooks/useReveal.js`, an IntersectionObserver hook
used by every major section except Hero (Hero is deliberately excluded —
its content must never be gated behind a scroll reveal) and, opt-in, by
`ImagePlaceholder` via its `revealMotion` prop (About/Case
Studies/Gallery only). Progressive-enhancement by construction:
`supportsReveal` is computed synchronously on first render (not inside an
effect) and is `false` — content fully visible, no hidden state ever
applied — whenever `IntersectionObserver` doesn't exist or
`prefers-reduced-motion` is set. A revealed node never re-hides on scroll
back up; a 1.5s fallback timer guarantees reveal even if the observer
callback never fires.

The actual **magnitude** is pure CSS, reading `data-motion-level` /
`data-image-motion` on `<html>` (set by `applyDesignSettings()`, §12) —
`.reveal`/`.reveal--visible` classes in `global.css`, default
`--reveal-distance: 16px` / `--reveal-duration: 500ms` (= "standard" DB
value), scaled up for `expressive`, zeroed + force-shown for `minimal`.
`image_motion_style="zoom"`/`"parallax"` both render as the same small,
one-time `scale(1.04)→scale(1)` ("Soft Zoom") — never a real continuously-
scrolling parallax translate; `"none"` forces the image to skip any motion
regardless of `motion_level`.

`prefers-reduced-motion: reduce` is honored at two independent layers:
`useReveal.js`'s own short-circuit (JS never hides anything) and a
`global.css` media query that force-shows `.reveal` regardless of class
state — belt and suspenders, same pattern as `variables.css`'s existing
`--motion-duration-*` reduced-motion overrides.

---

## 15. KR/EN 구조

`src/context/LanguageContext.jsx` — single state (`'ko' | 'en'`, default
`'ko'`), persisted to `localStorage`, exposed via `useLanguage()`
(`t(koValue, enValue)`, `language`, `setLanguage`, `toggleLanguage`). Every
section/component reads text through `t()` — a toggle updates the whole
page (including Header, Footer, and — since Phase 4-G — `document.title`
and `<meta name="description">`) in one render, never a partial switch.

On every language change, the context's effect also sets
`document.documentElement.lang` and swaps `document.title`/the description
meta tag between `site.titleTag`/`site.descriptionEn` and
`site.titleTagKo`/`site.descriptionKo` (`src/data/profile.js`). **`og:*`/
`twitter:*` meta tags are deliberately left static** — social-preview
crawlers fetch the page without running this client-side toggle, so there
is nothing for a dynamic update to actually reach.

`localStorage` access is wrapped in try/catch — the site works fully (just
without persistence) even if storage is unavailable (private browsing,
disabled storage).

Admin (`/admin`) has **no language system** — it's a Korean-labeled UI with
some English field labels, static `lang="en"` in `admin/index.html`, and
does not mount `LanguageProvider` at all.

---

## 16. Fallback 정책

The single guarantee every content fetch makes, enforced by one function:
`fetchWithFallback()` (`src/lib/content/fetchWithFallback.js`).

```js
export async function fetchWithFallback(supabaseQuery, fallbackValue) {
  if (!isSupabaseConfigured) return fallbackValue;
  try {
    const data = await supabaseQuery();
    if (data === null || data === undefined) return fallbackValue;
    return data;
  } catch (error) {
    console.warn('[content] Supabase fetch failed, using profile.js fallback:', error?.message ?? error);
    return fallbackValue;
  }
}
```

**This never rejects.** Not configured, network failure, RLS denial, an
empty table, a malformed row that throws while being mapped — every case
resolves to the given `profile.js`-derived fallback value, logged via
`console.warn` for debugging, never thrown, never rendered blank. This is
why `src/data/profile.js` is described everywhere in this codebase as
*permanent*, not a migration staging area — it is the safety net for as
long as this architecture exists, not just until Supabase is "fully set
up."

Image paths specifically resolve through `resolvePublicImage()`
(`src/lib/content/imagePath.js`), which prefixes a `profile.js` `images`
map entry with `import.meta.env.BASE_URL` (so it resolves correctly under
GitHub Pages' `/leo-business-advisory/` subpath — see §17) — but
`public/images/` itself is **mostly empty** in this repo (`.gitkeep` only)
because real photos live in Supabase Storage; a local fallback path
existing at all is not assumed anywhere, and `ImagePlaceholder` degrades
gracefully (§9) whether or not one does.

---

## 17. GitHub Pages Deployment 구조

`vite.config.js`: `base: '/leo-business-advisory/'`, two Rollup inputs
(`index.html`, `admin/index.html`) — see §1 and §22.

`.github/workflows/deploy.yml`: triggers on push to
`claude/leo-advisory-phase-1-foundation-6qikp7` (this repo's deployed
branch) or manual `workflow_dispatch`. Job: checkout → Node 20 →
`npm ci` → `npm run build` (with `VITE_SUPABASE_URL`/
`VITE_SUPABASE_ANON_KEY` injected from **GitHub repo secrets**, not
committed anywhere) → `actions/configure-pages` →
`actions/upload-pages-artifact` (`./dist`) → `actions/deploy-pages`.
`concurrency: { group: pages, cancel-in-progress: false }` — an in-flight
deploy is never cancelled mid-way by a newer push, so Pages never serves a
half-deployed build.

`public/404.html` is a genuinely static file — this site has no
client-side router, so GitHub Pages serving it for any unmatched path is
correct behavior, not the "copy `index.html` to `404.html`" SPA-rewrite
trick some other projects use.

`public/robots.txt` disallows `/admin/`; `admin/index.html` additionally
carries its own `<meta name="robots" content="noindex, nofollow">` — two
independent layers (§19's neighbor concern: robots.txt is not itself
"security," it just asks well-behaved crawlers not to index; the real
protection for `/admin` is Supabase Auth + RLS, same as always).

---

## 18. 환경변수 목록

All defined by `.env.example` (committed, no real values) and read at
**build time** via `import.meta.env.VITE_*`:

| Variable | Purpose | If unset |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project API URL | `isSupabaseConfigured = false` — public site falls back to `profile.js` entirely (§16); admin shows "Admin not configured" |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon** (public) key — see §19 for the key that must NOT go here | same as above |
| `VITE_GA_MEASUREMENT_ID` | GA4 Measurement ID (`src/lib/analytics.js`) | No analytics script loads at all — not even a network request. Never invent a placeholder value for this. |

Local development: copy `.env.example` to `.env.local` (gitignored) and
fill in real values. Production: the same two Supabase variables live as
**GitHub repository secrets**, consumed only by
`.github/workflows/deploy.yml`'s build step (§17) — never committed to the
repo in any form.

---

## 19. 절대로 client에 노출하면 안 되는 secret

**The Supabase `service_role` key.** It bypasses Row Level Security
entirely — anything holding it has unrestricted read/write on every table,
ignoring `is_admin()` and every other policy in §7. It:

- Must never be assigned to a `VITE_*` variable (Vite bakes every `VITE_*`
  value into the published JS bundle — anything with that prefix is
  effectively public).
- Must never appear in `.github/workflows/deploy.yml` or any GitHub repo
  secret consumed by a client build.
- Has **no legitimate use anywhere in this repository** as it stands
  today — there is no server-side code (no Edge Function, no backend) that
  would need it. If a future phase ever adds one, the key belongs only in
  that server-side config, never in anything Vite bundles.

Verified clean as of Phase 4-I's security audit: zero occurrences of
`service_role` in `src/`, and zero occurrences in an actual built `dist/`
output. The **anon key** (`VITE_SUPABASE_ANON_KEY`) is, by contrast,
*designed* to be public client-side — RLS (§7), not secrecy, is what
protects it. Don't confuse the two, and don't treat the anon key as
something that needs protecting the way the service_role key does.

---

## 20. 개발/수정 시 주의사항 — see the dedicated "DO NOT BREAK" list below

`CLAUDE.md` remains the permanent, authoritative rule set for this project
(content source-of-truth, design-system rules, the "No Dead Button Rule,"
etc.) — this document does not replace it. The DO NOT BREAK list right
below this section is this document's own addition, focused specifically
on the CMS/Auth/RLS/Image architecture described above.

---

## 21. lint/build 명령

```bash
npm install      # once, or after package.json changes
npm run dev      # local dev server (Vite)
npm run build    # production build -> dist/ (both entry points)
npm run preview  # serve the last build locally
npm run lint     # oxlint
```

There is no test suite in this repository — verification throughout this
project's history has been manual QA (a scratchpad mock PostgREST server +
Playwright), never committed to the repo. `npm run lint` and `npm run
build` passing cleanly is the actual, repeatable bar every phase has been
held to before considering work done.

---

## 22. Production 배포 흐름

1. Push a commit to `claude/leo-advisory-phase-1-foundation-6qikp7`.
2. `.github/workflows/deploy.yml` runs automatically (§17): install →
   build (with real Supabase secrets injected) → upload → deploy.
3. Live at `https://<owner>.github.io/leo-business-advisory/` (the actual
   repo owner as of this writing: `leafdraw282-oss`) — confirm via the
   Actions run's own `conclusion: success`, not by assumption.
4. `/admin` is live at the same origin's `/admin/` path — no separate
   deployment step.

No staging environment or preview-deploy mechanism exists — every push to
the deployed branch goes straight to the live Production site.

---

## 23. 알려진 제한사항 (Known Limitations, as of Phase 4-I)

- **Muted-text color contrast**: `--color-text-muted` (#8b8984) on
  `--color-background` (#f4f1ea) measures ~3.10:1 — passes WCAG AA's 3:1
  floor for large text/UI components, falls short of the 4.5:1 floor for
  normal body text, which is how this token is actually used in several
  places (Hero subhead, Career company name, Gallery captions, Contact
  labels). Pre-existing design value, not changed during QA (out of that
  phase's "report, don't redesign" scope) — flagged for a future decision.
- **No web font is actually loaded.** `--font-kr` lists `'Pretendard',
  'Noto Sans KR', ...` but no `@font-face`, CDN `<link>`, or `@import`
  exists anywhere in the project — every visitor sees their OS's system
  Korean font. Performance-wise this is neutral-to-good (zero font-loading
  network cost); it is a gap versus `CLAUDE.md`'s stated typography intent
  if actual Pretendard rendering matters.
- **`sitemap.xml`'s `<lastmod>` is a static date**, not auto-updated on
  content edits — a low-priority, known characteristic of a hand-maintained
  static sitemap, not a bug.
- **Gallery and Case Studies' per-item image resolution is N separate
  (already-parallel, not sequential) Supabase queries**, not one batched
  `.in()` lookup — a deliberate tradeoff (Phase 4-H), not an oversight; see
  §11.
- **No automated test suite** — see §21.
- **`0010_storage_size_limit.sql` may not yet be applied to the real
  Production Supabase project** — this repository's sessions never connect
  to a real database (every verification in this project's history has
  been against a local mock). If it hasn't been run yet, the Storage
  bucket's *server-side* upload limit is still 5MB even though the
  *client-side* check (already deployed) already enforces 2MB — see §8.

---

## 24. 향후 Phase에서 확장 가능한 영역

None of the following exist today — listed as plausible, non-committal
directions consistent with the architecture above, not a roadmap or a
promise:

- Loading a real Pretendard web font (with `font-display: swap` and a
  `<link rel="preload">`), closing the gap noted in §23 — would need to be
  weighed against the performance cost of adding a font-loading network
  request at all.
- Drag-to-reorder in the admin UI for list tables other than
  `gallery_items` (which already has ↑/↓ buttons) —
  `impact_metrics`/`career_entries`/`advisory_items`/etc. are `sort_order`-
  ordered in the schema already but have no admin reordering UI yet.
- A batched `.in()` media-resolution query for Gallery/Case Studies,
  trading a more complex `resolveImageUrl`/`publicTable.js` API surface for
  fewer round trips (§11, §23).
- Multiple admin roles/permission levels beyond the current single
  `admin_users` allowlist (every admin can edit everything today).
- An automated test suite (§21) — none exists; all verification has been
  manual to date.
- A CI check that fails a PR/push if `npm run lint` or `npm run build`
  fails, rather than relying on whoever pushes having run them locally
  first.
- Server-side image optimization/resizing on upload (today, whatever the
  admin uploads — within the 2MB/type limits, §8 — is served as-is).

---

# DO NOT BREAK

These are real, specific ways this codebase has been (or could easily be)
broken by a well-intentioned change. Each one is grounded in an actual
pattern or a real incident from this project's history — not a generic
warning.

1. **Never rewrite an existing `supabase/migrations/000N_*.sql` file.**
   Every schema change since `0008` has been a new, higher-numbered file
   (`0008_table_grants.sql`, `0009_site_design_settings.sql`,
   `0010_storage_size_limit.sql`), even when the "correct" fix would have
   been to edit an earlier file's original statement. Editing history
   retroactively breaks anyone diffing what actually ran against
   Production, and breaks `PRODUCTION_INITIAL_SETUP.sql`'s own claim to be
   a byte-identical concatenation of the real migration history. Add a new
   file instead, always.

2. **Never delete or destructively modify real Production data** —
   including via a "cleanup" migration, a manual SQL Editor session, or a
   test script pointed at the wrong project. This repo's own sessions have
   an explicit, repeated standing instruction to never connect to the real
   Production database at all; verification always happens against a local
   mock. If you are a future session and are unsure whether you're looking
   at mock or real infrastructure, stop and ask rather than run a write.

3. **Never use, request, or introduce the Supabase `service_role` key
   anywhere client-accessible** — see §19. No `VITE_*` variable, no GitHub
   Actions secret consumed by the build, no hardcoded value anywhere in
   `src/`.

4. **Never mix admin-only and public-only data-access code.** `src/lib/
   content/*.js` (public, always goes through `fetchWithFallback`) and
   `src/admin/content/*.js` (admin, calls `supabase` directly, no fallback)
   are deliberately separate, deliberately never imported across that
   boundary. Importing an admin helper into a public section (or vice
   versa) reintroduces exactly the kind of coupling Phase 2-A's original
   design explicitly avoided, and risks bundling admin-only code (or admin
   UI strings) into the public JS bundle.

5. **Never confuse Gallery's `is_active` with `deleted_at`.** See §10 in
   full. Toggling public visibility must never set/clear `deleted_at`;
   moving to/from Trash must never touch `is_active`. They are independent
   columns, independently gated, independently surfaced in the admin UI,
   and only one of them (`deleted_at`) is enforced by RLS at all — the
   other is enforced *only* by the client-side filter in
   `src/lib/content/gallery.js`. Removing that filter (even "cleaning up"
   what looks like a redundant check) silently un-hides every inactive
   photo to the public.

6. **Be careful changing the CMS-image-vs-fallback priority order.** Every
   image section resolves the real CMS image first, falls back to the
   local `profile.js` path second (§9, §16) — and Hero specifically uses a
   *third*, image-less first-paint state (`heroInitial()`) ahead of both,
   purely to avoid a wasted network request and a CLS-causing layout
   change. This exact ordering was the subject of multiple dedicated
   bugfix phases (a stale-`onError` race, a flicker-to-placeholder bug, a
   `.hero__grid` flex-sizing CLS bug) — re-test Hero's load timing,
   `<img>` `key`/`onError` behavior, and layout stability specifically if
   you touch any of `hero.js`, `Hero.jsx`, `Hero.css`, or
   `ImagePlaceholder.jsx`.

7. **Never change `vite.config.js`'s `base` path** without also updating
   every absolute URL in `index.html` (canonical, `og:url`, `og:image`,
   JSON-LD `@id`/`url` fields) and `public/404.html`'s hardcoded links
   (that file is static, not built by Vite, so it doesn't get the base
   path rewrite automatically — see its own code comment), and confirming
   the repo's Settings → Pages source is still "GitHub Actions." See
   `docs/CUSTOM_DOMAIN_SETUP.md` if the goal is actually switching to a
   custom domain.

8. **Never write a raw hex color, pixel radius, or spacing value directly
   in a component's CSS file.** Everything must go through a
   `var(--token)` from `variables.css` (§12, §13) — otherwise
   `site_design_settings`/the admin Settings UI has nothing to actually
   override at runtime, and a value silently stops being admin-editable
   even though the UI implies it is.

9. **Never add a new content table without both GRANT and RLS**, and
   without an explicit `select`/`for all using (is_admin())` policy pair —
   see §7 in full. A table missing either layer reproduces a real bug this
   project already had to diagnose and fix twice (once for the original
   GRANT gap across every table, once for a new table's own explicit
   grant).

10. **Never assume `.env.local` / the Supabase env vars are present.** Any
    new code path must degrade through `isSupabaseConfigured` /
    `fetchWithFallback` (public) exactly like everything else does — a
    component that assumes `supabase` is non-null will crash this repo's
    own "clone and run with nothing configured" experience, which
    `README.md` explicitly promises works.

---

*This document reflects the codebase as of the end of Phase 4-I (Production
Final QA, no blockers). If a later phase changes any of the structures
described above, update this file in the same change — it is meant to stay
accurate, not to be a permanent historical snapshot the way
`docs/PROJECT_STATUS.md` is.*
