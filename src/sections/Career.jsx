import { useLanguage } from '../context/languageContext';
import { useSectionContent } from '../hooks/useSectionContent';
import { useReveal } from '../hooks/useReveal';
import { fetchCareer, careerFallback } from '../lib/content/career';
import SectionTitle from '../components/SectionTitle';
import CareerEntry from '../components/CareerEntry';
import './Career.css';

/**
 * Career section (id: "career", matches src/data/navigation.js). A
 * vertical timeline (spine + marker per entry) rather than a plain
 * résumé list. Content comes from Supabase (Phase 2-E) when available,
 * falling back to src/data/profile.js `career` (cross-checked against the
 * Founder Profile source document) — see src/lib/content/career.js.
 */
function Career() {
  const { t } = useLanguage();
  const content = useSectionContent(fetchCareer, careerFallback());
  const { ref, className: revealClassName } = useReveal();

  return (
    <section id="career" ref={ref} className={`career ${revealClassName}`.trim()} aria-label={t('경력', 'Career')}>
      <div className="container">
        <SectionTitle eyebrow={t(content.eyebrowKo, content.eyebrowEn)} title={t(content.titleKo, content.titleEn)} />
        <ol className="career__timeline">
          {content.entries.map((entry) => (
            <CareerEntry
              key={entry.period}
              period={entry.period}
              role={t(entry.roleKo, entry.roleEn)}
              company={t(entry.companyKo, entry.companyEn)}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Career;
