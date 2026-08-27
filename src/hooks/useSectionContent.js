import { useEffect, useState } from 'react';

/**
 * Renders `initialValue` (always the exact src/data/profile.js-derived
 * shape, so first paint is byte-identical to before this hook existed —
 * no loading state, no blank page) and then, once `fetchContent`
 * resolves, swaps in whatever it returns. `fetchContent` itself
 * (src/lib/content/*.js) always resolves to a valid value — Supabase data
 * when configured and available, the same profile.js-derived fallback
 * otherwise — so this never has to handle an error or empty state itself.
 */
export function useSectionContent(fetchContent, initialValue) {
  const [content, setContent] = useState(initialValue);

  useEffect(() => {
    let active = true;
    fetchContent().then((data) => {
      if (active) setContent(data);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return content;
}
