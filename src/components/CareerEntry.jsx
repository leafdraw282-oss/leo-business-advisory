import { useReveal } from '../hooks/useReveal';

/**
 * One Career timeline entry. Phase 6-A: extracted out of Career.jsx so it
 * can observe its OWN scroll entrance (its own useReveal() instance)
 * instead of relying on the whole timeline's single trigger — a 7-entry
 * timeline runs well past one viewport, so a section-wide trigger fired
 * the moment the first entry appeared and immediately marked every entry
 * (including the last, still far below the fold) as "revealed", meaning
 * by the time a visitor scrolled down to it, its own entrance had long
 * since finished off-screen. Same root cause and same fix as CaseStudy.jsx.
 */
function CareerEntry({ period, role, company }) {
  const { ref, className: revealClassName } = useReveal();

  return (
    <li ref={ref} className={`career__entry ${revealClassName}`.trim()}>
      <div className="career__marker" aria-hidden="true">
        <span className="career__dot" />
      </div>
      <div className="career__detail">
        <p className="career__period">{period}</p>
        <h3 className="career__role">{role}</h3>
        <p className="career__company">{company}</p>
      </div>
    </li>
  );
}

export default CareerEntry;
