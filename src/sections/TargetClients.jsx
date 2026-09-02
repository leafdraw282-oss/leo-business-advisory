import { useLanguage } from '../context/languageContext';
import { useReveal } from '../hooks/useReveal';
import { useSectionContent } from '../hooks/useSectionContent';
import { fetchTargetClients, targetClientsFallback } from '../lib/content/targetClients';
import SectionTitle from '../components/SectionTitle';
import './TargetClients.css';

/**
 * "Target Clients" (id: "clients") — Advisory Sales IA, section 7. Four
 * client segments, plus a separately emphasized PE Portfolio Advisory
 * callout per the brief ("PE / Investment Firm 대상 영역은 별도로 강조").
 * Content comes from Supabase (Content -> Target Clients) when available,
 * falling back to src/data/profile.js — see src/lib/content/targetClients.js.
 */
function TargetClients() {
  const { t } = useLanguage();
  const targetClients = useSectionContent(fetchTargetClients, targetClientsFallback());
  const { ref, className: revealClassName } = useReveal();

  return (
    <section
      id="clients"
      ref={ref}
      className={`target-clients ${revealClassName}`.trim()}
      aria-label={t(targetClients.section.titleKo, targetClients.section.titleEn)}
    >
      <div className="container">
        <SectionTitle
          eyebrow={t(targetClients.section.eyebrowKo, targetClients.section.eyebrowEn)}
          title={t(targetClients.section.titleKo, targetClients.section.titleEn)}
        />
        <ul className="target-clients__list">
          {targetClients.clients.map((client) => (
            <li className="target-clients__item" key={client.ko}>
              {t(client.ko, client.en)}
            </li>
          ))}
        </ul>

        <div className="target-clients__pe">
          <p className="target-clients__pe-label">{t(targetClients.pe.labelKo, targetClients.pe.labelEn)}</p>
          <p className="target-clients__pe-intro">{t(targetClients.pe.introKo, targetClients.pe.introEn)}</p>
          <ul className="target-clients__pe-items">
            {targetClients.pe.items.map((item) => (
              <li key={item.ko}>{t(item.ko, item.en)}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default TargetClients;
