import { useImageDimensions } from '../content/useImageDimensions.js';
import { mismatchWarning } from '../content/imageGuidelines.js';

// Shown under an individual image thumbnail (current or newly-staged) —
// reads the actual file's pixel size off-DOM and, only if it meaningfully
// differs from the recommended ratio, shows a non-blocking warning. Never
// prevents upload/save either way.
function ImageActualInfo({ url, recommendedWidth, recommendedHeight }) {
  const dimensions = useImageDimensions(url);
  if (!dimensions) return null;

  const warning = mismatchWarning(dimensions.width, dimensions.height, recommendedWidth, recommendedHeight);

  return (
    <div className="admin-image-actual-info">
      <p className="admin-image-actual-size">
        실제 크기: {dimensions.width} × {dimensions.height} px
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
