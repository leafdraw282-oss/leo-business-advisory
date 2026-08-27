import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// base matches the GitHub Pages project-site path for this repo
// (https://<owner>.github.io/leo-business-advisory/). If a custom domain
// is set up later, change this back to '/' — see README.md's deployment
// section.
//
// Two independent HTML entry points (Vite's standard multi-page-app
// pattern — see https://vite.dev/guide/build.html#multi-page-app): the
// public site (index.html) and the admin CMS shell (admin/index.html,
// served at /admin/ on GitHub Pages). They share no runtime code path —
// admin has its own entry (src/admin/main.jsx) and never touches the
// public site's App.jsx or render tree.
export default defineConfig({
  plugins: [react()],
  base: '/leo-business-advisory/',
  build: {
    rollupOptions: {
      input: {
        main: new URL('index.html', import.meta.url).pathname,
        admin: new URL('admin/index.html', import.meta.url).pathname,
      },
      // Phase 4-H — measured, then deliberately NOT changed: Rollup's
      // default chunking already shares react/react-dom/@supabase/
      // supabase-js as ONE chunk between the main and admin entries (no
      // duplication) — it just names that chunk after whichever app
      // module pulls it in ("ImagePlaceholder-*.js" today), which looks
      // odd but has no effect on bytes shipped. Tried an explicit
      // manualChunks split (separate named vendor chunks, for better
      // cache stability across deploys) and measured a real regression
      // from it: total gzip for that code went from ~70.6KB to ~113.6KB,
      // because splitting it disabled cross-module tree-shaking Rollup
      // can only do when the code stays in one chunk. Reverted — a
      // same-visit transfer-size regression for every visitor is a worse
      // trade than a cosmetic chunk name / marginal cache-churn benefit.
    },
  },
})
