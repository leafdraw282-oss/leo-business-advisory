import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/variables.css';
import './styles/global.css';
import './styles/responsive.css';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { initAnalytics } from './lib/analytics.js';
import App from './App.jsx';

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
