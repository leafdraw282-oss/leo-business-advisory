import { gallery, gallerySection } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import SectionTitle from '../components/SectionTitle';
import ImagePlaceholder from '../components/ImagePlaceholder';
import './Gallery.css';

/**
 * Visual Story / Gallery section (id: "gallery"). Fully data-driven from
 * profile.js `gallery` — going from 6 photos to 10+ needs no layout
 * change, just more array entries. Tile size/aspect varies per entry
 * (`wide` + `aspect`) for an editorial-portfolio rhythm rather than a
 * uniform same-size grid; every tile falls back to ImagePlaceholder until
 * real photography is added.
 */
function Gallery() {
  const { t } = useLanguage();

  return (
    <section id="gallery" className="gallery" aria-label="Visual Story">
      <div className="container">
        <SectionTitle eyebrow={t(gallerySection.eyebrowKo, gallerySection.eyebrowEn)} title={t(gallerySection.titleKo, gallerySection.titleEn)} />
        {gallery.length === 0 ? (
          <p>{t('갤러리 사진은 추후 업데이트될 예정입니다.', 'Gallery photos will be added in a future phase.')}</p>
        ) : (
          <ul className="gallery__grid">
            {gallery.map((item) => (
              <li key={item.id} className={`gallery__item ${item.wide ? 'gallery__item--wide' : ''}`}>
                <ImagePlaceholder
                  src={item.src}
                  alt={t(item.captionKo, item.captionEn)}
                  label={t(item.captionKo, item.captionEn)}
                  aspectRatio={item.aspect || '4 / 3'}
                />
                <p className="gallery__caption">{t(item.captionKo, item.captionEn)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default Gallery;
