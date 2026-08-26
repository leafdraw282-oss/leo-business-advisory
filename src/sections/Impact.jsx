import { impact } from '../data/profile';
import { useLanguage } from '../context/languageContext';

/**
 * Structural shell — Impact section (id must match src/data/navigation.js
 * "impact" entry). Full metric-tile layout is a later phase.
 */
function Impact() {
  const { t } = useLanguage();

  return (
    <section id="impact" aria-label="Impact">
      <div className="container">
        <h2>{t('성과', 'Impact')}</h2>
        <ul>
          {impact.map((metric) => (
            <li key={metric.labelEn}>
              <strong>{t(metric.valueKo, metric.valueEn)}</strong>
              <span>{t(metric.labelKo, metric.labelEn)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Impact;
