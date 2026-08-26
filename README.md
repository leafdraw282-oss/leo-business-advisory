# LEO Business Advisory — Website

Personal-brand / business-advisory website for Boosuk "Leo" Suh, Founder &
President of LEO Business Advisory. Built with Vite + React.

> **Status:** Phase 1 is complete. Every section (Header, Hero, Impact,
> About, Case Studies, Advisory, Career, Gallery, Contact, Footer) is
> built, fully bilingual (KR/EN), and responsive. See
> `docs/PROJECT_STATUS.md` for the full phase-by-phase history and what's
> planned next.

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
    ContactForm.jsx    the inquiry form (mailto:-based, see below)
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
index.html          title, meta description, OpenGraph, JSON-LD
CLAUDE.md           permanent project rules and content source-of-truth
docs/PROJECT_STATUS.md   phase-by-phase build history
```

## Language system

The KR/EN toggle in the header switches the entire page at once (every
section, the footer, and the contact form) and remembers the visitor's
choice in `localStorage`. Default language is Korean. All text lives in
`src/data/profile.js` as `xKo`/`xEn` pairs — never hardcode copy directly
in a component.

## Contact form

The contact form does not have a backend yet. Submitting it builds a
`mailto:` link from the filled-in fields and opens the visitor's own email
app with the message pre-filled — a note under the submit button says so
explicitly, so nobody mistakes it for a direct server submission.

To connect a real backend later (e.g. Formspree):
1. Open `src/components/ContactForm.jsx`.
2. Replace the body of `handleSubmit` with a `fetch()`/API call to your
   backend instead of building the `mailto:` URL.
3. Keep giving the visitor real feedback (a success or error state) —
   never leave the button just sitting there with no response.

The field markup, labels, and inquiry-type options (from `profile.js`
`inquiryTypes`) don't need to change.

## Deploying to GitHub Pages / a custom domain

Not yet configured. When you're ready to deploy:

1. **Repository (project) Pages** — e.g. `https://<username>.github.io/leo-business-advisory/`:
   - Set `base: '/leo-business-advisory/'` in `vite.config.js` (must match
     the repo name).
   - Build (`npm run build`) and publish the `dist/` folder to a
     `gh-pages` branch, or configure a GitHub Actions workflow that runs
     the build and deploys `dist/` on every push.
   - In the repo's Settings → Pages, set the source to that branch.
2. **Custom domain**:
   - Add a `CNAME` file containing your domain to the `public/` folder
     (it will be copied into `dist/` on build).
   - Set `base: '/'` in `vite.config.js` instead of a subpath.
   - Point your domain's DNS at GitHub Pages per
     [GitHub's custom domain docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site),
     and set the custom domain in the repo's Settings → Pages.

Either way, re-run `npm run build` and spot-check the deployed site (all
image paths, nav anchors, and the KR/EN toggle) before considering the
deploy done.
