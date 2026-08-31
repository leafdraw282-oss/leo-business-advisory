import Header from './components/Header';
import Footer from './components/Footer';
import SectionErrorBoundary from './components/SectionErrorBoundary';
import { useApplyDesignSettings } from './hooks/useApplyDesignSettings';
import { useLanguage } from './context/languageContext';
import Hero from './sections/Hero';
import Challenge from './sections/Challenge';
import Advisory from './sections/Advisory';
import Impact from './sections/Impact';
import Profile from './sections/Profile';
import CaseStudies from './sections/CaseStudies';
import HowWeWork from './sections/HowWeWork';
import TargetClients from './sections/TargetClients';
import InsightsPreview from './sections/InsightsPreview';
import Career from './sections/Career';
import Gallery from './sections/Gallery';
import Contact from './sections/Contact';

// Advisory Sales IA overhaul — section order rebuilt around the visitor's
// problem first, Leo's history second (CLAUDE.md: "Customer's problem/
// solution shown before Leo's career"): Hero → Challenge → Advisory
// ("What We Do") → Impact ("Why Leo") → Profile ("About") → Case Studies
// ("Selected Cases") → How We Work → Target Clients → Insights → Career →
// Gallery → Contact. Career/Gallery are existing, real content — per this
// phase's brief ("기존 사이트에 존재하는 실제 경력 정보는 최대한 보존하면서
// 재배치") they're preserved and repositioned as supporting evidence right
// before the closing CTA, not removed. Each CMS-backed section (every one
// below except Header) is individually wrapped in SectionErrorBoundary
// (Phase 2-G): if malformed Supabase data somehow crashes one section's
// render, the rest of the page keeps working instead of going blank.
// useApplyDesignSettings() (Phase 4-C) applies the admin-configurable
// site_design_settings row to :root once fetched; first paint always uses
// variables.css's own defaults, and any fetch failure/invalid value falls
// back the same way, so this can never blank or break the page either.
function App() {
  useApplyDesignSettings();
  const { t } = useLanguage();

  return (
    <>
      {/* Phase 4-G — WCAG 2.4.1 Bypass Blocks: lets a keyboard user jump
          straight to #main-content instead of tabbing through the header's
          logo, full nav, and language toggle on every page load. Hidden
          via .skip-link (global.css) until it receives focus. */}
      <a href="#main-content" className="skip-link">
        {t('본문으로 바로가기', 'Skip to content')}
      </a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <SectionErrorBoundary>
          <Hero />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <Challenge />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <Advisory />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <Impact />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <Profile />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <CaseStudies />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <HowWeWork />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <TargetClients />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <InsightsPreview />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <Career />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <Gallery />
        </SectionErrorBoundary>
        <SectionErrorBoundary>
          <Contact />
        </SectionErrorBoundary>
      </main>
      <SectionErrorBoundary>
        <Footer />
      </SectionErrorBoundary>
    </>
  );
}

export default App;
