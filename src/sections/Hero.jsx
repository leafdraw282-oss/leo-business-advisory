import { hero, person } from '../data/profile';

/**
 * Structural shell only — full Hero design (layout, portrait imagery, CTA
 * styling) is scoped to Phase 1-B. This proves the section is wired to
 * App.jsx and to src/data/profile.js.
 */
function Hero() {
  return (
    <section id="top" aria-label={person.nameEnDisplay}>
      <div className="container">
        <p>{hero.eyebrowEn}</p>
        <h1>{hero.headlineEn.join(' ')}</h1>
        <p>{hero.subheadEn}</p>
        <nav aria-label="Hero calls to action">
          <a href={`#${hero.ctaPrimaryTarget}`}>{hero.ctaPrimaryEn}</a>
          <a href={`#${hero.ctaSecondaryTarget}`}>{hero.ctaSecondaryEn}</a>
        </nav>
      </div>
    </section>
  );
}

export default Hero;
