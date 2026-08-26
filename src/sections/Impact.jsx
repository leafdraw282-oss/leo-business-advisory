import { impact, impactSection } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import SectionTitle from '../components/SectionTitle';
import ImpactMetric from '../components/ImpactMetric';
import './Impact.css';

/**
 * Impact section (id: "impact", matches src/data/navigation.js). Four
 * headline figures, data-driven from profile.js `impact` — adding a
 * fifth metric later needs no layout change.
 */
function Impact() {
  const { t } = useLanguage();

  return (
    <section id="impact" className="impact" aria-label={t('성과', 'Impact')}>
      <div className="container">
        <SectionTitle eyebrow={t(impactSection.eyebrowKo, impactSection.eyebrowEn)} title={t(impactSection.titleKo, impactSection.titleEn)} />
        <div className="impact__grid">
          {impact.map((metric) => (
            <ImpactMetric key={metric.labelEn} value={t(metric.valueKo, metric.valueEn)} label={t(metric.labelKo, metric.labelEn)} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Impact;
