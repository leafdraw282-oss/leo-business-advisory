import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminErrorBoundary from './components/AdminErrorBoundary.jsx';

// Auth gate for the whole admin shell. There is no server here to enforce
// this — the real security boundary is Supabase Row Level Security (see
// supabase/migrations/0002_rls_policies.sql), which only lets rows in
// admin_users write. This just decides what the browser renders:
// unconfigured backend -> setup notice, no session -> Login, session -> Dashboard.
function AdminApp() {
  const [status, setStatus] = useState(isSupabaseConfigured ? 'loading' : 'unconfigured');
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setStatus('ready');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setStatus('ready');
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (status === 'unconfigured') {
    return (
      <div className="admin-status-screen">
        <h1>Admin not configured</h1>
        <p>
          This admin shell needs a Supabase project to authenticate against.
          Set <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> in a local <code>.env.local</code>{' '}
          file (see <code>.env.example</code>) and rebuild. See{' '}
          <code>supabase/README.md</code> for full setup steps.
        </p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="admin-status-screen">
        <p>Loading…</p>
      </div>
    );
  }

  return session ? (
    <AdminErrorBoundary>
      <Dashboard session={session} />
    </AdminErrorBoundary>
  ) : (
    <Login />
  );
}

export default AdminApp;
