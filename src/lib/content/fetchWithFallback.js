import { isSupabaseConfigured } from '../supabase';

/**
 * The core rule behind every future Supabase-backed content lookup: the
 * public site must never break because of a backend problem. This wraps
 * a Supabase query with `src/data/profile.js`'s existing value as the
 * safety net, so a missing project, a network error, an empty result, or
 * an RLS rejection all resolve the same way — quietly falling back to the
 * known-good static content instead of throwing or rendering blank.
 *
 * Not called from any page component yet (Phase 2-A is architecture only
 * — see docs/ADMIN_CMS_ARCHITECTURE.md). Phase 2-B wires this into each
 * section, e.g.:
 *
 *   const heroContent = await fetchWithFallback(
 *     () => supabase.from('hero_content').select('*').single().then(r => r.data),
 *     hero, // the existing profile.js export, used as-is
 *   );
 *
 * @param {() => Promise<any>} supabaseQuery - runs the Supabase query and
 *   resolves its data (or null/undefined if nothing was found). May reject.
 * @param {any} fallbackValue - the profile.js value to use whenever the
 *   query can't be trusted.
 * @returns {Promise<any>} the Supabase result, or `fallbackValue`.
 */
export async function fetchWithFallback(supabaseQuery, fallbackValue) {
  if (!isSupabaseConfigured) return fallbackValue;

  try {
    const data = await supabaseQuery();
    if (data === null || data === undefined) return fallbackValue;
    return data;
  } catch (error) {
    console.warn('[content] Supabase fetch failed, using profile.js fallback:', error?.message ?? error);
    return fallbackValue;
  }
}
