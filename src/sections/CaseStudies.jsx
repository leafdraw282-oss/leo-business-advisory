import { caseStudies, images } from '../data/profile';
import ImagePlaceholder from '../components/ImagePlaceholder';

/**
 * Structural shell — editorial Case Study list, rendered from
 * src/data/profile.js `caseStudies` (data-driven per project spec).
 * Distinct per-case editorial layout/rhythm is Phase 1-B.
 */
function CaseStudies() {
  return (
    <section id="case-studies" aria-label="Selected Impact">
      <div className="container">
        <h2>Selected Impact</h2>
        {caseStudies.map((item) => (
          <article key={item.id}>
            <p>{item.tag}</p>
            <h3>{item.titleEn}</h3>
            <ImagePlaceholder
              src={images[item.image]}
              alt={`${item.titleEn} project image`}
              label={`${item.titleEn} Project Image`}
              aspectRatio="16 / 9"
            />
            <p className="long-copy">{item.summaryEn}</p>
            {item.metrics.length > 0 && (
              <ul>
                {item.metrics.map((metric) => (
                  <li key={metric.labelEn}>
                    <strong>{metric.valueEn}</strong> <span>{metric.labelEn}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default CaseStudies;
