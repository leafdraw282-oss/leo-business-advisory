import { gallery, gallerySection } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import ImagePlaceholder from '../components/ImagePlaceholder';

/**
 * Structural shell — Visual Story / Gallery section. Renders from
 * src/data/profile.js `gallery` array so adding photos later (3 → 10 → 20)
 * never requires touching this component. Grid layout is a later phase.
 */
function Gallery() {
  const { t } = useLanguage();

  return (
    <section id="gallery" aria-label="Visual Story">
      <div className="container">
        <h2>{t(gallerySection.titleKo, gallerySection.titleEn)}</h2>
        {gallery.length === 0 ? (
          <p>{t('갤러리 사진은 추후 업데이트될 예정입니다.', 'Gallery photos will be added in a future phase.')}</p>
        ) : (
          <ul>
            {gallery.map((item) => (
              <li key={item.id}>
                <ImagePlaceholder
                  src={item.src}
                  alt={t(item.captionKo, item.captionEn)}
                  label={t(item.captionKo, item.captionEn)}
                  aspectRatio="4 / 3"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default Gallery;
