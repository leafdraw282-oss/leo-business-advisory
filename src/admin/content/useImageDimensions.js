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

  // `url` can be `null` (ImageSlotEditor's "no image yet") or `undefined`
  // (GalleryImages' "no image yet") — both must resolve to "nothing to
  // show" the same way. Checking `!loaded` explicitly, before reading
  // `loaded.url`, is what actually matters: comparing `loaded?.url !== url`
  // alone breaks when `loaded` is still null and `url` is `undefined`,
  // since `undefined !== undefined` is false and would fall through to
  // reading `.width` off `null`.
  if (!url || !loaded || loaded.url !== url) return null;
  return { width: loaded.width, height: loaded.height };
}
