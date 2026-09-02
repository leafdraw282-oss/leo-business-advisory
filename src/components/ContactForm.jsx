import { useState } from 'react';
import { useLanguage } from '../context/languageContext';
import { useSectionContent } from '../hooks/useSectionContent';
import { fetchContactForm, contactFormFallback } from '../lib/content/contactForm';
import { submitInquiry } from '../lib/inquiries';
import { trackEvent } from '../lib/analytics';
import './ContactForm.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phase 3-C: submitting this form saves the inquiry directly to Supabase
 * (src/lib/inquiries.js) — no more mailto: hand-off. A visible success
 * message only ever appears after the database insert actually succeeds;
 * a failure keeps the entered values in place and shows retry guidance
 * instead. The direct mailto:/tel: links in the Contact section's info
 * panel (Contact.jsx) remain as a separate, secondary contact method.
 *
 * Spam handling: a visually-hidden honeypot field ("website" — real
 * visitors never see or fill it) causes the submit handler to silently no-op
 * — no fake success, no error, just nothing, since a legitimate user can
 * never trigger that path. Basic format/length validation runs both here
 * and again at the database (supabase/migrations/0005_inquiries.sql).
 *
 * The "문의 유형" dropdown asks which of the four Advisory Products
 * (src/data/profile.js `inquiryTypes`, admin-editable via Content →
 * Contact) the inquiry is about — the same four the Advisory section
 * just showed the visitor, so this stays consistent with what the page
 * actually offers instead of a separate, disconnected category list.
 */
function ContactForm() {
  const { t } = useLanguage();
  const contactForm = useSectionContent(fetchContactForm, contactFormFallback());
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitState, setSubmitState] = useState('idle'); // idle | submitting | success | error

  function clearFieldError(name) {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function validate({ name, email, inquiryType, message }) {
    const errors = {};
    const required = t(contactForm.requiredKo, contactForm.requiredEn);
    if (!name) errors.name = required;
    if (!email) errors.email = required;
    else if (!EMAIL_PATTERN.test(email)) errors.email = t(contactForm.invalidEmailKo, contactForm.invalidEmailEn);
    if (!inquiryType) errors.inquiryType = required;
    if (!message) errors.message = required;
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    // Guards duplicate submissions from a fast double-click/double-Enter,
    // independent of the submit button's own `disabled` attribute.
    if (submitState === 'submitting') return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const honeypot = data.get('website')?.toString().trim();
    const name = data.get('name')?.toString().trim() || '';
    const company = data.get('company')?.toString().trim() || '';
    const email = data.get('email')?.toString().trim() || '';
    const inquiryType = data.get('inquiryType')?.toString().trim() || '';
    const message = data.get('message')?.toString().trim() || '';

    const errors = validate({ name, email, inquiryType, message });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (honeypot) return; // bot signal — no visible reaction either way

    setSubmitState('submitting');
    try {
      await submitInquiry({ name, company, email, inquiryType, message });
      setSubmitState('success');
      // No params — inquiry_type/name/email/etc. are all visitor-entered
      // or derived from it; only the fact that a submission succeeded is
      // tracked. See src/lib/analytics.js.
      trackEvent('contact_submit');
      form.reset();
    } catch (err) {
      // The underlying error (a raw network error name, a Postgres
      // constraint message, an RLS rejection) is never shown to the
      // visitor as-is — it's either not actionable ("TypeError: Failed to
      // fetch") or too technical. Always show the same friendly retry
      // message; log the real cause for debugging.
      console.warn('[ContactForm] submission failed:', err instanceof Error ? err.message : err);
      setSubmitState('error');
    }
  }

  if (submitState === 'success') {
    return (
      <div className="contact-form contact-form__success" role="status">
        <p className="contact-form__success-message">{t(contactForm.successKo, contactForm.successEn)}</p>
        <button type="button" className="btn btn--secondary" onClick={() => setSubmitState('idle')}>
          {t('새 문의 작성하기', 'Send another inquiry')}
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {submitState === 'error' && (
        <p className="contact-form__banner contact-form__banner--error" role="alert">
          {t(contactForm.errorKo, contactForm.errorEn)}
        </p>
      )}

      {/* Honeypot — real visitors never see or reach this field. Reuses the
          site-wide .visually-hidden utility (src/styles/global.css) for the
          visual hiding; aria-hidden + tabIndex=-1 below keep it out of the
          accessibility tree and tab order too, unlike a normal
          visually-hidden element that's meant to still be announced. */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="contact-form__row">
        <div className="contact-form__field">
          <label htmlFor="contact-name">{t(contactForm.labels.name.ko, contactForm.labels.name.en)}</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
            onChange={() => clearFieldError('name')}
          />
          {fieldErrors.name && (
            <span className="contact-form__error" id="contact-name-error" role="alert">
              {fieldErrors.name}
            </span>
          )}
        </div>
        <div className="contact-form__field">
          <label htmlFor="contact-company">{t(contactForm.labels.company.ko, contactForm.labels.company.en)}</label>
          <input id="contact-company" name="company" type="text" autoComplete="organization" />
        </div>
      </div>

      <div className="contact-form__field">
        <label htmlFor="contact-email">{t(contactForm.labels.email.ko, contactForm.labels.email.en)}</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
          onChange={() => clearFieldError('email')}
        />
        {fieldErrors.email && (
          <span className="contact-form__error" id="contact-email-error" role="alert">
            {fieldErrors.email}
          </span>
        )}
      </div>

      <div className="contact-form__field">
        <label htmlFor="contact-inquiry-type">
          {t(contactForm.labels.inquiryType.ko, contactForm.labels.inquiryType.en)}
        </label>
        <select
          id="contact-inquiry-type"
          name="inquiryType"
          defaultValue=""
          aria-invalid={Boolean(fieldErrors.inquiryType)}
          aria-describedby={fieldErrors.inquiryType ? 'contact-inquiry-type-error' : undefined}
          onChange={() => clearFieldError('inquiryType')}
        >
          <option value="" disabled>
            {t(contactForm.inquiryPlaceholderKo, contactForm.inquiryPlaceholderEn)}
          </option>
          {contactForm.inquiryTypes.map((type) => {
            const label = t(type.ko, type.en);
            return (
              <option key={label} value={label}>
                {label}
              </option>
            );
          })}
        </select>
        {fieldErrors.inquiryType && (
          <span className="contact-form__error" id="contact-inquiry-type-error" role="alert">
            {fieldErrors.inquiryType}
          </span>
        )}
      </div>

      <div className="contact-form__field">
        <label htmlFor="contact-message">{t(contactForm.labels.message.ko, contactForm.labels.message.en)}</label>
        <textarea
          id="contact-message"
          name="message"
          rows="5"
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
          onChange={() => clearFieldError('message')}
        />
        {fieldErrors.message && (
          <span className="contact-form__error" id="contact-message-error" role="alert">
            {fieldErrors.message}
          </span>
        )}
      </div>

      <div className="contact-form__submit">
        <button type="submit" className="btn btn--primary" disabled={submitState === 'submitting'}>
          {submitState === 'submitting' ? t(contactForm.sendingKo, contactForm.sendingEn) : t(contactForm.submitKo, contactForm.submitEn)}
        </button>
        <p className="contact-form__note">{t(contactForm.noteKo, contactForm.noteEn)}</p>
      </div>
    </form>
  );
}

export default ContactForm;
