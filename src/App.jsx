import Header from './components/Header';
import Hero from './sections/Hero';
import Impact from './sections/Impact';
import Profile from './sections/Profile';
import CaseStudies from './sections/CaseStudies';
import Advisory from './sections/Advisory';
import Career from './sections/Career';
import Gallery from './sections/Gallery';
import Contact from './sections/Contact';

// Phase 1-B: Header/navigation/Hero are now fully built. Footer and the
// full visual design of the remaining sections are scoped to a later
// phase — see docs/PROJECT_STATUS.md.
function App() {
  return (
    <>
      <Header />
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
    </>
  );
}

export default App;
