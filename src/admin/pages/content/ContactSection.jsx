import { contact, contactCta, contactForm, inquiryTypes } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton, fetchList, saveListRow } from '../../content/supabaseTable.js';
import { useAdminForm } from '../../content/useAdminForm.js';
import { requireFilled } from '../../content/validation.js';
import BilingualField from '../../components/BilingualField.jsx';
import PlainField from '../../components/PlainField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';

// contact.emailHref / contact.phoneHref are derived (mailto:/tel:) from
// email / phoneDisplay elsewhere in the app, not stored separately here —
// see docs/ADMIN_CMS_ARCHITECTURE.md's contact_info design note.

function infoFallback() {
  return {
    locationKo: contact.locationKo,
    locationEn: contact.locationEn,
    email: contact.email,
    phoneDisplay: contact.phoneDisplay,
    infoLabelKo: contact.infoLabelKo,
    infoLabelEn: contact.infoLabelEn,
  };
}

function ctaFallback() {
  return {
    headlineKo: contactCta.headlineKo,
    headlineEn: contactCta.headlineEn,
    buttonKo: contactCta.buttonKo,
    buttonEn: contactCta.buttonEn,
  };
}

function formFallback() {
  return {
    labelNameKo: contactForm.labels.name.ko,
    labelNameEn: contactForm.labels.name.en,
    labelCompanyKo: contactForm.labels.company.ko,
    labelCompanyEn: contactForm.labels.company.en,
    labelEmailKo: contactForm.labels.email.ko,
    labelEmailEn: contactForm.labels.email.en,
    labelInquiryTypeKo: contactForm.labels.inquiryType.ko,
    labelInquiryTypeEn: contactForm.labels.inquiryType.en,
    labelMessageKo: contactForm.labels.message.ko,
    labelMessageEn: contactForm.labels.message.en,
    inquiryPlaceholderKo: contactForm.inquiryPlaceholderKo,
    inquiryPlaceholderEn: contactForm.inquiryPlaceholderEn,
    submitKo: contactForm.submitKo,
    submitEn: contactForm.submitEn,
    noteKo: contactForm.noteKo,
    noteEn: contactForm.noteEn,
  };
}

function inquiryTypesFallback() {
  return inquiryTypes.map((t) => ({ id: null, labelKo: t.ko, labelEn: t.en }));
}

async function load() {
  if (!isSupabaseConfigured) {
    return { info: infoFallback(), cta: ctaFallback(), form: formFallback(), inquiryTypes: inquiryTypesFallback() };
  }

  const infoRow = await fetchSingleton('contact_info');
  const info = infoRow
    ? {
        locationKo: infoRow.location_ko,
        locationEn: infoRow.location_en,
        email: infoRow.email,
        phoneDisplay: infoRow.phone_display,
        infoLabelKo: infoRow.info_label_ko,
        infoLabelEn: infoRow.info_label_en,
      }
    : infoFallback();

  const ctaRow = await fetchSingleton('contact_cta');
  const cta = ctaRow
    ? { headlineKo: ctaRow.headline_ko, headlineEn: ctaRow.headline_en, buttonKo: ctaRow.button_ko, buttonEn: ctaRow.button_en }
    : ctaFallback();

  const formRow = await fetchSingleton('contact_form_content');
  const form = formRow
    ? {
        labelNameKo: formRow.labels.name.ko,
        labelNameEn: formRow.labels.name.en,
        labelCompanyKo: formRow.labels.company.ko,
        labelCompanyEn: formRow.labels.company.en,
        labelEmailKo: formRow.labels.email.ko,
        labelEmailEn: formRow.labels.email.en,
        labelInquiryTypeKo: formRow.labels.inquiryType.ko,
        labelInquiryTypeEn: formRow.labels.inquiryType.en,
        labelMessageKo: formRow.labels.message.ko,
        labelMessageEn: formRow.labels.message.en,
        inquiryPlaceholderKo: formRow.inquiry_placeholder_ko,
        inquiryPlaceholderEn: formRow.inquiry_placeholder_en,
        submitKo: formRow.submit_ko,
        submitEn: formRow.submit_en,
        noteKo: formRow.note_ko,
        noteEn: formRow.note_en,
      }
    : formFallback();

  const inquiryTypeRows = await fetchList('inquiry_types');
  const inquiryTypesValues =
    inquiryTypeRows.length > 0
      ? inquiryTypeRows.map((r) => ({ id: r.id, labelKo: r.label_ko, labelEn: r.label_en }))
      : inquiryTypesFallback();

  return { info, cta, form, inquiryTypes: inquiryTypesValues };
}

