import { about, images } from '../data/profile';
import ImagePlaceholder from '../components/ImagePlaceholder';

/**
 * Structural shell — Profile / About section (id: "about", matches
 * src/data/navigation.js). Full text+image responsive layout is Phase 1-B.
 */
function Profile() {
  return (
    <section id="about" aria-label="About">
      <div className="container">
        <ImagePlaceholder src={images.portrait} alt="LEO Suh portrait" label="LEO Portrait" aspectRatio="4 / 5" />
        <h2>{about.headlineEn}</h2>
        <p className="long-copy">{about.bioEn}</p>
      </div>
    </section>
  );
}

export default Profile;
