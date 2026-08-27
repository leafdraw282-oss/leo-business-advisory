import { useState } from 'react';
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
  { id: 'hero', label: 'Hero', Component: HeroSection },
  { id: 'impact', label: 'Impact', Component: ImpactSection },
  { id: 'about', label: 'About', Component: AboutSection },
  { id: 'case-studies', label: 'Case Studies', Component: CaseStudiesSection },
  { id: 'advisory', label: 'Advisory', Component: AdvisorySection },
  { id: 'career', label: 'Career', Component: CareerSection },
  { id: 'education', label: 'Education', Component: EducationSection },
  { id: 'contact', label: 'Contact', Component: ContactSection },
  { id: 'footer', label: 'Footer', Component: FooterSection },
];

// Each section owns its own load/save against Supabase (or the
// src/data/profile.js fallback) — this is just the sub-nav between them.
// Switching sections unmounts the previous one, so an in-progress unsaved
// edit in section A does not leak into section B; each section's own
// "Unsaved changes" indicator is the guard against losing that edit.
function Content() {
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

export default Content;
