import { career, careerSection } from '../data/profile';
import { useLanguage } from '../context/languageContext';

/**
 * Structural shell — Career timeline section (id: "career", matches
 * src/data/navigation.js). Visual timeline treatment is a later phase.
 */
function Career() {
  const { t } = useLanguage();

  return (
    <section id="career" aria-label="Executive Career">
      <div className="container">
        <h2>{t(careerSection.titleKo, careerSection.titleEn)}</h2>
        <ol>
          {career.map((entry) => (
            <li key={entry.period}>
              <span>{entry.period}</span>
              <strong>{t(entry.roleKo, entry.roleEn)}</strong>
              <span>{t(entry.companyKo, entry.companyEn)}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Career;
