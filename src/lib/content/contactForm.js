import { contactForm, inquiryTypes } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow, fetchListRows } from './publicTable.js';

export function contactFormFallback() {
  return {
    labels: {
      name: { ko: contactForm.labels.name.ko, en: contactForm.labels.name.en },
      company: { ko: contactForm.labels.company.ko, en: contactForm.labels.company.en },
      email: { ko: contactForm.labels.email.ko, en: contactForm.labels.email.en },
      inquiryType: { ko: contactForm.labels.inquiryType.ko, en: contactForm.labels.inquiryType.en },
      message: { ko: contactForm.labels.message.ko, en: contactForm.labels.message.en },
    },
    inquiryPlaceholderKo: contactForm.inquiryPlaceholderKo,
    inquiryPlaceholderEn: contactForm.inquiryPlaceholderEn,
    submitKo: contactForm.submitKo,
    submitEn: contactForm.submitEn,
    noteKo: contactForm.noteKo,
    noteEn: contactForm.noteEn,
    // Submission-state microcopy (sending/success/error/validation) has no
    // Supabase-editable counterpart (see fetchContactForm below) — it's
    // fixed interface text, not admin-managed marketing content, so it
    // always comes from profile.js regardless of whether Supabase is
    // configured.
    sendingKo: contactForm.sendingKo,
    sendingEn: contactForm.sendingEn,
    successKo: contactForm.successKo,
    successEn: contactForm.successEn,
    errorKo: contactForm.errorKo,
    errorEn: contactForm.errorEn,
    requiredKo: contactForm.requiredKo,
    requiredEn: contactForm.requiredEn,
    invalidEmailKo: contactForm.invalidEmailKo,
    invalidEmailEn: contactForm.invalidEmailEn,
    inquiryTypes: inquiryTypes.map((t) => ({ ko: t.ko, en: t.en })),
  };
}

// `labels` is stored as one jsonb blob, so a malformed/partial edit made
// directly in the Supabase table editor (bypassing the admin form, which
// always writes all five together) could leave one key missing. Merge
// field-by-field rather than trusting the blob's shape wholesale — the
// alternative is a render crash in ContactForm.jsx reading
// `labels.company.ko` off a missing `company` key (Phase 2-G security pass).
function mergeLabels(dbLabels, fallbackLabels) {
  const merged = {};
  for (const key of Object.keys(fallbackLabels)) {
    merged[key] = {
      ko: dbLabels?.[key]?.ko ?? fallbackLabels[key].ko,
      en: dbLabels?.[key]?.en ?? fallbackLabels[key].en,
    };
  }
  return merged;
}

export async function fetchContactForm() {
  return fetchWithFallback(async () => {
    // Phase 4-H: independent queries, run concurrently — see advisory.js
    // for the same fix with a fuller explanation.
    const [formRow, typeRows] = await Promise.all([
      fetchSingletonRow('contact_form_content'),
      fetchListRows('inquiry_types'),
    ]);
    if (!formRow && typeRows.length === 0) return null;

    const fallback = contactFormFallback();
    return {
      labels: mergeLabels(formRow?.labels, fallback.labels),
      inquiryPlaceholderKo: formRow?.inquiry_placeholder_ko ?? fallback.inquiryPlaceholderKo,
      inquiryPlaceholderEn: formRow?.inquiry_placeholder_en ?? fallback.inquiryPlaceholderEn,
      submitKo: formRow?.submit_ko ?? fallback.submitKo,
      submitEn: formRow?.submit_en ?? fallback.submitEn,
      noteKo: formRow?.note_ko ?? fallback.noteKo,
      noteEn: formRow?.note_en ?? fallback.noteEn,
      // Not stored in contact_form_content — always the fixed fallback text.
      sendingKo: fallback.sendingKo,
      sendingEn: fallback.sendingEn,
      successKo: fallback.successKo,
      successEn: fallback.successEn,
      errorKo: fallback.errorKo,
      errorEn: fallback.errorEn,
      requiredKo: fallback.requiredKo,
      requiredEn: fallback.requiredEn,
      invalidEmailKo: fallback.invalidEmailKo,
      invalidEmailEn: fallback.invalidEmailEn,
      inquiryTypes: typeRows.length > 0 ? typeRows.map((r) => ({ ko: r.label_ko, en: r.label_en })) : fallback.inquiryTypes,
    };
  }, contactFormFallback());
}
