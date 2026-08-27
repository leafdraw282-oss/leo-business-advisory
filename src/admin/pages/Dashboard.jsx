import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { isAnyDirty, UNSAVED_CHANGES_MESSAGE } from '../content/dirtyTracker.js';
import { getLastSaved } from '../content/lastSaved.js';
import Content from './Content.jsx';
import Images from './Images.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'content', label: 'Content' },
  { id: 'images', label: 'Images' },
  { id: 'settings', label: 'Settings' },
];

const AREA_LABELS = { content: 'Content', images: 'Images' };

function formatLastSaved() {
  const last = getLastSaved();
  if (!last) return '아직 저장한 내용이 없습니다.';
  const when = new Date(last.at).toLocaleString('ko-KR');
  return `${AREA_LABELS[last.area] ?? last.area} — ${when}`;
}

// Content editing (Phase 2-C) and Images (Phase 2-D) are implemented;
// Settings is still a placeholder. Phase 2-F adds: a Dashboard home view
// non-developers can orient from, and a guard against silently losing
// unsaved edits when navigating away (tab switch, logout, or closing the
// browser tab) — see src/admin/content/dirtyTracker.js.
function Dashboard({ session }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [signingOut, setSigningOut] = useState(false);
  // formatLastSaved() reads localStorage synchronously, so this is
  // derived directly during render (recomputed each time the Dashboard
  // tab is showing) rather than mirrored into its own state + effect.
  const lastSavedText = activeTab === 'dashboard' ? formatLastSaved() : '';

  useEffect(() => {
    function handleBeforeUnload(event) {
      if (!isAnyDirty()) return;
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  function selectTab(id) {
    if (id === activeTab) return;
    if (isAnyDirty() && !window.confirm(UNSAVED_CHANGES_MESSAGE)) return;
    setActiveTab(id);
  }

  async function handleLogout() {
    if (isAnyDirty() && !window.confirm(`${UNSAVED_CHANGES_MESSAGE}\n\n(로그아웃)`)) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    // AdminApp's onAuthStateChange listener clears the session and swaps
    // back to Login — nothing else to do here.
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <p className="admin-sidebar-title">LEO Admin</p>
        <nav>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={item.id === activeTab ? 'active' : ''}
                  onClick={() => selectTab(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <a
          className="admin-public-link"
          href={import.meta.env.BASE_URL}
          target="_blank"
          rel="noreferrer"
        >
          Public Website 바로가기 ↗
        </a>
        <button
          type="button"
          className="admin-logout"
          onClick={handleLogout}
          disabled={signingOut}
        >
          {signingOut ? 'Signing out…' : 'Logout'}
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-main-header">
          <h1>{NAV_ITEMS.find((item) => item.id === activeTab)?.label}</h1>
          <p className="admin-signed-in-as">Signed in as {session.user.email}</p>
        </header>

        {activeTab === 'dashboard' && (
          <div className="admin-dashboard-home">
            <div className="admin-dashboard-cards">
              <button type="button" className="admin-dashboard-card" onClick={() => selectTab('content')}>
                <h2>Content 관리</h2>
                <p>
                  Hero, Impact, About, Case Studies, Advisory, Career, Education, Contact, Footer의
                  한국어/영어 문구를 확인하고 수정합니다.
                </p>
              </button>
              <button type="button" className="admin-dashboard-card" onClick={() => selectTab('images')}>
                <h2>Images 관리</h2>
                <p>Hero, About, Case Study, Gallery에 사용되는 사진을 업로드하고 교체합니다.</p>
              </button>
            </div>

            <div className="admin-dashboard-status">
              <h2>마지막 저장</h2>
              <p>{lastSavedText}</p>
            </div>

            <p className="admin-dashboard-note">
              Settings는 아직 준비 중입니다. Content 또는 Images 카드를 눌러 시작하세요.
            </p>
          </div>
        )}
        {activeTab === 'content' && <Content />}
        {activeTab === 'images' && <Images />}
        {activeTab === 'settings' && (
          <p>Settings are not implemented yet (planned for a later phase).</p>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
