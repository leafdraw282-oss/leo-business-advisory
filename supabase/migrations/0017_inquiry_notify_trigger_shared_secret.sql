-- ============================================================================
-- Inquiry email notification trigger — switch from a Supabase anon-key
-- Authorization header to a plain shared secret.
--
-- 0016_inquiry_notify_trigger.sql's `Authorization: Bearer <anon key>`
-- header was rejected by the Edge Function gateway with
-- `UNAUTHORIZED_INVALID_JWT_FORMAT` on the real project this was being
-- set up on, even with a freshly-copied, correctly-decoding anon key —
-- confirmed via `select * from net._http_response ...`, which showed the
-- 401 coming back from the gateway itself, before notify-inquiry's own
-- code ever ran. Rather than keep chasing why that project's legacy JWT
-- verification rejects a well-formed anon key, this switches to a
-- mechanism this repo fully controls: the notify-inquiry function
-- (updated alongside this migration) is redeployed with JWT verification
-- turned OFF and instead checks a plain `x-webhook-secret` header itself
-- against a WEBHOOK_SECRET Edge Function secret.
--
-- REPLACE THE TWO PLACEHOLDERS BELOW before running this in the Supabase
-- SQL Editor:
--   <PROJECT_URL>      — e.g. https://xxxxxxxxxxxx.supabase.co
--   <WEBHOOK_SECRET>   — any long random string, YOUR OWN CHOICE — must
--                        match exactly the WEBHOOK_SECRET Edge Function
--                        secret (Edge Functions → Manage secrets). Unlike
--                        the anon key, this is a secret you generate
--                        yourself — never share it outside this SQL and
--                        that one secrets field.
-- Only replaces 0016's function — the trigger itself (inquiries_notify_email)
-- is untouched, `create or replace function` just swaps its body.
-- ============================================================================

create or replace function public.notify_new_inquiry()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform net.http_post(
    url := '<PROJECT_URL>/functions/v1/notify-inquiry',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', '<WEBHOOK_SECRET>'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'inquiries',
      'record', to_jsonb(new)
    )
  );
  return new;
end;
$$;
