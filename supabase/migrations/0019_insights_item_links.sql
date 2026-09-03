-- ============================================================================
-- Insights preview cards — optional per-card external link.
--
-- Each of the 3 Insight placeholder cards showed a shared "준비 중입니다"
-- ("Coming soon") label (insights_section.coming_soon_ko/en) — editing
-- that in admin changed all cards at once, with no way to point an
-- individual card at a real published piece (a Naver blog post, a
-- YouTube video, etc.) once one exists. link_url/link_label_ko/en are
-- per-row and all nullable: a card with no link set keeps rendering the
-- existing shared "coming soon" badge exactly as before (see
-- InsightCard.jsx) — this is purely additive, no existing card's
-- behavior changes until an admin explicitly sets a link on it.
--
-- The link itself is never shown as raw URL text on the public site
-- (InsightCard.jsx renders link_label_ko/en as the visible button text,
-- opened in a new tab) — link_label lets each card's button read
-- differently ("네이버 블로그에서 보기" vs "유튜브에서 보기") rather than
-- one fixed word for every card.
-- ============================================================================

alter table insights_items
  add column if not exists link_url text,
  add column if not exists link_label_ko text,
  add column if not exists link_label_en text;
