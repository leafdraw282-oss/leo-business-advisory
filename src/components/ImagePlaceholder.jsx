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
  // Tracks WHICH src last failed, not just whether "something" failed —
  // every section starts with a src that's guaranteed (or very likely) to
  // 404 (src/data/profile.js's local fallback path) before an async CMS
  // fetch (see src/lib/content/*.js) resolves and swaps in the real
  // Supabase Storage URL. Comparing failedSrc === src (derived at render
  // time, not reset via an effect) means a failure recorded against an
  // OLD src can never mask a newer, different src — it just stops
  // matching the moment `src` changes, with no separate reset step needed.
  const [failedSrc, setFailedSrc] = useState(null);
  const showPlaceholder = !src || failedSrc === src;

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
          // Keying by src forces React to mount a brand-new <img> DOM node
          // for every src change instead of mutating the existing one's
          // `src` attribute in place. This closes a real race: React
          // normally reuses the same node, so a late/queued `error` event
          // from the PREVIOUS (now-superseded) src — e.g. the guaranteed-
          // 404 fallback path above, whose network request can still be
          // in flight when the real CMS src arrives — would otherwise be
          // delivered to whatever onError handler happens to be attached
          // at the moment it fires (the current one), wrongly marking the
          // new, successfully-loading image as failed. A fresh node can
          // never receive an event meant for one that's already been
          // removed from the document — and even if it somehow did, the
          // failedSrc/src comparison above means it would record against
          // the old src value, not the new one, and still be ignored.
          key={src}
          className="image-placeholder__img"
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailedSrc(src)}
        />
      )}
    </div>
  );
}

export default ImagePlaceholder;
