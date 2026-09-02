import { useLanguage } from '../context/languageContext';
import { useSectionContent } from '../hooks/useSectionContent';
import { useReveal } from '../hooks/useReveal';
import { fetchChallenge, challengeFallback } from '../lib/content/challenge';
import SectionTitle from '../components/SectionTitle';
import './Challenge.css';

/**
 * "Your Challenge" (id: "challenge") — Advisory Sales IA, section 2. Leads
 * with the visitor's own problem before any of Leo's history, per the
 * repositioning brief. Content comes from Supabase (Content -> Challenge)
 * when available, falling back to src/data/profile.js — see
 * src/lib/content/challenge.js.
 */
function Challenge() {
  const { t } = useLanguage();
  const challenge = useSectionContent(fetchChallenge, challengeFallback());
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
