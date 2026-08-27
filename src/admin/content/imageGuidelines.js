// Phase 4-B — recommended image size/ratio guidance for the admin Images
// screens. Every constant below was derived from the REAL aspect ratios
// already rendered on the public site and passed into the shared
// ImagePlaceholder component, not invented:
//   - Hero portrait:        src/sections/Hero.jsx        aspectRatio="4 / 5"
//   - About/Profile portrait: src/sections/Profile.jsx   aspectRatio="4 / 5"
//   - Case study images:    src/components/CaseStudy.jsx aspectRatio={emphasis ? '4 / 3' : '16 / 10'}
//     (emphasis = the first/flagship case only — src/sections/CaseStudies.jsx's `emphasis={index === 0}`)
//   - Gallery images:       src/sections/Gallery.jsx     aspectRatio={item.aspect || '4 / 3'}
//     (per-item, admin-selectable — see GalleryImages.jsx's ratio <select>)
//
// Recommended pixel sizes are 2x-ish the largest on-screen render width for
// crisp retina display, kept as clean round numbers at the exact ratio.

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

/** Computes a recommended width/height for an arbitrary aspect-ratio string
 *  (used by Gallery, whose ratio is per-item admin-editable data, not a
 *  fixed slot) — never hardcoded, always derived from the ratio in use. */
export function recommendedSizeForRatio(ratio, baseWidth = 1600) {
  const { w, h } = parseAspectRatio(ratio);
  const width = baseWidth;
  const height = Math.round((baseWidth * h) / w);
  return { width, height, ratioLabel: simplifyRatioLabel(w, h) };
}

export const HERO_IMAGE_GUIDELINE = { width: 1200, height: 1500, ratioLabel: '4:5' };
export const ABOUT_IMAGE_GUIDELINE = { width: 1200, height: 1500, ratioLabel: '4:5' };
export const CASE_STUDY_STANDARD_GUIDELINE = { width: 1600, height: 1000, ratioLabel: '16:10' };
export const CASE_STUDY_EMPHASIS_GUIDELINE = { width: 1600, height: 1200, ratioLabel: '4:3' };

/** Warns (never blocks) when an uploaded image's actual ratio drifts more
 *  than ~8% from the recommended one — a real image is never pixel-exact
 *  to a suggested size, so this only flags a meaningfully different shape. */
export function mismatchWarning(actualWidth, actualHeight, recommendedWidth, recommendedHeight) {
  if (!actualWidth || !actualHeight || !recommendedWidth || !recommendedHeight) return null;
  const actualRatio = actualWidth / actualHeight;
  const recommendedRatio = recommendedWidth / recommendedHeight;
  const diff = Math.abs(actualRatio - recommendedRatio) / recommendedRatio;
  if (diff <= 0.08) return null;
  return '권장 비율과 다른 이미지입니다. 화면에서 일부가 잘릴 수 있습니다.';
}
