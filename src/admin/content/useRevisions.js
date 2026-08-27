import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../../lib/supabase.js';
import { fetchRecentRevisions, restoreRevision } from './supabaseTable.js';

function extractErrorMessage(err) {
  if (err instanceof Error) return err.message;
  if (err && typeof err.message === 'string') return err.message;
  return String(err);
}

/**
 * Admin-only "최근 변경 기록" (recent changes) screen data — every row is a
 * pre-write snapshot recorded automatically by supabaseTable.js's
 * upsertSingleton/saveListRow/upsertByNaturalKey (see
 * supabase/migrations/0006_content_revisions.sql). Restoring writes
 * immediately (no draft/Save step), same as Inquiries' status changes —
 * each entry tracks its own in-flight restore so one doesn't block others.
 */
export function useRevisions() {
  const [status, setStatus] = useState('loading'); // loading | ready | unconfigured | load-error
  const [loadError, setLoadError] = useState('');
  const [revisions, setRevisions] = useState([]);
  const [rowState, setRowState] = useState({}); // id -> { action: 'restoring' | null, error, done }

  const runLoad = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setRevisions([]);
      setStatus('unconfigured');
      return;
    }
    setStatus('loading');
    setLoadError('');
    try {
      const rows = await fetchRecentRevisions();
      setRevisions(rows);
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

  async function restore(revision) {
    setRowState((prev) => ({ ...prev, [revision.id]: { action: 'restoring', error: '' } }));
    try {
      await restoreRevision(revision);
      setRowState((prev) => ({ ...prev, [revision.id]: { action: null, error: '', done: true } }));
      await runLoad();
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setRowState((prev) => ({ ...prev, [revision.id]: { action: null, error: extractErrorMessage(err) } }));
    }
  }

  return { status, loadError, revisions, rowState, restore, reload: runLoad };
}
