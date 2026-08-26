import { gallery } from '../data/profile';
import ImagePlaceholder from '../components/ImagePlaceholder';

/**
 * Structural shell — Visual Story / Gallery section. Renders from
 * src/data/profile.js `gallery` array so adding photos later (3 → 10 → 20)
 * never requires touching this component. Grid layout is Phase 1-B.
 */
function Gallery() {
  return (
    <section id="gallery" aria-label="Visual Story">
      <div className="container">
        <h2>Visual Story</h2>
        {gallery.length === 0 ? (
          <p>Gallery photos will be added in a future phase.</p>
        ) : (
          <ul>
            {gallery.map((item) => (
              <li key={item.id}>
                <ImagePlaceholder src={item.src} alt={item.captionEn} label={item.captionEn} aspectRatio="4 / 3" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default Gallery;
