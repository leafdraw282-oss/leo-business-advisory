/**
 * One Insight placeholder card. No published post exists yet (see
 * src/data/profile.js's `insights` — title-only, "no fabricated content"
 * per the Advisory Sales brief), so this deliberately renders no
 * link/button of any kind — a fake "read more" going nowhere would violate
 * this project's own No Dead Button Rule (CLAUDE.md). It becomes a real
 * link only once an actual article exists.
 */
function InsightCard({ title, comingSoonLabel }) {
  return (
    <article className="insight-card">
      <h3 className="insight-card__title">{title}</h3>
      <span className="insight-card__badge">{comingSoonLabel}</span>
    </article>
  );
}

export default InsightCard;
