import Hero from './sections/Hero';
import Impact from './sections/Impact';
import Profile from './sections/Profile';
import CaseStudies from './sections/CaseStudies';
import Advisory from './sections/Advisory';
import Career from './sections/Career';
import Gallery from './sections/Gallery';
import Contact from './sections/Contact';

// Phase 1-A: structural section wiring only. Header, Footer,
// LanguageToggle and the full visual design of every section below are
// scoped to Phase 1-B — see docs/PROJECT_STATUS.md.
function App() {
  return (
    <main>
      <Hero />
      <Impact />
      <Profile />
      <CaseStudies />
      <Advisory />
      <Career />
      <Gallery />
      <Contact />
    </main>
  );
}

export default App;
