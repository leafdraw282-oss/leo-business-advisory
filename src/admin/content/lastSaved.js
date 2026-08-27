// Tracks "when was each area last saved" for the Dashboard home view's
// "최근 저장 상태" summary. Browser-local only (localStorage) — this is a
// per-device UX convenience, not an authoritative audit log; it resets if
// the admin clears site data or uses a different browser/device.
//
// Stored as a map of area -> ISO timestamp (e.g. { content: "...", images:
// "..." }) so the Dashboard can show Content and Images separately instead
// of only the single most-recent save across both.
const STORAGE_KEY = 'leo-admin-last-saved';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Phase 2-F stored a single { area, at } record instead of a map —
    // normalize old data on read so returning admins don't lose it.
    if (parsed && typeof parsed === 'object' && typeof parsed.at === 'string' && typeof parsed.area === 'string') {
      return { [parsed.area]: parsed.at };
    }
    return parsed && typeof parsed === 'object' ? parsed : {};
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return {};
  }
}

export function recordSave(area) {
  try {
    const all = readAll();
    all[area] = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    // Private browsing / storage disabled — last-saved just won't show. Never break saving over this.
  }
}

/** Returns { [area]: isoTimestamp } for every area that has been saved at least once. */
export function getAllLastSaved() {
  return readAll();
}
