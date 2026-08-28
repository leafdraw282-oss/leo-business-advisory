import { navigation } from '../data/navigation';
import { site, person } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import { useSectionContent } from '../hooks/useSectionContent';
import { useReveal } from '../hooks/useReveal';
import { fetchContactInfo, contactInfoFallback } from '../lib/content/contactInfo';
import { fetchFooter, footerFallback } from '../lib/content/footer';
import './Footer.css';

/**
 * Site footer: brand + navigation (from navigation.js, same single source
 * of truth as the header) + contact info (real mailto:/tel: links) +
 * copyright + a dedicated "back to top" link (in addition to the logo,
 * which also links to #top, per the project spec listing both). Contact
 * and copyright/back-to-top copy come from Supabase (Phase 2-E) when
 * available, falling back to src/data/profile.js — see
 * src/lib/content/contactInfo.js and footer.js. `site`/`person` identity
 * fields are not part of the CMS, so they stay direct profile.js reads.
 *
 * Phase 6-A: a plain, un-staggered fade via the shared .reveal/.reveal--
 * visible base rule (global.css) — the brief explicitly asks for nothing
 * more elaborate here ("전체 footer가 자연스럽게 fade-in 정도면 충분").
 */
function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const contact = useSectionContent(fetchContactInfo, contactInfoFallback());
  const footer = useSectionContent(fetchFooter, footerFallback());
  const { ref, className: revealClassName } = useReveal();

  return (
    <footer ref={ref} className={`footer ${revealClassName}`.trim()}>
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
