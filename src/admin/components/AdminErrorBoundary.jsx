import { Component } from 'react';

/**
 * Top-level safety net around the admin Dashboard (Phase 2-G). Unlike the
 * public site's SectionErrorBoundary (which fails silently — a marketing
 * page shouldn't show an error box), the admin operator needs to know
 * something broke and how to recover, so this shows a visible message
 * with a reload button instead of a blank white screen.
 */
class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Admin UI crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="admin-status-screen">
          <h1>문제가 발생했습니다</h1>
          <p>화면을 표시하는 중 오류가 발생했습니다. 새로고침 후 다시 시도해주세요.</p>
          <button type="button" onClick={() => window.location.reload()}>
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AdminErrorBoundary;
