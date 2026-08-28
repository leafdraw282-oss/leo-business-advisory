import { useReveal } from '../hooks/useReveal';
import ImagePlaceholder from './ImagePlaceholder';
import './CaseStudy.css';

/**
 * One editorial case-study entry. Deliberately not a repeating "card" —
 * media/text sides alternate per `reverse`, the flagship case can be
 * given more visual weight via `emphasis`, and a case with no metrics
 * (e.g. LEOHOLDINGS) renders its summary as a larger pull statement
 * instead of an empty metrics row, so layout varies with content, not
 * just alternates mechanically.
 *
 * All text arriving here is already resolved to the current language by
 * the caller (src/sections/CaseStudies.jsx) — this component has no
 * language logic of its own.
 *
 * Phase 6-A: each case study observes its OWN scroll entrance (its own
 * useReveal() instance) instead of relying on the parent section's single
 * trigger. The full case-studies list runs 3400-5500px tall (6 cases,
 * each with a real image), well past one viewport — a section-wide
 * trigger fired the moment the FIRST case entered view and immediately
 * marked every case (including the sixth, still thousands of pixels
 * below the fold) as "revealed", so by the time a visitor actually
 * scrolled to case four, five, six, their entrance had already finished
 * off-screen — the single largest reason motion read as "barely felt"
 * on this page. See global.css's `.case-study.reveal` rules for the
 * image-leads/body-then/metrics-then internal stagger.
 */
function CaseStudy({ tag, title, summary, metrics = [], highlights = [], image, imageAlt, imageLabel, reverse = false, emphasis = false }) {
  const hasMetrics = metrics.length > 0;
  const { ref, className: revealClassName } = useReveal();

  return (
    <article
      ref={ref}
      className={[
        'case-study',
        revealClassName,
        reverse ? 'case-study--reverse' : '',
        emphasis ? 'case-study--emphasis' : '',
        hasMetrics ? '' : 'case-study--statement',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="case-study__media">
        <ImagePlaceholder
          src={image}
          alt={imageAlt}
          label={imageLabel}
          aspectRatio={emphasis ? '4 / 3' : '16 / 10'}
          revealMotion
        />
      </div>
      <div className="case-study__body">
        <p className="case-study__tag">{tag}</p>
        <h3 className="case-study__title">{title}</h3>
        <p className="case-study__summary">{summary}</p>

        {highlights.length > 0 && (
          <ul className="case-study__highlights">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        {hasMetrics && (
          <div className="case-study__metrics">
            {metrics.map((metric) => (
              <div className="case-study__metric" key={metric.label}>
                <span className="case-study__metric-value">{metric.value}</span>
                <span className="case-study__metric-label">{metric.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default CaseStudy;
