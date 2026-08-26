import { advisory } from '../data/profile';

/**
 * Structural shell — Advisory section (id: "advisory", matches
 * src/data/navigation.js). Final visual treatment is Phase 1-B.
 */
function Advisory() {
  return (
    <section id="advisory" aria-label="Advisory Focus">
      <div className="container">
        <h2>{advisory.titleEn}</h2>
        <ul>
          {advisory.items.map((item) => (
            <li key={item.en}>{item.en}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Advisory;
