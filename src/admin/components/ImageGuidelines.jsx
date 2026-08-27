// Static "recommended size" guidance block, shown once per image slot
// (right under its title) — see src/admin/content/imageGuidelines.js for
// how these numbers were derived from the real public-site layout.
function ImageGuidelines({ width, height, ratioLabel }) {
  return (
    <div className="admin-image-guideline">
      <p className="admin-image-guideline-size">
        권장 사이즈: {width} × {height} px · 비율 {ratioLabel}
      </p>
      <p className="admin-image-guideline-format">JPG / PNG / WebP 권장</p>
    </div>
  );
}

export default ImageGuidelines;
