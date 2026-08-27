import { useLanguage } from '../context/languageContext';
import { useSectionContent } from '../hooks/useSectionContent';
import { useReveal } from '../hooks/useReveal';
import { fetchCaseStudies, caseStudiesFallback } from '../lib/content/caseStudies';
import SectionTitle from '../components/SectionTitle';
import CaseStudy from '../components/CaseStudy';
import './CaseStudies.css';

/**
 * Editorial case-study list (id: "case-studies", part of the Impact flow).
 * Content comes from Supabase (Phase 2-E) when available, falling back to
 * src/data/profile.js per case — see src/lib/content/caseStudies.js.
 * Media/text sides alternate per case and the first (flagship) case gets
 * extra visual weight, so the section reads as an editorial spread rather
 * than a repeating grid of cards.
 */
function CaseStudies() {
  const { t } = useLanguage();
  const content = useSectionContent(fetchCaseStudies, caseStudiesFallback());
  const { ref, className: revealClassName } = useReveal();

  return (
    <section
      id="case-studies"
      ref={ref}
      className={`case-studies ${revealClassName}`.trim()}
      aria-label={t(content.section.titleKo, content.section.titleEn)}
    >
      <div className="container">
        <SectionTitle
          eyebrow={t(content.section.eyebrowKo, content.section.eyebrowEn)}
          title={t(content.section.titleKo, content.section.titleEn)}
        />
        <div className="case-studies__list">
          {content.items.map((item, index) => {
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
                image={item.imageUrl}
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
