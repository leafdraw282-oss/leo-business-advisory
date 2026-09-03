/**
 * One Insight card. Two states:
 * - No link set (linkUrl falsy) — the original placeholder: no real post
 *   exists yet, so this deliberately renders no link/button of any kind,
 *   just the shared "coming soon" badge (comingSoonLabel). A fake "read
 *   more" going nowhere would violate this project's own No Dead Button
 *   Rule (CLAUDE.md).
 * - A link is set (an admin pointed this specific card at a real Naver
 *   blog post / YouTube video / etc., src/admin/pages/content/InsightsSection.jsx)
 *   — a real, working button opening it in a new tab. linkLabel is the
 *   button's own text (never the raw URL), editable per card.
 */
function InsightCard({ title, comingSoonLabel, linkUrl, linkLabel }) {
  return (
    <article className="insight-card">
      <h3 className="insight-card__title">{title}</h3>
      {linkUrl ? (
        <a className="insight-card__badge insight-card__link" href={linkUrl} target="_blank" rel="noreferrer">
          {linkLabel}
        </a>
      ) : (
        <span className="insight-card__badge">{comingSoonLabel}</span>
      )}
    </article>
  );
}

export default InsightCard;
