import { caseStudies, caseStudiesSection, images } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import SectionTitle from '../components/SectionTitle';
import CaseStudy from '../components/CaseStudy';
import './CaseStudies.css';

/**
 * Editorial case-study list (id: "case-studies", part of the Impact flow).
 * Fully data-driven from src/data/profile.js `caseStudies` — adding a
 * 7th case needs no layout change. Media/text sides alternate per case
 * and the first (flagship) case gets extra visual weight, so the section
 * reads as an editorial spread rather than a repeating grid of cards.
 */
function CaseStudies() {
  const { t } = useLanguage();

  return (
    <section id="case-studies" className="case-studies" aria-label="Selected Impact">
      <div className="container">
        <SectionTitle
          eyebrow={t('선택된 성과', 'SELECTED IMPACT')}
          title={t(caseStudiesSection.titleKo, caseStudiesSection.titleEn)}
        />
        <div className="case-studies__list">
          {caseStudies.map((item, index) => (
            <CaseStudy
              key={item.id}
              tag={item.tag}
              title={t(item.titleKo, item.titleEn)}
              summary={t(item.summaryKo, item.summaryEn)}
              metrics={item.metrics.map((metric) => ({
                value: t(metric.valueKo, metric.valueEn),
                label: t(metric.labelKo, metric.labelEn),
              }))}
              highlights={(item.highlights ?? []).map((h) => t(h.ko, h.en))}
              image={images[item.image]}
              imageAlt={`${item.titleEn} project image`}
              imageLabel={`${item.titleEn} Project Image`}
              reverse={index % 2 === 1}
              emphasis={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CaseStudies;
