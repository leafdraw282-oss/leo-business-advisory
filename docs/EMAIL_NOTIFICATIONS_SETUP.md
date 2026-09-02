# Email Notifications for New Inquiries

This is a step-by-step guide for turning on email alerts: whenever
someone submits the Contact Form on the site, a summary of that inquiry
lands in your Gmail inbox automatically. Written for someone who has
never done this before — every step says exactly what to click or type.

**Nothing about this is active yet.** The code (`supabase/functions/notify-inquiry/index.ts`)
is written and committed, but three things only you can do (steps 1, 2,
and 4 below) haven't happened — this session can't sign up for a Resend
account on your behalf, and it can never connect to your real production
Supabase project (see `docs/FOUNDATION.md` for why). Until you finish this
guide, the site behaves exactly as it does today: inquiries save to the
database and show up in the admin Inquiries screen — nothing breaks by
not doing this, you just don't get the email nudge yet.

## How it works

```
Contact Form submitted
  → saved to the `inquiries` table (already live today)
  → a Database Webhook fires
  → an Edge Function (`notify-inquiry`) formats the inquiry
  → Resend (a free email-sending service) sends it to your Gmail
```

No new server was added — the "backend" here is entirely Supabase's own
Edge Functions feature (a small piece of code Supabase runs for you) plus
Resend, a service that exists specifically to let apps like this one send
email reliably (a plain website can't send email directly the way a mail
client can). If the email step ever fails for any reason, the inquiry
itself is never lost — it's already safely saved to the database before
the email is even attempted, and always stays visible in
Admin → Inquiries regardless.

## 1. Resend 계정 만들기 (Create a free Resend account)

1. Go to [resend.com](https://resend.com) and sign up (no credit card
   required for the free tier — 3,000 emails/month, 100/day, more than
   enough for inquiry notifications).
2. Once logged in, go to **API Keys** in the left sidebar → **Create API
   Key**. Give it any name (e.g. "leo-business-advisory") and leave
   permissions at the default (Full access / Sending access).
3. Copy the key it shows you — it starts with `re_` and is only shown
   **once**. Save it somewhere safe; you'll paste it into Supabase in
   step 3.

You don't need to verify a domain for this to work — Resend's shared
`onboarding@resend.dev` sending address (already set as this function's
default) works immediately with no setup. The one trade-off: mail from a
shared address occasionally lands in Gmail's Spam/Promotions folder the
first few times, especially before you've ever replied to or starred one.
If that happens, open the message once and mark it "Not spam" — Gmail
learns from that quickly. (Owning a custom domain later, per
`docs/CUSTOM_DOMAIN_SETUP.md`, lets you verify it with Resend for a
branded `noreply@yourdomain.com` sender that skips this entirely — not
needed to get started.)

## 2. Supabase에 Edge Function 배포하기 (Deploy the Edge Function)

The function's code already exists in this repo at
`supabase/functions/notify-inquiry/index.ts`. Deploy it to your Supabase
project via the Dashboard (no command line needed):

1. Open your project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Go to **Edge Functions** in the left sidebar → **Deploy a new
   function** (or **Create a function**, wording varies by Supabase
   version).
3. Name it exactly `notify-inquiry` (the webhook in step 4 will look for
   this name).
4. When it opens a code editor, delete the placeholder content and paste
   in the entire contents of `supabase/functions/notify-inquiry/index.ts`
   from this repo.
5. Click **Deploy**. Leave "Verify JWT" / "Enforce JWT verification"
   **turned on** (the default) — this is what stops random internet
   traffic from calling your function directly; the webhook in step 4
   authenticates automatically, so you don't need to do anything extra
   for that.

