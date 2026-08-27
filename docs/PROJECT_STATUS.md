# Project Status

## Phase 3-G — Admin Data-Loss Prevention & Recovery

**Status: complete.** Public Website design unchanged — the only
public-facing code touched is `src/lib/content/gallery.js` (a filter
excluding soft-deleted rows, not a design/layout change, and necessary
for the soft-delete feature to actually work on the public site). See
`docs/BACKUP_RECOVERY.md` for the full design writeup; this entry is a
summary.

**Backup strategy:** documented as two layers — Supabase's own
infrastructure-level backups (Dashboard-configured, outside this repo,
protects against catastrophic loss) and a new application-level
`content_revisions` table (self-service, protects against the much more
common single-admin-mistake case). Not a replacement for real database
backups, a faster complement to them.

**Revision system:** new `content_revisions` table
(`supabase/migrations/0006_content_revisions.sql`) — one generic table,
not 14 per-table ones. Wired centrally into
`src/admin/content/supabaseTable.js`'s `upsertSingleton`/`saveListRow`/
`upsertByNaturalKey`, so every content section (Hero, About, Impact, Case
Studies, Advisory, Career, Contact, plus Education/Footer as a side
effect of centralizing rather than special-casing) gets a pre-write
snapshot automatically, with no per-section code changes needed. A
SECURITY DEFINER trigger caps retention at the 10 most recent snapshots
per row. Snapshot recording is best-effort — never blocks a real save on
failure.

**Restore flow:** new admin "Revisions" screen (nav item + "변경 기록"
Dashboard card) — lists recent changes with a plain-language label,
timestamp, an expandable field-level preview, and a 복원 (restore)
button that writes immediately and snapshots the pre-restore state first
(so restoring is itself undoable). Verified live end to end: edited
Hero's subhead, saved, confirmed the revision recorded the *old* value
(not the new one), restored it, confirmed the live form reflected the
old value again.

**Delete protection:** Gallery photos gained real soft delete
(`supabase/migrations/0007_gallery_soft_delete.sql`'s `deleted_at`
column) — "삭제" now moves a photo to a Trash section (immediate write,
same pattern as Inquiries' status changes) instead of permanently
removing it; Trash offers 복원 (restore) or a separate, explicitly
irreversible 영구 삭제 (permanent delete). The public gallery read policy
is tightened to `deleted_at is null` at the RLS level, plus a client-side
filter in `gallery.js` as a second, independently-testable layer (RLS
itself can't be exercised against this repo's local mock-backend tests).
No other admin section has a delete control at all currently (confirmed
by grep), so nothing else needed this treatment.

A real bug was found and fixed via live testing during this phase: the
first Trash implementation left `savedItems`/the reset snapshot out of
sync after an immediate soft-delete/restore, so the Gallery editor
incorrectly showed an "unsaved changes" badge for an action that was
already persisted. Fixed by updating that bookkeeping alongside every
immediate-write action, not just the draft `items` array.

**Storage strategy:** reviewed and changed, per this phase's explicit
question — replacing an image (Hero/About/Case Study slots, Gallery
photos) or clearing a slot no longer deletes the previous media
row/Storage file immediately; it's left orphaned but recoverable, at the
cost of Storage slowly accumulating replaced images over time. Verified
live: replacing a Hero image and a Gallery photo both leave the old
`media` row intact afterward. `ImageSlotEditor.jsx`'s "이미지 삭제"
button/confirm text was renamed to "이미지 제거" with accurate copy (no
longer claims the file is deleted, since it no longer is).

**Build:** `npm run lint` and `npm run build` both pass with zero errors.

## Phase 3-F — Custom Domain Readiness (Audit + Documentation Only)

**Status: complete. Zero production files changed** — no real domain was
provided this phase, and the phase's own explicit instruction is not to
change production config without one. This was an audit + documentation
phase: `git diff` against every file except the new
`docs/CUSTOM_DOMAIN_SETUP.md` and this entry is empty.

**Full audit — every location that hardcodes the current GitHub Pages
subpath (`/leo-business-advisory/`) or its full URL
(`https://leafdraw282-oss.github.io/leo-business-advisory/`), found by
grepping the entire repo (excluding `dist/`, `node_modules/`):**

- `vite.config.js` — `base: '/leo-business-advisory/'`.
- `index.html` — **10 occurrences**: `canonical`, `og:url`, `og:image`,
  `twitter:image`, and 6 more inside the JSON-LD `@graph` block (Person's
  `@id`/`url`/`worksFor` reference, ProfessionalService's
  `@id`/`url`/`founder` reference).
- `public/robots.txt` — the `Sitemap:` line only. `Disallow: /admin/` is
  already domain-root-relative and needs **no** change — it becomes
  correct (not more or less correct than today) once serving from `/`.
- `public/sitemap.xml` — the one `<loc>` entry.
- `public/404.html` — the favicon `<link>` and the "back to home" `<a>`
  href. This file is a plain static passthrough (not run through Vite's
  build pipeline), so unlike everywhere else, these two can't pick up a
  `base` change automatically — they're hardcoded strings and always will
  be, whichever domain is active.
- `public/CNAME` — doesn't exist yet; required to be created (just the
  domain name) once a domain is chosen.

