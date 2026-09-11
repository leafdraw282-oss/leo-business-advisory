import { isValidHttpUrl } from '../lib/urlValidation.js';

/**
 * One Insight card. Two states:
 * - No link set, or an invalid one (isValidHttpUrl fails) — the original
 *   placeholder: no real post exists yet, so this deliberately renders no
 *   link/button of any kind, just the shared "coming soon" badge
 *   (comingSoonLabel). A fake "read more" going nowhere, or a button
 *   pointing at a blank/malformed href, would violate this project's own
 *   No Dead Button Rule (CLAUDE.md).
 * - A valid http(s) link is set (an admin pointed this specific card at a
 *   real blog post / video / etc., src/admin/pages/content/InsightsSection.jsx)
 *   — a real, working button opening it in a new tab. linkLabel is
 *   auto-generated from the current language (see InsightsPreview.jsx),
 *   never the raw URL.
 */
function InsightCard({ title, comingSoonLabel, linkUrl, linkLabel }) {
  const href = isValidHttpUrl(linkUrl) ? linkUrl.trim() : null;
  return (
    <article className="insight-card">
      <h3 className="insight-card__title">{title}</h3>
      {href ? (
        <a className="insight-card__badge insight-card__link" href={href} target="_blank" rel="noreferrer">
          {linkLabel}
        </a>
      ) : (
        <span className="insight-card__badge">{comingSoonLabel}</span>
      )}
    </article>
  );
}

export default InsightCard;
