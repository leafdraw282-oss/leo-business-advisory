import Header from './components/Header';
import Footer from './components/Footer';
import SectionErrorBoundary from './components/SectionErrorBoundary';
import Hero from './sections/Hero';
import Impact from './sections/Impact';
import Profile from './sections/Profile';
import CaseStudies from './sections/CaseStudies';
import Advisory from './sections/Advisory';
import Career from './sections/Career';
import Gallery from './sections/Gallery';
import Contact from './sections/Contact';

// Every planned Phase 1 section, plus Header and Footer, is built and
// connected — see docs/PROJECT_STATUS.md. Each CMS-backed section (every
// one below except Header) is individually wrapped in
// SectionErrorBoundary (Phase 2-G): if malformed Supabase data somehow
// crashes one section's render, the rest of the page keeps working
// instead of going blank.
function App() {
  return (
    <>
      <Header />
      <main>
        <SectionErrorBoundary>
          <Hero />
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
          <Advisory />
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
