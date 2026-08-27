# Custom Domain Setup (Phase 3-F)

This is a step-by-step guide for moving this site from GitHub Pages'
project-subpath URL (`https://<username>.github.io/leo-business-advisory/`)
to your own domain (e.g. `https://leobusinessadvisory.com/`). Written for
someone who has never done this before — every step says exactly what to
click or type.

**No domain has been set up yet.** This guide describes what to do *when
you have one*; nothing in this repo's actual configuration has been
changed by writing this document (see `docs/PROJECT_STATUS.md`'s Phase
3-F entry for the full audit). Throughout this guide, replace
`yourdomain.com` with your real domain everywhere it appears.

## Why this needs code changes at all

Right now the whole site is built to live under a **subpath**
(`/leo-business-advisory/`) — every internal link, every asset, and every
absolute URL baked into the page (for search engines and social sharing)
assumes that prefix is there. A custom domain serves the site from the
**root** (`/`) instead. Sections 6–8 below are exactly the places that
"subpath" assumption is written down and need to change to "root" —
everything else (React components, the admin CMS, Supabase, the deploy
workflow) already reads its own base path automatically and needs no
changes at all. See `docs/PROJECT_STATUS.md`'s Phase 3-F entry for the
full technical audit behind this guide.

---

## 1. Domain 준비 (Get a domain)

Buy a domain from any registrar — Namecheap, GoDaddy, Cloudflare
Registrar, 가비아, 후이즈, etc. Any of these work identically for what
follows; GitHub Pages doesn't care who you bought it from. You'll end up
with:
- A login to that registrar's site (to edit DNS records — step 3).
- The domain name itself, e.g. `leobusinessadvisory.com` (an **apex**
  domain) or a subdomain you plan to use instead, e.g.
  `www.leobusinessadvisory.com`.

You don't need to do anything else here yet — just have the domain and
registrar login ready before step 3.

## 2. GitHub Pages Custom Domain 입력 (Tell GitHub Pages your domain)

1. Go to this repository on GitHub → **Settings → Pages**.
2. Under "Custom domain", type your domain (e.g. `leobusinessadvisory.com`
   or `www.leobusinessadvisory.com`) and click **Save**.
3. GitHub will show a DNS check that fails for now — that's expected,
   you haven't set up DNS yet (next step). Leave this tab open or come
   back to it after step 3.

This step alone doesn't make the site reachable at the new domain yet —
DNS (step 3) and the code changes (steps 6–8) still need to happen.

## 3. DNS 설정 (Point your domain at GitHub Pages)

In your registrar's DNS settings for the domain, add records pointing at
GitHub Pages. Which record type depends on whether you're using an apex
domain or a `www` subdomain:

**Apex domain** (`leobusinessadvisory.com`, no `www`) — add four **A**
records, all pointing to GitHub Pages' IP addresses:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```
(Confirm these are still current in
[GitHub's own docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)
before adding them — GitHub occasionally changes these IPs.)

**`www` subdomain** (`www.leobusinessadvisory.com`) — add one **CNAME**
DNS record: `www` → `<username>.github.io.` (note the trailing dot some
registrars require).

Many people set up both: apex A records + a `www` CNAME, then use
GitHub's "Enforce HTTPS" + a redirect (GitHub Pages does this
automatically) so both `leobusinessadvisory.com` and
`www.leobusinessadvisory.com` reach the same site.

DNS changes can take anywhere from a few minutes to 24-48 hours to
propagate — this is normal, not a sign something's broken. You can check
propagation with `dig yourdomain.com` or a site like
[whatsmydns.net](https://www.whatsmydns.net/).

## 4. CNAME (two different things with the same name — don't mix them up)

There are **two separate "CNAME" concepts** here, and beginners
frequently confuse them:

1. **The DNS CNAME record** (step 3, `www` subdomain case only) — lives at
   your registrar, points a subdomain at `<username>.github.io`.
2. **The repo's `CNAME` file** — a plain text file, just your domain name
   and nothing else, that tells GitHub Pages which custom domain this
   *deployment* belongs to. Without it, GitHub Pages resets your custom
   domain setting on every new deployment.

For this repo specifically, add the file at **`public/CNAME`** (not the
repo root — Vite copies everything in `public/` into `dist/` on build, and
`dist/` is what actually gets deployed):

```
public/CNAME
```
containing exactly one line, your domain, no `https://`, no trailing
slash:
```
yourdomain.com
```
(GitHub's Settings → Pages UI in step 2 actually writes this file for you
automatically when you save the custom domain there — but committing it
yourself in `public/CNAME` means it survives every future deployment
instead of needing to be re-entered if Pages settings ever reset.)

## 5. HTTPS

Once DNS has propagated (step 3) and GitHub has verified your domain
(the check from step 2 turns green), go back to **Settings → Pages** and
check **"Enforce HTTPS"**. GitHub Pages provisions a free TLS certificate
for you automatically — this can take up to a few hours after DNS first
verifies. Until it's checked (and available — the checkbox is disabled
until GitHub finishes provisioning), visitors could reach the site over
plain HTTP; always turn this on once it's available.

## 6. Vite base 변경

