import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';
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
 * @param {'lazy'|'eager'} [loading] - defaults to 'lazy'; pass 'eager' for an
 *   above-the-fold image (e.g. Hero) that should start loading immediately.
 * @param {'high'|'low'|'auto'} [fetchPriority] - hints the browser's request
 *   priority; only meaningful paired with loading="eager".
 * @param {boolean} [fadeInOnLoad] - opt-in short opacity transition once the
 *   real image has actually finished loading (see .image-placeholder__img--fade-in
 *   in ImagePlaceholder.css) — off by default so every existing caller's
 *   appearance is unchanged; pass true only where this specific polish is wanted.
 * @param {boolean} [revealMotion] - Phase 4-F opt-in scroll-reveal (see
 *   useReveal.js), styled per the admin's image_motion_style setting via
 *   global.css's [data-image-motion] rules. Never passed by Hero, which
 *   keeps its own separate, load-triggered fadeInOnLoad untouched — the two
 *   are mutually exclusive by caller, never combined on one instance.
 * @param {boolean} [isVideo] - Gallery-only: renders a <video> instead of an
 *   <img> for an uploaded video (mp4/webm/mov/avi — see supabaseStorage.js's
 *   VIDEO_MIME_TYPES; GIF is not included here, it's a still-vs-animated
 *   image and always renders through the normal <img> below). Auto-detected
 *   from `src`'s file extension (works for a saved Storage URL, which
 *   always has one) when omitted; pass it explicitly for a blob: object-URL
 *   preview (an in-progress admin upload), which has no extension to sniff
 *   — see GalleryImages.jsx. Every other caller (Hero/About/Case Studies)
 *   never passes this and is completely unaffected.
 */
function ImagePlaceholder({
  src,
  alt,
  label,
  aspectRatio = '4 / 3',
  className = '',
  loading = 'lazy',
  fetchPriority,
  fadeInOnLoad = false,
  revealMotion = false,
  isVideo,
}) {
  // Tracks WHICH src last failed, not just whether "something" failed —
  // every section starts with a src that's guaranteed (or very likely) to
  // 404 (src/data/profile.js's local fallback path) before an async CMS
  // fetch (see src/lib/content/*.js) resolves and swaps in the real
  // Supabase Storage URL. Comparing failedSrc === src (derived at render
  // time, not reset via an effect) means a failure recorded against an
  // OLD src can never mask a newer, different src — it just stops
  // matching the moment `src` changes, with no separate reset step needed.
  const [failedSrc, setFailedSrc] = useState(null);
  // Same src-keyed-comparison pattern for "has THIS src finished loading",
  // used only to drive the optional fade-in above — a src change never
  // inherits a previous src's loaded state.
  const [loadedSrc, setLoadedSrc] = useState(null);
  const showPlaceholder = !src || failedSrc === src;
  const loaded = loadedSrc === src;
  const isVideoSrc = isVideo ?? (typeof src === 'string' && /\.(mp4|webm|mov|avi)($|\?)/i.test(src));

  // Always called (rules of hooks) but its ref/className are only wired
  // into the DOM below when revealMotion is actually true — an unused
  // hook instance never observes anything (its ref stays null) so this
  // has no effect on the many callers that don't opt in.
  const reveal = useReveal();
  const revealRef = revealMotion ? reveal.ref : undefined;
  const revealClassName = revealMotion ? reveal.className : '';

  const imgClassName = [
    'image-placeholder__img',
    fadeInOnLoad && 'image-placeholder__img--fade-in',
    fadeInOnLoad && loaded && 'image-placeholder__img--loaded',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={revealRef}
      className={['image-placeholder', revealClassName, className].filter(Boolean).join(' ')}
      style={{ aspectRatio }}
      role={showPlaceholder ? 'img' : undefined}
      aria-label={showPlaceholder ? alt : undefined}
    >
      {showPlaceholder ? (
        <span className="image-placeholder__label">{label || alt}</span>
      ) : isVideoSrc ? (
        <video
          // Same remount-per-src rationale as the <img> below — see its own
          // comment for the exact stale-event race this closes.
          key={src}
          className={imgClassName}
          src={src}
          aria-label={alt}
          controls
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
        />
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
          className={imgClassName}
          src={src}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          // Phase 4-H — measured: no <img> anywhere on the site set this
          // before. "async" tells the browser it may decode off the main
          // thread and doesn't need to block rendering on this specific
          // image being decode-ready, which is the right default for
          // every caller here (lazy below-the-fold images shouldn't block
          // on decode at all; the eager Hero image already gets its own
          // opacity fade-in via fadeInOnLoad, so a decode that finishes a
          // frame later costs nothing visible there either).
          decoding="async"
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
        />
      )}
    </div>
  );
}

export default ImagePlaceholder;
