import { useState } from 'react';
import HeroImage from './images/HeroImage.jsx';
import AboutImage from './images/AboutImage.jsx';
import CaseStudyImages from './images/CaseStudyImages.jsx';
import GalleryImages from './images/GalleryImages.jsx';

const SECTIONS = [
  { id: 'hero', label: 'Hero', Component: HeroImage },
  { id: 'about', label: 'About / Profile', Component: AboutImage },
  { id: 'case-studies', label: 'Case Studies', Component: CaseStudyImages },
  { id: 'gallery', label: 'Gallery', Component: GalleryImages },
];

// Every image slot here is backed by the same Phase 2-A schema as the
// Content tab (media table + each content table's *_image_id FK) — see
// docs/ADMIN_CMS_ARCHITECTURE.md. Uploads go to Supabase Storage's
// "site-images" bucket, never into this Git repository.
function Images() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const Active = SECTIONS.find((section) => section.id === activeId)?.Component;

  return (
    <div className="admin-content">
      <nav className="admin-content-nav">
        <ul>
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                className={section.id === activeId ? 'active' : ''}
                onClick={() => setActiveId(section.id)}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="admin-content-panel">{Active && <Active />}</div>
    </div>
  );
}

export default Images;
