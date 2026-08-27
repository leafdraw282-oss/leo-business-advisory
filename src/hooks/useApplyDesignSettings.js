import { useEffect } from 'react';
import { fetchDesignSettings, applyDesignSettings } from '../lib/content/designSettings.js';

/**
 * Phase 4-C: fetches the active `site_design_settings` row once on mount
 * and applies it to :root. First paint always uses variables.css's own
 * defaults (this only runs after mount, same fallback-first pattern as
 * useSectionContent.js) — there's no loading state and nothing here can
 * block or blank the page. fetchDesignSettings() already guarantees a
 * safe fallback value on any failure (see src/lib/content/designSettings.js),
 * and applyDesignSettings() re-validates every field before writing it,
 * so this effect can never throw.
 */
export function useApplyDesignSettings() {
  useEffect(() => {
    let active = true;
    fetchDesignSettings()
      .then((settings) => {
        if (!active) return;
        applyDesignSettings(settings);
      })
      .catch(() => {
        // fetchDesignSettings() already resolves (never rejects) on any
        // failure, per its own contract — this catch exists purely so a
        // future change to that contract can never turn into an unhandled
        // rejection here.
      });
    return () => {
      active = false;
    };
  }, []);
}
