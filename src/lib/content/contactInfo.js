import { contact, contactCta } from '../../data/profile.js';
import { fetchWithFallback } from './fetchWithFallback.js';
import { fetchSingletonRow } from './publicTable.js';

// mailto:/tel: hrefs are always derived from email/phoneDisplay here, never
// stored separately — see docs/ADMIN_CMS_ARCHITECTURE.md's contact_info
// design note. phoneHref strips everything but digits and a leading "+",
// matching how profile.js's own phoneHref relates to phoneDisplay.
function deriveHrefs(email, phoneDisplay) {
  return {
    emailHref: `mailto:${email}`,
    phoneHref: `tel:${phoneDisplay.replace(/[^\d+]/g, '')}`,
  };
}

export function contactInfoFallback() {
  return {
    locationKo: contact.locationKo,
    locationEn: contact.locationEn,
    email: contact.email,
    emailHref: contact.emailHref,
    phoneDisplay: contact.phoneDisplay,
    phoneHref: contact.phoneHref,
    infoLabelKo: contact.infoLabelKo,
    infoLabelEn: contact.infoLabelEn,
    ctaHeadlineKo: contactCta.headlineKo,
    ctaHeadlineEn: contactCta.headlineEn,
    ctaButtonKo: contactCta.buttonKo,
    ctaButtonEn: contactCta.buttonEn,
  };
}

// Phase 4-H: both Contact.jsx and Footer.jsx call fetchContactInfo() —
// two independent components each needing the same contact/CTA copy — so
// a normal page load fired this exact query pair twice. Caching the
// in-flight/resolved promise here (module-level, reset per page load —
// there's no need for a TTL or invalidation, a fresh page load starts a
// fresh cache) means the second caller reuses the first caller's request
// instead of firing a duplicate one, with no change to either caller.
let cachedPromise = null;

export function fetchContactInfo() {
  if (cachedPromise) return cachedPromise;
  cachedPromise = fetchContactInfoUncached();
  return cachedPromise;
}

async function fetchContactInfoUncached() {
  return fetchWithFallback(async () => {
    // Independent queries — run concurrently.
    const [infoRow, ctaRow] = await Promise.all([fetchSingletonRow('contact_info'), fetchSingletonRow('contact_cta')]);
    if (!infoRow && !ctaRow) return null;

    const fallback = contactInfoFallback();
    const email = infoRow?.email ?? fallback.email;
    const phoneDisplay = infoRow?.phone_display ?? fallback.phoneDisplay;

    return {
      locationKo: infoRow?.location_ko ?? fallback.locationKo,
      locationEn: infoRow?.location_en ?? fallback.locationEn,
      email,
      phoneDisplay,
      ...deriveHrefs(email, phoneDisplay),
      infoLabelKo: infoRow?.info_label_ko ?? fallback.infoLabelKo,
      infoLabelEn: infoRow?.info_label_en ?? fallback.infoLabelEn,
      ctaHeadlineKo: ctaRow?.headline_ko ?? fallback.ctaHeadlineKo,
      ctaHeadlineEn: ctaRow?.headline_en ?? fallback.ctaHeadlineEn,
      ctaButtonKo: ctaRow?.button_ko ?? fallback.ctaButtonKo,
      ctaButtonEn: ctaRow?.button_en ?? fallback.ctaButtonEn,
    };
  }, contactInfoFallback());
}
