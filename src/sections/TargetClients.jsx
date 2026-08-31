import { targetClientsSection, targetClients, peAdvisory } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import { useReveal } from '../hooks/useReveal';
import SectionTitle from '../components/SectionTitle';
import './TargetClients.css';

/**
 * "Target Clients" (id: "clients") — Advisory Sales IA, section 7. Four
 * client segments, plus a separately emphasized PE Portfolio Advisory
 * callout per the brief ("PE / Investment Firm 대상 영역은 별도로 강조").
 * Fixed authored copy, same direct profile.js pattern as Challenge.
 */
function TargetClients() {
  const { t } = useLanguage();
  const { ref, className: revealClassName } = useReveal();

  return (
    <section
      id="clients"
      ref={ref}
      className={`target-clients ${revealClassName}`.trim()}
      aria-label={t(targetClientsSection.titleKo, targetClientsSection.titleEn)}
    >
      <div className="container">
        <SectionTitle
          eyebrow={t(targetClientsSection.eyebrowKo, targetClientsSection.eyebrowEn)}
          title={t(targetClientsSection.titleKo, targetClientsSection.titleEn)}
        />
        <ul className="target-clients__list">
          {targetClients.map((client) => (
            <li className="target-clients__item" key={client.ko}>
              {t(client.ko, client.en)}
            </li>
          ))}
        </ul>

        <div className="target-clients__pe">
          <p className="target-clients__pe-label">{t(peAdvisory.labelKo, peAdvisory.labelEn)}</p>
          <p className="target-clients__pe-intro">{t(peAdvisory.introKo, peAdvisory.introEn)}</p>
          <ul className="target-clients__pe-items">
            {peAdvisory.items.map((item) => (
              <li key={item.ko}>{t(item.ko, item.en)}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default TargetClients;
