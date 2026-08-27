import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { setDirtyState } from './dirtyTracker.js';
import { recordSave } from './lastSaved.js';

// Supabase's client throws plain { message, code, ... } objects, not
// Error instances, so String(err) would otherwise render "[object
// Object]" in the UI instead of the actual failure reason.
function extractErrorMessage(err) {
  if (err instanceof Error) return err.message;
  if (err && typeof err.message === 'string') return err.message;
  return String(err);
}

/**
 * Generic state machine behind every Content section editor
 * (src/admin/pages/content/*.jsx): load current values (database if
 * configured and populated, src/data/profile.js otherwise — see each
 * section's own `load()`), track whether the form has unsaved edits, and
 * save + re-fetch to confirm what's actually persisted.
 *
 * `load`: async () => formValues
 * `save`: async (formValues) => formValues — must perform the actual
 *   writes and then return the freshly re-read values (the section's own
 *   `save()` re-calls its `load()` at the end), so the UI always reflects
 *   what's really in the database after a save, not just what was typed.
 */
export function useAdminForm({ load, save }) {
  const instanceId = useId();
  const [status, setStatus] = useState('loading'); // loading | ready | load-error
  const [loadError, setLoadError] = useState('');
  const [values, setValues] = useState(null);
  const savedRef = useRef(null);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | success | error
  const [saveError, setSaveError] = useState('');

  const runLoad = useCallback(async () => {
    setStatus('loading');
    setLoadError('');
    try {
      const initial = await load();
      setValues(initial);
      savedRef.current = initial;
      setStatus('ready');
      setSaveState('idle');
      setSaveError('');
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

  function update(updater) {
    setValues((prev) => (typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }));
    if (saveState !== 'idle') setSaveState('idle');
  }

  const isDirty =
    values !== null && savedRef.current !== null && JSON.stringify(values) !== JSON.stringify(savedRef.current);

  useEffect(() => {
    setDirtyState(instanceId, isDirty);
    return () => setDirtyState(instanceId, false);
  }, [instanceId, isDirty]);

  async function runSave() {
    setSaveState('saving');
    setSaveError('');
    try {
      const confirmed = await save(values);
      setValues(confirmed);
      savedRef.current = confirmed;
      setSaveState('success');
      recordSave('content');
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setSaveState('error');
      setSaveError(extractErrorMessage(err));
    }
  }

  return {
    status,
    loadError,
    values,
    update,
    isDirty,
    saveState,
    saveError,
    save: runSave,
    reload: runLoad,
  };
}
