/**
 * One Advisory Product panel (What We Do section) — deliberately flat and
 * typographic (a top border + generous padding, no shadow/gradient/rounded
 * card chrome) per the Advisory Sales brief's "카드 UI 남용 지양" direction.
 * All text arriving here is already resolved to the current language by
 * the caller (src/sections/Advisory.jsx).
 */
function AdvisoryCard({ name, target, focus = [], deliverableLabel, deliverable, ctaLabel }) {
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
      <a className="advisory-card__cta" href="#contact">
        {ctaLabel} →
      </a>
    </article>
  );
}

export default AdvisoryCard;
