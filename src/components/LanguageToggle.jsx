import { useLanguage } from '../context/languageContext';
import './LanguageToggle.css';

/**
 * KR / EN switch. Reads and writes the shared language state from
 * LanguageContext — every consumer re-renders together, so there is never
 * a partial-language state on the page.
 */
function LanguageToggle({ className = '' }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`language-toggle ${className}`.trim()} role="group" aria-label="Language">
      <button
        type="button"
        className={language === 'ko' ? 'is-active' : ''}
        aria-pressed={language === 'ko'}
        onClick={() => setLanguage('ko')}
      >
        KR
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        className={language === 'en' ? 'is-active' : ''}
        aria-pressed={language === 'en'}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
    </div>
  );
}

export default LanguageToggle;