**Confirmed to need NO change** — already domain-agnostic:
`.github/workflows/deploy.yml` has no hardcoded path or domain anywhere
(`actions/configure-pages`/`upload-pages-artifact`/`deploy-pages` all
work identically regardless of custom domain); `admin/index.html`'s
favicon reference is already root-relative with no absolute URL;
`src/admin/pages/Dashboard.jsx`'s two "site link" hrefs already read
`import.meta.env.BASE_URL`, which follows `vite.config.js`'s `base`
automatically.

**A real bug found during this audit, not fixed (out of this phase's
scope — flagged, not touched):** `src/data/profile.js`'s `images` map
(`hero: '/images/hero.jpg'`, etc., consumed by `src/lib/content/hero.js`,
`about.js`, `caseStudies.js`) stores root-relative paths with no
`import.meta.env.BASE_URL` prefix — confirmed by grepping the built
bundle, the literal unprefixed string `/images/hero.jpg` ships as-is. This
is currently invisible only because no real photo files exist yet at
those paths (`ImagePlaceholder`'s error fallback hides a 404 exactly the
same as "no image configured" — same visual result either way). **Once
real photos are added while still on the current project-subpath
deployment, these would 404** (the browser would request
`.../images/hero.jpg` from the domain root, missing the
`/leo-business-advisory/` prefix). This bug happens to fix itself
automatically once migrated to a custom domain serving from `/` — see
`docs/CUSTOM_DOMAIN_SETUP.md`. Flagged in this phase's report; not fixed
here, since it's outside this audit-only phase's scope and touches
`profile.js`/content-layer code, not domain config.

**Also confirmed as a genuine (not cosmetic) benefit of migrating:**
`public/robots.txt` and `public/sitemap.xml`, served today from
`https://leafdraw282-oss.github.io/leo-business-advisory/robots.txt`,
are **not at the standard location** crawlers check (that's
`https://leafdraw282-oss.github.io/robots.txt` — the true origin root,
which for a GitHub Pages *project* site belongs to a different site
entirely, or nothing). This isn't a Phase 3-D mistake — there was no way
to serve robots.txt/sitemap.xml from the real root under a subpath
deployment; it's an inherent limitation of project-subpath GitHub Pages
that only a custom domain (serving from `/`) actually resolves.

**Documentation:** new `docs/CUSTOM_DOMAIN_SETUP.md` — a 10-step
beginner-oriented guide (domain purchase → GitHub Pages custom domain
setting → DNS → the repo `CNAME` file → HTTPS → `vite.config.js` →
`index.html` → sitemap/robots → deploy → verification), plus a quick-
reference table of exactly what needs editing versus what's already
domain-agnostic. Every domain reference in the doc uses the placeholder
`yourdomain.com`, never a real or invented domain.

**Build:** `npm run lint` and `npm run build` both pass with zero errors
(build was also run mid-phase, before any doc was written, purely to
confirm the built bundle's actual content for the `images` map finding
above).

## Phase 3-E — Visitor Analytics (Minimal, Privacy-Safe)

**Status: complete.** No public-site design changed — this phase only
added `src/lib/analytics.js` and wired event calls into existing
interaction handlers.

**Architecture:** `src/lib/analytics.js` mirrors `src/lib/supabase.js`'s
shape exactly — `isAnalyticsConfigured` derived from
`VITE_GA_MEASUREMENT_ID` (Google Analytics 4, via `gtag.js`), with every
other function a safe no-op when unset. No Measurement ID is hardcoded or
invented anywhere; without a real one, `initAnalytics()` does nothing at
all — verified live: no script tag, no `googletagmanager.com` network
request, `window.gtag`/`window.dataLayer` stay `undefined`,
`trackEvent(...)` calls no-op silently with zero errors.

