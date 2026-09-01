/**
 * One Advisory Product panel (What We Do section) — deliberately flat and
 * typographic (a top border + generous padding, no shadow/gradient/rounded
 * card chrome) per the Advisory Sales brief's "카드 UI 남용 지양" direction.
 * All text arriving here is already resolved to the current language by
 * the caller (src/sections/Advisory.jsx).
 *
 * No per-card CTA — a "Talk to Leo" link on every single product read as
 * a hard sell rather than informational ("설명은 좋지만 신뢰감을 주지
 * 않는다"), undercutting the credibility this section is trying to build.
 * The card simply states what the product is; the site's one consultation
 * ask stays at Hero and Contact, where it belongs.
 */
function AdvisoryCard({ name, target, focus = [], deliverableLabel, deliverable }) {
  return (
    <article className="advisory-card">
      <h3 className="advisory-card__name">{name}</h3>
      <p className="advisory-card__target">{target}</p>
      <ul className="advisory-card__focus">
        {focus.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="advisory-card__deliverable">
        <span className="advisory-card__deliverable-label">{deliverableLabel}</span>
        {deliverable}
      </p>
    </article>
  );
}

export default AdvisoryCard;
