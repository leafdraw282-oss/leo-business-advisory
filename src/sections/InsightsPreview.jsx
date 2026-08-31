import { insightsSection, insights } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import { useReveal } from '../hooks/useReveal';
import SectionTitle from '../components/SectionTitle';
import InsightCard from '../components/InsightCard';
import './InsightsPreview.css';

/**
 * "Insights" (id: "insights", matches src/data/navigation.js and the
 * simplified header nav) — Advisory Sales IA, section 8. Title-only
 * placeholder cards; no real posts exist yet — see InsightCard.jsx for why
 * these are deliberately non-interactive rather than dead links.
 */
function InsightsPreview() {
  const { t } = useLanguage();
  const { ref, className: revealClassName } = useReveal();

  return (
    <section
      id="insights"
      ref={ref}
      className={`insights-preview ${revealClassName}`.trim()}
      aria-label={t(insightsSection.titleKo, insightsSection.titleEn)}
    >
      <div className="container">
        <SectionTitle eyebrow={t(insightsSection.eyebrowKo, insightsSection.eyebrowEn)} title={t(insightsSection.titleKo, insightsSection.titleEn)} />
        <ul className="insights-preview__grid">
          {insights.map((item) => (
            <li key={item.id}>
              <InsightCard title={t(item.titleKo, item.titleEn)} comingSoonLabel={t(insightsSection.comingSoonKo, insightsSection.comingSoonEn)} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default InsightsPreview;
