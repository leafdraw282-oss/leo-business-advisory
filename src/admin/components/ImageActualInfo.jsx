import { useImageDimensions } from '../content/useImageDimensions.js';
import { mismatchWarning, simplifyRatioLabel } from '../content/imageGuidelines.js';

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Shown under an individual image thumbnail (current or newly-staged) —
// reads the actual file's pixel size off-DOM and, only if it meaningfully
// differs from the recommended ratio, shows a non-blocking warning. Never
// prevents upload/save either way.
//
// `fileSizeBytes` (Phase 5-E) is optional and only ever known for a
// newly-selected-but-not-yet-uploaded file (its File object is right
// there — see ImageSlotEditor.jsx/GalleryImages.jsx's `pendingFile.size`);
// an already-uploaded image's byte size isn't available client-side
// without an extra network request this pass doesn't add, so that case
// simply omits it rather than guessing.
function ImageActualInfo({ url, recommendedWidth, recommendedHeight, fileSizeBytes }) {
  const dimensions = useImageDimensions(url);
  if (!dimensions) return null;

  const ratioLabel = simplifyRatioLabel(dimensions.width, dimensions.height);
  const warning = mismatchWarning(dimensions.width, dimensions.height, recommendedWidth, recommendedHeight);

  return (
    <div className="admin-image-actual-info">
      <p className="admin-image-actual-size">
        실제 파일: {dimensions.width} × {dimensions.height} px · 비율 {ratioLabel}
        {fileSizeBytes != null ? ` · ${formatFileSize(fileSizeBytes)}` : ''}
      </p>
      {warning && (
        <p className="admin-image-guideline-warning" role="alert">
          {warning}
        </p>
      )}
    </div>
  );
}

export default ImageActualInfo;
