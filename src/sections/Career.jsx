import { career, careerSection } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import SectionTitle from '../components/SectionTitle';
import './Career.css';

/**
 * Career section (id: "career", matches src/data/navigation.js). A
 * vertical timeline (spine + marker per entry) rather than a plain
 * résumé list — generous spacing on desktop, the same clear single-line
 * structure carries straight through to mobile. Entries come from
 * profile.js `career`, cross-checked against the Founder Profile source
 * document (years, roles, companies match exactly).
 */
function Career() {
  const { t } = useLanguage();

  return (
    <section id="career" className="career" aria-label={t('경력', 'Career')}>
      <div className="container">
        <SectionTitle eyebrow={t(careerSection.eyebrowKo, careerSection.eyebrowEn)} title={t(careerSection.titleKo, careerSection.titleEn)} />
        <ol className="career__timeline">
          {career.map((entry) => (
            <li className="career__entry" key={entry.period}>
              <div className="career__marker" aria-hidden="true">
                <span className="career__dot" />
              </div>
              <div className="career__detail">
                <p className="career__period">{entry.period}</p>
                <h3 className="career__role">{t(entry.roleKo, entry.roleEn)}</h3>
                <p className="career__company">{t(entry.companyKo, entry.companyEn)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Career;
