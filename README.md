# LEO Business Advisory — Website

Personal-brand / business-advisory website for Boosuk "Leo" Suh, Founder &
President of LEO Business Advisory. Built with Vite + React.

> **Status:** Production Foundation frozen as of Phase 4-J (Phase 4-I's
> Final Production QA found no blockers). The public site (every section,
> fully bilingual, responsive, CMS-backed) and the admin CMS at `/admin`
> (content editing, image management, Gallery active/inactive + Trash,
> Design/Layout/Motion Settings, Inquiries, revision history) are both
> live and deployed to GitHub Pages via `.github/workflows/deploy.yml`.
> `src/data/profile.js` remains the permanent automatic fallback if
> Supabase isn't configured or is unreachable.
>
> **Read `docs/FOUNDATION.md` first** — it's the current, code-verified
> reference for the whole system (project/CMS/DB/Auth/RLS/Image/Design
> Settings/Motion structure, environment variables, and a "DO NOT BREAK"
> list) and supersedes `docs/ADMIN_CMS_ARCHITECTURE.md`'s original design
> doc for anything about the CURRENT implementation. `supabase/README.md`
> has the migration-application steps; `docs/PROJECT_STATUS.md` has the
> full phase-by-phase build history.

## Run the site locally

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:5173`).

## Production build

```bash
npm run build
```

Output is written to `dist/`. Preview the production build locally with:

```bash
npm run preview
```

## Linting

```bash
npm run lint
```

## Where to edit things

| What | File |
| --- | --- |
| Page text (bio, metrics, case studies, career, advisory items, form labels, footer, etc.), KR & EN | `src/data/profile.js` |
| Menu / navigation items | `src/data/navigation.js` |
| Photos | `public/images/` (referenced from the `images` map in `src/data/profile.js`, or directly by path for Gallery entries) |
| Colors, spacing, fonts | `src/styles/variables.css` |

`src/data/profile.js` is the single source of truth for all copy on the
site — every section reads from it rather than having text hardcoded in
components, so editing content never requires touching component code.
All facts (name, titles, company names, career years, revenue/growth/P&L
figures) are sourced from the official Founder Profile document — see
`CLAUDE.md` before changing any of them.

Once the Supabase backend (see above) is set up, most of this content
and every image can also be edited live at `/admin` without touching
code — `profile.js` stays in place underneath as the automatic fallback
either way, so it must still be kept accurate.

## Adding photos

1. Drop the image file into `public/images/`.
2. Point the matching entry at it:
   - Hero / portrait / case-study images: update the path in the `images`
     map at the bottom of `src/data/profile.js`.
   - Gallery photos: update (or add) an entry's `src` field in the
     `gallery` array in `src/data/profile.js`.
3. Nothing else changes — every image renders through the `ImagePlaceholder`
   component, so until a real file exists (or if a path is ever wrong) the
   site shows a labeled placeholder instead of a broken-image icon.

## Project structure

```
src/
  components/       reusable UI pieces
    Header.jsx        sticky nav, logo, KR/EN toggle, mobile menu
    Footer.jsx         brand, nav, contact, copyright, back-to-top
    LanguageToggle.jsx KR / EN switch
    SectionTitle.jsx   shared eyebrow + heading pattern
    ImpactMetric.jsx   one Impact-section figure
    CaseStudy.jsx      one editorial case-study entry
    ContactForm.jsx    the inquiry form (saves to Supabase, see below)
    ImagePlaceholder.jsx  image with graceful fallback
  sections/         one file per page section, each mounted in App.jsx
    Hero.jsx, Impact.jsx, Profile.jsx (About), CaseStudies.jsx,
    Advisory.jsx, Career.jsx, Gallery.jsx, Contact.jsx
  context/          LanguageContext.jsx — site-wide KR/EN state (localStorage-persisted)
  data/
    profile.js        ALL page copy + facts (KR & EN) — the source of truth
    navigation.js      nav items — the only place section ids are defined
  styles/
    variables.css      design tokens (colors, spacing, fonts)
    global.css          resets, shared .btn/.container/.long-copy styles
    responsive.css      breakpoint-level container/header tweaks
  App.jsx            mounts Header, every section, and Footer
  main.jsx           entry point, wraps App in LanguageProvider
public/images/      static image files
public/robots.txt, sitemap.xml, 404.html, og-image.png  SEO/crawling files (Phase 3-D)
index.html          title, meta description, canonical, robots, OpenGraph,
                     Twitter/X Card, theme-color, JSON-LD (Person + ProfessionalService)
CLAUDE.md           permanent project rules and content source-of-truth
docs/PROJECT_STATUS.md   phase-by-phase build history
```

The tree above covers the **public site** only. For `src/admin/` (the CMS),
`src/lib/` (the public content-fetch layer), `src/hooks/`, and the full
Supabase schema/RLS/Storage structure, see `docs/FOUNDATION.md`.

## Language system

The KR/EN toggle in the header switches the entire page at once (every
section, the footer, and the contact form) and remembers the visitor's
choice in `localStorage`. Default language is Korean. All text lives in
`src/data/profile.js` as `xKo`/`xEn` pairs — never hardcode copy directly
in a component.

## Contact form

Submitting the form saves the inquiry directly to Supabase (the
`inquiries` table — see `supabase/migrations/0005_inquiries.sql` and
`src/lib/inquiries.js`), with real loading/success/error states — never a
fake "sent" message. Submissions are only ever visible in the admin
Inquiries screen (`/admin` → Inquiries), never readable by the public; see
that migration's Row Level Security policies. The direct `mailto:`/`tel:`
links in the Contact section's info panel are a separate, secondary
contact method and don't go through this form at all.

The field markup, labels, and inquiry-type options (from `profile.js`
`inquiryTypes`) match the `inquiries` table's columns; extending either
needs matching changes on both sides — see the migration file's comments
for the schema.

## Deploying to GitHub Pages / a custom domain

**Already configured** for repository (project) Pages at
`https://<username>.github.io/leo-business-advisory/`:
`vite.config.js` sets `base: '/leo-business-advisory/'`, and
`.github/workflows/deploy.yml` builds and publishes `dist/` on every
push to this branch (or via manual `workflow_dispatch`). In the repo's
Settings → Pages, the source must be set to **GitHub Actions**. Note
this repo is currently Private, and GitHub Pages requires a paid plan to
serve Pages from a private repo on the Free tier — make the repo public,
or upgrade, before Pages will actually go live.

To switch to a **custom domain** instead:
- Add a `CNAME` file containing your domain to the `public/` folder (it
  will be copied into `dist/` on build).
- Set `base: '/'` in `vite.config.js` instead of the subpath.
- Point your domain's DNS at GitHub Pages per
  [GitHub's custom domain docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site),
  and set the custom domain in the repo's Settings → Pages.

Either way, re-run `npm run build` and spot-check the deployed site (all
image paths, nav anchors, the KR/EN toggle, and `/admin`) before
considering the deploy done.
