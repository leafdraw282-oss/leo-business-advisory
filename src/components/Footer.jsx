import { navigation } from '../data/navigation';
import { site, person, contact, footer } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import './Footer.css';

/**
 * Site footer: brand + navigation (from navigation.js, same single source
 * of truth as the header) + contact info (real mailto:/tel: links) +
 * copyright + a dedicated "back to top" link (in addition to the logo,
 * which also links to #top, per the project spec listing both).
 */
function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <a href="#top" className="footer__logo">
            {site.name}
          </a>
          <p className="footer__tagline">{t(person.titleKo, person.titleEn)} · {t(person.positioningKo, person.positioningEn)}</p>
        </div>

        <nav className="footer__nav" aria-label={t('푸터 내비게이션', 'Footer navigation')}>
          <ul>
            {navigation.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{t(item.labelKo, item.labelEn)}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__contact">
          <a href={contact.emailHref}>{contact.email}</a>
          <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
          <p>{t(contact.locationKo, contact.locationEn)}</p>
        </div>
      </div>

      <div className="container footer__bottom">
        <p className="footer__copyright">
          © {year} {site.name}. {t(footer.copyrightKo, footer.copyrightEn)}
        </p>
        <a href="#top" className="footer__top">
          {t(footer.backToTopKo, footer.backToTopEn)}
        </a>
      </div>
    </footer>
  );
}

export default Footer;
