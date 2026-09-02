import { useLanguage } from '../context/languageContext';
import { useSectionContent } from '../hooks/useSectionContent';
import { useReveal } from '../hooks/useReveal';
import { fetchAdvisory, advisoryFallback } from '../lib/content/advisory';
import SectionTitle from '../components/SectionTitle';
import AdvisoryCard from '../components/AdvisoryCard';
import './Advisory.css';

/**
 * "What We Do" (id: "advisory", matches src/data/navigation.js) — the 4
 * named Advisory Products. Content comes from Supabase (Content ->
 * Advisory) when available, falling back to src/data/profile.js — see
 * src/lib/content/advisory.js. Replaces the old flat advisory.items list
 * this section rendered before the Advisory Sales repositioning; that
 * list (and its advisory_items table) is untouched but no longer read
 * anywhere.
 */
function Advisory() {
  const { t } = useLanguage();
  const advisory = useSectionContent(fetchAdvisory, advisoryFallback());
  const { ref, className: revealClassName } = useReveal();

  return (
    <section
      id="advisory"
      ref={ref}
      className={`advisory ${revealClassName}`.trim()}
      aria-label={t(advisory.section.titleKo, advisory.section.titleEn)}
    >
      <div className="container">
        <SectionTitle
          eyebrow={t(advisory.section.eyebrowKo, advisory.section.eyebrowEn)}
          title={t(advisory.section.titleKo, advisory.section.titleEn)}
        />
        <div className="advisory__grid">
          {advisory.products.map((product) => (
            <AdvisoryCard
              key={product.id}
              name={t(product.nameKo, product.nameEn)}
              target={t(product.targetKo, product.targetEn)}
              focus={t(product.focusKo, product.focusEn)}
              deliverableLabel={t('제공 결과물', 'Deliverable')}
              deliverable={t(product.deliverableKo, product.deliverableEn)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Advisory;
