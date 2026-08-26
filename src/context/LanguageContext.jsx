import { useEffect, useMemo, useState } from 'react';
import { LanguageContext } from './languageContext.js';

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

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage((prev) => (prev === 'ko' ? 'en' : 'ko')),
      t: (koValue, enValue) => (language === 'ko' ? koValue : enValue),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
