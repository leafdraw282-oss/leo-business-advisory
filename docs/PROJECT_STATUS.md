# Project Status

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

### Phase 1-C, 1-D, 1-E and 1-F are documented above (all complete).

### Next: Phase 1-G (not started — do not begin without explicit instruction)

Every section now has a full visual design and has been through one
site-wide consistency pass. Remaining scope is new behavior/deployment:

1. Active-nav-on-scroll (IntersectionObserver) highlighting the current
   section in the header nav as the visitor scrolls — explicitly deferred
   out of Phase 1-F since it would have been a new feature, not polish.
2. Subtle scroll-reveal animation (opacity/translateY on scroll into
   view), content visible by default if JS fails.
3. GitHub Pages deployment config (`vite.config.js` `base`, asset paths)
   and the README sections on GitHub upload / Pages / custom domain /
   swapping the contact form to Formspree — all currently deferred per
   `CLAUDE.md`.
4. Basic SEO: OpenGraph metadata, JSON-LD (Person or ProfessionalService).
5. Responsive QA at 1440 / 1024 / 768 / 390px for any new behavior added.
6. `npm run build` re-verified clean.

Real photography and final copywriting polish remain owner-driven inputs
(drop files into `public/images/` and update `src/data/profile.js`) and
are not a "phase" to schedule — they can happen at any time.

Content editing locations for the next phase (no code changes needed):
text → `src/data/profile.js`, nav/menu → `src/data/navigation.js`, photos →
`public/images/`, colors → `src/styles/variables.css`.
