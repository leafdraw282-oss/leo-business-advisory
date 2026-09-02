import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/variables.css';
import './styles/global.css';
import './styles/responsive.css';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { initAnalytics } from './lib/analytics.js';
import App from './App.jsx';

// Perceived-loading-speed optimization: every section's real content
// (and, for Hero/About/Case Studies/Gallery, its image or video) comes
// from this same Supabase project — see src/lib/content/*.js. Each
// section only starts that fetch from its own useEffect, after the
// initial render has already committed (see useSectionContent.js), so
// the DNS lookup + TLS handshake to this origin hadn't even started by
// the time the first real request needed it. A `preconnect` hint fired
// here, before React even renders, lets the browser open that connection
// in parallel with everything else — by the time a component's fetch
// actually fires, the connection is already warm. `VITE_SUPABASE_URL` is
// inlined at build time (see src/lib/supabase.js), so this is static
// once built; it's a no-op (no element added) when Supabase isn't
// configured, matching every other Supabase-aware code path's
// fail-quiet behavior.
const supabaseOrigin = import.meta.env.VITE_SUPABASE_URL;
if (supabaseOrigin) {
  for (const rel of ['preconnect', 'dns-prefetch']) {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = supabaseOrigin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);

// Deferred until the browser is idle (or, lacking that API — Safari — a
// short timeout) so loading analytics never competes with first paint or
// hydration. A no-op entirely when VITE_GA_MEASUREMENT_ID isn't set.
const scheduleIdle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 200));
scheduleIdle(initAnalytics);
