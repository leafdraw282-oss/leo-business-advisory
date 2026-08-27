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
 */
function CaseStudy({ tag, title, summary, metrics = [], highlights = [], image, imageAlt, imageLabel, reverse = false, emphasis = false }) {
  const hasMetrics = metrics.length > 0;

  return (
    <article
      className={[
        'case-study',
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
