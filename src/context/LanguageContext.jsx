import { useCallback, useEffect, useMemo, useState } from 'react';
import { LanguageContext } from './languageContext.js';
import { trackEvent } from '../lib/analytics.js';

const STORAGE_KEY = 'leo-advisory-language';

function readStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'ko' || stored === 'en' ? stored : null;
  } catch {
    // localStorage unavailable (private browsing, disabled storage, etc.) —
    // fall back to the default language rather than breaking the site.
    return null;
  }
}

/**
 * Site-wide language state ('ko' | 'en', default 'ko'), persisted to
 * localStorage. Every section must read text through this provider's
 * `t(koValue, enValue)` helper rather than hardcoding one language, so a
 * toggle always updates the whole page at once — never a partial switch.
 */
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => readStoredLanguage() ?? 'ko');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Non-fatal — the site still works for this session without persistence.
    }
    document.documentElement.lang = language;
  }, [language]);

  // Tracks only an actual change (clicking the already-active language is
  // a no-op, not a "change" event) — compares against `language` from the
  // closure rather than putting the trackEvent side effect inside a
  // functional setState updater, since React (in StrictMode dev builds)
  // can invoke that updater twice, which would double-fire the event.
  // Watching `language` in a useEffect instead was also ruled out: that
  // would additionally fire once on mount, which isn't a visitor action.
  const changeLanguage = useCallback(
    (next) => {
      if (next !== language) trackEvent('language_change', { language: next });
      setLanguage(next);
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage: changeLanguage,
      toggleLanguage: () => changeLanguage(language === 'ko' ? 'en' : 'ko'),
      t: (koValue, enValue) => (language === 'ko' ? koValue : enValue),
    }),
    [language, changeLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
