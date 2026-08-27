// Shared validation for Content section save() functions. Every bilingual
// field must have both a KO and an EN value before saving — this is the
// admin-side enforcement of CLAUDE.md's "never a partial switch" rule:
// nothing should be saveable in one language only.
export function requireFilled(pairs) {
  const missing = pairs.filter((pair) => !pair.ko?.trim() || !pair.en?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing KO or EN text for: ${missing.map((pair) => pair.label).join(', ')}`);
  }
}
