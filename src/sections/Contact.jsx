import { contact, contactCta } from '../data/profile';

/**
 * Structural shell — Contact section (id: "contact", matches
 * src/data/navigation.js). The full inquiry form (ContactForm component)
 * is Phase 1-B; email/phone are already real working links since that
 * requires no design work.
 */
function Contact() {
  return (
    <section id="contact" aria-label="Contact">
      <div className="container">
        <h2>{contactCta.headlineEn}</h2>
        <p>
          <a href={contact.emailHref}>{contact.email}</a>
        </p>
        <p>
          <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
        </p>
        <p>{contact.locationEn}</p>
      </div>
    </section>
  );
}

export default Contact;