**Events wired** (all via one `trackEvent(name, params)` call, never
called directly against `window.gtag`):
- **Page View** — GA4's own `config` call already sends this by default;
  this SPA has no client-side router/route changes, so no manual
  page_view call is needed anywhere.
- **explore_experience_click** / **discuss_project_click** —
  `src/sections/Hero.jsx`'s two CTA buttons, tracked by their fixed
  primary/secondary role, not their (admin-editable) label text.
- **contact_section_view** — `src/sections/Contact.jsx`, a new
  `IntersectionObserver` (this codebase's first use of it) fires once,
  the first time the section is actually scrolled into view; disconnects
  after firing so it never re-fires.
- **contact_submit** — `src/components/ContactForm.jsx`, fired only after
  `submitInquiry()` actually resolves successfully (Phase 3-C's real
  Supabase insert) — never on a validation failure and never on the
  honeypot's silent no-op path. Verified live: exactly one event, only
  after a genuine success.
- **email_click** / **phone_click** — the `mailto:`/`tel:` links in
  Contact.jsx's info panel.
- **language_change** — `LanguageContext.jsx`'s `changeLanguage` fires
  only on an actual change (clicking the already-active language is a
  no-op, not tracked).

**Privacy enforcement (not just a comment):** `trackEvent`'s
`sanitizeParams` drops any param under the keys `name`, `email`, `phone`,
`message`, or `company` before sending, logging a console warning — this
is a real runtime guard against ever sending visitor-entered content, not
just a documented convention. Every wired call site above passes no
params at all, or only a fixed non-personal value (`language: 'en'|'ko'`).
Verified both via a standalone logic test and live in the browser.

**Performance:** `initAnalytics()` is called from `main.jsx` via
`requestIdleCallback` (a short `setTimeout` fallback for browsers without
it), after the initial render already kicked off — so loading analytics
never competes with first paint. The injected `gtag.js` script tag itself
carries `async` (verified in the DOM). When unconfigured, there is no
script, no request, and no measurable cost at all. Bundle size impact of
`analytics.js` itself: ~0.4KB gzipped.

**Build:** `npm run lint` and `npm run build` both pass with zero errors.
One real bug was found and fixed via live testing during this phase: the
first `language_change` wiring put the `trackEvent` call inside a
functional `setState` updater, which React's `StrictMode` (development
only) double-invokes — causing every real language change to fire the
event twice in `npm run dev`. Fixed by comparing against the current
`language` from the component's closure instead (via `useCallback`), so
the side effect runs exactly once per real change; confirmed live.

## Phase 3-D — SEO, Structured Data & Sharing Metadata

**Status: complete.** No public-site design, layout, or page copy was
changed — this phase only touched `index.html`'s `<head>` and added new
`public/` files (robots.txt, sitemap.xml, 404.html, og-image.png).

**SEO tags added to `index.html`** (title/meta description were already
present and unchanged): `<link rel="canonical">`, `<meta name="robots"
content="index, follow">`, `<meta name="theme-color" content="#0b1625">`
(reuses the existing navy brand token, not a new color), `og:url`,
`og:image` (+ width/height/alt), and a full Twitter/X Card block
(`summary_large_image`). All new absolute URLs are hardcoded to this
repo's GitHub Pages project URL (`https://leafdraw282-oss.github.io/leo-business-advisory/`)
— every one of them needs updating together if a custom domain is ever
configured, same as the README's existing custom-domain checklist
(`vite.config.js`'s `base`, image paths).

**Structured data:** the existing Person JSON-LD was verified field-by-field
against `src/data/profile.js` — already accurate, unchanged. Restructured
into a `@graph` with a linked **ProfessionalService** entity for "LEO
BUSINESS ADVISORY" (name, url, email, telephone, address, description,
`founder` reference back to the Person) — every field is a direct pull
from `profile.js`'s `site`/`person`/`contact` exports. No award, review,
rating, employee count, or founding date was added anywhere, since none of
those are stated facts in the Founder Profile source document.

**robots.txt / sitemap.xml:** new `public/robots.txt` allows everything
except `/admin/` (which also already carries its own page-level `noindex`
meta — this is the crawl-level layer on top of that), and points to the
new sitemap. `public/sitemap.xml` lists a single URL — the site's one page
— since this is an anchor-navigated SPA with no separate routes; in-page
anchors (`#hero`, `#about`, etc.) aren't separate crawlable documents and
don't belong in a sitemap.

