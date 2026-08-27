// Tracks "when was anything last saved" for the Dashboard home view's
// "마지막 저장/수정 상태" summary. Browser-local only (localStorage) — this
// is a per-device UX convenience, not an authoritative audit log; it
// resets if the admin clears site data or uses a different browser/device.
const STORAGE_KEY = 'leo-admin-last-saved';

export function recordSave(area) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ area, at: new Date().toISOString() }));
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    // Private browsing / storage disabled — last-saved just won't show. Never break saving over this.
  }
}

export function getLastSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return null;
  }
}
