import { challenge } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import { useReveal } from '../hooks/useReveal';
import SectionTitle from '../components/SectionTitle';
import './Challenge.css';

/**
 * "Your Challenge" (id: "challenge") — Advisory Sales IA, section 2. Leads
 * with the visitor's own problem before any of Leo's history, per the
 * repositioning brief. Not CMS-backed (same as the other new sections
 * added in this pass) — content is authored copy, not a fact from the
 * Founder Profile document, so it stays a direct src/data/profile.js
 * read, same pattern as Header's `site`/`navigation`.
 */
function Challenge() {
  const { t } = useLanguage();
  const { ref, className: revealClassName } = useReveal();

  return (
    <section id="challenge" ref={ref} className={`challenge ${revealClassName}`.trim()} aria-label={t(challenge.titleKo, challenge.titleEn)}>
      <div className="container">
        <SectionTitle eyebrow={t(challenge.eyebrowKo, challenge.eyebrowEn)} title={t(challenge.titleKo, challenge.titleEn)} />
        <ul className="challenge__list">
          {challenge.items.map((item) => (
            <li className="challenge__item" key={item.ko}>
              {t(item.ko, item.en)}
            </li>
          ))}
        </ul>
        <div className="challenge__statement">
          <p className="challenge__statement-main">{t(challenge.statementKo, challenge.statementEn)}</p>
          <p className="challenge__statement-sub">{t(challenge.statementSubKo, challenge.statementSubEn)}</p>
        </div>
      </div>
    </section>
  );
}

export default Challenge;
