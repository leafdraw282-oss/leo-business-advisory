import { useLanguage } from '../context/languageContext';
import { useSectionContent } from '../hooks/useSectionContent';
import { fetchContactInfo, contactInfoFallback } from '../lib/content/contactInfo';
import { fetchContactForm, contactFormFallback } from '../lib/content/contactForm';
import './ContactForm.css';

/**
 * No backend exists yet, so this form never claims a message was "sent".
 * Submitting builds a mailto: link from the field values and hands off to
 * the visitor's own email app — contactForm.noteKo/En says so explicitly,
 * visible right under the submit button. Content comes from Supabase
 * (Phase 2-E) when available, falling back to src/data/profile.js — see
 * src/lib/content/contactForm.js and contactInfo.js (for emailHref).
 */
function ContactForm() {
  const { t } = useLanguage();
  const contact = useSectionContent(fetchContactInfo, contactInfoFallback());
  const contactForm = useSectionContent(fetchContactForm, contactFormFallback());

  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get('name')?.toString().trim() || '';
    const company = data.get('company')?.toString().trim() || '';
    const email = data.get('email')?.toString().trim() || '';
    const inquiryType = data.get('inquiryType')?.toString().trim() || '';
    const message = data.get('message')?.toString().trim() || '';

    const subject = `[LEO Business Advisory] ${inquiryType || 'Inquiry'} — ${name}`;
    const body = [
      `${t(contactForm.labels.name.ko, contactForm.labels.name.en)}: ${name}`,
      `${t(contactForm.labels.company.ko, contactForm.labels.company.en)}: ${company}`,
      `${t(contactForm.labels.email.ko, contactForm.labels.email.en)}: ${email}`,
      `${t(contactForm.labels.inquiryType.ko, contactForm.labels.inquiryType.en)}: ${inquiryType}`,
      '',
      message,
    ].join('\n');

    window.location.href = `${contact.emailHref}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form__row">
        <div className="contact-form__field">
          <label htmlFor="contact-name">{t(contactForm.labels.name.ko, contactForm.labels.name.en)}</label>
          <input id="contact-name" name="name" type="text" required autoComplete="name" />
        </div>
        <div className="contact-form__field">
          <label htmlFor="contact-company">{t(contactForm.labels.company.ko, contactForm.labels.company.en)}</label>
          <input id="contact-company" name="company" type="text" autoComplete="organization" />
        </div>
      </div>

      <div className="contact-form__row">
        <div className="contact-form__field">
          <label htmlFor="contact-email">{t(contactForm.labels.email.ko, contactForm.labels.email.en)}</label>
          <input id="contact-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="contact-form__field">
          <label htmlFor="contact-inquiry-type">{t(contactForm.labels.inquiryType.ko, contactForm.labels.inquiryType.en)}</label>
          <select id="contact-inquiry-type" name="inquiryType" required defaultValue="">
            <option value="" disabled>
              {t(contactForm.inquiryPlaceholderKo, contactForm.inquiryPlaceholderEn)}
            </option>
            {contactForm.inquiryTypes.map((type) => (
              <option key={type.en} value={t(type.ko, type.en)}>
                {t(type.ko, type.en)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="contact-form__field">
        <label htmlFor="contact-message">{t(contactForm.labels.message.ko, contactForm.labels.message.en)}</label>
        <textarea id="contact-message" name="message" rows="5" required />
      </div>

      <div className="contact-form__submit">
        <button type="submit" className="btn btn--primary">
          {t(contactForm.submitKo, contactForm.submitEn)}
        </button>
        <p className="contact-form__note">{t(contactForm.noteKo, contactForm.noteEn)}</p>
      </div>
    </form>
  );
}

export default ContactForm;
