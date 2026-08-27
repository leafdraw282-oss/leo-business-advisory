import { useState } from 'react';
import { isAnyDirty, UNSAVED_CHANGES_MESSAGE } from '../content/dirtyTracker.js';
import HeroImage from './images/HeroImage.jsx';
import AboutImage from './images/AboutImage.jsx';
import CaseStudyImages from './images/CaseStudyImages.jsx';
import GalleryImages from './images/GalleryImages.jsx';

const SECTIONS = [
  { id: 'hero', label: 'Hero', description: '첫 화면 사진 1장', Component: HeroImage },
  { id: 'about', label: 'About / Profile', description: '프로필 사진 1장', Component: AboutImage },
  { id: 'case-studies', label: 'Case Studies', description: '성과 사례별 사진 6장', Component: CaseStudyImages },
  { id: 'gallery', label: 'Gallery', description: '갤러리 사진 추가/삭제/순서 변경', Component: GalleryImages },
];

// Every image slot here is backed by the same Phase 2-A schema as the
// Content tab (media table + each content table's *_image_id FK) — see
// docs/ADMIN_CMS_ARCHITECTURE.md. Uploads go to Supabase Storage's
// "site-images" bucket, never into this Git repository. Switching
// sub-sections while one has an unsaved upload/edit would silently
// discard it, so this asks for confirmation first, same as Content.jsx.
function Images() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const Active = SECTIONS.find((section) => section.id === activeId)?.Component;

  function selectSection(id) {
    if (id === activeId) return;
    if (isAnyDirty() && !window.confirm(UNSAVED_CHANGES_MESSAGE)) return;
    setActiveId(id);
  }

  return (
    <div className="admin-content">
      <nav className="admin-content-nav">
        <ul>
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                className={section.id === activeId ? 'active' : ''}
                onClick={() => selectSection(section.id)}
              >
                <span className="admin-content-nav-label">{section.label}</span>
                <span className="admin-content-nav-desc">{section.description}</span>
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
