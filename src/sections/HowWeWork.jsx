import { useLanguage } from '../context/languageContext';
import { useSectionContent } from '../hooks/useSectionContent';
import { useReveal } from '../hooks/useReveal';
import { fetchHowWeWork, howWeWorkFallback } from '../lib/content/howWeWork';
import SectionTitle from '../components/SectionTitle';
import './HowWeWork.css';

/**
 * "How We Work" (id: "how-we-work") — Advisory Sales IA, section 6.
 * Traditional Consulting's step sequence vs. Leo Business Advisory's own,
 * plus the operator-vs-consultant positioning line. Content comes from
 * Supabase (Content -> How We Work) when available, falling back to
 * src/data/profile.js — see src/lib/content/howWeWork.js.
 */
function HowWeWork() {
  const { t } = useLanguage();
  const howWeWork = useSectionContent(fetchHowWeWork, howWeWorkFallback());
  const { ref, className: revealClassName } = useReveal();

  return (
    <section
      id="how-we-work"
      ref={ref}
      className={`how-we-work ${revealClassName}`.trim()}
      aria-label={t(howWeWork.titleKo, howWeWork.titleEn)}
    >
      <div className="container">
        <SectionTitle eyebrow={t(howWeWork.eyebrowKo, howWeWork.eyebrowEn)} title={t(howWeWork.titleKo, howWeWork.titleEn)} />

        <div className="how-we-work__compare">
          <div className="how-we-work__row how-we-work__row--traditional">
            <p className="how-we-work__row-label">{t(howWeWork.traditionalLabelKo, howWeWork.traditionalLabelEn)}</p>
            <ol className="how-we-work__steps">
              {t(howWeWork.traditionalStepsKo, howWeWork.traditionalStepsEn).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="how-we-work__row how-we-work__row--leo">
            <p className="how-we-work__row-label">{t(howWeWork.leoLabelKo, howWeWork.leoLabelEn)}</p>
            <ol className="how-we-work__steps">
              {t(howWeWork.leoStepsKo, howWeWork.leoStepsEn).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <blockquote className="how-we-work__quote">
          <p>{t(howWeWork.quoteKo, howWeWork.quoteEn)}</p>
          <cite>{t(howWeWork.taglineKo, howWeWork.taglineEn)}</cite>
        </blockquote>
      </div>
    </section>
  );
}

export default HowWeWork;