Open **`vite.config.js`** and change:
```js
base: '/leo-business-advisory/',
```
to:
```js
base: '/',
```
This is the single most important code change — it controls where Vite
assumes the site lives, and every JS/CSS asset path in the built
`index.html`/`admin/index.html` is generated from it. The admin
Dashboard's "Public Website 바로가기" and "사이트 바로가기" links
(`import.meta.env.BASE_URL`) update automatically from this one change —
no separate edit needed for those.

## 7. canonical 변경

Open **`index.html`** and replace every occurrence of
`https://leafdraw282-oss.github.io/leo-business-advisory/` with
`https://yourdomain.com/` (ten occurrences as of Phase 3-F — search the
file for `leafdraw282-oss.github.io` to catch all of them):

- `<link rel="canonical" href="...">`
- `<meta property="og:url" content="...">`
- `<meta property="og:image" content=".../og-image.png">`
- `<meta name="twitter:image" content=".../og-image.png">`
- Inside the JSON-LD `<script type="application/ld+json">` block: the
  Person entity's `@id` and `url`, its `worksFor` reference, the
  ProfessionalService entity's `@id` and `url`, and its `founder`
  reference (six occurrences here alone — they all share the same base
  URL, just with different `#person`/`#organization` suffixes).

The site's `<title>` and meta description don't reference the domain and
don't need to change.

## 8. sitemap 변경

Two files, one line each:

**`public/robots.txt`** — change:
```
Sitemap: https://leafdraw282-oss.github.io/leo-business-advisory/sitemap.xml
```
to:
```
Sitemap: https://yourdomain.com/sitemap.xml
```
(`Disallow: /admin/` on the line above does **not** need to change — it's
already written relative to the domain root, which is exactly where
`/admin/` will actually live once you're off the subpath.)

**`public/sitemap.xml`** — change:
```xml
<loc>https://leafdraw282-oss.github.io/leo-business-advisory/</loc>
```
to:
```xml
<loc>https://yourdomain.com/</loc>
```

**`public/404.html`** also has two hardcoded subpath references that need
the same treatment (this file is a plain static passthrough — Vite
doesn't process it, so these can't auto-update the way `BASE_URL` does
elsewhere): the favicon `<link href="/leo-business-advisory/favicon.svg">`
→ `/favicon.svg`, and the "back to home" link
`<a href="/leo-business-advisory/">` → `/`.

## 9. 배포 (Deploy)

1. Run `npm run build` locally first and skim the output — confirm it
   completes with no errors.
2. Commit every file changed in steps 4 and 6–8 (`public/CNAME`,
   `vite.config.js`, `index.html`, `public/robots.txt`,
   `public/sitemap.xml`, `public/404.html`) and push to the branch
   `.github/workflows/deploy.yml` watches. The workflow itself needs
   **no changes** — it builds and publishes whatever's in `dist/`
   regardless of what domain that ends up serving from.
3. Watch the deployment under the repo's **Actions** tab — confirm the
   "Deploy to GitHub Pages" run finishes green.

## 10. 정상 연결 확인 (Verify it actually works)

Once deployed, check all of the following at `https://yourdomain.com/`:

- The page loads at the bare domain — no `/leo-business-advisory/` in the
  URL bar, and the browser shows a valid HTTPS padlock (no certificate
  warning).
- View page source: `<link rel="canonical">` and the OpenGraph/Twitter
  tags show `yourdomain.com`, not the old GitHub Pages URL.
- `https://yourdomain.com/robots.txt` and
  `https://yourdomain.com/sitemap.xml` are both reachable directly (this
  is also the first time they're reachable *correctly* at all — served
  from a project subpath, as they are today, they aren't at the standard
  location crawlers check; see `docs/PROJECT_STATUS.md`'s Phase 3-F entry).
- `https://yourdomain.com/admin/` loads the admin login screen, and
  logging in and opening each of Dashboard/Content/Images/Inquiries still
  works.
- Every nav anchor (`#hero`, `#about`, `#contact`, etc.), the KR/EN
  toggle, and image loading (or `ImagePlaceholder`'s fallback, if no real
  photos exist yet) all still work exactly as before — none of this
  should visibly change; only the URL itself does.
- Share a link to the new URL in something that shows a link preview
  (Slack, KakaoTalk, iMessage, etc.) and confirm the OG image/title/
  description render correctly from the new domain.
- If you kept the old GitHub Pages URL bookmarked anywhere, note that
  GitHub Pages does **not** automatically redirect
  `<username>.github.io/leo-business-advisory/` to the new domain — once
  the custom domain is active, that old URL stops serving this site
  (Settings → Pages fully switches to the custom domain, it doesn't keep
  both live). Update any bookmarks/links you control.

---

## Quick reference: what changes, what doesn't

| Needs manual editing for a custom domain | Already domain-agnostic, no edit needed |
|---|---|
| `vite.config.js` (`base`) | `.github/workflows/deploy.yml` (no hardcoded paths) |
| `index.html` (canonical, OG, Twitter, JSON-LD — 10 spots) | `admin/index.html` (favicon is root-relative, no absolute URLs) |
| `public/robots.txt` (Sitemap: line only) | `src/admin/pages/Dashboard.jsx` (`import.meta.env.BASE_URL`) |
| `public/sitemap.xml` (loc) | `public/robots.txt`'s `Disallow: /admin/` line |
| `public/404.html` (favicon href, home link) | Supabase config, RLS, every other env var |
| `public/CNAME` (new file, doesn't exist yet) | |
