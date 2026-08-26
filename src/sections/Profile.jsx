import { about, images } from '../data/profile';
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

  return (
    <section id="about" className="profile" aria-label="About">
      <div className="container profile__grid">
        <div className="profile__media">
          <ImagePlaceholder src={images.portrait} alt="LEO Suh portrait" label="LEO Portrait" aspectRatio="4 / 5" />
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