**KR/EN duplicate-content check:** confirmed no duplicate-content risk —
the language toggle is client-side state on one single URL (no `/en/` or
`/ko/` routes), so there is only ever one canonical document for search
engines to index; the new `<link rel="canonical">` reinforces that. No
`hreflang` tags were added, since those describe *separate* URLs serving
equivalent content, which doesn't apply here — and per this phase's
explicit instruction, no multi-language routing was added to make it
apply.

**Sharing preview:** since no real photography exists yet, generated
`public/og-image.png` (1200×630, exact OG/Twitter-recommended size) — a
brand-colored graphic (navy/bronze/ivory, the existing design tokens)
built entirely from already-approved copy (person name, title, site name
from `profile.js`), in the same spirit as `ImagePlaceholder`'s "never a
broken/blank state" pattern rather than a decorative fake photo. It's
referenced by `og:image`/`twitter:image`; swapping in real photography
later only means replacing this one file (keep it 1200×630) — the meta
tags don't need to change.

**404 / direct-access check:** verified against a local static-file server
that mimics GitHub Pages' behavior (project subpath + real 404 for
unmatched paths, no SPA rewrite). Direct access to `/` and `/admin/`
returns 200 (both are real built HTML files — Vite's multi-page-app
setup). Direct access to any other path correctly returns HTTP 404; new
`public/404.html` gives that a branded page (bilingual, matches the site's
navy/bronze palette) instead of GitHub's generic default, with a working
link back home. This is **not** the common "copy index.html to 404.html"
SPA-rewrite trick — this site has no client-side router (confirmed: no
`react-router` dependency, `App.jsx` uses anchor navigation only), so
there's no deep-linkable route for a rewritten index.html to serve; a real
404 for a genuinely nonexistent path is correct here, not a bug.

**Also fixed in passing:** `README.md`'s Contact Form section and file-tree
comment still described the pre-Phase-3-C `mailto:`-only behavior — a
staleness bug left over from that phase, not part of this phase's SEO
scope, but corrected here since it was found during this pass.

**Build:** `npm run lint` and `npm run build` both pass with zero errors.

## Phase 3-C — Contact Form → Real Business Inquiry System

**Status: complete.** The Contact Form now saves directly to Supabase
instead of opening a mailto: link, with a matching admin Inquiries screen.
Public-site design/layout/copy structure is otherwise unchanged; the field
set stayed exactly Name/Company/Email/Type of Inquiry/Message, per this
phase's explicit "don't add fields that increase visitor burden"
instruction.

**Database:** new `inquiries` table
(`supabase/migrations/0005_inquiries.sql`): `id, name, company, email,
phone, inquiry_type, message, status, created_at`. `phone` is nullable and
not yet collected by the form — the column exists so adding an optional
Phone field later needs only a form change, not a migration (Country/Region
would be the same: one nullable column, no architecture change). `status`
defaults `'new'` with a check constraint limiting it to
`new`/`in_progress`/`completed`. Basic length/format checks (email regex,
message ≤ 5000 chars, etc.) are a database-level safety net behind the
form's own validation.

