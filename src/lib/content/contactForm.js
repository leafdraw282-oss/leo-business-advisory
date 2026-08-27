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
    inquiryTypes: inquiryTypes.map((t) => ({ ko: t.ko, en: t.en })),
  };
}

export async function fetchContactForm() {
  return fetchWithFallback(async () => {
    const formRow = await fetchSingletonRow('contact_form_content');
    const typeRows = await fetchListRows('inquiry_types');
    if (!formRow && typeRows.length === 0) return null;

    const fallback = contactFormFallback();
    return {
      labels: formRow?.labels ?? fallback.labels,
      inquiryPlaceholderKo: formRow?.inquiry_placeholder_ko ?? fallback.inquiryPlaceholderKo,
      inquiryPlaceholderEn: formRow?.inquiry_placeholder_en ?? fallback.inquiryPlaceholderEn,
      submitKo: formRow?.submit_ko ?? fallback.submitKo,
      submitEn: formRow?.submit_en ?? fallback.submitEn,
      noteKo: formRow?.note_ko ?? fallback.noteKo,
      noteEn: formRow?.note_en ?? fallback.noteEn,
      inquiryTypes: typeRows.length > 0 ? typeRows.map((r) => ({ ko: r.label_ko, en: r.label_en })) : fallback.inquiryTypes,
    };
  }, contactFormFallback());
}
