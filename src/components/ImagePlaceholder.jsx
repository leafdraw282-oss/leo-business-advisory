import { useState } from 'react';
import './ImagePlaceholder.css';

/**
 * Renders `src` when it loads successfully; falls back to a labeled
 * placeholder block (no broken-image icon, ever) when it fails to load or
 * no `src` is provided yet. This is the only way images should be rendered
 * on this site — see src/data/profile.js `images` map.
 *
 * @param {string} [src] - image path (e.g. from the `images` map)
 * @param {string} alt - accessible alt text, required even in placeholder state
 * @param {string} label - short text shown inside the placeholder (e.g. "LEO Portrait")
 * @param {string} [aspectRatio] - CSS aspect-ratio value, e.g. "4 / 5"
 * @param {string} [className]
 */
function ImagePlaceholder({ src, alt, label, aspectRatio = '4 / 3', className = '' }) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !src || failed;

  return (
    <div
      className={`image-placeholder ${className}`.trim()}
      style={{ aspectRatio }}
      role={showPlaceholder ? 'img' : undefined}
      aria-label={showPlaceholder ? alt : undefined}
    >
      {showPlaceholder ? (
        <span className="image-placeholder__label">{label || alt}</span>
      ) : (
        <img
          className="image-placeholder__img"
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default ImagePlaceholder;
