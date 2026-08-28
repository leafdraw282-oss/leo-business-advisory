// Phase 4-B, re-measured Phase 5-E — recommended image size/ratio guidance
// for the admin Images screens. Every constant below was derived from the
// REAL aspect ratios currently rendered on the public site and the REAL
// on-screen container widths those ratios render at (measured at 1440px —
// this site's container caps at --content-max-width: 1280px, so a wider
// viewport never renders these slots any larger; 1440px was confirmed to
// already be past that cap), not invented:
//   - Hero portrait:          src/sections/Hero.jsx        aspectRatio="3 / 4"   (Phase 5-C)
//     measured render: 497 x 663px
//   - About/Profile portrait: src/sections/Profile.jsx     aspectRatio="1 / 1"   (Phase 5-D)
//     measured render: 256 x 256px
//   - Case study images:      src/components/CaseStudy.jsx aspectRatio={emphasis ? '4 / 3' : '16 / 10'}
//     (emphasis = the first/flagship case only — src/sections/CaseStudies.jsx's `emphasis={index === 0}`)
//     measured render: emphasis 625 x 469px, standard 584 x 365px
//   - Gallery images:       src/sections/Gallery.jsx     aspectRatio={item.aspect || '4 / 3'}
//     (per-item, admin-selectable — see GalleryImages.jsx's ratio <select>)
//     measured render: standard tile 278 x ~ (varies by ratio), wide tile 596 x ~
//
// Recommended pixel sizes are ~2x the largest measured on-screen render
// width for crisp retina display, kept as clean round numbers at the exact
// ratio. Minimum sizes are the real 1x render size, rounded up to a clean
// number — below that, the image is genuinely upscaled on some visitor's
// screen.
//
// IMPORTANT: Hero/About/Case Study aspect ratios are set via a component
// prop (Hero.jsx/Profile.jsx/CaseStudy.jsx), not read from this file — if a
// future phase changes one of those props again, the matching constant
// below (and the `aspectRatio` prop passed to that slot's ImageSlotEditor
// in src/admin/pages/images/*.jsx) must be updated in the same change, or
// this guidance silently goes stale again exactly like it did between
// Phase 5-C/5-D and this phase.

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

export function simplifyRatioLabel(w, h) {
  const divisor = gcd(Math.round(w), Math.round(h)) || 1;
  return `${Math.round(w / divisor)}:${Math.round(h / divisor)}`;
}

/** Parses a CSS aspect-ratio string like "4 / 3" into { w, h } numbers. */
export function parseAspectRatio(ratio) {
  const [wStr, hStr] = String(ratio ?? '4 / 3').split('/');
  const w = Number(wStr?.trim()) || 4;
  const h = Number(hStr?.trim()) || 3;
  return { w, h };
}

/** Computes a recommended (and minimum) width/height for an arbitrary
 *  aspect-ratio string (used by Gallery, whose ratio is per-item admin-
 *  editable data, not a fixed slot) — never hardcoded, always derived from
 *  the ratio in use. `baseWidth` should be ~2x the real measured render
 *  width for the grid column this item will actually occupy (see
 *  GalleryImages.jsx, which passes a different baseWidth for a `wide`
 *  tile vs a standard one — those two column widths were themselves
 *  measured on the real rendered grid, not guessed). */
export function recommendedSizeForRatio(ratio, baseWidth = 600) {
  const { w, h } = parseAspectRatio(ratio);
  const width = baseWidth;
  const height = Math.round((baseWidth * h) / w);
  const minWidth = Math.round(baseWidth / 2);
  const minHeight = Math.round((minWidth * h) / w);
  return { width, height, minWidth, minHeight, ratioLabel: simplifyRatioLabel(w, h) };
}

export const HERO_IMAGE_GUIDELINE = {
  width: 1200,
  height: 1600,
  minWidth: 600,
  minHeight: 800,
  ratioLabel: '3:4',
};
export const ABOUT_IMAGE_GUIDELINE = {
  width: 600,
  height: 600,
  minWidth: 300,
  minHeight: 300,
  ratioLabel: '1:1',
};
export const CASE_STUDY_STANDARD_GUIDELINE = {
  width: 1600,
  height: 1000,
  minWidth: 800,
  minHeight: 500,
  ratioLabel: '16:10',
};
export const CASE_STUDY_EMPHASIS_GUIDELINE = {
  width: 1600,
  height: 1200,
  minWidth: 800,
  minHeight: 600,
  ratioLabel: '4:3',
};

/** Warns (never blocks) when an uploaded image's actual ratio drifts more
 *  than ~8% from the recommended one — a real image is never pixel-exact
 *  to a suggested size, so this only flags a meaningfully different shape.
 *  States both ratios explicitly (Phase 5-E) so an admin knows exactly
 *  what's mismatched, not just that something is. */
export function mismatchWarning(actualWidth, actualHeight, recommendedWidth, recommendedHeight) {
  if (!actualWidth || !actualHeight || !recommendedWidth || !recommendedHeight) return null;
  const actualRatio = actualWidth / actualHeight;
  const recommendedRatio = recommendedWidth / recommendedHeight;
  const diff = Math.abs(actualRatio - recommendedRatio) / recommendedRatio;
  if (diff <= 0.08) return null;
  const recommendedLabel = simplifyRatioLabel(recommendedWidth, recommendedHeight);
  const actualLabel = simplifyRatioLabel(actualWidth, actualHeight);
  return `권장 비율은 ${recommendedLabel}입니다. 현재 이미지는 ${actualLabel}입니다 — 화면에서 일부가 잘릴 수 있습니다.`;
}
