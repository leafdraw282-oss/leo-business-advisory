import { person, hero as heroStatic } from '../data/profile';
import { useLanguage } from '../context/languageContext';
import { useSectionContent } from '../hooks/useSectionContent';
import { fetchHero, heroInitial } from '../lib/content/hero';
import { trackEvent } from '../lib/analytics';
import ImagePlaceholder from '../components/ImagePlaceholder';
import './Hero.css';

/**
 * Hero section (id: "top" — also the Logo's scroll target). Content comes
 * from Supabase (Phase 2-E) when configured and saved, falling back to
 * src/data/profile.js otherwise — see src/lib/content/hero.js. `name` is
 * not part of the CMS (person identity fields are out of admin scope),
 * so it stays a direct profile.js read.
 */
function Hero() {
  const { language, t } = useLanguage();
  const hero = useSectionContent(fetchHero, heroInitial());
  const name = language === 'ko' ? person.nameKoFormatted : person.nameEnDisplay;
  const headlineLines = t(hero.headlineKo, hero.headlineEn);
  const portraitLabel = t(hero.imageAltKo, hero.imageAltEn);

  return (
    <section id="top" className="hero" aria-label={name}>
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
          {/* Advisory Sales repositioning — a supporting credential line
              (30+ Years / Global CEO / 8X Growth / ...), not part of the
              CMS-backed hero_content row (see src/lib/content/hero.js):
              every token here just restates facts already established in
              impact/about/caseStudies below, so it stays a direct
              profile.js read (same pattern as `person` above) rather than
              needing a new DB column + migration for a fixed derived
              line. */}
          <p className="hero__credentials">{t(heroStatic.credentialsKo, heroStatic.credentialsEn)}</p>
          <div className="hero__cta">
            {/* Tracked by the CTA's fixed role (primary/secondary), not its
                admin-editable label text, which can change without notice —
                see src/lib/analytics.js. */}
            <a
              className="btn btn--primary"
              href={`#${hero.ctaPrimaryTarget}`}
              onClick={() => trackEvent('explore_experience_click')}
            >
              {t(hero.ctaPrimaryKo, hero.ctaPrimaryEn)}
            </a>
            <a
              className="btn btn--secondary"
              href={`#${hero.ctaSecondaryTarget}`}
              onClick={() => trackEvent('discuss_project_click')}
            >
              {t(hero.ctaSecondaryKo, hero.ctaSecondaryEn)}
            </a>
          </div>
        </div>
        <div className="hero__media">
          <ImagePlaceholder
            src={hero.imageUrl}
            alt={portraitLabel}
            label={portraitLabel}
            aspectRatio="3 / 4"
            loading="eager"
            fetchPriority="high"
            fadeInOnLoad
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
