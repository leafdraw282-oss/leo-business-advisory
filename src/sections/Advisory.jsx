import { useLanguage } from '../context/languageContext';
import { useSectionContent } from '../hooks/useSectionContent';
import { fetchAdvisory, advisoryFallback } from '../lib/content/advisory';
import SectionTitle from '../components/SectionTitle';
import './Advisory.css';

/**
 * Advisory section (id: "advisory", matches src/data/navigation.js).
 * Content comes from Supabase (Phase 2-E) when available, falling back
 * to src/data/profile.js — see src/lib/content/advisory.js.
 */
function Advisory() {
  const { t } = useLanguage();
  const advisory = useSectionContent(fetchAdvisory, advisoryFallback());

  return (
    <section id="advisory" className="advisory" aria-label={t('자문', 'Advisory')}>
      <div className="container">
        <SectionTitle eyebrow={t(advisory.eyebrowKo, advisory.eyebrowEn)} title={t(advisory.titleKo, advisory.titleEn)} />
        <ol className="advisory__list">
          {advisory.items.map((item, index) => (
            <li className="advisory__item" key={item.id}>
              <span className="advisory__index">{String(index + 1).padStart(2, '0')}</span>
              <span className="advisory__label">{t(item.ko, item.en)}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Advisory;
