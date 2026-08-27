import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { isAnyDirty, UNSAVED_CHANGES_MESSAGE } from '../content/dirtyTracker.js';
import { getAllLastSaved } from '../content/lastSaved.js';
import Content from './Content.jsx';
import Images from './Images.jsx';
import Inquiries from './Inquiries.jsx';
import Revisions from './Revisions.jsx';
import Settings from './Settings.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'content', label: 'Content' },
  { id: 'images', label: 'Images' },
  { id: 'inquiries', label: 'Inquiries' },
  { id: 'revisions', label: 'Revisions' },
  { id: 'settings', label: 'Settings' },
];

const AREA_LABELS = { content: 'Content (Contact 포함)', images: 'Images' };

// Rows shown in the Dashboard's "최근 저장" panel — Contact is saved under
// the 'content' area (see ContactSection.jsx), so it doesn't get its own
// row, but its label makes that explicit rather than leaving an admin to
// wonder why there's no separate "Contact" line.
function lastSavedRows() {
  const all = getAllLastSaved();
  const areas = Object.keys(AREA_LABELS);
  if (areas.every((area) => !all[area])) return null;
  return areas.map((area) => ({
    area,
    label: AREA_LABELS[area],
    when: all[area] ? new Date(all[area]).toLocaleString('ko-KR') : '아직 저장한 내용이 없습니다.',
  }));
}

// Content editing (Phase 2-C), Images (Phase 2-D), and Settings (Phase
// 4-C, site-wide Design Settings) are implemented. Phase 2-F adds: a Dashboard home view
// non-developers can orient from, and a guard against silently losing
// unsaved edits when navigating away (tab switch, logout, or closing the
// browser tab) — see src/admin/content/dirtyTracker.js. Phase 3-B adds a
// direct "연락처 관리" shortcut (Contact was previously only reachable via
// Content's own sub-nav) and splits "최근 저장" out per area.
function Dashboard({ session }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [signingOut, setSigningOut] = useState(false);
  // Which Content sub-section to open when the Content tab mounts — null
  // means "default" (Content's own first section, Hero). Content.jsx is
  // only rendered while activeTab === 'content', so it naturally
  // unmounts/remounts (picking up a fresh initialSectionId) whenever the
  // admin leaves and comes back via a different tab; `contentKey` forces
  // the same remount when the shortcut is clicked while already on the
  // Content tab.
  const [contentInitialSection, setContentInitialSection] = useState(null);
  const [contentKey, setContentKey] = useState(0);
  // getAllLastSaved() reads localStorage synchronously, so this is derived
  // directly during render (recomputed each time the Dashboard tab is
  // showing) rather than mirrored into its own state + effect.
  const lastSavedRowsList = activeTab === 'dashboard' ? lastSavedRows() : null;

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
    if (id === 'content') setContentInitialSection(null);
    setActiveTab(id);
  }

  function goToContentSection(sectionId) {
    if (isAnyDirty() && !window.confirm(UNSAVED_CHANGES_MESSAGE)) return;
    setContentInitialSection(sectionId);
    setContentKey((key) => key + 1);
    setActiveTab('content');
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
                <h2>콘텐츠 관리</h2>
                <p>
                  Hero, Impact, About, Case Studies, Advisory, Career, Education, Contact, Footer의
                  한국어/영어 문구를 확인하고 수정합니다.
                </p>
              </button>
              <button type="button" className="admin-dashboard-card" onClick={() => selectTab('images')}>
                <h2>이미지 관리</h2>
                <p>Hero, About, Case Study, Gallery에 사용되는 사진을 업로드하고 교체합니다.</p>
              </button>
              <button
                type="button"
                className="admin-dashboard-card"
                onClick={() => goToContentSection('contact')}
              >
                <h2>연락처 관리</h2>
                <p>근무 지역, 이메일, 전화번호, 문의 폼 문구와 문의 유형 목록을 확인하고 수정합니다.</p>
              </button>
              <button type="button" className="admin-dashboard-card" onClick={() => selectTab('inquiries')}>
                <h2>문의 관리</h2>
                <p>Contact Form으로 접수된 실제 문의 목록을 확인하고 처리 상태를 관리합니다.</p>
              </button>
              <button type="button" className="admin-dashboard-card" onClick={() => selectTab('revisions')}>
                <h2>변경 기록</h2>
                <p>콘텐츠를 저장할 때마다 자동으로 남는 이전 값 기록을 확인하고, 필요하면 되돌립니다.</p>
              </button>
              <button type="button" className="admin-dashboard-card" onClick={() => selectTab('settings')}>
                <h2>디자인 설정</h2>
                <p>사이트 전체 색상·폰트·레이아웃·모션 값을 확인하고 수정합니다.</p>
              </button>
              <a
                className="admin-dashboard-card admin-dashboard-card--link"
                href={import.meta.env.BASE_URL}
                target="_blank"
                rel="noreferrer"
              >
                <h2>사이트 바로가기 ↗</h2>
                <p>Public Website를 새 탭에서 열어 실제로 반영된 내용을 확인합니다.</p>
              </a>
            </div>

            <div className="admin-dashboard-status">
              <h2>최근 저장 상태</h2>
              {lastSavedRowsList ? (
                <ul className="admin-dashboard-status-list">
                  {lastSavedRowsList.map((row) => (
                    <li key={row.area}>
                      {row.label}: <span>{row.when}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>아직 저장한 내용이 없습니다.</p>
              )}
            </div>

          </div>
        )}
        {activeTab === 'content' && <Content key={contentKey} initialSectionId={contentInitialSection} />}
        {activeTab === 'images' && <Images />}
        {activeTab === 'inquiries' && <Inquiries />}
        {activeTab === 'revisions' && <Revisions />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default Dashboard;
