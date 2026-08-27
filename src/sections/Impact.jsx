import { useLanguage } from '../context/languageContext';
import { useSectionContent } from '../hooks/useSectionContent';
import { useReveal } from '../hooks/useReveal';
import { fetchImpact, impactFallback } from '../lib/content/impact';
import SectionTitle from '../components/SectionTitle';
import ImpactMetric from '../components/ImpactMetric';
import './Impact.css';

/**
 * Impact section (id: "impact", matches src/data/navigation.js). Content
 * comes from Supabase (Phase 2-E) when available, falling back to
 * src/data/profile.js — see src/lib/content/impact.js.
 */
function Impact() {
  const { t } = useLanguage();
  const content = useSectionContent(fetchImpact, impactFallback());
  const { ref, className: revealClassName } = useReveal();

  return (
    <section id="impact" ref={ref} className={`impact ${revealClassName}`.trim()} aria-label={t('성과', 'Impact')}>
      <div className="container">
        <SectionTitle
          eyebrow={t(content.section.eyebrowKo, content.section.eyebrowEn)}
          title={t(content.section.titleKo, content.section.titleEn)}
        />
        <div className="impact__grid">
          {content.metrics.map((metric) => (
            <ImpactMetric key={metric.labelEn} value={t(metric.valueKo, metric.valueEn)} label={t(metric.labelKo, metric.labelEn)} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Impact;
