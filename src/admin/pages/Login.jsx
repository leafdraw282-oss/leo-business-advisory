import { useState } from 'react';
import { supabase } from '../../lib/supabase.js';

// Sign-in only. There is deliberately no sign-up form or link anywhere in
// this admin shell — admin accounts are created out-of-band by whoever
// has access to the Supabase project (Dashboard -> Authentication ->
// Users -> Add user, or the SQL Editor), never by a site visitor. See
// supabase/README.md and supabase/migrations/0002_rls_policies.sql
// (admin_users allowlist).
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    // On success, AdminApp's onAuthStateChange listener picks up the new
    // session and swaps this screen for the Dashboard — nothing else to
    // do here.
  }

  return (
    <div className="admin-login-screen">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h1>LEO Business Advisory</h1>
        <p className="admin-login-subtitle">Admin sign in</p>

        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && (
          <p className="admin-login-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default Login;
