import { gallerySection } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import { useSectionContent } from '../hooks/useSectionContent';
import { fetchGallery, galleryFallback } from '../lib/content/gallery';
import SectionTitle from '../components/SectionTitle';
import ImagePlaceholder from '../components/ImagePlaceholder';
import './Gallery.css';

/**
 * Visual Story / Gallery section (id: "gallery"). Photos come from
 * Supabase (Phase 2-D/2-E) when available, falling back to
 * src/data/profile.js `gallery` — see src/lib/content/gallery.js. The
 * section heading/empty-state copy (`gallerySection`) has no admin editor
 * (Phase 2-C's Content sections don't include it — Gallery's admin-
 * manageable content is its photos/captions), so it stays a direct
 * profile.js read, same as before.
 */
function Gallery() {
  const { t } = useLanguage();
  const gallery = useSectionContent(fetchGallery, galleryFallback());

  return (
    <section id="gallery" className="gallery" aria-label={t(gallerySection.titleKo, gallerySection.titleEn)}>
      <div className="container">
        <SectionTitle eyebrow={t(gallerySection.eyebrowKo, gallerySection.eyebrowEn)} title={t(gallerySection.titleKo, gallerySection.titleEn)} />
        {gallery.length === 0 ? (
          <p>{t(gallerySection.emptyKo, gallerySection.emptyEn)}</p>
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
