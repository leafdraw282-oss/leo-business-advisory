import { about, person, images } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import SectionTitle from '../components/SectionTitle';
import ImagePlaceholder from '../components/ImagePlaceholder';
import './Profile.css';

/**
 * Profile / About section (id: "about", matches src/data/navigation.js).
 * Executive-introduction layout: text + portrait on desktop, portrait
 * above text on mobile/tablet (per project spec).
 */
function Profile() {
  const { t } = useLanguage();
  const portraitLabel = t(person.portraitLabelKo, person.portraitLabelEn);

  return (
    <section id="about" className="profile" aria-label={t('소개', 'About')}>
      <div className="container profile__grid">
        <div className="profile__media">
          <ImagePlaceholder src={images.portrait} alt={portraitLabel} label={portraitLabel} aspectRatio="4 / 5" />
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
