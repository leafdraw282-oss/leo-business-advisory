import { advisory } from '../data/profile';
import { useLanguage } from '../context/languageContext';

/**
 * Structural shell — Advisory section (id: "advisory", matches
 * src/data/navigation.js). Final visual treatment is a later phase.
 */
function Advisory() {
  const { t } = useLanguage();

  return (
    <section id="advisory" aria-label="Advisory Focus">
      <div className="container">
        <h2>{t(advisory.titleKo, advisory.titleEn)}</h2>
        <ul>
          {advisory.items.map((item) => (
            <li key={item.en}>{t(item.ko, item.en)}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Advisory;
