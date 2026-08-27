import { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import Content from './Content.jsx';
import Images from './Images.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'content', label: 'Content' },
  { id: 'images', label: 'Images' },
  { id: 'settings', label: 'Settings' },
];

// Content editing (Phase 2-C) and Images (Phase 2-D) are implemented;
// Settings is still a placeholder.
function Dashboard({ session }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
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
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
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
          <p>
            Use the Content tab to edit the public site's text (Hero,
            Impact, About, Case Studies, Advisory, Career, Education,
            Contact, Footer) in Korean and English, and the Images tab to
            manage Hero, About, Case Study, and Gallery photos. Settings
            is not implemented yet — see docs/PROJECT_STATUS.md.
          </p>
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
