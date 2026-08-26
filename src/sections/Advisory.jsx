import { advisory } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import SectionTitle from '../components/SectionTitle';
import './Advisory.css';

/**
 * Advisory section (id: "advisory", matches src/data/navigation.js).
 * An editorial numbered index rather than a card grid — each row is
 * ready to carry a description or case reference in a later phase
 * without any layout change, since it's driven entirely by
 * profile.js `advisory.items`.
 */
function Advisory() {
  const { t } = useLanguage();

  return (
    <section id="advisory" className="advisory" aria-label="Advisory Focus">
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
