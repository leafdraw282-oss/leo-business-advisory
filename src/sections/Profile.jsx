import { about, images } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import ImagePlaceholder from '../components/ImagePlaceholder';

/**
 * Structural shell — Profile / About section (id: "about", matches
 * src/data/navigation.js). Full text+image responsive layout is a later phase.
 */
function Profile() {
  const { t } = useLanguage();

  return (
    <section id="about" aria-label="About">
      <div className="container">
        <ImagePlaceholder src={images.portrait} alt="LEO Suh portrait" label="LEO Portrait" aspectRatio="4 / 5" />
        <h2>{t(about.headlineKo, about.headlineEn)}</h2>
        <p className="long-copy">{t(about.bioKo, about.bioEn)}</p>
      </div>
    </section>
  );
}

export default Profile;
