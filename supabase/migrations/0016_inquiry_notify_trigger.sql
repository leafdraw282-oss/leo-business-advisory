-- ============================================================================
-- Inquiry email notification — direct pg_net trigger (fallback for
-- projects where the Dashboard's Database Webhooks UI fails).
--
-- The intended setup (docs/EMAIL_NOTIFICATIONS_SETUP.md, step 4) is to
-- create a Database Webhook via Dashboard → Integrations → Database
-- Webhooks, Type "Supabase Edge Functions". On at least one real project
-- that failed outright with `ERROR: 3F000: schema "supabase_functions"
-- does not exist` — a gap in that project's own platform-managed schema,
-- not something any migration in this repo can create or fix (that
-- schema/its trigger function are provisioned by Supabase's control
-- plane, not by user migrations).
--
-- `pg_net` itself (the extension the Dashboard feature is a thin wrapper
-- around) works fine and is confirmed enabled on Database → Extensions,
-- so this trigger calls it directly — `net.http_post()` — skipping the
-- missing `supabase_functions` wrapper entirely. Functionally identical
-- to what the Dashboard webhook would have created: same URL, same
-- payload shape (`{type, table, record}`, matching what
-- supabase/functions/notify-inquiry/index.ts already expects), fired
-- asynchronously so a slow/failing notify-inquiry call never blocks or
-- fails the actual insert.
--
-- REPLACE THE TWO PLACEHOLDERS BELOW before running this in the Supabase
-- SQL Editor:
--   <PROJECT_URL>  — e.g. https://xxxxxxxxxxxx.supabase.co (Settings → API)
--   <ANON_KEY>     — the "anon" / "public" project API key (Settings →
--                    API). Safe to embed here: it's designed to be
--                    public client-side (see docs/FOUNDATION.md §19) —
--                    this is not the service_role key, and never should
--                    be.
-- Only needed on a project where the Database Webhooks UI itself hits the
-- schema error above; skip this file entirely if that UI worked.
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
      'Authorization', 'Bearer <ANON_KEY>'
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

drop trigger if exists inquiries_notify_email on inquiries;

create trigger inquiries_notify_email
  after insert on inquiries
  for each row
  execute function public.notify_new_inquiry();
