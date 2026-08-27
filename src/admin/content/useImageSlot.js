import { useCallback, useEffect, useId, useState } from 'react';
import { isSupabaseConfigured } from '../../lib/supabase.js';
import { saveListRow } from './supabaseTable.js';
import { validateImageFile, uploadImageFile } from './supabaseStorage.js';
import { setDirtyState } from './dirtyTracker.js';
import { recordSave } from './lastSaved.js';

function extractErrorMessage(err) {
  if (err instanceof Error) return err.message;
  if (err && typeof err.message === 'string') return err.message;
  return String(err);
}

/**
 * Manages one single-image slot (Hero, About/Profile, or one Case Study).
 * Gallery uses its own list-shaped logic (src/admin/pages/images/GalleryImages.jsx)
 * since it's a variable-length collection, not one fixed slot.
 *
 * `folder`: storage folder for new uploads, e.g. "hero", "about", "case-studies/samsonite-korea".
 * `fallbackAlt`: { ko, en } default alt text shown until the admin sets their own.
 * `loadParent`: async () => { media: mediaRow } | null — current state (null = no image set yet).
 * `applyParent`: async (imageIdOrNull) => void — persists the new/cleared image_id onto the parent row.
 */
export function useImageSlot({ folder, fallbackAlt, loadParent, applyParent }) {
  const instanceId = useId();
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [mediaId, setMediaId] = useState(null);
  const [storagePath, setStoragePath] = useState(null);
  const [altKo, setAltKo] = useState('');
  const [altEn, setAltEn] = useState('');
  const [savedAlt, setSavedAlt] = useState({ ko: '', en: '' });
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState('');
  const [saveState, setSaveState] = useState('idle');
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setLoadError('');
    setPendingFile(null);
    setFileError('');
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    try {
      const current = isSupabaseConfigured ? await loadParent() : null;
      const media = current?.media ?? null;
      setMediaId(media?.id ?? null);
      setStoragePath(media?.storage_path ?? null);
      const ko = media?.alt_ko ?? fallbackAlt.ko;
      const en = media?.alt_en ?? fallbackAlt.en;
      setAltKo(ko);
      setAltEn(en);
      setSavedAlt({ ko, en });
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
    load();
  }, [load]);

  function selectFile(file) {
    const error = validateImageFile(file);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError('');
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPendingFile(file);
    setSaveState('idle');
  }

  function cancelPendingFile() {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingFile(null);
    setFileError('');
  }

  const isDirty = Boolean(pendingFile) || altKo !== savedAlt.ko || altEn !== savedAlt.en;

  useEffect(() => {
    setDirtyState(instanceId, isDirty);
    return () => setDirtyState(instanceId, false);
  }, [instanceId, isDirty]);

  async function save() {
    if (!isSupabaseConfigured) {
      setSaveState('error');
      setSaveError('Supabase is not configured — cannot save. See supabase/README.md.');
      return;
    }
    setSaveState('saving');
    setSaveError('');
    try {
      if (pendingFile) {
        const path = await uploadImageFile(folder, pendingFile);
        const mediaRow = await saveListRow('media', null, {
          storage_path: path,
          alt_ko: altKo,
          alt_en: altEn,
        });
        await applyParent(mediaRow.id);
        // The previous media row/storage file (if any) is deliberately
        // NOT deleted here — see docs/BACKUP_RECOVERY.md's Storage
        // Strategy. It's now orphaned (nothing references it) but still
        // recoverable, at the cost of Storage slowly accumulating replaced
        // images over time.
      } else if (mediaId && (altKo !== savedAlt.ko || altEn !== savedAlt.en)) {
        await saveListRow('media', mediaId, { alt_ko: altKo, alt_en: altEn });
      }

      await load();
      setSaveState('success');
      recordSave('images');
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setSaveState('error');
      setSaveError(extractErrorMessage(err));
    }
  }

  // Reverts an in-progress edit (a staged file, or an alt-text change)
  // back to what's currently saved — cancels the pending upload and
  // restores the last-loaded alt text, with no network call and no effect
  // on the database. Distinct from `resetSlot` below, which deletes the
  // saved image itself, and from `reload`, which re-fetches from Supabase.
  function resetToSaved() {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingFile(null);
    setFileError('');
    setAltKo(savedAlt.ko);
    setAltEn(savedAlt.en);
    setSaveState('idle');
    setSaveError('');
  }

  // Detaches the current image from this slot — no longer also deletes
  // the underlying media row/storage file (see docs/BACKUP_RECOVERY.md's
  // Storage Strategy): the file becomes orphaned but stays recoverable,
  // matching the same policy applied to a replaced image in save() above.
  async function resetSlot() {
    if (!isSupabaseConfigured) {
      setSaveState('error');
      setSaveError('Supabase is not configured — cannot save. See supabase/README.md.');
      return;
    }
    setSaveState('saving');
    setSaveError('');
    try {
      await applyParent(null);
      await load();
      setSaveState('success');
      recordSave('images');
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setSaveState('error');
      setSaveError(extractErrorMessage(err));
    }
  }

  return {
    status,
    loadError,
    hasImage: Boolean(storagePath),
    storagePath,
    previewUrl,
    pendingFile,
    fileError,
    altKo,
    altEn,
    setAltKo,
    setAltEn,
    selectFile,
    cancelPendingFile,
    isDirty,
    saveState,
    saveError,
    save,
    reset: resetToSaved,
    resetSlot,
    reload: load,
  };
}
