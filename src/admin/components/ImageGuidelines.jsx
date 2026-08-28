import { RECOMMENDED_MAX_KB, MAX_IMAGE_BYTES } from '../content/supabaseStorage.js';

// Static "recommended size" guidance block, shown once per image slot
// (right under its title) — see src/admin/content/imageGuidelines.js for
// how these numbers were derived from the real public-site layout.
//
// Phase 4-H: added a target file-size line alongside the existing pixel
// guidance — the previous text only ever told an admin the recommended
// WIDTH/HEIGHT, never a byte-size target, so nothing here previously
// hinted that a correctly-sized-but-poorly-compressed export (e.g. an
// uncompressed 8MB PNG straight off a camera) could still hurt page load
// even while matching the recommended pixel dimensions exactly.
function ImageGuidelines({ width, height, ratioLabel, minWidth, minHeight }) {
  const maxMb = (MAX_IMAGE_BYTES / 1024 / 1024).toFixed(0);
  return (
    <div className="admin-image-guideline">
      <p className="admin-image-guideline-size">
        권장 사이즈: {width} × {height} px · 비율 {ratioLabel}
      </p>
      {minWidth && minHeight && (
        <p className="admin-image-guideline-min">
          최소 사이즈: {minWidth} × {minHeight} px (이보다 작으면 화면에서 확대되어 흐릿하게 보일 수 있습니다)
        </p>
      )}
      <p className="admin-image-guideline-format">
        JPG / PNG / WebP 권장 · 권장 용량 {RECOMMENDED_MAX_KB}KB 이하 (최대 {maxMb}MB)
      </p>
    </div>
  );
}

export default ImageGuidelines;
