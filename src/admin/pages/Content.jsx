import { useState } from 'react';
import { isAnyDirty, UNSAVED_CHANGES_MESSAGE } from '../content/dirtyTracker.js';
import HeroSection from './content/HeroSection.jsx';
import ChallengeSection from './content/ChallengeSection.jsx';
import AdvisorySection from './content/AdvisorySection.jsx';
import ImpactSection from './content/ImpactSection.jsx';
import AboutSection from './content/AboutSection.jsx';
import CaseStudiesSection from './content/CaseStudiesSection.jsx';
import HowWeWorkSection from './content/HowWeWorkSection.jsx';
import TargetClientsSection from './content/TargetClientsSection.jsx';
import InsightsSection from './content/InsightsSection.jsx';
import CareerSection from './content/CareerSection.jsx';
import ContactSection from './content/ContactSection.jsx';
import FooterSection from './content/FooterSection.jsx';

// Education was removed from this list (Phase: Advisory Sales CMS
// wiring) — no section in App.jsx has rendered it since the Advisory
// Sales repositioning, so its editor here had nothing to affect; see
// docs/PROJECT_STATUS.md. education_entries stays in the schema
// untouched, just no longer written to from this screen.
const SECTIONS = [
  { id: 'hero', label: 'Hero', description: '첫 화면 문구와 버튼', Component: HeroSection },
  { id: 'challenge', label: 'Challenge', description: '이런 고민이 있으신가요', Component: ChallengeSection },
  { id: 'advisory', label: 'Advisory', description: '자문 서비스 4가지', Component: AdvisorySection },
  { id: 'impact', label: 'Impact', description: '숫자로 보는 성과 4가지', Component: ImpactSection },
  { id: 'about', label: 'About', description: '소개 문구', Component: AboutSection },
  { id: 'case-studies', label: 'Case Studies', description: '경영 성과 사례 6건', Component: CaseStudiesSection },
  { id: 'how-we-work', label: 'How We Work', description: '일하는 방식 비교', Component: HowWeWorkSection },
  { id: 'target-clients', label: 'Target Clients', description: '이런 분들과 함께합니다', Component: TargetClientsSection },
  { id: 'insights', label: 'Insights', description: '인사이트 미리보기 카드', Component: InsightsSection },
  { id: 'career', label: 'Career', description: '경력 타임라인', Component: CareerSection },
  { id: 'contact', label: 'Contact', description: '연락처와 문의 폼 문구', Component: ContactSection },
  { id: 'footer', label: 'Footer', description: '하단 저작권 문구', Component: FooterSection },
];

// Each section owns its own load/save against Supabase (or the
// src/data/profile.js fallback) — this is just the sub-nav between them.
// Switching sections unmounts the previous one, which would silently
// discard an in-progress edit — so switching while the active section has
// unsaved changes asks for confirmation first (see src/admin/content/dirtyTracker.js).
//
// `initialSectionId`: lets a caller (Dashboard's "연락처 관리" shortcut)
// open directly on a specific sub-section instead of always defaulting to
// the first one (Hero).
function Content({ initialSectionId }) {
  const [activeId, setActiveId] = useState(
    SECTIONS.some((section) => section.id === initialSectionId) ? initialSectionId : SECTIONS[0].id,
  );
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
