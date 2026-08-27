import { isSupabaseConfigured, supabase } from './supabase.js';

// Public-facing write path for the Contact Form (src/components/ContactForm.jsx)
// — the mirror image of src/lib/content/*.js, which are all read-only. RLS
// (supabase/migrations/0005_inquiries.sql) is the real security boundary:
// this can only ever INSERT a fresh 'new' row, never read one back.

export class InquirySubmissionError extends Error {}

/**
 * @param {{ name: string, company: string, email: string, inquiryType: string, message: string }} fields
 *   Already-trimmed, already-validated field values — ContactForm.jsx runs
 *   its own required/format checks before calling this, so failures here
 *   are backend problems (network, RLS, a database constraint), not typos.
 */
export async function submitInquiry({ name, company, email, inquiryType, message }) {
  if (!isSupabaseConfigured) {
    throw new InquirySubmissionError('Supabase is not configured — the Contact Form cannot accept submissions yet.');
  }

  const { error } = await supabase.from('inquiries').insert({
    name,
    company: company || null,
    email,
    inquiry_type: inquiryType,
    message,
  });

  if (error) {
    throw new InquirySubmissionError(error.message);
  }
}
