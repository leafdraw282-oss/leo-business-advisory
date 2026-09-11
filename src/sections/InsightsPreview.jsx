import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/languageContext';
import { useReveal } from '../hooks/useReveal';
import { useSectionContent } from '../hooks/useSectionContent';
import { fetchInsights, insightsFallback } from '../lib/content/insights';
import SectionTitle from '../components/SectionTitle';
import InsightCard from '../components/InsightCard';
import './InsightsPreview.css';

/**
 * "Insights" (id: "insights", matches src/data/navigation.js and the
 * simplified header nav) — Advisory Sales IA, section 8. Content comes from
 * Supabase (Content -> Insights) when available, falling back to
 * src/data/profile.js — see src/lib/content/insights.js. A card's link
 * button text is never admin-authored data (see InsightCard.jsx) — it's a
 * fixed pair auto-picked by the current language below.
 *
 * The admin edits cards top-to-bottom, oldest first, always appending new
 * ones at the bottom (src/admin/pages/content/InsightsSection.jsx). This
 * renders that same list reversed, so the most recently added insight is
 * always the first card a visitor sees — without needing to touch the
 * admin's own row order or add a timestamp column.
 *
 * Cards render in a horizontally-scrolling track (native scroll-snap, so
 * touch/trackpad swipe works for free) instead of a fixed grid, since the
 * list can now grow without bound. Prev/Next arrows just scroll the track
 * by one viewport width and only appear once the track actually overflows
 * (i.e. there are more cards than fit at the current breakpoint).
 */
function InsightsPreview() {
  const { t } = useLanguage();
  const data = useSectionContent(fetchInsights, insightsFallback());
  const { ref, className: revealClassName } = useReveal();
  const trackRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const items = [...data.items].reverse();

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  // useLayoutEffect (not useEffect) so the first measurement happens
  // before paint — otherwise the arrows would visibly pop in a frame after
  // the cards do. Re-runs when the item count changes (fallback -> real
  // fetched data, or an admin add/remove) since that changes whether the
  // track overflows at all.
  useLayoutEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState, items.length]);

  function scrollByPage(direction) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' });
  }

  const showArrows = canScrollPrev || canScrollNext;

  return (
    <section
      id="insights"
      ref={ref}
      className={`insights-preview ${revealClassName}`.trim()}
      aria-label={t(data.section.titleKo, data.section.titleEn)}
    >
      <div className="container">
        <SectionTitle
          eyebrow={t(data.section.eyebrowKo, data.section.eyebrowEn)}
          title={t(data.section.titleKo, data.section.titleEn)}
        />
        <div className="insights-carousel">
          {showArrows && (
            <button
              type="button"
              className="insights-carousel__arrow insights-carousel__arrow--prev"
              onClick={() => scrollByPage(-1)}
              disabled={!canScrollPrev}
              aria-label={t('이전 인사이트', 'Previous insights')}
            >
              ‹
            </button>
          )}
          <ul className="insights-preview__grid" ref={trackRef} onScroll={updateScrollState}>
            {items.map((item, index) => (
              <li key={item.id ?? index}>
                <InsightCard
                  title={t(item.titleKo, item.titleEn)}
                  comingSoonLabel={t(data.section.comingSoonKo, data.section.comingSoonEn)}
                  linkUrl={item.linkUrl}
                  linkLabel={t('블로그에서 보기', 'Read on the blog')}
                />
              </li>
            ))}
          </ul>
          {showArrows && (
            <button
              type="button"
              className="insights-carousel__arrow insights-carousel__arrow--next"
              onClick={() => scrollByPage(1)}
              disabled={!canScrollNext}
              aria-label={t('다음 인사이트', 'Next insights')}
            >
              ›
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default InsightsPreview;