*(If your Supabase project's Dashboard doesn't offer an in-browser code
editor for functions — older projects sometimes only show a CLI-based
"Deploy a new function" screen — the alternative is the [Supabase
CLI](https://supabase.com/docs/guides/cli): install it, run
`supabase login`, `supabase link --project-ref <your-project-ref>` (found
in Settings → General), then `supabase functions deploy notify-inquiry`
from this repo's root. Either path deploys the same file.)*

## 3. Secret 값 등록하기 (Set the function's secrets)

The function needs two pieces of information it never hardcodes — your
Resend API key and the Gmail address to notify. Set these as Edge
Function secrets (separate from this repo's `.env.local`/GitHub
secrets — these live only inside Supabase and are never bundled into the
public website):

1. In the Dashboard, go to **Edge Functions** → **Manage secrets** (or
   **Secrets**, in the Edge Functions section).
2. Add:
   | Name | Value |
   |---|---|
   | `RESEND_API_KEY` | the `re_...` key from step 1 |
   | `NOTIFY_EMAIL_TO` | the Gmail address that should receive inquiries |
3. Save. No redeploy is needed — secrets are read fresh on every
   invocation.

*(Optional: `NOTIFY_EMAIL_FROM` overrides the default `onboarding@resend.dev`
sender — only set this once you've verified your own domain with Resend,
per the note in step 1.)*

## 4. Database Webhook 연결하기 (Wire it to new inquiries)

This is the step that actually makes an insert into `inquiries` call the
function above:

1. In the Dashboard, go to **Database** → **Webhooks** → **Create a new
   webhook**.
2. Fill in:
   - **Name**: `notify-inquiry` (or anything recognizable).
   - **Table**: `inquiries`.
   - **Events**: check **Insert** only (leave Update/Delete unchecked —
     the function is written to expect Insert and will just no-op on
     anything else, but there's no reason to send it events it ignores).
   - **Type**: choose **Supabase Edge Functions** (not "HTTP Request") —
     this is what makes Supabase attach the right authentication
     automatically, matching "Verify JWT: on" from step 2.
   - **Edge Function**: select `notify-inquiry` from the dropdown.
3. Save.

### Step 4가 이 에러로 실패한다면 (Plan B)

> Failed to create webhook: Failed to run sql query: ERROR: 3F000: schema
> "supabase_functions" does not exist

이건 일부 Supabase 프로젝트에 Database Webhooks 기능이 내부적으로 의존하는
`supabase_functions` 스키마가 아예 프로비저닝되어 있지 않은, Supabase
플랫폼 쪽의 알려진 문제입니다 — 이 저장소의 마이그레이션으로 고칠 수 있는
부분이 아니에요 (그 스키마는 Supabase 서버 쪽에서 자동으로 만들어주는
것이라, `pg_net` 확장 기능을 껐다 켜도 보통 해결되지 않습니다).

다행히 Database Webhooks 기능 자체가 내부적으로 `pg_net`
(Database → Extensions에서 이미 켜져 있는 걸 확인하셨죠) 위에 얇게 씌운
편의 기능일 뿐이라, `pg_net`을 직접 호출하는 트리거를 만들면 완전히 같은
결과를 낼 수 있습니다. 이 저장소에 이미 그 코드가
`supabase/migrations/0016_inquiry_notify_trigger.sql`로 준비되어 있어요.

1. Supabase Dashboard → **SQL Editor** → **New query**.
2. `supabase/migrations/0016_inquiry_notify_trigger.sql` 파일 내용을 그대로
   복사해서 붙여넣기.
3. 붙여넣은 내용에서 **딱 2곳**을 실제 값으로 바꿔주세요 (파일 안에 있는
   `<PROJECT_URL>`, `<ANON_KEY>` 자리):
   - `<PROJECT_URL>` → Settings → API 페이지의 **Project URL**
     (예: `https://xxxxxxxxxxxx.supabase.co`)
   - `<ANON_KEY>` → 같은 페이지의 **anon / public** 키 (service_role 키가
     아닙니다 — anon 키는 원래 공개해도 되는 키예요, `docs/FOUNDATION.md`
     §19 참고)
4. **Run** 클릭. 에러 없이 끝나면 완료입니다 — 이제 5번 "테스트하기"로
   바로 넘어가시면 돼요. (이 경우 4번의 Dashboard Webhook은 만들 필요가
   없습니다 — 이 SQL 트리거가 같은 역할을 대신합니다.)

### Plan B를 했는데도 메일이 안 온다면 (Plan C)

Plan B의 트리거는 실제로 작동하지만, `Authorization: Bearer <anon key>`
헤더를 일부 프로젝트의 Edge Function 게이트웨이가 `Invalid JWT`로 거부하는
경우가 확인됐습니다 — anon 키를 다시 정확히 복사해도 동일했습니다. 아래
쿼리로 실제 응답을 직접 볼 수 있습니다:

```sql
select * from net._http_response order by created desc limit 3;
```

`status_code`가 401이고 `content`에 `"UNAUTHORIZED_INVALID_JWT_FORMAT"`이
보이면 이 문제입니다. anon 키 대신, 이 저장소가 완전히 통제할 수 있는
방식 — 직접 만든 비밀 문자열(shared secret)을 커스텀 헤더로 보내고,
`notify-inquiry` 함수가 그 값을 스스로 검사하는 방식 — 으로 바꾸면
해결됩니다.

1. **`notify-inquiry` 함수를 최신 코드로 재배포** — Edge Functions →
   `notify-inquiry` → 편집 화면 열기 → `supabase/functions/notify-inquiry/index.ts`의
   **현재(최신)** 내용 전체로 덮어쓰기 (이제 `WEBHOOK_SECRET`이라는 값을
   커스텀 헤더로 검사하는 코드가 추가되어 있습니다) → **Deploy**.
   - 이번엔 **"Verify JWT" / "Enforce JWT Verification" 옵션을 꺼주세요**
     (재배포 화면 또는 함수의 Settings/Details 쪽에 있습니다). 이 함수는
     이제 Supabase JWT가 아니라 자체 비밀 값으로 인증을 확인하므로, 플랫폼
     JWT 검증을 켜두면 오히려 우리 코드가 실행되기도 전에 막혀버립니다
     (지금 겪은 문제와 동일한 증상).
2. **`WEBHOOK_SECRET` 시크릿 추가** — Edge Functions → **Manage secrets** →
   이름 `WEBHOOK_SECRET`, 값은 아무 긴 무작위 문자열이나 직접 정하시면
   됩니다 (예: 비밀번호 생성기로 만든 32자 이상 문자열). 이 값은 anon
   키와 달리 **본인만 아는 값**이어야 합니다 — 아무에게도 공유하지 마세요.
3. **트리거 함수 업데이트** — SQL Editor → New query →
   `supabase/migrations/0017_inquiry_notify_trigger_shared_secret.sql`
   파일 내용을 그대로 붙여넣고, `<PROJECT_URL>`은 그대로 실제 프로젝트
   URL로, `<WEBHOOK_SECRET>`은 **2번에서 정한 것과 정확히 같은 값**으로
   바꿔서 **Run**.
4. 사이트에서 테스트 문의를 다시 보내고, `select * from net._http_response
   order by created desc limit 3;`로 최신 응답이 200인지, Gmail에 메일이
   왔는지 확인합니다.

## 5. 테스트하기 (Test it for real)

1. Go to the live public site's Contact section and submit a real test
   inquiry (any name/email/message — you can delete it from
   Admin → Inquiries afterward).
2. Within a few seconds, check the Gmail inbox you set in step 3 — the
   notification should arrive with the subject
   `[LEO BUSINESS ADVISORY] 새 문의 — <이름> (<문의 유형>)`.
3. If it doesn't arrive after a minute or two:
   - Check Gmail's Spam/Promotions folders first (see the note in step
     1).
   - In the Supabase Dashboard, go to **Edge Functions** → `notify-inquiry`
     → **Logs**, and separately **Database** → **Webhooks** → your
     webhook → its delivery log. Between the two you can see exactly
     where it stopped (webhook never fired, function errored, or Resend
     rejected the request) and the logged error message says why.
   - The most common causes: `RESEND_API_KEY`/`NOTIFY_EMAIL_TO` not set
     (step 3), or the webhook's Type set to "HTTP Request" instead of
     "Supabase Edge Functions" (step 4) — the log messages spell out
     both directly.
4. Once confirmed working, delete the test inquiry from
   Admin → Inquiries so it doesn't sit there as clutter.

---

## Quick reference

| Piece | Where it lives | Who sets it up |
|---|---|---|
| `inquiries` table + RLS | `supabase/migrations/0005_inquiries.sql` | already done |
| Edge Function code | `supabase/functions/notify-inquiry/index.ts` | already written — you deploy it (step 2) |
| `RESEND_API_KEY` / `NOTIFY_EMAIL_TO` | Supabase Edge Function secrets | you (step 3) |
| Database Webhook (insert → function) | Supabase Dashboard → Database → Webhooks | you (step 4) |
| Resend account | resend.com | you (step 1) |
