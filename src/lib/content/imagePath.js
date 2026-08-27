/**
 * Resolves a root-relative public asset path (as stored in
 * src/data/profile.js's `images` map, e.g. "/images/hero.jpg") against
 * Vite's configured base path (vite.config.js's `base`).
 *
 * Vite only rewrites asset URLs it can see at build time — an `import`
 * statement, or specific attributes (src/href/etc.) in index.html — not a
 * plain string sitting in a .js data file. Left unresolved, these paths
 * 404 under GitHub Pages' project-subpath deployment
 * (base: '/leo-business-advisory/') the moment a real photo file exists
 * at the path (confirmed live during Phase 3-H's production QA: every
 * page load requested /images/hero.jpg and /images/portrait.jpg instead
 * of /leo-business-advisory/images/hero.jpg, 404ing both — invisible
 * before now only because ImagePlaceholder's onError fallback hides a
 * 404 exactly like "no image configured," and no real photo file has
 * existed at these paths yet to trigger it). See
 * docs/PROJECT_STATUS.md's Phase 3-H entry.
 */
export function resolvePublicImage(path) {
  if (!path) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
