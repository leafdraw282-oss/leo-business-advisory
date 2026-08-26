import { career } from '../data/profile';

/**
 * Structural shell — Career timeline section (id: "career", matches
 * src/data/navigation.js). Visual timeline treatment is Phase 1-B.
 */
function Career() {
  return (
    <section id="career" aria-label="Executive Career">
      <div className="container">
        <h2>Executive Career</h2>
        <ol>
          {career.map((entry) => (
            <li key={entry.period}>
              <span>{entry.period}</span>
              <strong>{entry.roleEn}</strong>
              <span>{entry.companyEn}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Career;
