import './SectionTitle.css';

/**
 * Shared eyebrow + heading pattern used across sections, matching the
 * treatment already established in Hero (small bronze uppercase kicker
 * above a large serif heading). Keeps heading typography consistent
 * without every section re-implementing its own styles.
 */
function SectionTitle({ eyebrow, title, align = 'left', className = '' }) {
  return (
    <div className={`section-title section-title--${align} ${className}`.trim()}>
      {eyebrow && <p className="section-title__eyebrow">{eyebrow}</p>}
      <h2 className="section-title__heading">{title}</h2>
    </div>
  );
}

export default SectionTitle;
