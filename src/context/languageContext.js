import { createContext, useContext } from 'react';

export const LanguageContext = createContext(null);

/**
 * Access the shared language state. Must be used within LanguageProvider
 * (see LanguageContext.jsx).
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
