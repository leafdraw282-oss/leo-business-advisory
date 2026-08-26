import { contact, contactCta } from '../data/profile';
import { useLanguage } from '../context/languageContext';

/**
 * Structural shell — Contact section (id: "contact", matches
 * src/data/navigation.js). The full inquiry form (ContactForm component)
 * is a later phase; email/phone are already real working links since that
 * requires no design work.
 */
function Contact() {
  const { t } = useLanguage();

  return (
    <section id="contact" aria-label="Contact">
      <div className="container">
        <h2>{t(contactCta.headlineKo, contactCta.headlineEn)}</h2>
        <p>
          <a href={contact.emailHref}>{contact.email}</a>
        </p>
        <p>
          <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
        </p>
        <p>{t(contact.locationKo, contact.locationEn)}</p>
      </div>
    </section>
  );
}

export default Contact;
