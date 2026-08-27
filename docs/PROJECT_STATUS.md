# Project Status

## PHASE 1 COMPLETE

All Phase 1 scope from the Master Specification is built, verified, and
documented: Header, Hero, Impact, About, Case Studies, Advisory, Career,
Gallery, Contact (with a working `mailto:` form), and Footer — fully
bilingual (KR/EN), responsive at 1440/1024/768/390px, and passing lint +
build with zero console errors/warnings. See Phase 1-G directly below for
the final QA pass, and each earlier phase's section for how every part
was built.

## Phase 2-F — Admin Usability Pass (Content/Images UX)

**Status: complete.** Public site untouched — every change is scoped to
`src/admin/`.

Scope was making the already-working admin CMS (Phase 2-B–2-E) safe and
clear for a non-developer to operate, not new functionality.

**Dashboard home view:** replaced the single placeholder paragraph with
two cards ("Content 관리" / "Images 관리", each with a one-line
description, clicking either jumps to that tab), a "마지막 저장" panel, and
a "Public Website 바로가기" link (opens the live site in a new tab, using
`import.meta.env.BASE_URL` so it's correct in both dev and production).

**Never silently lose an edit:** the biggest real risk in the Phase
2-B–E admin was that switching sections (or tabs, or logging out, or
closing the tab) unmounted the active form and discarded any unsaved
edit with no warning. `src/admin/content/dirtyTracker.js` is a small
module every data hook (`useAdminForm`, `useImageSlot`,
`useGalleryImages`) now reports its dirty state into; `Content.jsx`,
`Images.jsx`, and `Dashboard.jsx`'s tab/section switches and Logout all
check it first and ask for confirmation before discarding anything, and
a `beforeunload` handler warns before closing/refreshing the tab too.

**Saved vs. editing, unmistakably:** `SectionStatus.jsx`'s toolbar now
tints its whole background (amber = unsaved changes, green = just
saved, red = save failed, neutral = matches what's saved) instead of
only changing a line of text — the distinction reads at a glance without
needing to read English. Every status message, button label, and
confirmation dialog was translated to Korean (Content/Images sections'
own field labels stay as before — this pass targeted the messages where
a mistake is actually made, not a full UI translation).

**Section navigation now shows what's inside:** both Content's and
Images' sub-nav list a one-line Korean description under each section
name (e.g. "Hero — 첫 화면 문구와 버튼"), so a non-developer can find the
right section without opening each one to check.

**KR/EN clarity:** `BilingualField.jsx`'s tags changed from bare "KO"/
"EN" to "한국어"/"영어 (EN)", with distinct background colors per
language, so the two columns read as unmistakably different languages,
not just different abbreviations.

**Current vs. replacement image, side by side:** `ImageSlotEditor.jsx`
(Hero/About/Case Study slots) and Gallery's per-photo rows now show
"현재 이미지" and, once a new file is selected but not yet saved, "새
이미지 (저장 전 미리보기)" next to it with a green outline — previously the
new preview silently replaced the current-image view, so there was no
way to compare them or confirm what was actually still live. Gallery
also gained an item count in its heading ("Gallery (6장)"), a per-photo
number label, and a short instructions line.

**Responsive:** re-tested Dashboard, Content, and Images (including
Gallery) at 390px, 768px, 1024px, and 1280px via a full-page overflow
sweep. **Found and fixed a real bug**: at 768px (tablet-portrait width),
the two-column image-slot layout didn't have enough room next to the
sidebar and sub-nav and caused horizontal overflow — the stacking
breakpoint was 640px, leaving a gap between "phone" and "desktop" widths
with nothing designed for it. Widened the breakpoint to 900px; re-swept
all four widths afterward with zero overflow anywhere.

**Not built in this phase (by design):** any new admin functionality
(Settings, additional fields, new sections) — this was a UX pass over
what Phase 2-B–2-E already built, not new scope.

## Phase 2-E — Public Website Connected to CMS Data

**Status: complete for every section with a public rendering surface
(Hero, Impact, About, Case Studies, Advisory, Career, Gallery, Contact,
Footer). Education has no public UI to connect — see Issues.**

Scope was wiring the public site's existing components to read from
Supabase (Phase 2-A schema, Phase 2-C/2-D's admin-writable data) with
`src/data/profile.js` as the fallback at every level, per the exact
priority order specified: (1) successfully-fetched Supabase data, (2)
`profile.js` whenever there's no data or the fetch fails. No design,
layout, animation, or responsive behavior was changed — every section's
JSX/CSS is untouched; only *where the values come from* changed.

**What was built:**

- **`src/hooks/useSectionContent.js`** — the hook every section now uses.
  It initializes React state directly with the `profile.js`-derived
  fallback (so first paint is byte-identical to before this phase — no
  loading state, no blank page), then swaps in whatever the section's
  fetch function resolves to once it completes.
- **`src/lib/content/{hero,impact,about,caseStudies,advisory,career,
  gallery,contactInfo,contactForm,footer}.js`** — one read module per
  section, each exporting a `xFallback()` (the instant, `profile.js`-only
  initial value) and `fetchX()` (tries Supabase via
  `fetchWithFallback.js` — built in Phase 2-A, wired in for the first
  time here — returns `xFallback()` untouched on any missing data,
  network error, or unconfigured backend). Case Studies/Advisory/Career
  merge Supabase and `profile.js` at the finest available granularity
  (per case, per advisory item) rather than all-or-nothing, matching the
  stated priority rule literally. Image-bearing sections resolve their
  `media` row to a public Storage URL and fall back to the existing
  static `images` map entry when no image is set.
- **`src/lib/content/publicTable.js`** — tiny read-only query helpers,
  intentionally separate from `src/admin/content/supabaseTable.js` so the
  public bundle's dependency graph never reaches into `src/admin/`
  (same isolation principle as Phase 2-B's separate entry points).
- **Section components updated** (content source only, zero markup/CSS
  changes): `Hero.jsx`, `Impact.jsx`, `Profile.jsx` (About),
  `CaseStudies.jsx`, `Advisory.jsx`, `Career.jsx`, `Gallery.jsx`,
  `Contact.jsx`, `ContactForm.jsx`, `Footer.jsx`. Each now calls
  `useSectionContent(fetchX, xFallback())` instead of importing its
  content directly from `profile.js`; `person`/`site`/navigation (not
  part of the Phase 2-C CMS scope) are still direct `profile.js` reads,
  unchanged.

**Verified with a local mock backend (not a real Supabase project — see
Issues):** ran the exact test the phase asked for — changed Footer's
"Back to top" EN label to a non-factual test string
(`"Back to top (TEST)"`) in the admin Content editor, saved, reloaded the
public site, confirmed the footer showed the new text in EN while KO
stayed unchanged (`맨 위로`), then reverted the EN value and saved again,
reloaded, and confirmed the footer was back to `"Back to top"`. Also
confirmed: with a configured-but-empty backend, Hero/About/Case Study
images correctly fall back to the labeled `ImagePlaceholder` (same
component, unmodified); the full page still renders (never blank); KR/EN
toggle still updates every section simultaneously; anchor nav, smooth
scroll, and the mobile menu all still work; the public site with no
Supabase configuration at all (this repo's actual current state) renders
byte-identical section counts/content to before this phase.

**Not built in this phase (by design):** an Education section on the
public site (none exists to connect — see Issues), and
`.github/workflows/deploy.yml` changes to inject real Supabase secrets at
deploy time (still no real project to point at).

## Phase 2-D — Admin Image Manager (Supabase Storage, Admin ↔ Database only)

**Status: complete for the site's actual current image slots (Hero,
About/Profile, 6 Case Studies, Gallery). No Career image slot exists to
manage — see "Issues" below. Live upload/delete against real Storage
still requires a real Supabase project.**

Scope was the admin-side Images tab only: view the current image for
each slot, upload/replace, preview, save, and reset/delete — backed by
Supabase Storage's `site-images` bucket and the `media` table, both
already defined in Phase 2-A's schema (`hero_content.hero_image_id`,
`about_content.portrait_image_id`, `case_studies.image_id`,
`gallery_items.image_id` all already existed; no migration changes were
needed this phase). The public site's own images are untouched — it
still renders only from `src/data/profile.js`'s `images` map and
`public/images/`, unchanged; connecting the two is Phase 2-E.

**What was built:**

- **`src/admin/content/supabaseStorage.js`** — `validateImageFile()`
  (JPEG/PNG/WebP/SVG only, 5 MB max), `uploadImageFile()`,
  `publicUrlFor()`, `removeStorageFile()`, all against the `site-images`
  bucket from `supabase/migrations/0003_storage_setup.sql`.
- **`src/admin/content/rowDefaults.js`** — `heroRowDefaults()` /
  `aboutRowDefaults()` / `caseStudyRowDefaults()`: since
  `hero_content`/`about_content`/`case_studies` all have several `NOT
  NULL` text columns beyond the new image FK, attaching an image before
  that row's own text has ever been saved via Phase 2-C would otherwise
  fail on insert. These builders always produce a complete, valid row —
  the row's current values when one exists, `profile.js`'s own text
  (unmodified) when it doesn't — so an image can be attached in any
  order relative to the text.
- **`src/admin/content/useImageSlot.js`** — the state machine behind
  every single-image slot (Hero, About, each Case Study): load current
  image + alt text, stage a new file locally (validated, previewed via
  `URL.createObjectURL`, not yet uploaded), save (uploads, writes a new
  `media` row, updates the parent's image FK, then best-effort cleans up
  the previous image/media row), and reset (clears the FK and deletes the
  image). Old-image cleanup failures are logged, not surfaced as save
  failures, since the primary action — the new image going live, or the
  slot being cleared — already succeeded by that point.
- **`src/admin/content/useGalleryImages.js`** — the equivalent state
  machine for Gallery's variable-length list: add/delete/reorder (Move
  Up/Down, persisted via `sort_order` at save time, same pattern as
  Phase 2-C's Advisory/Career lists), each row with its own optional
  pending upload, caption KO/EN required before saving.
- **`src/admin/components/ImageSlotEditor.jsx`** — shared UI for every
  single-image slot: renders the **same, unmodified `ImagePlaceholder`
  component the public site uses** for the preview, so "no image yet" or
  "image failed to load" looks and behaves exactly like the public site's
  own fallback (see "Fallback check" below) — file input with client-side
  validation, alt text fields, and a Remove-image button (only shown once
  an image actually exists, with a confirm prompt before deleting).
- **`src/admin/pages/images/HeroImage.jsx`**, **`AboutImage.jsx`**,
  **`CaseStudyImages.jsx`** (6 slots, one per case study, keyed by
  `case_key`), **`GalleryImages.jsx`** — one page per slot group, wired
  into a new **`src/admin/pages/Images.jsx`** sub-nav, replacing
  Dashboard's previous "Images" placeholder tab.
- **`src/admin/content/supabaseTable.js`** — two small additions:
  `fetchRowById()` (used to look up a slot's `media` row from its FK) and
  `deleteRow()` (used by Reset and Gallery's delete-photo action; no
  Phase 2-C flow needed row deletion before this).

**Why the public site is unchanged:** no file under `src/components/`
other than reusing (not modifying) the existing `ImagePlaceholder.jsx`,
and nothing under `src/sections/`, `src/data/`, or `src/styles/` was
touched — verified via `git diff --stat` (only `src/admin/*` files
changed) and a dev-server + Playwright check that `/` still renders its
full title and Hero text unchanged.

**Testing performed:** with the repo's actual current (unconfigured)
state, confirmed all 4 Images sub-sections load without error — Hero and
About show the labeled placeholder (`person.portraitLabelKo/En`, exactly
matching what the public site would show today, since no images exist
yet either way), all 6 Case Study slots list correctly by tag/title, and
Gallery pre-fills its 6 rows with `profile.js`'s exact captions.
Confirmed upload validation rejects an oversized file (>5 MB) and a
wrong-type file (`text/plain`) with a clear, specific message *before*
any network call; confirmed a valid file selection shows a pending-file
indicator with a working Cancel; confirmed the Remove-image button is
hidden until an image actually exists (nothing to remove yet); confirmed
Gallery's Add/Delete/Move-up/Move-down all update the list and dirty
state correctly, and that a newly-added row with an empty caption blocks
Save with a specific validation message. Found and fixed one real bug
during this testing: Gallery's `save()` checked "is Supabase configured"
*before* running caption validation (the opposite order from every
Phase 2-C section), so an invalid new row reported "Supabase is not
configured" instead of the actual validation problem — reordered to
validate first, matching the established pattern.

**Testing limits (same honest caveat as Phase 2-B/2-C, carried over from
Phase 2-A's "don't create a real Supabase project" constraint):** an
actual file upload to Storage, and a save → reload round trip confirming
a real `media` row and image FK, could not be exercised end-to-end — that
requires a real project. The Storage/DB calls follow documented
`@supabase/supabase-js` v2 APIs exactly
(`storage.from().upload()/.getPublicUrl()/.remove()`, plus the same
`saveListRow`/`upsertByNaturalKey`/`upsertSingleton` primitives Phase 2-C
already established and tested via error-path verification), and every
write re-fetches afterward to confirm persistence once a real project
exists.

**Fallback check:** `src/components/ImagePlaceholder.jsx` was not
modified in any way this phase (confirmed via `git diff` — zero changes)
and is reused as-is for every admin preview, so its "no `src` or failed
load → labeled placeholder, never a broken-image icon" behavior is
guaranteed identical between the admin preview and the (still
disconnected) public site.

**Not built in this phase (by design):** connecting the public site's
own rendering to Storage/the `media` table (Phase 2-E, explicitly), and
a Career image slot — the current public site has no image in its Career
section at all (Career.jsx renders a text-only timeline, confirmed via
audit — the only four `ImagePlaceholder` usages site-wide are Hero,
About, CaseStudy, and Gallery), so nothing was built or changed there;
see Issues.

## Phase 2-C — Admin Content Editor (text content, Admin ↔ Database only)

**Status: complete for the 9 sections in scope (Hero, Impact, About, Case
Studies, Advisory, Career, Education, Contact, Footer). Full save→reload
round trips against a live database still require a real Supabase
project — see "Testing limits" below.**

Scope was the admin-side Content editor only: view current values, edit
KR/EN, save to the Phase 2-A Supabase schema, re-fetch to confirm. The
public site's data source is **not** switched to the database yet (still
reads only from `src/data/profile.js`, unchanged) — that's Phase 2-E per
the user's own instruction.

**What was built:**

- **`src/admin/content/supabaseTable.js`** — generic CRUD helpers over the
  Phase 2-A schema (`fetchSingleton`/`upsertSingleton` for the id=1
  tables, `fetchList`/`saveListRow` for id-keyed list tables,
  `upsertByNaturalKey` for tables with a stable text key — `item_key` on
  `advisory_items`, `case_key` on `case_studies`).
- **`src/admin/content/useAdminForm.js`** — the state machine behind every
  section: load (database if configured and populated, `profile.js`
  otherwise), track dirty state (`JSON.stringify` diff against the last
  loaded/saved snapshot), save, and re-load to confirm what's actually
  persisted. One hook, reused by all 9 sections instead of 9 bespoke
  state machines.
- **`src/admin/content/validation.js`** — `requireFilled()`: every
  bilingual field must have both KO and EN text before a save is
  attempted (enforces CLAUDE.md's "never a partial switch" rule at the
  admin layer). Runs client-side, before any network call, and before the
  "is Supabase configured" check, so validation errors are visible even
  when no backend exists yet.
- **`src/admin/components/BilingualField.jsx`**, **`PlainField.jsx`**,
  **`SectionStatus.jsx`** — shared field/status UI so every section looks
  and behaves the same: KO and EN inputs always shown together, a
  Reload/Save toolbar with an explicit "Unsaved changes" badge and a
  distinct save-success / save-failure message.
- **`src/admin/pages/content/*.jsx`** (9 files) — one page per section,
  each mapping its Supabase table(s) to/from `profile.js`'s exact current
  content field-for-field, with no rewriting, summarizing, or number
  changes (existing copy becomes the database's initial value verbatim
  the first time it's saved, per this phase's explicit constraint).
  `HeroSection`/`AboutSection`/`FooterSection` are single tables;
  `ImpactSection`/`AdvisorySection`/`CareerSection` combine a heading
  singleton with a list; `EducationSection` is a plain list (no heading
  table exists, matching `profile.js`'s own shape); `ContactSection`
  combines four tables (`contact_info`, `contact_cta`,
  `contact_form_content`, `inquiry_types`); `CaseStudiesSection` is the
  most complex — a heading, 6 case rows, and each case's nested metrics
  and highlights, saved in FK-safe order (parent case row first, so
  children can reference its real database id). Structural/non-copy
  fields (`cta_*_target` nav ids, portrait/hero image ids) are
  deliberately left out of this phase's editable fields.
- **`src/admin/pages/Content.jsx`** — the Content tab's own sub-navigation
  between the 9 sections; wired into `Dashboard.jsx`'s existing "Content"
  tab (previously a placeholder).

**Why the public site is unchanged:** no file under `src/components/`,
`src/sections/`, `src/context/`, `src/data/`, or `src/styles/` was
touched; every new file lives under `src/admin/`, reachable only from the
already-isolated admin bundle (see Phase 2-B). Verified via dev server +
Playwright that `/` still renders unchanged.

**Testing performed:** with the repo's actual current configuration (no
Supabase project — `isSupabaseConfigured` is `false`), loaded all 9
sections and confirmed every field is pre-filled with `profile.js`'s
exact current text (spot-checked Hero field-by-field against the source
object). Edited a KO field only and confirmed the paired EN field stayed
untouched in the form state (KR/EN independent editing), confirmed the
"Unsaved changes" badge and Save-button enablement track dirtiness
correctly, confirmed Reload discards an unsaved edit and restores the
last-loaded value, confirmed clearing one side of a bilingual field and
saving is blocked with a specific validation message ("Missing KO or EN
text for: ..."), and confirmed that saving valid content with no backend
configured fails with a clear, distinct message ("Supabase is not
configured — cannot save") rather than a false success. Found and fixed
one real bug during this testing: non-`Error` failures (e.g. Supabase
client errors) were rendering as the literal string "[object Object]"
instead of their actual message — fixed in `useAdminForm.js`.

**Testing limits (honest, per this phase's own "don't create a real
Supabase project" constraint carried over from Phase 2-A):** a full
save→re-fetch round trip against a live, populated database table could
not be exercised end-to-end, since doing so requires a real Supabase
project. The write logic follows documented `@supabase/supabase-js` v2
call patterns exactly (`.select().eq().maybeSingle()`,
`.upsert().select().single()`, `.update().eq().select().single()`,
`.insert().select().single()`, `.upsert(values, { onConflict }).select().single()`)
and re-fetches after every write to confirm persistence once a real
project exists — but this remains unverified against a real database
until the user completes their own Supabase setup (see Phase 2-A/2-B's
"User action required").

**Not built in this phase (by design):** image editing (`hero_image_id`,
`about_content.portrait_image_id`, case study/gallery images), the
`cta_primary_target`/`cta_secondary_target` nav-id fields, add/remove-row
UI for list sections (only existing rows are edited, per this phase's
"기존 값을 확인하고 수정" scope), a `profile.js`→Supabase seed *script*
(seeding instead happens naturally the first time each section is
loaded-then-saved, exactly once, by an admin), and any change to the
public site's own data source or `.github/workflows/deploy.yml`. These
are Phase 2-D / Phase 2-E, not started.

## Phase 2-B — Admin Auth & `/admin` Entry Point

**Status: complete (login/dashboard implemented; end-to-end auth flow
cannot be fully exercised until a real Supabase project exists — see
"User action required" below).**

Scope was authentication and the `/admin` entry point only — no
content-edit, image-upload, or settings functionality yet. Built on the
Phase 2-A architecture (`docs/ADMIN_CMS_ARCHITECTURE.md`,
`src/lib/supabase.js`, the `admin_users` + RLS design).

**What was built:**

- **`admin/index.html`** + **`src/admin/`** — a second, fully independent
  Vite entry point (standard Vite multi-page-app pattern), built to
  `dist/admin/` and served at `/admin/` on GitHub Pages
  (`https://<owner>.github.io/leo-business-advisory/admin/`). It shares no
  runtime code with the public site's `App.jsx`/render tree — only the
  existing `src/lib/supabase.js` client is reused. `admin/index.html`
  carries `<meta name="robots" content="noindex, nofollow">` so it's never
  indexed as part of the public site.
- **`src/admin/AdminApp.jsx`** — the auth gate. On mount it calls
  `supabase.auth.getSession()` and subscribes to
  `supabase.auth.onAuthStateChange`, then renders one of four states:
  "not configured" (no `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` — true
  for this repo today), "loading", `Login` (no session), or `Dashboard`
  (session present).
- **`src/admin/pages/Login.jsx`** — email/password form calling
  `supabase.auth.signInWithPassword`. **No sign-up form, sign-up link, or
  self-registration path exists anywhere in the admin bundle** — admin
  accounts are created out-of-band via the Supabase Dashboard or SQL
  Editor (see `supabase/README.md`), gated by the `admin_users` allowlist
  + RLS built in Phase 2-A. A failed sign-in shows Supabase's error
  message inline; nothing pretends to succeed.
- **`src/admin/pages/Dashboard.jsx`** — minimal shell only: a sidebar with
  Dashboard / Content / Images / Settings (client-side tab switching, no
  router dependency added) and a working Logout button
  (`supabase.auth.signOut()`, which the auth-state listener turns back
  into the Login screen). No real content-editing, image-upload, or
  settings UI — each tab shows a "not implemented yet" placeholder.
- **`src/admin/admin.css`** — self-contained styling, imported only by the
  admin entry; never touches the public site's CSS.
- **`vite.config.js`** — `build.rollupOptions.input` now lists both
  `index.html` and `admin/index.html` so both are built; `base` is
  unchanged.

**Why the public site is unchanged:** no file under `src/components/`,
`src/sections/`, `src/context/`, `src/data/`, or `src/styles/` was
touched, `src/App.jsx`/`src/main.jsx` are untouched, and the admin bundle
is a separate Rollup input that produces separate output files
(`dist/admin/*` vs `dist/index.html`/`dist/assets/main-*`) — verified by
inspecting the build output.

**Verification performed:** built and ran the dev server; confirmed
`/admin/` with no Supabase configuration shows the "not configured"
notice (not a broken page); with a temporary local-only dummy
configuration (never committed — `.env.local` is gitignored and was
deleted before finishing), confirmed the Login form renders with no
sign-up affordance anywhere in the page, and that a login attempt against
a nonexistent project surfaces a visible error message rather than
silently failing or appearing to succeed; confirmed the public site
(`/`) still renders its full title and content unchanged. Full
login-success, session-persistence-after-refresh, and logout→Login
transitions need a real Supabase Auth session and could not be exercised
end-to-end in this phase, since creating a real Supabase project is
explicitly out of scope (see "User action required"); the code follows
`@supabase/supabase-js`'s standard session-handling contract
(`getSession()` on load + `onAuthStateChange` subscription, default
`persistSession`/`autoRefreshToken` behavior), which is what makes those
three behaviors work once a real project is connected.

**Not built in this phase (by design):** content-edit UI, image-upload
UI, settings UI, any write to the Supabase tables from Phase 2-A, and any
`.github/workflows/deploy.yml` change to inject real Supabase secrets at
deploy time. These are Phase 2-C, not started.

## Phase 2-A — Admin CMS Architecture (design + foundation only)

**Status: complete.**

Scope was architecture design and non-invasive foundation only, per
explicit instruction: the public site's design, layout, responsive
structure, animation, navigation, KR/EN toggle, SEO, and existing content
must not change in this phase, and no admin login/edit UI and no real
Supabase project or credentials were to be created. All of that was
honored — see `docs/ADMIN_CMS_ARCHITECTURE.md` for the full design.

**What was built:**

- **`src/lib/supabase.js`** — Supabase client, gated by
  `isSupabaseConfigured` (`false` unless `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` are set at build time — true for this repo
  today).
- **`src/lib/content/fetchWithFallback.js`** — the fallback-first fetch
  wrapper: returns the given `profile.js` value immediately if Supabase
  isn't configured, or if a configured query fails for any reason. Not
  imported by any component yet, so it has zero effect on the current
  build or the rendered site.
- **`supabase/migrations/0001_init_schema.sql`, `0002_rls_policies.sql`,
  `0003_storage_setup.sql`** — complete DDL for 23 content tables (mapped
  field-for-field to `profile.js`), an `admin_users` allowlist + RLS
  policies (public read, admin-only write), and the `site-images` Storage
  bucket + policies. Ready to run against a real project later; not
  applied anywhere — no Supabase project exists yet.
- **`supabase/README.md`** — step-by-step instructions for the user to
  apply these migrations and add an admin account, once they choose to.
- **`.env.example`** — documents `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` with no real values; `.gitignore` updated so
  `.env`, `.env.local`, `.env.*.local` are never committed.
- **`docs/ADMIN_CMS_ARCHITECTURE.md`** — the full design document:
  architecture diagram, database/storage design, KR/EN column-pair
  rationale, fallback strategy, environment-variable/secret handling
  rules, and an explicit list of what this phase deliberately did not
  build.
- Dependency added: `@supabase/supabase-js` (only new package installed).

**Why the public site is unchanged:** no existing component, section, or
style file was modified, and nothing imports `fetchWithFallback` or
`supabase.js` yet — the new code is complete and lint/build-clean but
structurally unreachable from the current render tree. `src/data/profile.js`
remains untouched and is still the only thing any page actually renders.

**Not built in this phase (by design):** `/admin` route, login screen,
content-edit UI, image-upload UI, a real Supabase project or any real
credentials, a `profile.js` → Supabase seed script, and any change to
`.github/workflows/deploy.yml`. These are Phase 2-B, not started.

## Phase 1-G — Final QA

**Status: complete.**

Scope was QA and bugfixing only, explicitly no new design or features:
functional QA (every nav link/CTA/mobile menu/language toggle), content
QA (re-verify every fact against the Founder Profile source document),
technical QA (lint, build, broken imports/images, console errors, dead
buttons, `href="#"`, missing/duplicate section ids, horizontal overflow,
unused components), responsive QA, accessibility QA, SEO QA, and bringing
the documentation (`README.md`, this file) up to date with the actual
finished project.

### Content QA — facts re-verified against the source document

Re-extracted `word/document.xml` from the original
`Leo_Business_Advisory_Founder_Profile_KR_EN.docx` fresh (not reused from
earlier phases) and diffed every fact in `src/data/profile.js` against it
line by line: name, title, positioning, contact info, the founder-profile
bio, all 4 impact metrics, all 8 advisory items, all 6 case-study
summaries + figures, all 7 career entries (years/roles/companies), and
education. Cross-checked every brand/company name's spelling for
consistency across every field it appears in (`grep`-verified — no
case/spelling variants found anywhere).

Found and corrected three real deviations from the document:
- `caseStudies` (RCC entry) `summaryKo` had an inserted object particle
  ("수익성을 개선" → the document's own text reads "수익성 개선", matching
  its telegraphic/résumé phrasing used throughout that list) — corrected.
- `caseStudies` (LEOHOLDINGS entry) `summaryEn` had drifted from the
  document's own English wording — it was missing "curated platform ...
  across online and offline channels" (present in the document) and had
  gained "personally planned, built and" (not in the document, apparently
  influenced by the Korean line instead of the document's own English
  section — exactly what CLAUDE.md's "do not machine-translate one into
  the other" rule exists to prevent). Corrected to match the document's
  English wording, keeping the same subject-first sentence structure used
  by the other 5 case summaries.
- `career` (Samsonite Korea, 2005–2019 entry) `roleKo` read "대표이사
  (President & Representative Director)" — the document's Korean section
  uses the English title verbatim with no Korean gloss, and every other
  `roleKo` in the array also keeps the English title as-is (matching how
  the source document itself keeps executive titles in English within its
  Korean text). This entry was the one exception, both to the document and
  to the site's own internal consistency — corrected to plain
  `'President & Representative Director'`.

Everything else — every number, date, company name, and market/growth/
EBITDA/P&L figure — matched the document exactly; no further changes were
needed. No fact was invented or estimated at any point in this pass.

### Functional QA (all verified via Playwright against the production build)

- Every nav link (Header desktop + mobile, Footer): `#about #impact
  #advisory #career #contact`, matching `navigation.js` exactly.
- Logo (Header + Footer) and Footer's dedicated "Back to top" link: all
  three go to `#top` and land there (confirmed via `scrollY`, not just href).
- Hero CTAs: "Explore Experience"/"성과 살펴보기" → `#impact`, "Discuss a
  Project"/"프로젝트 문의하기" → `#contact`.
- Final CTA ("Start a Conversation"/"대화 시작하기") moves focus to the
  Contact form's `name` field.
- Contact + Footer email/phone: real `mailto:leosuh00@gmail.com` /
  `tel:+821090332237` links.
- Mobile menu: opens, closes via Escape/outside-click/nav-link-click, and
  locks/unlocks `body` scroll correctly every time.
- Language: full `KR → EN → KR` round trip confirmed identical to the
  starting state (compared all `h1`/`h2` text before and after); every
  section, the footer, and the contact form (5 field labels, 9 dropdown
  options, disclosure note) switch together — no partial switch.

### Technical QA

- `npm run lint` → 0 warnings/errors. `npm run build` → succeeds.
- No console errors or warnings at any point across the full QA pass.
- No `href="#"` anywhere in the codebase (grepped).
- No duplicate HTML ids anywhere in the codebase (grepped every `id="..."`
  across all `.jsx` files — each of the 14 ids used, used exactly once).
- Every `<section id>` used by `navigation.js` (`about`, `impact`,
  `advisory`, `career`, `contact`) exists exactly once; the 3 additional
  section ids (`top`, `case-studies`, `gallery`) are valid anchor targets
  not required to appear in nav.
- No broken imports: every file in `src/components/` and `src/sections/`
  is imported and rendered somewhere in the tree (`App.jsx` or a parent
  section/component) — traced by hand, none orphaned.
- No broken images: every `images` map entry in `profile.js` is
  referenced by exactly one consumer and vice versa; every image (14
  slots total — Hero, About portrait, 6 case studies, 6 gallery items)
  correctly falls back to `ImagePlaceholder` (no real photography exists
  yet, so all 14 currently show their placeholder — that's expected, not
  a bug) with zero visibly-broken `<img>` icons.
- `education` (`profile.js`) is exported but not currently rendered by any
  section — this is intentional reserved data (captured from the source
  document for possible future use), not a broken/orphaned component, and
  wasn't newly surfaced since this phase excludes adding new UI.

### Responsive QA (1440 / 1024 / 768 / 390px)

Scripted full-DOM bounding-box scan at each width (not just a visual spot
check): zero horizontal overflow and zero elements extending past the
viewport edge at any of the 4 widths. Also confirmed at every width: zero
clipped Impact-metric numbers or Hero headline text (`scrollWidth ===
clientWidth`), Career timeline renders all 7 entries, nav/hamburger swap
correctly at the 768px breakpoint, Gallery/Contact-form/Footer all render
with the expected element counts.

### Accessibility QA

- Heading hierarchy: exactly one `<h1>` (Hero), followed only by `<h2>`s
  (section headings) and `<h3>`s (case-study titles, career roles) — no
  skipped levels, verified by walking every heading in DOM order.
- All 12 rendered `<img>` elements have non-empty `alt`; both currently-
  visible `ImagePlaceholder` fallbacks (`role="img"`) carry a matching
  `aria-label` — same guarantee holds for all 14 image slots once
  scrolled into view (verified in Phase 1-E/1-F).
- Keyboard focus: tab order starts at the logo, reaches the KR/EN toggle
  buttons, and every stop shows the shared bronze `outline` from
  `global.css` — confirmed via computed style, not just visual inspection.
- Button vs. link roles are correct throughout: the hamburger, KR/EN
  toggle, Final CTA (a same-page focus action), and form submit are all
  `<button>`; Hero CTAs and all navigation are `<a>` — verified by tag name.
- Form: all 5 fields (`name`, `company`, `email`, `inquiryType`,
  `message`) have an associated `<label for>` — 0 unlabeled fields.
- Landmarks: exactly one `<header>`, one `<main>`, one `<footer>`, two
  `<nav>` (header + footer — the mobile-menu `<nav>` only exists in the
  DOM while open), 8 `<section>`s, 6 `<article>`s (the case studies).

### SEO QA

- `<title>` and meta description already existed (Phase 1-A) and match
  the Master Specification's own specified text exactly — no change needed.
- OpenGraph (`og:type`, `og:site_name`, `og:title`, `og:description`,
  `og:locale` + `og:locale:alternate`) and a JSON-LD `Person` block were
  **added** to `index.html` — these were the two SEO items from the
  Master Specification (section 30) and CLAUDE.md's own "once content is
  finalized enough to be worth encoding" commitment that hadn't been built
  yet. Every JSON-LD field is sourced directly from already-verified
  `profile.js` data (name, title, email, phone, Seoul/KR, employer name) —
  nothing new was invented. Verified: `JSON.parse()` succeeds on the
  rendered script content, no console errors from adding it.
- No `og:image` was added — no real photography exists yet, and pointing
  social crawlers at a non-existent file would produce a broken preview
  image, which is worse than no image. Add one once a real hero/portrait
  photo exists.
- No `og:url` was added — the site has no canonical deployed URL yet (see
  "Deploying to GitHub Pages" in `README.md`); add it once deployed.

### Documentation

- `README.md` rewritten to match the actual finished project: accurate
  run/build/lint commands, a complete `src/` structure listing (including
  `context/`, every component, and `index.html`'s SEO role), a "Where to
  edit things" table plus a step-by-step "Adding photos" section, the
  language system, the contact form's `mailto:` behavior and how to swap
  in a real backend, and concrete GitHub Pages / custom-domain deployment
  steps (`vite.config.js` `base`, a `CNAME` file, DNS). Previously it
  still described the site as "Phase 1-A ... plain, unstyled" — that
  entire status section was replaced.
- This file (`docs/PROJECT_STATUS.md`) updated with this Phase 1-G entry
  and a `PHASE 1 COMPLETE` marker at the top.

### Issues found and fixed (summary)

1. Three content deviations from the source document (see Content QA above).
2. Missing OpenGraph metadata and JSON-LD (see SEO QA above).
3. `README.md` was stale (still described Phase 1-A's unstyled state).

No other problems were found — the site's navigation, CTAs, language
system, responsiveness, and accessibility were already correct from
Phases 1-A through 1-F, and were re-verified rather than changed.

### Build verification

```
npm run lint  → passes, 0 warnings/errors
npm run build → succeeds, no errors
```

## Phase 1-F — Site-Wide QA & Consistency Pass

**Status: complete.**

Scope was audit and polish only — no new sections, no new features, no
redesign. Target: full KR/EN coverage, responsive integrity at 1440/1024/
768/390px, visual consistency (container width, section spacing, heading
scale, body width, line-height, bronze-accent usage, image treatment,
button style, dividers, background transitions), and a regression check
of every interaction built in Phases 1-B through 1-E.

### What was found and fixed

**KR/EN gaps** (text that didn't switch with the language toggle):
- Hero and About portrait `ImagePlaceholder` `alt`/`label` were hardcoded
  English ("LEO Portrait") — now `t(person.portraitLabelKo, person.portraitLabelEn)`
  ("리오 포트레이트" / "LEO Portrait"), new field on `profile.js` `person`.
- Case Study project-image `alt`/`label` always read `${item.titleEn}
  Project Image` regardless of language — now built from the resolved,
  language-aware title ("SAMSONITE KOREA 프로젝트 이미지" in KR).
- Every section's `aria-label` (`Impact`, `Advisory Focus`, `Executive
  Career`, `Visual Story`, `Contact`, `About`, `Selected Impact`, and
  Hero's) was a static English string — now all resolve through `t()`,
  matching the visible heading/nav text in the current language.
- Header's desktop-nav `aria-label="Primary"` and `LanguageToggle`'s
  `aria-label="Language"` were English-only even though the mobile nav's
  equivalent label was already localized — now both use `t()`, matching
  the pattern already established elsewhere in the same files.
- Gallery's "no photos yet" empty-state message and the Case Studies
  section's eyebrow text were hardcoded inline in the component instead
  of `profile.js` — moved to `gallerySection.emptyKo/emptyEn` and
  `caseStudiesSection.eyebrowKo/eyebrowEn` respectively, matching how
  every other section's eyebrow/empty copy is already structured.
- Minor: the Gallery's "LEO Portrait" entry used `captionKo: 'LEO
  포트레이트'` (mixed English/Korean) while the new portrait label uses
  the fully-transliterated `'리오 포트레이트'` — aligned to the latter for
  consistency between the two "LEO portrait" placeholder labels on the page.

All of the above were verified end-to-end with Playwright: default
language, KR→EN, reload (localStorage persistence), and EN→KR, checking
every section's heading, aria-label, image-placeholder label, footer
tagline/nav/copyright, contact form labels/dropdown options/disclosure
note, and the constructed `mailto:` body — nothing left over in the wrong
language after a toggle, in either direction.

**Visual consistency:**
- `.contact__headline` used a larger `font-size` clamp than every other
  section's heading (`SectionTitle`'s `.section-title__heading`), even
  though Contact doesn't use the `SectionTitle` component (it needs a
  custom composition — headline + CTA button together, no eyebrow).
  Aligned its clamp to match `.section-title__heading` exactly
  (`clamp(1.75rem, 1.4vw + 1.4rem, 2.75rem)`) so heading scale is now
  uniform across every section on the page.
- Audited container width, spacing scale, bronze-accent usage, image
  radius/treatment, button style, divider style, and background
  transitions across every section's CSS (grepped for hardcoded hex/rgb
  colors and box-shadows outside `variables.css` — found none besides one
  intentional, already-existing shadow on the mobile nav panel). No other
  changes were needed: every section already shares the same `.container`,
  the same `--space-*` spacing scale, the same `ImagePlaceholder`
  radius/treatment, the same `.btn`/`.btn--primary`/`.btn--secondary`
  styles, and bronze is used only for small kickers/accents (index
  numbers, dots, eyebrows) — never as a large fill — consistent with
  CLAUDE.md's design system section.

**Interaction regression** (no new interactions added — verified existing
ones still work correctly):
- Smooth scroll, sticky header (background/border after 8px scroll),
  mobile menu (open, close via Escape/outside-click/nav-link-click, body
  scroll lock), language toggle, Hero CTAs, Contact's Final CTA (focuses
  the form), Contact/Footer `mailto:`/`tel:` links, and both "logo → top"
  and the dedicated "Back to top" footer link — all confirmed working via
  Playwright. (Two checks initially read as failures because the
  page is long and CSS smooth-scroll takes noticeably longer than a
  typical `waitForTimeout`; re-checked with a longer wait and both the
  mobile nav-link scroll and the logo-to-top scroll land correctly —
  not a real regression.)
- Active-nav-on-scroll (highlighting the current section in the header as
  you scroll) was intentionally **not** added — this phase's instructions
  explicitly exclude new features, and highlighting-on-scroll doesn't
  exist yet in this codebase, so adding it now would be new, not "polish."

### Deliberately NOT built yet (by scope, not oversight)

- Active-nav-on-scroll highlighting, scroll-reveal animation.
- Real photography (all 14 image slots still render via `ImagePlaceholder`).
- GitHub Pages deployment config, SEO OpenGraph/JSON-LD.
- `ContactForm.jsx` backend swap (still `mailto:`, as designed).

### Test results

```
npm run lint  → passes, 0 warnings/errors
npm run build → succeeds, no errors
```

Verified with a scripted Playwright pass (Chromium) against the production
build (`npm run preview`):
- No console errors/warnings, no page errors, at any point in the audit.
- KR/EN: default `ko`, every section heading + aria-label + image-placeholder
  label + footer chrome + contact form (labels, 9 dropdown options,
  disclosure note) switches to `en` on toggle and back to `ko` correctly;
  `<html lang>` follows; reload after switching to `en` preserves it
  (localStorage persistence confirmed); scanned full page text for stray
  Hangul while `en` is active — none found outside intentional Latin-script
  brand names.
- Responsive: 1440/1024/768/390px all show zero horizontal overflow and
  zero DOM elements extending past the viewport edge (scripted full-DOM
  bounding-box scan, not just a visual spot check). Impact metric values'
  `scrollWidth === clientWidth` at every breakpoint (no numeral clipping).
  Hero headline never exceeds its container width at any breakpoint.
  Career timeline renders all 7 entries at every breakpoint. Nav/hamburger
  correctly swap at the 768px breakpoint. Footer grid: 3 columns down to
  1024px, 1 column at 768px and 390px.
- Full interaction re-test (see above) — all pass.

## Phase 1-E — Gallery / Final CTA / Contact / Footer

**Status: complete.**

Scope was the Gallery/Visual Story section, the Contact section's Final
CTA + full inquiry form, and the site Footer. This completes the visual
design of every Phase 1 section in the Master Specification — the full
page now flows Header → Hero → Impact → About → Case Studies → Advisory →
Career → Gallery → Contact → Footer.

### What was built

- `src/sections/Gallery.jsx` redesigned (+ `Gallery.css`) — an editorial
  grid (4 columns desktop, 2 tablet, 1 mobile) with per-item aspect ratio
  and an optional 2-column `wide` span, so tile size/shape varies instead
  of a uniform photo grid. Fully driven by `profile.js` `gallery` — going
  from the current 6 entries to 10+ needs no component change, and an
  entry with no `aspect`/`wide` still renders correctly (defaults apply).
  All 6 entries currently render through `ImagePlaceholder` (no real
  photography yet).
- `src/components/ContactForm.jsx` (+ css) — Name / Company / Email /
  Type of Inquiry / Message fields (inquiry options from `profile.js`
  `inquiryTypes`, unchanged from earlier phases). No backend exists, so
  submitting builds a `mailto:` link from the field values (subject +
  body, localized labels) and hands off to the visitor's email app —
  there is no "message sent" confirmation anywhere, and a visible note
  under the submit button states plainly that sending still happens in
  the visitor's own email app. Verified end-to-end with Playwright: the
  constructed `mailto:` URL carries all 5 fields correctly, and no
  success-style text appears on the page after submitting.
- `src/sections/Contact.jsx` rewritten (+ `Contact.css`) — a Final CTA
  block (headline + "Start a Conversation" / "대화 시작하기" button, both
  already existed in `profile.js` `contactCta` from Phase 1-A) whose
  button click focuses the form's first field (verified: the `name` input
  receives focus on click); contact info (working `mailto:`/`tel:` links,
  unchanged) alongside the new `ContactForm`.
- `src/components/Footer.jsx` (+ css) — dark navy band (matches the
  mobile-menu panel treatment already established in Header) with:
  `LEO BUSINESS ADVISORY` brand + tagline linking to `#top`, Navigation
  (reads `navigation.js`, the same single source of truth as the header),
  Contact info (live `mailto:`/`tel:` links), a dynamic-year copyright
  line, and a dedicated "Back to top" / "맨 위로" link in addition to the
  logo (both go to `#top`, matching the spec's explicit "Top 이동 기능"
  item). Mounted in `App.jsx` after `<main>`.
- `src/data/profile.js` — additive only:
  - `gallery` populated with 6 placeholder entries (`aspect`, `wide`)
    named after already-documented ventures (Samsonite Korea, Samsonite
    RED, TravelDepot, RCC · Rawrow · Nautica, LEOHOLDINGS · Just Craft,
    plus a "LEO Portrait" slot) — no new facts, just reusing entity names
    already verified against the source document in earlier phases.
  - `gallerySection` gained `eyebrowKo`/`eyebrowEn` (moved the old
    "비주얼 스토리"/"VISUAL STORY" text here) and new `titleKo`/`titleEn`
    ("기록으로 남은 순간들" / "Moments Along the Way") — the source
    document has no gallery section, so this is placeholder UI copy as
    before, just split into eyebrow + heading like every other section.
  - `contact.infoLabelKo`/`infoLabelEn` (new): "연락처" / "Contact Details".
  - `contactForm` (new): field labels, inquiry-type placeholder, submit
    button text, and the mailto-disclosure note — all bilingual.
  - `footer` (new): copyright phrase and "back to top" link text.
  - No existing fact (career years, case-study figures, advisory items,
    contact email/phone) was touched.

### Deliberately NOT built yet (by scope, not oversight)

- Active-nav-on-scroll highlighting in the header.
- Scroll-reveal animation (opacity/translateY on scroll).
- Real photography (all 14 image slots — Hero, Profile portrait, 6 case
  studies, 6 gallery items — still render via `ImagePlaceholder`).
- GitHub Pages `base` path / custom domain deployment config.
- SEO OpenGraph/JSON-LD.

### Test results

```
npm run lint  → passes, 0 warnings/errors
npm run build → succeeds, no errors
```

Verified with a scripted Playwright pass (Chromium) against the production
build (`npm run preview`):
- No console errors/warnings, no page errors, at any point below.
- Gallery renders all 6 items with correct captions.
- Final CTA button click moves focus to the Contact form's `name` field.
- Email (`mailto:leosuh00@gmail.com`) and phone (`tel:+821090332237`)
  links confirmed on both the Contact section and the Footer.
- Contact form: filled every field, submitted, and captured the resulting
  `mailto:` request — subject and body contain all 5 field values with
  localized labels; confirmed no "sent"/"submitted successfully"-style
  text appears anywhere on the page after submitting (regex-checked the
  full page text in both languages).
- Footer: nav hrefs match `navigation.js` exactly, logo and the dedicated
  "Back to top" link both go to `#top`, copyright renders with the live
  year.
- Full-page regression: Header nav hrefs, Hero CTA hrefs, Impact metric
  values, About heading, Case Study tag count (6), Advisory item count
  (8), and Career entry count (7) all unchanged from Phase 1-D.
- All 14 image slots across the whole page fall back to `ImagePlaceholder`
  correctly after scrolling into view — 0 visibly broken `<img>` icons.
- No horizontal overflow at 1440 / 1024 / 768 / 390px.
- Mobile hamburger menu still opens and closes (ESC) correctly.
- KR/EN toggle switches Gallery heading/captions, Contact headline/CTA/
  form labels/disclosure note, and Footer tagline/nav/copyright/back-to-top
  simultaneously with the rest of the page — no partial switch.

## Phase 1-D — Advisory / Career

**Status: complete.**

Scope was the full visual design of the Advisory section and the Career
timeline. Gallery, Contact, and Footer remain out of scope (still
structural shells, or not yet built).

### What was built

- `src/sections/Advisory.jsx` redesigned (+ `Advisory.css`) — an
  editorial numbered index (01–08) instead of a card grid: two columns on
  desktop/tablet, one column on mobile, each row separated by a hairline
  rule. Fully data-driven from `profile.js` `advisory.items` — a 9th item
  (or a future description/case-reference field on an item) needs no
  layout change. Reuses the `SectionTitle` component from Phase 1-C for
  heading consistency.
- `src/sections/Career.jsx` redesigned (+ `Career.css`) — a vertical
  timeline: a continuous spine line with a bronze marker dot per entry,
  period as a small kicker above a serif role heading and the company
  name below. One consistent structure serves both breakpoints (no
  DOM reshuffling between desktop/mobile) — desktop gets generous
  `--space-lg`/`--space-2xl` vertical rhythm, mobile keeps the same clear
  single-line spine at tighter spacing. Chosen deliberately over a
  résumé-style plain list so scale/seniority reads through typography
  (large serif role titles) rather than a dense text block.
- `src/data/profile.js`:
  - **Corrected `advisory.items` EN wording to match the source document
    exactly** — found during this phase's required re-verification.
    Previous text had added words not in the document ("Growth **strategy**
    & turnaround" → "Growth and turnaround"; "New ventures **&**..." → "New
    ventures **and**..."; "Product / pricing / channel **strategy**" →
    "Product/pricing/channel"; "Licensing **&**..." → "Licensing **and**...";
    "P&L / organization..." spacing → "P&L/organization..." (no spaces, per
    doc); "Founder **&**..." → "Founder **and**..."). The Korean item that
    read "라이선싱 및 **전략적** 파트너십" had an inserted word not in the
    source document's own KR list ("라이선싱 및 파트너십") — corrected.
    Added a stable `id` to each item (was keying off the English string).
  - `advisory.eyebrowKo` / `advisory.eyebrowEn` (new): "자문 영역" /
    "HOW I CAN HELP" — satisfies this phase's request for a "HOW I CAN
    HELP"-equivalent title while keeping the document's own heading
    ("핵심 자문 영역" / "ADVISORY FOCUS") as the actual `<h2>`.
  - `careerSection.eyebrowKo` / `careerSection.eyebrowEn` (new): "경력
    타임라인" / "CAREER TIMELINE" — short non-factual UI copy.
  - `career` array itself: unchanged — re-verified word-for-word against
    the source document (see below) and already correct.

### Facts re-verification (per this phase's explicit instruction)

Re-extracted `word/document.xml` from the original
`Leo_Business_Advisory_Founder_Profile_KR_EN.docx` and diffed against
`src/data/profile.js`:

- **Career**: all 7 entries' years, roles, and company names match the
  document's "EXECUTIVE CAREER" / "주요 경력" list exactly, including the
  "concurrent Korea leadership" / "한국 대표 겸임" note on the 2013–2015
  entry. No changes needed.
- **Advisory**: title matches the document exactly. Item wording had
  drifted from the document in 6 of 8 English items and 1 of 8 Korean
  items (see above) — corrected to match verbatim; the underlying menu of
  8 advisory areas itself was already correct and unchanged.

### Deliberately NOT built yet (by scope, not oversight)

- Gallery, Contact, Footer visual design.
- `ContactForm.jsx`.
- Active-nav-on-scroll highlighting, scroll-reveal animation.
- Real photography (all 8 image slots still render via `ImagePlaceholder`
  — Advisory/Career have no image slots by design, matching the source
  document, which has none for these sections either).

### Test results

```
npm run lint  → passes, 0 warnings/errors
npm run build → succeeds, no errors
```

Verified with a scripted Playwright pass (Chromium) against the production
build (`npm run preview`):
- No console errors/warnings, no page errors, at any point below.
- Advisory renders all 8 items with the corrected text, numbered 01–08.
- Career renders all 7 entries in order with correct period/role/company.
- Regression check: Header nav hrefs, Hero CTA hrefs, Impact metric
  values, and Case Study tag count all still correct — nothing in Phase
  1-B/1-C broke.
- No horizontal overflow at 1440 / 1024 / 768 / 390px.
- Mobile hamburger menu still opens and closes (via nav-link click) correctly.
- KR/EN toggle switches Advisory heading + first item, and Career heading
  + first role, simultaneously with the rest of the page; toggling back to
  KR restores both correctly — no partial switch introduced by the new
  sections.

## Phase 1-C — Impact / Profile / Selected Impact

**Status: complete.**

Scope was the full visual design of the Impact section, the Profile/About
section, and the Selected Impact case-study list — the three sections
covering the "Results" and "Credibility" part of the site flow. Advisory,
Career, Gallery, Contact and Footer remain out of scope (still structural
shells, or not yet built).

### What was built

- `src/components/SectionTitle.jsx` (+ css) — shared eyebrow + heading
  pattern (small bronze uppercase kicker over a large serif heading),
  matching the treatment Hero already established in Phase 1-B. Used by
  Impact, Profile, and CaseStudies so heading typography stays consistent
  without each section re-implementing it.
- `src/components/ImpactMetric.jsx` (+ css) — one headline figure: a
  hairline rule, a large `clamp()`-sized number, and a label. Deliberately
  not a bordered/shadowed card.
- `src/sections/Impact.jsx` redesigned (+ `Impact.css`) — 4-column grid on
  desktop, 2-column from 1024px down (spec's "Tablet: 2 Column" and
  "Mobile: 1~2 Column" — 2 columns reads better than 1 for four short
  figures and was verified not to overflow or crowd at 390px). Renders the
  same four `profile.js` `impact` entries as before (8× Samsonite Korea
  growth, KRW 100B+ Samsonite RED sales, USD 1B APAC & ME P&L, 20+ markets)
  — no data changed, only the layout.
- `src/sections/Profile.jsx` redesigned (+ `Profile.css`) — Executive
  Introduction layout: portrait + eyebrow + headline + bio, text/image
  side-by-side on desktop (image right, per spec's "Desktop: Text + Image"
  reading order), image stacked above text from 1024px down (spec's
  "Mobile: Image → Text"). Long-form bio keeps the existing `.long-copy`
  max-width/line-height treatment from the global stylesheet.
- `src/components/CaseStudy.jsx` (+ css) — the editorial case-study unit.
  Media and text sides alternate per case (`reverse` prop, odd-indexed
  cases flip), the flagship case (Samsonite Korea, index 0) gets a larger
  title via an `emphasis` modifier, and a case with no metrics (LEOHOLDINGS)
  automatically renders its summary as a larger serif pull-statement
  instead of an empty metrics row (`case-study--statement`) — verified by
  computed style (25.6px serif vs. 16px sans-serif for the metric cases).
  Cases are separated by a hairline rule, not card borders/shadows.
- `src/sections/CaseStudies.jsx` rewritten to map `profile.js`
  `caseStudies` through `CaseStudy`, resolving KR/EN text before handing
  it down (the component itself has no language logic).
- `src/data/profile.js` — additive only, no existing fact/value changed:
  - `impactSection` (new: short non-factual eyebrow/heading copy for the
    Impact section — the source document has no heading of its own here).
  - `about.eyebrowKo` / `about.eyebrowEn` (new keys on the existing `about`
    object): "이그제큐티브 프로필" / "EXECUTIVE PROFILE".
  - `caseStudies[1].highlights` (Samsonite RED only): Concept / Product /
    Pricing / Distribution / Marketing, in both languages — taken directly
    from that case's own summary sentence in the source document, not
    invented.
  - All existing `caseStudies` facts (case numbers, KRW/USD/market figures,
    dates, entity names) were re-checked word-for-word against the source
    document before writing any component and are unchanged — see the
    facts note below.

### Facts re-verification (per this phase's explicit instruction)

Re-extracted `word/document.xml` from the original
`Leo_Business_Advisory_Founder_Profile_KR_EN.docx` and diffed every case's
numbers/wording against `src/data/profile.js`:

- Case 01 Samsonite Korea (KRW 30B → KRW 240B, 8× growth, 2018 EBITDA
  KRW 53B / 22% margin) — matches document exactly.
- Case 02 Samsonite RED (opportunity → KRW 100B+ Asian brand,
  concept/product/pricing/distribution/marketing) — matches.
- Case 03 Asia Pacific & Middle East (USD 1B P&L, 20+ markets, 38% growth
  2013–2015) — matches.
- Case 05 RCC · Rawrow · Nautica (-2% → +19% within 4 months) — matches.
- Case 06 TravelDepot (8,000㎡, 88 brands, 2,300+ SKUs, 4 months) — matches.
- **LEOHOLDINGS was kept as Case 04.** This phase's instructions re-listed
  the Master Specification's original 5-case example (which predates the
  source document and omits LEOHOLDINGS); the source document itself lists
  LEOHOLDINGS as one of its six "Selected Career Impact" / "주요 경영 성과"
  entries. Per CLAUDE.md ("Founder Profile document wins" on any conflict,
  and "never invent or estimate — or drop verified facts") this real,
  documented entry was kept rather than removed to match the older
  5-case example. This was already the Phase 1-A decision; Phase 1-C only
  re-confirmed it against the document rather than changing it.

### Deliberately NOT built yet (by scope, not oversight)

- Advisory, Career, Gallery, Contact, Footer visual design.
- `CareerTimeline.jsx`, `ContactForm.jsx`.
- Active-nav-on-scroll highlighting, scroll-reveal animation.
- Real photography (all 8 image slots — Hero, Profile portrait, and 6 case
  studies — still render via `ImagePlaceholder`).

### Test results

```
npm run lint  → passes, 0 warnings/errors
npm run build → succeeds, no errors
```

Verified with a scripted Playwright pass (Chromium) against the production
build (`npm run preview`):
- No console errors/warnings, no page errors, at any point below.
- Impact renders all 4 metrics with correct values (`8×`, `KRW 100B+`,
  `USD 1B`, `20+개국`).
- About (`#about`) heading and Hero/nav both still resolve correctly —
  Header/Hero/Navigation from Phase 1-B unaffected.
- CaseStudies renders exactly 6 cases with tags `CASE 01`–`CASE 06` and the
  correct titles, in order.
- All 8 image slots (Hero, Profile portrait, 6 case studies) fall back to
  `ImagePlaceholder` correctly after scrolling them into view (lazy-loaded)
  — 0 visibly broken `<img>` icons.
- No horizontal overflow at 1440 / 1024 / 768 / 390px.
- Mobile hamburger menu still opens/closes (incl. ESC) correctly.
- KR/EN toggle switches Impact heading, About heading, and case-study
  title/summary text simultaneously with the rest of the page (e.g. "Impact
  at a Glance" / "30+ Years of Building, Scaling and Transforming Brands."
  in EN) — no partial switch introduced by the new sections.

## Phase 1-B — Header / Hero / Navigation

**Status: complete.**

Scope was Header (desktop + mobile nav, sticky behavior, logo, KR/EN
toggle), the Hero section's full visual design, and making CTA/nav links
actually work end to end. Visual design of Impact, Profile, CaseStudies,
Advisory, Career, Gallery, Contact remains out of scope (still structural
shells from Phase 1-A).

### What was built

- `src/context/languageContext.js` + `src/context/LanguageContext.jsx` —
  site-wide `language` state (`'ko' | 'en'`, default `'ko'`), persisted to
  `localStorage` with try/catch (site still works if storage throws), and
  a `t(koValue, enValue)` helper. Split into two files to keep Vite Fast
  Refresh happy (a component file may only export components) — zero lint
  warnings.
- `src/components/LanguageToggle.jsx` (+ css) — reusable KR/EN switch,
  used in the header; wired to the shared context so it can't drift out of
  sync with any other consumer.
- `src/components/Header.jsx` (+ css) — sticky header; logo links to
  `#top` (the Hero section's id); desktop nav rendered from
  `navigation.js`; background/border appear once `window.scrollY > 8`;
  mobile hamburger menu with open/close, section-link-click auto-close,
  `Escape` to close, outside-click to close, and a body-scroll lock while
  open (all verified with Playwright, see Test Results below).
- `src/sections/Hero.jsx` (+ css) — full visual design: name, eyebrow
  (title · positioning), 3-line headline, subhead, two CTA buttons
  (`Explore Experience` → `#impact`, `Discuss a Project` → `#contact`),
  and a large hero image area using the existing `ImagePlaceholder`
  system (`images.hero`, currently no file so it shows the "LEO Portrait"
  placeholder — correct, no broken-image icon). Headline uses `clamp()`
  so it doesn't overflow on mobile; image moves above text on tablet/mobile.
- `src/styles/global.css` — added `.btn`/`.btn--primary`/`.btn--secondary`
  shared button styles (System-level, reusable by future CTAs) and
  `scroll-behavior: smooth` (disabled under `prefers-reduced-motion`).
- All other section shells (`Impact`, `Profile`, `CaseStudies`,
  `Advisory`, `Career`, `Gallery`, `Contact`) updated to read text through
  the same `t()` helper instead of hardcoded English, so the KR/EN toggle
  switches the **entire visible page** at once — required by CLAUDE.md's
  "no partial switch" rule. This did not change their layout/markup, only
  which language string each already-existing field renders.
- `src/data/profile.js` — additive only: three new heading-metadata
  exports (`caseStudiesSection`, `careerSection`, `gallerySection`), the
  first two using the source document's own section headings ("주요 경영
  성과" / "SELECTED CAREER IMPACT" and "주요 경력" / "EXECUTIVE CAREER").
  No existing export was restructured or renamed.
- `src/App.jsx` — now renders `<Header />` before `<main>`.
- `src/main.jsx` — wraps `<App />` in `<LanguageProvider>`.

### Deliberately NOT built yet (by scope, not oversight)

- `Footer.jsx` (not requested for this phase).
- `ContactForm.jsx` and any visual design for Impact, Profile,
  CaseStudies, Advisory, Career, Gallery, Contact.
- Active-nav-on-scroll highlighting, scroll-reveal animation.
- Real photography (Hero and all other image slots still render via
  `ImagePlaceholder`).

### Test results

```
npm run lint  → passes, 0 warnings/errors
npm run build → succeeds, no errors (see console output in commit history)
```

Verified with a scripted Playwright pass (Chromium) against the production
build (`npm run preview`):
- No console errors/warnings, no page errors, on any check below.
- Desktop nav hrefs: `#about #impact #advisory #career #contact` — all
  match `navigation.js` ids exactly; logo href is `#top` (Hero's id).
- Hero CTA hrefs: `#impact` and `#contact`, confirmed.
- Clicking each desktop nav link scrolls to that section; the last three
  sections (`advisory`/`career`/`contact`) currently sit at the very
  bottom of a short, unstyled-content page, so the browser can't scroll
  further once it hits the document's bottom edge — expected given their
  placeholder content height, not a navigation defect, and resolves
  naturally once those sections get real layout.
- Mobile (390px): desktop nav hidden, hamburger visible; opening the menu
  sets `body { overflow: hidden }`; `Escape`, an outside click, and
  clicking a nav link (which also scrolls to the section) all remove the
  menu; no horizontal overflow at 390px.
- Header gains the `header--scrolled` class (background/border) after
  scrolling past 8px, and loses it back at the top.
- 1024px: desktop nav visible, hamburger hidden. 768px: desktop nav
  hidden, hamburger visible. No horizontal overflow at either width.
- Language toggle: default language is `ko` (confirmed `<html lang="ko">`
  and Korean text everywhere — nav, Hero name/headline/CTAs, Impact
  heading, Career heading). Clicking `EN` switches **every** checked
  element to English simultaneously (including `<html lang="en">`).
  Reloading the page after switching to `EN` preserves `EN` (localStorage
  persistence confirmed). Switching back to `KR` restores Korean
  everywhere.

## Phase 1-A — Working Foundation Scaffold

**Status: complete.**

Scope was structure only: project skeleton, folder layout, data schema, CSS
design tokens, and minimal section shells wired into `App.jsx` so the app
builds and every section id exists. Visual design of individual sections
was explicitly out of scope for this phase.

### What was built

- Vite + React (JS) project scaffolded at the repo root.
- Folder structure: `src/components`, `src/sections`, `src/data`,
  `src/styles`, `public/images`.
- `src/data/navigation.js` — single source of truth for nav items
  (about / impact / advisory / career / contact).
- `src/data/profile.js` — full content schema populated with real content
  from the Founder Profile source document (KR + EN): person/contact info,
  hero copy, impact metrics, about bio, 6 selected-impact case studies,
  advisory focus items, career timeline, education, empty gallery array,
  contact CTA, inquiry types, and the image path registry.
- `src/styles/variables.css`, `global.css`, `responsive.css` — color
  system, spacing scale, container, base resets, focus states,
  `scroll-margin-top` on all sections.
- `src/components/ImagePlaceholder.jsx` — reusable image component with
  real `onError` fallback to a labeled placeholder (no broken-image icons).
- `src/sections/*.jsx` — one shell per section (Hero, Impact, Profile,
  CaseStudies, Advisory, Career, Gallery, Contact), each with the correct
  `id`, reading real copy from `profile.js`, mounted in `App.jsx`. Hero CTA
  links already point to real anchors (`#impact`, `#contact`); Contact
  section's email/phone links are already live `mailto:`/`tel:` links.
- `CLAUDE.md` — permanent project instructions distilled from the Master
  Specification.
- `README.md` — basic run/build instructions and where to edit content.
- `npm run build` verified passing (see below).

### Deliberately NOT built yet (by scope, not oversight)

- `Header.jsx`, `Footer.jsx`, `LanguageToggle.jsx`, `SectionTitle.jsx`,
  `ImpactMetric.jsx`, `CaseStudy.jsx`, `CareerTimeline.jsx`,
  `ContactForm.jsx` — no header/nav/footer chrome exists yet, so there is
  no sticky header, mobile hamburger menu, or KR/EN language switching yet.
- No visual layout/design for any section (currently plain unstyled
  semantic HTML reading from data).
- No scroll animations (IntersectionObserver).
- No active-nav-on-scroll behavior.
- No real photography (all image slots correctly fall back to
  `ImagePlaceholder`).
- No GitHub Pages `base` path / custom domain config (deferred until real
  images exist, per `CLAUDE.md`).
- No SEO OpenGraph/JSON-LD (basic `<title>`/`<meta description>` only).

### Build verification

```
npm run build
```
Result: succeeded, no errors. (Re-run and update this note if the result changes.)

### Phase 1-C, 1-D, 1-E, 1-F and 1-G are documented above — PHASE 1 COMPLETE.

### Phase 2 (not started — do not begin without explicit instruction)

Phase 1 delivered the complete, QA'd, bilingual Phase 1 site. Candidate
Phase 2 scope, none of it started:

1. Active-nav-on-scroll (IntersectionObserver) highlighting the current
   section in the header nav as the visitor scrolls.
2. Subtle scroll-reveal animation (opacity/translateY on scroll into
   view), content visible by default if JS fails.
3. GitHub Pages deployment (`vite.config.js` `base`, a `CNAME` file for a
   custom domain — see `README.md`'s deployment section for the exact steps).
4. Swapping the contact form from `mailto:` to a real backend (e.g.
   Formspree) — see `README.md`'s Contact form section.
5. `og:image`/`og:url` once real photography and a deployed URL exist.
6. Real photography (drop files into `public/images/`, update the
   relevant paths in `src/data/profile.js`) and any further copywriting
   polish — owner-driven inputs, not something to schedule as a phase.

Content editing locations (no code changes needed):
text → `src/data/profile.js`, nav/menu → `src/data/navigation.js`, photos →
`public/images/`, colors → `src/styles/variables.css`.
