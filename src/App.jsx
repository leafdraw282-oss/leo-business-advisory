import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import Impact from './sections/Impact';
import Profile from './sections/Profile';
import CaseStudies from './sections/CaseStudies';
import Advisory from './sections/Advisory';
import Career from './sections/Career';
import Gallery from './sections/Gallery';
import Contact from './sections/Contact';

// Phase 1-E: every planned Phase 1 section, plus Header and Footer, is
// now built and connected — see docs/PROJECT_STATUS.md for what's next
// (scroll-reveal animation, active-nav-on-scroll, deployment config).
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
      <Footer />
    </>
  );
}

export default App;
