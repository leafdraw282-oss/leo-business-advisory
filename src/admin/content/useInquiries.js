import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase.js';

function extractErrorMessage(err) {
  if (err instanceof Error) return err.message;
  if (err && typeof err.message === 'string') return err.message;
  return String(err);
}

export const STATUS_OPTIONS = ['new', 'in_progress', 'completed'];

async function fetchInquiries() {
  const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * Admin-only read/manage access to Contact Form submissions
 * (supabase/migrations/0005_inquiries.sql) — RLS only lets an admin
 * session select/update/delete these rows at all, so this hook has no
 * src/data/profile.js fallback the way public content hooks do: if
 * Supabase isn't configured or the request is rejected, there is nothing
 * meaningful to show instead of the real data.
 *
 * Status changes and deletes write immediately (no draft/Save step) — each
 * row tracks its own in-flight action in `rowState` so one row updating
 * doesn't block or blank out the rest of the list.
 */
export function useInquiries() {
  const [status, setStatus] = useState('loading'); // loading | ready | unconfigured | load-error
  const [loadError, setLoadError] = useState('');
  const [items, setItems] = useState([]);
  const [rowState, setRowState] = useState({}); // id -> { action: 'updating' | 'deleting' | null, error: string }

  const runLoad = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setItems([]);
      setStatus('unconfigured');
      return;
    }
    setStatus('loading');
    setLoadError('');
    try {
      const rows = await fetchInquiries();
      setItems(rows);
      setStatus('ready');
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setStatus('load-error');
      setLoadError(extractErrorMessage(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    runLoad();
  }, [runLoad]);

  async function updateStatus(id, newStatus) {
    setRowState((prev) => ({ ...prev, [id]: { action: 'updating', error: '' } }));
    try {
      const { data, error } = await supabase.from('inquiries').update({ status: newStatus }).eq('id', id).select().single();
      if (error) throw error;
      setItems((prev) => prev.map((item) => (item.id === id ? data : item)));
      setRowState((prev) => ({ ...prev, [id]: { action: null, error: '' } }));
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setRowState((prev) => ({ ...prev, [id]: { action: null, error: extractErrorMessage(err) } }));
    }
  }

  async function remove(id) {
    setRowState((prev) => ({ ...prev, [id]: { action: 'deleting', error: '' } }));
    try {
      const { error } = await supabase.from('inquiries').delete().eq('id', id);
      if (error) throw error;
      setItems((prev) => prev.filter((item) => item.id !== id));
      setRowState((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setRowState((prev) => ({ ...prev, [id]: { action: null, error: extractErrorMessage(err) } }));
    }
  }

  return { status, loadError, items, rowState, updateStatus, remove, reload: runLoad };
}