async function save(values) {
  requireFilled([
    { label: 'Location', ko: values.info.locationKo, en: values.info.locationEn },
    { label: 'Contact info label', ko: values.info.infoLabelKo, en: values.info.infoLabelEn },
    { label: 'CTA headline', ko: values.cta.headlineKo, en: values.cta.headlineEn },
    { label: 'CTA button', ko: values.cta.buttonKo, en: values.cta.buttonEn },
    { label: 'Form label: Name', ko: values.form.labelNameKo, en: values.form.labelNameEn },
    { label: 'Form label: Company', ko: values.form.labelCompanyKo, en: values.form.labelCompanyEn },
    { label: 'Form label: Email', ko: values.form.labelEmailKo, en: values.form.labelEmailEn },
    { label: 'Form label: Inquiry type', ko: values.form.labelInquiryTypeKo, en: values.form.labelInquiryTypeEn },
    { label: 'Form label: Message', ko: values.form.labelMessageKo, en: values.form.labelMessageEn },
    { label: 'Inquiry placeholder', ko: values.form.inquiryPlaceholderKo, en: values.form.inquiryPlaceholderEn },
    { label: 'Submit label', ko: values.form.submitKo, en: values.form.submitEn },
    { label: 'Form note', ko: values.form.noteKo, en: values.form.noteEn },
    ...values.inquiryTypes.map((t, i) => ({ label: `Inquiry type ${i + 1}`, ko: t.labelKo, en: t.labelEn })),
  ]);

  if (!values.info.email.trim() || !values.info.phoneDisplay.trim()) {
    throw new Error('Email and phone are required.');
  }

  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured — cannot save. See supabase/README.md.');
  }

  await upsertSingleton('contact_info', {
    location_ko: values.info.locationKo,
    location_en: values.info.locationEn,
    email: values.info.email,
    phone_display: values.info.phoneDisplay,
    info_label_ko: values.info.infoLabelKo,
    info_label_en: values.info.infoLabelEn,
  });

  await upsertSingleton('contact_cta', {
    headline_ko: values.cta.headlineKo,
    headline_en: values.cta.headlineEn,
    button_ko: values.cta.buttonKo,
    button_en: values.cta.buttonEn,
  });

  await upsertSingleton('contact_form_content', {
    labels: {
      name: { ko: values.form.labelNameKo, en: values.form.labelNameEn },
      company: { ko: values.form.labelCompanyKo, en: values.form.labelCompanyEn },
      email: { ko: values.form.labelEmailKo, en: values.form.labelEmailEn },
      inquiryType: { ko: values.form.labelInquiryTypeKo, en: values.form.labelInquiryTypeEn },
      message: { ko: values.form.labelMessageKo, en: values.form.labelMessageEn },
    },
    inquiry_placeholder_ko: values.form.inquiryPlaceholderKo,
    inquiry_placeholder_en: values.form.inquiryPlaceholderEn,
    submit_ko: values.form.submitKo,
    submit_en: values.form.submitEn,
    note_ko: values.form.noteKo,
    note_en: values.form.noteEn,
  });

  for (const [index, type] of values.inquiryTypes.entries()) {
    await saveListRow('inquiry_types', type.id, {
      label_ko: type.labelKo,
      label_en: type.labelEn,
      sort_order: index,
    });
  }

  return load();
}

