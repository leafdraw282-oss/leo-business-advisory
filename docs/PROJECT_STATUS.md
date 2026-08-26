# Project Status

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

### Phase 1-C and 1-D are documented above (both complete).

### Next: Phase 1-E (not started — do not begin without explicit instruction)

Expected scope, per the Master Specification:

1. Full visual design pass for Gallery, Contact, and `Footer.jsx` — per
   the design system in `CLAUDE.md`. `SectionTitle.jsx` should be reused
   for their headings rather than re-implemented.
2. `ContactForm.jsx` — real fields per `profile.js` `inquiryTypes`, with a
   working `mailto:` (or clearly-labeled backend-not-configured) submission
   path — never a fake "sent" confirmation.
3. Active-nav-on-scroll (IntersectionObserver) highlighting the current
   section in the header.
4. Subtle scroll-reveal animation (opacity/translateY), content visible by default.
5. Responsive QA at 1440 / 1024 / 768 / 390px for the newly designed sections.
6. `npm run build` re-verified clean.

Content editing locations for the next phase (no code changes needed):
text → `src/data/profile.js`, nav/menu → `src/data/navigation.js`, photos →
`public/images/`, colors → `src/styles/variables.css`.
