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
    <section id="case-studies" className="case-studies" aria-label={t(caseStudiesSection.titleKo, caseStudiesSection.titleEn)}>
      <div className="container">
        <SectionTitle
          eyebrow={t(caseStudiesSection.eyebrowKo, caseStudiesSection.eyebrowEn)}
          title={t(caseStudiesSection.titleKo, caseStudiesSection.titleEn)}
        />
        <div className="case-studies__list">
          {caseStudies.map((item, index) => {
            const title = t(item.titleKo, item.titleEn);
            const imageText = t(`${item.titleKo} 프로젝트 이미지`, `${item.titleEn} Project Image`);
            return (
              <CaseStudy
                key={item.id}
                tag={item.tag}
                title={title}
                summary={t(item.summaryKo, item.summaryEn)}
                metrics={item.metrics.map((metric) => ({
                  value: t(metric.valueKo, metric.valueEn),
                  label: t(metric.labelKo, metric.labelEn),
                }))}
                highlights={(item.highlights ?? []).map((h) => t(h.ko, h.en))}
                image={images[item.image]}
                imageAlt={imageText}
                imageLabel={imageText}
                reverse={index % 2 === 1}
                emphasis={index === 0}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CaseStudies;
