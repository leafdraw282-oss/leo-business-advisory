# LEO Business Advisory — Website

Personal-brand / business-advisory website for Boosuk "Leo" Suh, Founder &
President of LEO Business Advisory. Built with Vite + React.

> **Status:** Phase 1-A (project foundation) is complete. The site
> currently renders plain, unstyled section content wired to real data —
> visual design, navigation, and language switching are being built in the
> next phase. See `docs/PROJECT_STATUS.md` for exactly what's done and
> what's next.

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

## Where to edit things

| What | File |
| --- | --- |
| Page text (bio, metrics, case studies, career, etc.), KR & EN | `src/data/profile.js` |
| Menu / navigation items | `src/data/navigation.js` |
| Photos | `public/images/` (referenced from the `images` map in `src/data/profile.js`) |
| Colors, spacing, fonts | `src/styles/variables.css` |

`src/data/profile.js` is the single source of truth for all copy on the
site — every section reads from it rather than having text hardcoded in
components, so editing content never requires touching component code.

## Project structure

```
src/
  components/   reusable UI pieces (e.g. ImagePlaceholder)
  sections/     one file per page section (Hero, Impact, Profile, ...)
  data/         profile.js (content) + navigation.js (menu/section ids)
  styles/       variables.css, global.css, responsive.css
  App.jsx       mounts all sections
  main.jsx      app entry point
public/images/  static image files
```

## Contact form

The contact form does not yet have a backend. Until one is connected,
submissions are handled without pretending a message was sent when it
wasn't (see `CLAUDE.md` for the exact rule). A future phase will document
how to connect Formspree or a custom backend here.

## Deploying to GitHub Pages / a custom domain

Not yet configured — this will be documented once real photography and
the GitHub Pages `base` path are finalized (tracked in
`docs/PROJECT_STATUS.md`).
