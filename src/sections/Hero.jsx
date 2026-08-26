import { hero, person, images } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import ImagePlaceholder from '../components/ImagePlaceholder';
import './Hero.css';

/**
 * Hero section (id: "top" — also the Logo's scroll target). Full visual
 * design per Phase 1-B; other sections remain structural shells.
 */
function Hero() {
  const { language, t } = useLanguage();
  const name = language === 'ko' ? person.nameKoFormatted : person.nameEnDisplay;
  const headlineLines = t(hero.headlineKo, hero.headlineEn);

  return (
    <section id="top" className="hero" aria-label={person.nameEnDisplay}>
      <div className="container hero__grid">
        <div className="hero__content">
          <p className="hero__name">{name}</p>
          <p className="hero__eyebrow">{t(hero.eyebrowKo, hero.eyebrowEn)}</p>
          <h1 className="hero__headline">
            {headlineLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="hero__subhead">{t(hero.subheadKo, hero.subheadEn)}</p>
          <div className="hero__cta">
            <a className="btn btn--primary" href={`#${hero.ctaPrimaryTarget}`}>
              {t(hero.ctaPrimaryKo, hero.ctaPrimaryEn)}
            </a>
            <a className="btn btn--secondary" href={`#${hero.ctaSecondaryTarget}`}>
              {t(hero.ctaSecondaryKo, hero.ctaSecondaryEn)}
            </a>
          </div>
        </div>
        <div className="hero__media">
          <ImagePlaceholder
            src={images.hero}
            alt={`${person.nameEnDisplay} portrait`}
            label="LEO Portrait"
            aspectRatio="4 / 5"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
