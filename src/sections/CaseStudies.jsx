import { caseStudies, caseStudiesSection, images } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import ImagePlaceholder from '../components/ImagePlaceholder';

/**
 * Structural shell — editorial Case Study list, rendered from
 * src/data/profile.js `caseStudies` (data-driven per project spec).
 * Distinct per-case editorial layout/rhythm is a later phase.
 */
function CaseStudies() {
  const { t } = useLanguage();

  return (
    <section id="case-studies" aria-label="Selected Impact">
      <div className="container">
        <h2>{t(caseStudiesSection.titleKo, caseStudiesSection.titleEn)}</h2>
        {caseStudies.map((item) => (
          <article key={item.id}>
            <p>{item.tag}</p>
            <h3>{t(item.titleKo, item.titleEn)}</h3>
            <ImagePlaceholder
              src={images[item.image]}
              alt={`${item.titleEn} project image`}
              label={`${item.titleEn} Project Image`}
              aspectRatio="16 / 9"
            />
            <p className="long-copy">{t(item.summaryKo, item.summaryEn)}</p>
            {item.metrics.length > 0 && (
              <ul>
                {item.metrics.map((metric) => (
                  <li key={metric.labelEn}>
                    <strong>{t(metric.valueKo, metric.valueEn)}</strong> <span>{t(metric.labelKo, metric.labelEn)}</span>
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
