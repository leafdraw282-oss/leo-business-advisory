import { useEffect, useState } from 'react';

/** Loads `url` off-DOM to read its natural pixel size, independent of the
 *  ImagePlaceholder component (which never needs to know about this) —
 *  purely an admin-side helper for showing "actual image size" next to
 *  the recommended-size guidance. Returns null until `url` has finished
 *  loading (or if it never does) — the loaded result is tagged with the
 *  `url` it came from, so a stale result from a previous `url` is never
 *  shown while the new one is still loading. */
export function useImageDimensions(url) {
  const [loaded, setLoaded] = useState(null);

  useEffect(() => {
    if (!url) return undefined;

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setLoaded({ url, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loaded?.url !== url) return null;
  return { width: loaded.width, height: loaded.height };
}
