# Project Status

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

### Next: Phase 1-C (not started — do not begin without explicit instruction)

Expected scope, per the Master Specification:

1. `Footer.jsx`.
2. Full visual design pass for Impact, Profile, CaseStudies, Advisory,
   Career, Gallery, Contact — per the design system in `CLAUDE.md`
   (colors, spacing, typography, container rules). Text/data already
   exists in `profile.js` for all of these; this is layout/CSS work.
3. `SectionTitle.jsx`, `ImpactMetric.jsx`, `CaseStudy.jsx`,
   `CareerTimeline.jsx` extracted as reusable components as the sections
   are designed.
4. `ContactForm.jsx` — real fields per `profile.js` `inquiryTypes`, with a
   working `mailto:` (or clearly-labeled backend-not-configured) submission
   path — never a fake "sent" confirmation.
5. Active-nav-on-scroll (IntersectionObserver) highlighting the current
   section in the header.
6. Subtle scroll-reveal animation (opacity/translateY), content visible by default.
7. Responsive QA at 1440 / 1024 / 768 / 390px for the newly designed sections.
8. `npm run build` re-verified clean.

Content editing locations for the next phase (no code changes needed):
text → `src/data/profile.js`, nav/menu → `src/data/navigation.js`, photos →
`public/images/`, colors → `src/styles/variables.css`.
