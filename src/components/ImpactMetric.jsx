import './ImpactMetric.css';

/**
 * A single headline figure in the Impact section — a hairline rule, a
 * large number, and a short label. Deliberately not a bordered/shadowed
 * "card" (see CLAUDE.md: avoid generic SaaS card grids).
 */
function ImpactMetric({ value, label }) {
  return (
    <div className="impact-metric">
      <p className="impact-metric__value">{value}</p>
      <p className="impact-metric__label">{label}</p>
    </div>
  );
}

export default ImpactMetric;
