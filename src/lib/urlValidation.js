/**
 * Basic external-link validation (Insights card URLs, etc.) — accepts only
 * http(s) URLs with something after the scheme, so a bare "http://", a
 * non-http scheme (javascript:, mailto:, ...), or plain non-URL text can
 * never become a real href. Not a full RFC 3986 parser, just enough to
 * keep obviously-broken or unsafe values off the public page.
 */
export function isValidHttpUrl(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!/^https?:\/\/./i.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
