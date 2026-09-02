// Supabase Edge Function — Inquiry email notification.
//
// Triggered by a Database Webhook (Dashboard → Database → Webhooks, type
// "Supabase Edge Functions") on every INSERT into `inquiries`
// (supabase/migrations/0005_inquiries.sql). Formats the new row into a
// readable summary and sends it by email via Resend (resend.com) to the
// address in NOTIFY_EMAIL_TO — see docs/EMAIL_NOTIFICATIONS_SETUP.md for
// the full, no-CLI-required setup walkthrough.
//
// This is read-only with respect to the database — it only reads the row
// the webhook already handed it. It never queries Supabase itself, so it
// needs no service_role key (see docs/FOUNDATION.md §19): its only
// secrets are RESEND_API_KEY and NOTIFY_EMAIL_TO, both Edge Function
// secrets that never reach the client bundle.
//
// A failure here (missing secret, Resend outage, etc.) never loses the
// inquiry itself — the row is already safely committed to `inquiries`
// before the webhook fires, and stays visible in the admin Inquiries
// screen regardless of whether the notification email goes out.

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'LEO BUSINESS ADVISORY <onboarding@resend.dev>';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const toEmail = Deno.env.get('NOTIFY_EMAIL_TO');
  const fromEmail = Deno.env.get('NOTIFY_EMAIL_FROM') || DEFAULT_FROM;

  if (!resendApiKey || !toEmail) {
    console.error('notify-inquiry: missing RESEND_API_KEY or NOTIFY_EMAIL_TO secret');
    return new Response('Not configured', { status: 500 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // A Database Webhook can be (mis)configured for other events/tables —
  // failing loud here beats silently emailing the wrong thing.
  if (payload?.type !== 'INSERT' || payload?.table !== 'inquiries') {
    return new Response('Ignored (not an inquiry insert)', { status: 200 });
  }

  const row = (payload.record ?? {}) as Record<string, unknown>;
  const name = String(row.name ?? '');
  const company = row.company ? String(row.company) : null;
  const email = String(row.email ?? '');
  const inquiryType = String(row.inquiry_type ?? '');
  const message = String(row.message ?? '');
  const createdAt = formatDate(String(row.created_at ?? new Date().toISOString()));

  const subject = `[LEO BUSINESS ADVISORY] 새 문의 — ${name} (${inquiryType})`;

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="margin-bottom: 4px;">새로운 문의가 접수되었습니다</h2>
      <p style="color: #666; margin-top: 0;">${escapeHtml(createdAt)}</p>
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr><td style="padding: 6px 12px 6px 0; color: #666; white-space: nowrap;">이름</td><td style="padding: 6px 0;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #666;">회사</td><td style="padding: 6px 0;">${escapeHtml(company ?? '—')}</td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #666;">이메일</td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #666;">문의 유형</td><td style="padding: 6px 0;">${escapeHtml(inquiryType)}</td></tr>
      </table>
      <p style="color: #666; margin-bottom: 4px;">내용</p>
      <p style="white-space: pre-wrap; border-left: 3px solid #ddd; padding-left: 12px;">${escapeHtml(message)}</p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">관리자 페이지(Inquiries)에서 상태를 변경하거나 삭제할 수 있습니다.</p>
    </div>
  `;

  const resendResponse = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      // Lets the site owner just hit Reply in Gmail to answer the
      // inquirer directly, instead of copying their address out by hand.
      reply_to: email || undefined,
      subject,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    console.error('notify-inquiry: Resend API error', resendResponse.status, errorText);
    return new Response('Email send failed', { status: 502 });
  }

  return new Response('OK', { status: 200 });
});
