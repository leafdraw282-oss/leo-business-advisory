import { useRef } from 'react';
import { contact, contactCta } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import ContactForm from '../components/ContactForm';
import './Contact.css';

/**
 * Contact section (id: "contact", matches src/data/navigation.js) — the
 * site's final conversion point. A large closing statement + "Start a
 * Conversation" button that focuses the form below it, then contact
 * details (real mailto:/tel: links) alongside the actual inquiry form.
 */
function Contact() {
  const { t } = useLanguage();
  const formWrapperRef = useRef(null);

  function focusForm() {
    formWrapperRef.current?.querySelector('input[name="name"]')?.focus();
  }

  return (
    <section id="contact" className="contact" aria-label="Contact">
      <div className="container">
        <div className="contact__cta">
          <h2 className="contact__headline">{t(contactCta.headlineKo, contactCta.headlineEn)}</h2>
          <button type="button" className="btn btn--primary" onClick={focusForm}>
            {t(contactCta.buttonKo, contactCta.buttonEn)}
          </button>
        </div>

        <div className="contact__grid">
          <div className="contact__info">
            <p className="contact__info-label">{t(contact.infoLabelKo, contact.infoLabelEn)}</p>
            <a className="contact__info-link" href={contact.emailHref}>
              {contact.email}
            </a>
            <a className="contact__info-link" href={contact.phoneHref}>
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
