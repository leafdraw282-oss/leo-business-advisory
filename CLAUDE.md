# CLAUDE.md — LEO BUSINESS ADVISORY Website

Permanent working instructions for this project. Read this before making
any change. It distills the full Master Specification (provided by the
project owner) and stays authoritative across every phase.

## What this site is

A personal-brand / business-advisory website for **BOOSUK "LEO" SUH (서부석)**,
Founder & President of LEO BUSINESS ADVISORY, designed to make visitors
understand his track record and want to inquire about advisory or business
projects. Not a résumé — flow is Introduction → Credibility → Results →
Capability → Career → Human/Visual Story → Contact, not a chronological CV.

## Source of truth for content

- **`src/data/profile.js` is the single source of truth for all page copy**,
  sourced from the official Founder Profile document
  (`Leo_Business_Advisory_Founder_Profile_KR_EN.docx`).
- Every fact — name, title, company names, career years, revenue/growth/P&L/
  market-count figures — must match that document exactly. **Never invent or
  estimate a number.** If new content is needed that the document doesn't
  cover, mark it clearly as placeholder/TBD rather than guessing.
- Where the Master Specification's example copy conflicts with the Founder
  Profile document's facts, **the Founder Profile document wins**.
- KR and EN copy are each sourced from that document's own KR and EN
  sections respectively — do not machine-translate one into the other.
- Components must import content from `profile.js`; never hardcode
  paragraphs of copy inside a component.

## Non-negotiable engineering rules ("No Dead Button Rule")

These failure modes are never acceptable, at any phase:

- A nav item, button, or CTA that doesn't actually navigate/act (no bare `#` hrefs).
- A KR/EN toggle that doesn't change all copy on the page simultaneously.
- A component file that exists but isn't imported into `App.jsx`.
- A `<section id>` that doesn't match its corresponding `navigation.js` entry.
- A broken image (no fallback) or a request for an image that doesn't exist.
- Horizontal overflow or clipped text on mobile (test at 390px).
- An anchor jump whose target heading is hidden behind the sticky header
  (every `<section>` needs `scroll-margin-top`).
- Unused imports, dead code, console errors/warnings.
- A "Submit" button on the contact form that gives no real feedback about
  whether anything was actually sent (there is no backend yet — see below).

If a feature isn't ready to be real yet, build the structure for it (data
shape, id, wiring) without faking behavior — never a decorative dead control.

## Single source of truth for navigation

`src/data/navigation.js` is the only place nav items are defined. Both the
header nav links and each section's `id` must derive from this file's `id`
values. Never define a section id independently of this file.

## Architecture

- **Stack:** Vite + React (JavaScript, not TypeScript). Minimal dependencies
  — no UI kit, no animation library. React + CSS + native browser APIs
  (IntersectionObserver, localStorage) only.
- **Structure:**
  ```
  src/
    components/   reusable UI pieces (Header, LanguageToggle, ImagePlaceholder, ...)
    sections/     one file per page section (Hero, Impact, Profile, ...)
    data/         profile.js (content) + navigation.js (nav/section ids)
    styles/       variables.css, global.css, responsive.css
    App.jsx       mounts every section inside <main>, wrapped by Header/Footer
    main.jsx      entry point
  public/images/  static image assets referenced via the `images` map in profile.js
  ```
- All list-like content (impact metrics, advisory items, career timeline,
  case studies, gallery photos) is data-driven from arrays in `profile.js` —
  adding an entry should never require editing JSX/layout code.
- Images are never hardcoded as inline paths in components — resolve them
  through the `images` map in `profile.js`, and always render through the
  `ImagePlaceholder` component so a missing/broken image degrades to a
  labeled placeholder instead of a broken-image icon.

## Design system

- Colors are CSS variables only (`src/styles/variables.css`):
  `--color-navy #0B1625`, `--color-ivory #F4F1EA`, `--color-charcoal #222222`,
  `--color-gray #8B8984`, `--color-bronze #A4865C` (accent only, used
  sparingly), `--color-white #FFFFFF`.
- Spacing is variable-based (`--space-xs` … `--space-2xl`); sections share
  one `.container` (max-width 1280px) rather than inventing per-section padding.
- Typography: a single family site-wide — Noto Sans, with Noto Sans KR as
  its Korean-glyph companion (loaded via Google Fonts) — used for every
  heading, body, nav, button, number and label with no exceptions. No
  separate serif/display typeface. Long-form body copy is capped near
  720px wide with 1.7–1.9 line-height. Large headings/metrics use `clamp()`
  so they never overflow on mobile.
- Aesthetic: **Global Consulting × Luxury Brand Editorial × Executive
  Portfolio.** Explicitly avoid: gradients, glassmorphism, neon, 3D/floating
  animation, cursor effects, generic SaaS card grids. Should look premium
  and be legible 2–3 years from now, not trend-chasing.

## Language system

- `language` state (`'ko' | 'en'`), default `'ko'`, persisted to
  `localStorage` — but the site must work fully even if localStorage access
  throws (private browsing, disabled storage, etc.).
- Switching language must update every visible section at once (Header,
  Hero, Profile, Impact, Advisory, Career, Contact, Footer) — never a
  partial switch.

## Contact form

No backend exists yet. Do not build a form that appears to "submit"
without actually doing anything. Phase-appropriate options: `mailto:`
submission, or a clearly-labeled "Email Leo directly" fallback. Structure
the form so swapping in Formspree/a real backend later is a small, isolated
change — never let the user believe a submission succeeded when it did not.

## Accessibility & SEO baseline

Semantic HTML (`header`, `nav`, `main`, `section`, `article`, `footer`),
correct heading hierarchy (h1 → h2 → h3), visible keyboard focus states,
meaningful `alt` text, and basic SEO metadata (title/description/OG/JSON-LD)
once content is finalized enough to be worth encoding.

## Deployment

Site will eventually deploy to GitHub Pages, possibly behind a custom
domain. Any change to `vite.config.js` `base`, or to how images are
referenced, must keep both a GitHub Pages project-subpath deployment and a
custom-domain root deployment working — this is finalized once real images
exist and deployment is actually being set up (see `docs/PROJECT_STATUS.md`
for current status).

## Workflow

- The Master Specification (site owner's full brief) is implemented in
  phases, not in one pass. Check `docs/PROJECT_STATUS.md` for what's been
  built and what the next phase covers before starting work.
- Do not start the next phase's scope on your own — the site owner assigns
  each phase explicitly.
- Before ending any phase: run `npm run build` and confirm it succeeds with
  no errors; check for console errors/warnings; verify every interactive
  element added in that phase actually works.
