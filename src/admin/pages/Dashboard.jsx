import { useState } from 'react';
import { supabase } from '../../lib/supabase.js';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'content', label: 'Content' },
  { id: 'images', label: 'Images' },
  { id: 'settings', label: 'Settings' },
];

// Minimal, functional shell only — no real content-editing, image-upload,
// or settings UI yet. That's Phase 2-C. This just proves the authenticated
// area exists and logout works.
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
            This is the admin dashboard shell built in Phase 2-B. Content,
            image, and settings editing are not implemented yet — see
            docs/PROJECT_STATUS.md for what's planned in Phase 2-C.
          </p>
        )}
        {activeTab === 'content' && (
          <p>Content editing is not implemented yet (planned for Phase 2-C).</p>
        )}
        {activeTab === 'images' && (
          <p>Image management is not implemented yet (planned for Phase 2-C).</p>
        )}
        {activeTab === 'settings' && (
          <p>Settings are not implemented yet (planned for Phase 2-C).</p>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
