import { Component } from 'react';

/**
 * Wraps one section so a render-time error there (e.g. malformed CMS
 * data that slips past the fetch-layer fallbacks — see
 * src/lib/content/*.js) can never take down the rest of the page. This
 * is a deliberately small, silent net: known failure modes are already
 * handled upstream (fetchWithFallback.js), so reaching this boundary
 * means something unexpected happened — the safest response is to drop
 * just that one section, not show a scary error box in the middle of a
 * marketing page. Logged to the console for debugging.
 */
class SectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Section failed to render and was hidden:', error, info);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default SectionErrorBoundary;