**RLS (the opposite shape from every other table):** anyone can `INSERT`
(and only ever as a fresh `'new'` row — the `with check (status = 'new')`
clause blocks a direct API call from planting an already-`'in_progress'`
row); nobody but an admin (`is_admin()`, the same `admin_users` mechanism
as every other table) can `SELECT`, `UPDATE`, or `DELETE` — there is no
public policy for those at all, so RLS denies them outright. Verified
against a local mock backend (no real Supabase project exists — none has
ever been created for this repo): a real form submission works, but the
mock has no RLS to verify server-side; the policy SQL itself was reviewed
by hand for correctness (see the migration file's comments) and should be
re-verified against the real project once one exists.

**Contact Form UX (`src/components/ContactForm.jsx`, rewritten):**
field-by-field required/format validation with inline Korean/English
messages; a visually-hidden honeypot field that causes a silent no-op (no
insert, no success or error shown — a real visitor can never trigger it,
so no fake-success risk); submit button disabled + relabeled "전송 중…"
while in flight, with a same-tick `submitState === 'submitting'` guard
against a duplicate double-click/double-Enter independent of the
`disabled` attribute (verified live: two rapid clicks produced exactly one
database row). A success message only ever renders after the database
insert actually resolves — never optimistically. A failure keeps every
entered value in place and shows one generic, friendly retry message; the
real underlying error (found live in testing to sometimes be a raw
`TypeError: Failed to fetch`) is logged to the console for debugging, never
shown to the visitor. The mailto:/tel: links in the Contact section's info
panel are untouched and remain the secondary contact method.

**Admin Inquiries:** a new Dashboard-level "Inquiries" nav item and
"문의 관리" shortcut card (`src/admin/pages/Inquiries.jsx`,
`src/admin/content/useInquiries.js`) list every inquiry newest-first;
clicking one expands full detail (name/company/email/type/message/received
time) with a status dropdown (신규/진행 중/완료, writing immediately, no
draft/Save step) and a delete button (confirm-guarded, for removing test
or spam entries) — kept deliberately simple, no filtering/sorting/CRM
features added.

**Test result:** a real inquiry was submitted through the live form
against a local mock Supabase backend, confirmed visible and fully
manageable in the admin Inquiries screen (status change persisted through
a reload), then deleted via the admin's own delete action — no test data
was left behind. This was against the mock only, since (per standing
project constraint) no real Supabase project has been created; the same
flow needs re-running against the real project once one exists.

**Build:** `npm run lint` and `npm run build` both pass with zero errors.

## Phase 3-B — Admin Operational Convenience Pass

**Status: complete. Admin CMS only** — no public-site file
(`src/data/profile.js`, `src/sections/*`, `src/lib/*`, `src/App.jsx`, or
any public CSS) was touched; `git diff` on that set is empty.

**Dashboard:** added a fourth Dashboard-home card, **연락처 관리**, as its
own direct shortcut — Contact was previously reachable only via
Content → its own sub-nav. Clicking it opens the Content tab straight on
the Contact sub-section (`Dashboard.jsx`'s `goToContentSection`, passed
into `Content.jsx` as a new `initialSectionId` prop). Also added a fourth
card, **사이트 바로가기**, so Dashboard now surfaces all of 콘텐츠 관리 /
이미지 관리 / 연락처 관리 / 사이트 바로가기 as equal-weight cards (Logout
stays in the sidebar, always visible). The "최근 저장" panel now shows
Content and Images as two separate rows instead of one merged
most-recent-wins line (`lastSaved.js` now stores a `{area: isoTimestamp}`
map instead of a single record, with the old single-record shape still
read correctly for anyone with existing localStorage data).

**Content editor UX:** `SectionStatus.jsx`'s status text now names the
three states the spec asked for explicitly — "✎ 수정 중" (editing) vs.
"✓ 저장 완료 — 현재 저장된 값입니다" (current saved value) vs. the existing
"저장되지 않은 변경사항" dirty badge — instead of leaving "editing" implicit.
Save-success/failure messaging and duplicate-save prevention
(`disabled={saveState === 'saving' || !isDirty}`) already existed from
Phase 2-F and needed no change; confirmed still correct everywhere.

**Reset (되돌리기), not a factory-reset:** every editor (`useAdminForm`,
`useImageSlot`, `useGalleryImages`) gained a `reset()` that reverts
in-progress edits back to the last value confirmed from the database —
purely local, no network call, no Founder Profile involvement. If nothing
has ever been saved to the database, "the saved value" is whatever
`load()` already returned (which may be the `profile.js` fallback the
site is already showing) — reset never pulls in a separate "original"
value on top of that. This is distinct from the existing "다시 불러오기"
(a real network re-fetch) and, for images, from "이미지 삭제" (which
actually deletes the saved file). Wired into all 9 Content sections, both
single-image slots, and Gallery.

**Image management:** `ImageSlotEditor.jsx` and `GalleryImages.jsx` now
show file size next to file name for a staged upload (e.g. "선택한 파일:
photo.jpg (240 KB)") — previously only the name was shown. The
current-photo-never-lost-before-save behavior (current vs. new-preview
shown side by side, nothing overwritten until Save) was already correct
from Phase 2-D/2-F and is unchanged.

**Gallery active/inactive:** added `is_active boolean not null default
true` to `gallery_items` (`supabase/migrations/0004_gallery_active_flag.sql`,
additive, defaults every existing row to visible) and a per-photo 활성/비활성
checkbox in the admin Gallery editor, so a photo can be hidden without
being permanently deleted. Reordering stays the existing ↑/↓ button
pattern — no drag-and-drop library was added, per the phase's explicit
constraint. **Deliberately admin-side only in this phase:** the public
site's gallery query (`src/lib/content/gallery.js`) was not touched, so
toggling a photo inactive does not yet hide it on the public site — the
admin UI says this next to the checkbox and in the section's help text, so
it's disclosed rather than a silent gap. See "Next Phase 3-C" for the
public-side follow-up.

**Responsive:** re-verified at 390/768/1024/1280px after all of the above
(new 4-card Dashboard grid, the gallery active-toggle row, the added
Reset button in every toolbar) — zero horizontal overflow at any width,
verified via a headless-browser pass, not just CSS review.

**Build:** `npm run lint` and `npm run build` both pass with zero errors.

## Phase 3-A — Content-Readiness & Admin Label Pass

**Status: complete.** No public site design change, no database field
change, no Founder Profile fact change — verified below. Scope was
checking and labeling, not new features.

**Content structure check:** confirmed (by grep, no fixes needed) that
every image renders through `ImagePlaceholder` with a fixed CSS
`aspect-ratio` container + `object-fit: cover` on the `<img>` — already
true site-wide since Phase 1, so any real photo of any dimensions will
always crop to the designed ratio, never distort or blow out layout.
Confirmed no text container anywhere uses `-webkit-line-clamp`, a fixed
`height`, or `white-space: nowrap` on admin-editable content (the one
`nowrap` that exists, `.header__logo`, is the fixed brand name — not
CMS-editable). Stress-tested by injecting far-longer-than-current KR and
EN sentences into Hero headline/subhead, About bio, a Case Study
summary, an Advisory item, a Career role/company, a Gallery caption, and
the Contact form note, across Desktop/Tablet/Mobile: zero horizontal
overflow at any width: text simply wraps and the section grows taller,
which is the correct, expected behavior for a page with no fixed-height
sections.

**Image slot check:** every image area on the public site already has a
1:1 admin counterpart from Phase 2-D (Hero, About/Profile, 6 Case
Studies, Gallery) — confirmed, not newly built. Retitled the admin's
image slots for recognizability: Hero → "Hero Portrait (첫 화면 인물
사진)", About → "Founder Profile (소개 섹션 프로필 사진)", and the
LEOHOLDINGS case slot now reads "CASE 04 — LEOHOLDINGS (Just Craft)" —
"Just Craft" is the sub-brand name already used in that case's own
fact-checked summary text and in the Gallery's own caption for the same
entity, so this is a recognition aid pulled from existing verified
content, not a new fact.

**Admin label pass:** every field label in all 9 Content admin sections
(Hero, Impact, About, Case Studies, Advisory, Career, Education,
Contact, Footer) was rewritten from generic/developer-flavored English
("Eyebrow", "Label", "Value", a raw slug like `brand-portfolio` as a row
heading) to a plain, context-grounded Korean description of what the
field actually controls on the public site (e.g. "Hero 메인 문구 (줄바꿈으로
줄 구분)", "사례 요약 문구", "문의 폼 - 이메일 필드 라벨"). Section headings
gained a Korean gloss too (e.g. "Case Studies (경영 성과 사례)"). Only the
JSX `label=` prop strings changed — no Supabase column name, table, or
migration file was touched anywhere.

**Source of truth:** `git diff` of `src/data/profile.js` against every
prior commit this phase is empty — no Founder Profile fact (name, title,
career, company, years, revenue, growth rate, EBITDA, P&L, market
counts) was touched, directly or indirectly, by this phase's work.

## PHASE 2 COMPLETE

All Phase 2 scope (Admin CMS: Phases 2-A through 2-H) is built, wired to
the public site with `src/data/profile.js` fallback, security-reviewed,
and integration-tested end to end — see Phase 2-H directly below for the
final integration pass, and each earlier phase's section for how every
part was built. The public site's design is unchanged from Phase 1
throughout all of Phase 2.

## PHASE 1 COMPLETE

All Phase 1 scope from the Master Specification is built, verified, and
documented: Header, Hero, Impact, About, Case Studies, Advisory, Career,
Gallery, Contact (with a working `mailto:` form), and Footer — fully
bilingual (KR/EN), responsive at 1440/1024/768/390px, and passing lint +
build with zero console errors/warnings. See Phase 1-G directly below for
the final QA pass, and each earlier phase's section for how every part
was built.

## Phase 2-H — Final Integration Test & Deployment Readiness

**Status: complete. Zero code changes were needed** — every check in
this pass confirmed Phase 2-A–2-G's work already correct. This phase was
verification only, per its own scope ("새로운 기능을 추가하는 Phase가
아니다").

**Fact integrity confirmed:** `git diff` of `src/data/profile.js` between
Phase 1-G's commit (`baca351`, the last commit that touched it) and the
current `HEAD` is empty — the Founder Profile source-of-truth content
has not been touched by any Phase 2 work.

**Public website**, swept at Desktop (1440px)/Tablet (768px)/Mobile
(390px) with Supabase unconfigured (this repo's actual, current state —
i.e. testing the real fallback path, not a simulation): all 8 sections
(Hero, Impact, About, Case Studies, Advisory, Career, Gallery, Contact)
+ Header + Footer present at every width, zero horizontal overflow, zero
console/page errors. KR/EN toggle updates every section simultaneously,
persists across reload, and updates `<html lang>`. Anchor nav + smooth
scroll land correctly under the sticky header (confirmed via
`scroll-margin-top` offset, not hidden). Mobile hamburger menu opens,
navigates, and closes correctly. `mailto:`/`tel:` links correct. SEO
(title, meta description, OpenGraph, JSON-LD, `<html lang>`) present.
No dedicated scroll-reveal/keyframe animation exists in this codebase
(confirmed via grep) — "animations" here means the smooth-scroll +
hover/focus transitions already verified working, consistent with
CLAUDE.md's explicit no-flashy-animation design philosophy.

**Admin CMS — tested against a real (locally mocked, not a real Supabase
project) Auth + REST + Storage backend for the first time this
integration pass**, rather than structural review alone:

- **Login → session → logout, for real**: unauthenticated `/admin` shows
  Login (no sign-up link anywhere); signing in via the actual form
  reaches the Dashboard; **refreshing the browser kept the session**
  (real `@supabase/supabase-js` localStorage persistence exercised end
  to end, not just reviewed); Logout returns to Login; a second refresh
  after logout correctly stays logged out.
- **Content**: loaded Footer's "Back to top" label (조회), edited both
  KO and EN (수정), saved successfully, then tested validation by
  clearing EN only and confirming Save is blocked with a specific
  message, then restored and re-saved — reverted to the exact original
  values afterward.
- **Images**: uploaded a file to the Hero slot (current/new comparison
  panels both rendered correctly), saved, replaced it with a second
  file, saved again, then removed the image (confirm dialog) — Gallery
  loaded its 6 fallback photos correctly.
- All of the above against **Supabase data only** — `src/data/profile.js`
  was never written to at any point; the mock backend is disposable and
  was torn down after testing.

**End-to-end (the exact flow requested):** changed Contact's submit
button label to a non-factual test string in the admin, saved, reloaded
the **public site** and confirmed the change appeared there; reverted
the label in the admin, saved, reloaded the public site again and
confirmed it was back to the original text. This is the first time in
Phase 2 this exact admin→database→public round trip was verified with
the public site reload included in the same test run (earlier phases
verified the pieces separately).

**Fallback**: the entire public-website sweep above ran with Supabase
completely unconfigured — by construction, every result in that section
*is* the fallback-path result, not a separate simulation.

**Deployment**: `vite.config.js` and `.github/workflows/deploy.yml`
diffed against the commit that first set up GitHub Pages (`9bf39a3`) —
`deploy.yml` is byte-identical (unchanged); `vite.config.js`'s only
change since then is the Phase 2-B multi-page `admin/index.html` entry
(intentional, already documented), `base: '/leo-business-advisory/'`
untouched. Rebuilt and confirmed `dist/admin/index.html` remains a real,
separate static file with correctly base-prefixed asset URLs — direct
navigation to `/admin/` on GitHub Pages still needs no SPA-fallback
trick. `npm run lint` / `npm run build` both clean.

## Phase 2-G — Security, Data Integrity & Operational Safety Review

**Status: complete.** Public site design unchanged — every fix is
either backend (SQL migrations, not yet applied anywhere) or defensive
code that only activates on already-abnormal data.

Audited the full Admin CMS + public site (Phase 2-A–2-F) against an
explicit checklist covering auth, RLS, Storage, secrets, XSS, error
handling, and fallback behavior. Found and fixed three real gaps;
everything else was verified correct as already built.

**Fixed:**

1. **Storage bucket had no server-side file-type/size enforcement**
   (`supabase/migrations/0003_storage_setup.sql`) — the 5 MB/
   JPEG-PNG-WebP-SVG check only existed in the admin's client-side JS
   (`validateImageFile`), which a direct API call with a valid admin
   session could bypass entirely. Added `file_size_limit` (5242880) and
   `allowed_mime_types` to the bucket definition itself, matching the
   client check exactly — real defense in depth, not just a UI nicety.
2. **`is_admin()` didn't pin its `search_path`**
   (`supabase/migrations/0002_rls_policies.sql`) — a `security definer`
   function without an explicit `search_path` is vulnerable to a caller
   shadowing `admin_users` via a same-named object earlier in their own
   search path (standard Postgres hardening advice). Added
   `set search_path = public, pg_temp`.
3. **Two concrete render-crash risks from malformed CMS data**, found by
   seeding a local mock backend with deliberately broken rows and
   watching what happened:
   - `contact_form_content.labels` is one jsonb blob; a partial/malformed
     edit (e.g. a typo made directly in the Supabase table editor) could
     leave one key missing, and `ContactForm.jsx` reading
     `labels.company.ko` off a missing `company` key would throw.
     `src/lib/content/contactForm.js` now merges the blob key-by-key
     against the `profile.js` fallback instead of trusting its shape.
   - `hero_content.headline_ko/en` are jsonb arrays; a non-array value
     there would crash `Hero.jsx`'s `.map()`. `src/lib/content/hero.js`
     now checks `Array.isArray()` before using the DB value.
4. **No general safety net for the class of "malformed data crashes the
   whole page" that the two fixes above don't individually cover** —
   added `src/components/SectionErrorBoundary.jsx`, wrapping each
   CMS-backed public section (Hero, Impact, About, Case Studies,
   Advisory, Career, Gallery, Contact, Footer) individually in `App.jsx`.
   Verified by seeding an `advisory_items` row with an object where a
   string was expected (a case neither fix above touches): Advisory's
   render threw as expected, the boundary caught it and hid only that
   one section, and every other section — Hero through Footer — kept
   rendering normally. Added the equivalent `AdminErrorBoundary.jsx`
   around the admin Dashboard (visible "새로고침" recovery message,
   since an admin operator needs to know something broke, unlike a
   silent public-page boundary).

**Verified, no change needed:**

- **RLS coverage**: all 23 content tables + `admin_users` have RLS
  enabled; every content table has exactly a public-read + admin-write
  policy pair (`for all using (is_admin()) with check (is_admin())`) —
  confirmed by diffing the table list against the policy list.
  Non-admins cannot write (`auth.uid()` is `null` when signed out, and
  `user_id = null` never matches in SQL, so `is_admin()` correctly
  returns false).
- **No sign-up path**: confirmed (again) that `Login.jsx` only calls
  `signInWithPassword` — no sign-up form/link anywhere in the admin
  bundle.
- **Secrets**: `git log --all` for `.env`/`.env.local` returns nothing
  (never committed); grepped the full working tree and entire git
  history for JWT-shaped strings and `*.supabase.co` URLs — no matches;
  `service_role` appears only once, in a documentation warning not to
  use it. `.gitignore` correctly excludes `.env`, `.env.local`,
  `.env.*.local`. **No secret exposure found — see SECRET CHECK.**
- **XSS**: no `dangerouslySetInnerHTML`, `eval`, `new Function`, or raw
  `innerHTML` anywhere in `src/` — every admin-editable string renders
  through React's default (auto-escaping) JSX text interpolation.
- **Fallback / API / Storage errors**: `fetchWithFallback.js` (public)
  and `extractErrorMessage` + try/catch (admin) already cover network
  failures, missing rows, and Storage errors — re-verified, not
  re-tested from scratch since Phase 2-C/D/E already exercised these
  paths directly.
- **KR/EN missing data**: `t(ko, en)` returns whatever it's given —
  a missing leaf string renders blank (never crashes); the risk was
  always at the structural level, addressed by fixes 3–4 above.
- **Admin/public refresh**: session persistence is `@supabase/supabase-js`'s
  default (`persistSession`/`autoRefreshToken`), unchanged; the new
  dirty-tracker (Phase 2-F) is module-level state that naturally resets
  on reload, no stale state risk.
- **GitHub Pages direct URL access**: confirmed `dist/admin/index.html`
  is still a real, separate static file with correctly base-prefixed
  asset URLs (`/leo-business-advisory/assets/...`) — direct navigation
  to `/admin/` on GitHub Pages resolves normally, no SPA-fallback trick
  needed (this was the reason for this architecture back in Phase 2-B).
  `.github/workflows/deploy.yml` uses least-privilege permissions
  (`contents: read`, `pages: write`, `id-token: write`) and references
  no secrets yet (Supabase isn't wired into the build).

**Residual, accepted limitation:** file-type validation (both the
client check and the new bucket-level `allowed_mime_types`) checks the
declared `Content-Type`, not the file's actual bytes — a determined
attacker with valid admin credentials could still spoof the header.
Full content-sniffing would need server-side processing (e.g. an Edge
Function), which is disproportionate to this phase's scope for a
single-trusted-operator internal tool; noted for awareness, not fixed.

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
