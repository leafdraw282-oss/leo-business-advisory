import { useEffect, useRef, useState } from 'react';
import { navigation } from '../data/navigation';
import { site } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import LanguageToggle from './LanguageToggle';
import './Header.css';

/**
 * Sticky site header: logo (→ #top), desktop nav (from navigation.js),
 * language toggle, and a mobile hamburger menu. All navigation is real
 * anchor links to sections that exist — smooth scroll + scroll-margin-top
 * are handled globally in src/styles/global.css.
 */
function Header() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef(null);
  const toggleButtonRef = useRef(null);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    function handleClickOutside(event) {
      const clickedPanel = panelRef.current && panelRef.current.contains(event.target);
      const clickedToggle = toggleButtonRef.current && toggleButtonRef.current.contains(event.target);
      if (!clickedPanel && !clickedToggle) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="container header__bar">
        <a href="#top" className="header__logo" onClick={closeMenu}>
          {site.name}
        </a>

        <nav className="header__nav" aria-label="Primary">
          <ul>
            {navigation.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{t(item.labelKo, item.labelEn)}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__controls">
          <LanguageToggle />
          <button
            ref={toggleButtonRef}
            type="button"
            className={`header__hamburger ${menuOpen ? 'is-open' : ''}`}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('메뉴 닫기', 'Close menu') : t('메뉴 열기', 'Open menu')}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" ref={panelRef} className="header__mobile-panel">
          <nav aria-label={t('모바일 메뉴', 'Mobile')}>
            <ul>
              {navigation.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} onClick={closeMenu}>
                    {t(item.labelKo, item.labelEn)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