function ContactSection() {
  const { status, loadError, values, update, isDirty, saveState, saveError, save: runSave, reload } =
    useAdminForm({ load, save });

  function updateInfo(patch) {
    update((prev) => ({ ...prev, info: { ...prev.info, ...patch } }));
  }
  function updateCta(patch) {
    update((prev) => ({ ...prev, cta: { ...prev.cta, ...patch } }));
  }
  function updateForm(patch) {
    update((prev) => ({ ...prev, form: { ...prev.form, ...patch } }));
  }
  function updateInquiryType(index, patch) {
    update((prev) => ({
      ...prev,
      inquiryTypes: prev.inquiryTypes.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    }));
  }

  return (
    <section className="admin-section-form">
      <h2>Contact</h2>
      <SectionStatus
        status={status}
        loadError={loadError}
        isDirty={isDirty}
        saveState={saveState}
        saveError={saveError}
        onSave={runSave}
        onReload={reload}
      />
      {values && (
        <>
          <h3>Contact info</h3>
          <BilingualField
            label="Location"
            ko={values.info.locationKo}
            en={values.info.locationEn}
            onKoChange={(v) => updateInfo({ locationKo: v })}
            onEnChange={(v) => updateInfo({ locationEn: v })}
          />
          <PlainField label="Email" type="email" value={values.info.email} onChange={(v) => updateInfo({ email: v })} />
          <PlainField label="Phone (display)" value={values.info.phoneDisplay} onChange={(v) => updateInfo({ phoneDisplay: v })} />
          <BilingualField
            label="Contact info label"
            ko={values.info.infoLabelKo}
            en={values.info.infoLabelEn}
            onKoChange={(v) => updateInfo({ infoLabelKo: v })}
            onEnChange={(v) => updateInfo({ infoLabelEn: v })}
          />

          <h3>Final CTA</h3>
          <BilingualField
            label="Headline"
            ko={values.cta.headlineKo}
            en={values.cta.headlineEn}
            onKoChange={(v) => updateCta({ headlineKo: v })}
            onEnChange={(v) => updateCta({ headlineEn: v })}
          />
          <BilingualField
            label="Button"
            ko={values.cta.buttonKo}
            en={values.cta.buttonEn}
            onKoChange={(v) => updateCta({ buttonKo: v })}
            onEnChange={(v) => updateCta({ buttonEn: v })}
          />

          <h3>Form copy</h3>
          <BilingualField
            label="Field label: Name"
            ko={values.form.labelNameKo}
            en={values.form.labelNameEn}
            onKoChange={(v) => updateForm({ labelNameKo: v })}
            onEnChange={(v) => updateForm({ labelNameEn: v })}
          />
          <BilingualField
            label="Field label: Company"
            ko={values.form.labelCompanyKo}
            en={values.form.labelCompanyEn}
            onKoChange={(v) => updateForm({ labelCompanyKo: v })}
            onEnChange={(v) => updateForm({ labelCompanyEn: v })}
          />
          <BilingualField
            label="Field label: Email"
            ko={values.form.labelEmailKo}
            en={values.form.labelEmailEn}
            onKoChange={(v) => updateForm({ labelEmailKo: v })}
            onEnChange={(v) => updateForm({ labelEmailEn: v })}
          />
          <BilingualField
            label="Field label: Inquiry type"
            ko={values.form.labelInquiryTypeKo}
            en={values.form.labelInquiryTypeEn}
            onKoChange={(v) => updateForm({ labelInquiryTypeKo: v })}
            onEnChange={(v) => updateForm({ labelInquiryTypeEn: v })}
          />
          <BilingualField
            label="Field label: Message"
            ko={values.form.labelMessageKo}
            en={values.form.labelMessageEn}
            onKoChange={(v) => updateForm({ labelMessageKo: v })}
            onEnChange={(v) => updateForm({ labelMessageEn: v })}
          />
          <BilingualField
            label="Inquiry-type placeholder"
            ko={values.form.inquiryPlaceholderKo}
            en={values.form.inquiryPlaceholderEn}
            onKoChange={(v) => updateForm({ inquiryPlaceholderKo: v })}
            onEnChange={(v) => updateForm({ inquiryPlaceholderEn: v })}
          />
          <BilingualField
            label="Submit button"
            ko={values.form.submitKo}
            en={values.form.submitEn}
            onKoChange={(v) => updateForm({ submitKo: v })}
            onEnChange={(v) => updateForm({ submitEn: v })}
          />
          <BilingualField
            label="Note (below submit)"
            ko={values.form.noteKo}
            en={values.form.noteEn}
            onKoChange={(v) => updateForm({ noteKo: v })}
            onEnChange={(v) => updateForm({ noteEn: v })}
            multiline
          />

          <h3>Inquiry types</h3>
          {values.inquiryTypes.map((type, index) => (
            <div className="admin-list-row" key={type.id ?? `new-${index}`}>
              <BilingualField
                label={`Inquiry type ${index + 1}`}
                ko={type.labelKo}
                en={type.labelEn}
                onKoChange={(v) => updateInquiryType(index, { labelKo: v })}
                onEnChange={(v) => updateInquiryType(index, { labelEn: v })}
              />
            </div>
          ))}
        </>
      )}
    </section>
  );
}

export default ContactSection;
