import { advisorySection, advisoryProducts, advisoryCta } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import { useReveal } from '../hooks/useReveal';
import SectionTitle from '../components/SectionTitle';
import AdvisoryCard from '../components/AdvisoryCard';
import './Advisory.css';

/**
 * "What We Do" (id: "advisory", matches src/data/navigation.js) — Advisory
 * Sales repositioning: the section formerly rendered `advisory.items` (a
 * flat 8-item CMS-backed list, still exported from profile.js and still
 * editable in the admin panel — see src/lib/content/advisory.js — but no
 * longer shown on the public site) and now renders the 4 named Advisory
 * Products instead. Not CMS-backed for the same reason as Challenge below:
 * these are 4 fixed, structured products (name/target/focus list/
 * deliverable), not a shape the existing advisory_items admin editor
 * supports — see this phase's report, "Remaining TODO".
 */
function Advisory() {
  const { t } = useLanguage();
  const { ref, className: revealClassName } = useReveal();

  return (
    <section id="advisory" ref={ref} className={`advisory ${revealClassName}`.trim()} aria-label={t(advisorySection.titleKo, advisorySection.titleEn)}>
      <div className="container">
        <SectionTitle
          eyebrow={t(advisorySection.eyebrowKo, advisorySection.eyebrowEn)}
          title={t(advisorySection.titleKo, advisorySection.titleEn)}
        />
        <div className="advisory__grid">
          {advisoryProducts.map((product) => (
            <AdvisoryCard
              key={product.id}
              name={t(product.nameKo, product.nameEn)}
              target={t(product.targetKo, product.targetEn)}
              focus={t(product.focusKo, product.focusEn)}
              deliverableLabel={t('제공 결과물', 'Deliverable')}
              deliverable={t(product.deliverableKo, product.deliverableEn)}
              ctaLabel={t(advisoryCta.ko, advisoryCta.en)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Advisory;
