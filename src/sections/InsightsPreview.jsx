import { useLanguage } from '../context/languageContext';
import { useReveal } from '../hooks/useReveal';
import { useSectionContent } from '../hooks/useSectionContent';
import { fetchInsights, insightsFallback } from '../lib/content/insights';
import SectionTitle from '../components/SectionTitle';
import InsightCard from '../components/InsightCard';
import './InsightsPreview.css';

/**
 * "Insights" (id: "insights", matches src/data/navigation.js and the
 * simplified header nav) — Advisory Sales IA, section 8. Title-only
 * placeholder cards; no real posts exist yet — see InsightCard.jsx for why
 * these are deliberately non-interactive rather than dead links. Content
 * comes from Supabase (Content -> Insights) when available, falling back
 * to src/data/profile.js — see src/lib/content/insights.js.
 */
function InsightsPreview() {
  const { t } = useLanguage();
  const insights = useSectionContent(fetchInsights, insightsFallback());
  const { ref, className: revealClassName } = useReveal();

  return (
    <section
      id="insights"
      ref={ref}
      className={`insights-preview ${revealClassName}`.trim()}
      aria-label={t(insights.section.titleKo, insights.section.titleEn)}
    >
      <div className="container">
        <SectionTitle
          eyebrow={t(insights.section.eyebrowKo, insights.section.eyebrowEn)}
          title={t(insights.section.titleKo, insights.section.titleEn)}
        />
        <ul className="insights-preview__grid">
          {insights.items.map((item, index) => (
            <li key={item.id ?? index}>
              <InsightCard
                title={t(item.titleKo, item.titleEn)}
                comingSoonLabel={t(insights.section.comingSoonKo, insights.section.comingSoonEn)}
                linkUrl={item.linkUrl}
                linkLabel={t(item.linkLabelKo, item.linkLabelEn) || t('자세히 보기', 'Learn more')}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default InsightsPreview;
