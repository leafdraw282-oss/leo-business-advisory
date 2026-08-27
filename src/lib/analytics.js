// Google Analytics 4 (gtag.js) integration — mirrors src/lib/supabase.js's
// shape exactly: a `isAnalyticsConfigured` flag derived from an env var,
// with every other function a safe no-op when it's false. No Measurement
// ID is ever invented or hardcoded here; without a real one (set via
// VITE_GA_MEASUREMENT_ID in .env.local — see .env.example), analytics is
// simply off and nothing is loaded, fetched, or sent.

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const isAnalyticsConfigured = Boolean(measurementId);

// Event params must never carry visitor-entered content. This is enforced
// here, not just documented at call sites: any param under one of these
// keys is dropped before the event is sent, and a console warning names
// the offending key so the mistake is visible in development rather than
// silently shipping PII.
const BLOCKED_PARAM_KEYS = new Set(['name', 'email', 'phone', 'message', 'company']);

function sanitizeParams(params) {
  const clean = {};
  for (const [key, value] of Object.entries(params)) {
    if (BLOCKED_PARAM_KEYS.has(key.toLowerCase())) {
      console.warn(`[analytics] dropped event param "${key}" — visitor-entered content is never sent to Analytics.`);
      continue;
    }
    clean[key] = value;
  }
  return clean;
}

let initialized = false;

/**
 * Loads gtag.js and configures it, but only if VITE_GA_MEASUREMENT_ID is
 * set. The script tag is injected with `async` (never blocks HTML
 * parsing/first paint) and only added to the DOM at all when configured —
 * when it's not, this function does nothing: no request, no script, no
 * cost. Call once, e.g. from main.jsx after the initial render kicks off;
 * safe to call more than once (idempotent).
 *
 * GA4's default `config` call already sends an initial page_view — this
 * SPA has no client-side router/route changes (see App.jsx), so that
 * single automatic page_view is Page View tracking in full; no manual
 * page_view calls are needed anywhere else.
 */
export function initAnalytics() {
  if (!isAnalyticsConfigured || initialized) return;
  initialized = true;

  window.dataLayer = window.dataLayer || [];
  const gtag = (...args) => window.dataLayer.push(args);
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

/**
 * Fires a GA4 event. No-ops (does not queue, does not throw) when
 * analytics isn't configured or hasn't initialized yet — every call site
 * can call this unconditionally without checking `isAnalyticsConfigured`
 * itself. `params` is sanitized against BLOCKED_PARAM_KEYS before send;
 * never pass raw visitor input (name/email/phone/message/company) as a
 * param value, even indirectly.
 */
export function trackEvent(eventName, params = {}) {
  if (!isAnalyticsConfigured || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, sanitizeParams(params));
}
