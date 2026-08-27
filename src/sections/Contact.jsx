import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/languageContext';
import { useSectionContent } from '../hooks/useSectionContent';
import { fetchContactInfo, contactInfoFallback } from '../lib/content/contactInfo';
import { trackEvent } from '../lib/analytics';
import ContactForm from '../components/ContactForm';
import './Contact.css';

/**
 * Contact section (id: "contact", matches src/data/navigation.js) — the
 * site's final conversion point. Content comes from Supabase (Phase 2-E)
 * when available, falling back to src/data/profile.js — see
 * src/lib/content/contactInfo.js.
 */
function Contact() {
  const { t } = useLanguage();
  const contact = useSectionContent(fetchContactInfo, contactInfoFallback());
  const formWrapperRef = useRef(null);
  const sectionRef = useRef(null);

  function focusForm() {
    formWrapperRef.current?.querySelector('input[name="name"]')?.focus();
  }

  // Fires once, the first time the section is actually scrolled into view
  // — not on mount, since every section is mounted immediately (no
  // route-based lazy loading). Never re-fires on repeated visits within
  // the same page load.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackEvent('contact_section_view');
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="contact" className="contact" aria-label={t('문의', 'Contact')} ref={sectionRef}>
      <div className="container">
        <div className="contact__cta">
          <h2 className="contact__headline">{t(contact.ctaHeadlineKo, contact.ctaHeadlineEn)}</h2>
          <button type="button" className="btn btn--primary" onClick={focusForm}>
            {t(contact.ctaButtonKo, contact.ctaButtonEn)}
          </button>
        </div>

        <div className="contact__grid">
          <div className="contact__info">
            <p className="contact__info-label">{t(contact.infoLabelKo, contact.infoLabelEn)}</p>
            <a
              className="contact__info-link"
              href={contact.emailHref}
              onClick={() => trackEvent('email_click')}
            >
              {contact.email}
            </a>
            <a
              className="contact__info-link"
              href={contact.phoneHref}
              onClick={() => trackEvent('phone_click')}
            >
              {contact.phoneDisplay}
            </a>
            <p className="contact__info-location">{t(contact.locationKo, contact.locationEn)}</p>
          </div>

          <div className="contact__form-wrapper" ref={formWrapperRef}>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
