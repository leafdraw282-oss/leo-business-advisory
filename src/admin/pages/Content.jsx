import { useState } from 'react';
import { isAnyDirty, UNSAVED_CHANGES_MESSAGE } from '../content/dirtyTracker.js';
import HeroSection from './content/HeroSection.jsx';
import ImpactSection from './content/ImpactSection.jsx';
import AboutSection from './content/AboutSection.jsx';
import CaseStudiesSection from './content/CaseStudiesSection.jsx';
import AdvisorySection from './content/AdvisorySection.jsx';
import CareerSection from './content/CareerSection.jsx';
import EducationSection from './content/EducationSection.jsx';
import ContactSection from './content/ContactSection.jsx';
import FooterSection from './content/FooterSection.jsx';

const SECTIONS = [
  { id: 'hero', label: 'Hero', description: '첫 화면 문구와 버튼', Component: HeroSection },
  { id: 'impact', label: 'Impact', description: '숫자로 보는 성과 4가지', Component: ImpactSection },
  { id: 'about', label: 'About', description: '소개 문구', Component: AboutSection },
  { id: 'case-studies', label: 'Case Studies', description: '경영 성과 사례 6건', Component: CaseStudiesSection },
  { id: 'advisory', label: 'Advisory', description: '자문 영역 목록', Component: AdvisorySection },
  { id: 'career', label: 'Career', description: '경력 타임라인', Component: CareerSection },
  { id: 'education', label: 'Education', description: '학력 및 어학', Component: EducationSection },
  { id: 'contact', label: 'Contact', description: '연락처와 문의 폼 문구', Component: ContactSection },
  { id: 'footer', label: 'Footer', description: '하단 저작권 문구', Component: FooterSection },
];

// Each section owns its own load/save against Supabase (or the
// src/data/profile.js fallback) — this is just the sub-nav between them.
// Switching sections unmounts the previous one, which would silently
// discard an in-progress edit — so switching while the active section has
// unsaved changes asks for confirmation first (see src/admin/content/dirtyTracker.js).
function Content() {
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

export default Content;
