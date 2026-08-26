# Project Status

## Phase 1-A — Working Foundation Scaffold (current)

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

### Next: Phase 1-B (not started — do not begin without explicit instruction)

Expected scope, per the Master Specification:

1. `Header.jsx` (sticky, logo → `#top`, nav using `navigation.js`, KR/EN
   toggle, mobile hamburger menu with open/close/ESC/outside-click/body-scroll-lock).
2. `LanguageToggle.jsx` wired to a `language` state (`'ko' | 'en'`,
   default `'ko'`, persisted to localStorage with try/catch).
3. `Footer.jsx`.
4. Full visual design pass for Hero, Impact, Profile, CaseStudies,
   Advisory, Career, Gallery, Contact — per the design system in
   `CLAUDE.md` (colors, spacing, typography, container rules).
5. `SectionTitle.jsx`, `ImpactMetric.jsx`, `CaseStudy.jsx`,
   `CareerTimeline.jsx` extracted as reusable components as the sections
   are designed.
6. `ContactForm.jsx` — real fields per `profile.js` `inquiryTypes`, with a
   working `mailto:` (or clearly-labeled backend-not-configured) submission
   path — never a fake "sent" confirmation.
7. Smooth scroll + active-nav-on-scroll (IntersectionObserver).
8. Subtle scroll-reveal animation (opacity/translateY), content visible by default.
9. Responsive QA at 1440 / 1024 / 768 / 390px.
10. `npm run build` re-verified clean.

Content editing locations for the next phase (no code changes needed):
text → `src/data/profile.js`, nav/menu → `src/data/navigation.js`, photos →
`public/images/`, colors → `src/styles/variables.css`.
