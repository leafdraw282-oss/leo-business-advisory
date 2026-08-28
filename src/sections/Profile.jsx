import { useLanguage } from '../context/languageContext';
import { useSectionContent } from '../hooks/useSectionContent';
import { useReveal } from '../hooks/useReveal';
import { fetchAbout, aboutFallback } from '../lib/content/about';
import SectionTitle from '../components/SectionTitle';
import ImagePlaceholder from '../components/ImagePlaceholder';
import './Profile.css';

/**
 * Profile / About section (id: "about", matches src/data/navigation.js).
 * Content comes from Supabase (Phase 2-E) when available, falling back
 * to src/data/profile.js — see src/lib/content/about.js.
 */
function Profile() {
  const { t } = useLanguage();
  const about = useSectionContent(fetchAbout, aboutFallback());
  const portraitLabel = t(about.imageAltKo, about.imageAltEn);
  const { ref, className: revealClassName } = useReveal();

  return (
    <section id="about" ref={ref} className={`profile ${revealClassName}`.trim()} aria-label={t('소개', 'About')}>
      <div className="container profile__grid">
        <div className="profile__media">
          <ImagePlaceholder
            src={about.imageUrl}
            alt={portraitLabel}
            label={portraitLabel}
            aspectRatio="1 / 1"
            revealMotion
          />
        </div>
        <div className="profile__body">
          <SectionTitle eyebrow={t(about.eyebrowKo, about.eyebrowEn)} title={t(about.headlineKo, about.headlineEn)} />
          <p className="profile__bio long-copy">{t(about.bioKo, about.bioEn)}</p>
        </div>
      </div>
    </section>
  );
}

export default Profile;
