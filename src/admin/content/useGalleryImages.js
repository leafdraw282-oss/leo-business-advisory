import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { gallery } from '../../data/profile.js';
import { isSupabaseConfigured } from '../../lib/supabase.js';
import { fetchList, upsertByNaturalKey, fetchRowById, saveListRow, deleteRow } from './supabaseTable.js';
import { uploadImageFile, removeStorageFile, validateImageFile } from './supabaseStorage.js';
import { requireFilled } from './validation.js';
import { setDirtyState } from './dirtyTracker.js';
import { recordSave } from './lastSaved.js';

function extractErrorMessage(err) {
  if (err instanceof Error) return err.message;
  if (err && typeof err.message === 'string') return err.message;
  return String(err);
}

function fallbackItems() {
  return gallery.map((g) => ({
    id: null,
    itemKey: g.id,
    captionKo: g.captionKo,
    captionEn: g.captionEn,
    aspectRatio: g.aspect ?? '4 / 3',
    isWide: Boolean(g.wide),
    // src/data/profile.js has no active/inactive concept — every fallback
    // photo is active until an admin turns one off in the database.
    isActive: true,
    mediaId: null,
    storagePath: null,
    pendingFile: null,
    previewUrl: null,
  }));
}

// Fields that count toward "unsaved changes" / the saved snapshot —
// excludes pendingFile/previewUrl, which are transient local-only state
// (a File object isn't a meaningful thing to diff via JSON.stringify).
function comparable(item) {
  const { id, itemKey, captionKo, captionEn, aspectRatio, isWide, isActive, mediaId } = item;
  return { id, itemKey, captionKo, captionEn, aspectRatio, isWide, isActive, mediaId };
}

async function load() {
  if (!isSupabaseConfigured) return fallbackItems();

  const rows = await fetchList('gallery_items');
  if (rows.length === 0) return fallbackItems();

  const mediaRows = await Promise.all(rows.map((r) => fetchRowById('media', r.image_id)));
  return rows.map((r, i) => ({
    id: r.id,
    itemKey: r.item_key,
    captionKo: r.caption_ko,
    captionEn: r.caption_en,
    aspectRatio: r.aspect_ratio,
    isWide: r.is_wide,
    // is_active defaults true at the database (0004_gallery_active_flag.sql)
    // for every pre-existing row, so `?? true` only matters when running
    // against a database that predates that migration.
    isActive: r.is_active ?? true,
    mediaId: r.image_id,
    storagePath: mediaRows[i]?.storage_path ?? null,
    pendingFile: null,
    previewUrl: null,
  }));
}

/**
 * State machine behind the Gallery image editor: a variable-length list
 * (add/delete/reorder), each row with its own optional pending upload.
 * Kept as its own hook (mirroring useAdminForm/useImageSlot) rather than
 * inline in GalleryImages.jsx, so the load-on-mount state updates live in
 * a hook, not directly in the component's own effect body.
 */
export function useGalleryImages() {
  const instanceId = useId();
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [items, setItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [saveState, setSaveState] = useState('idle');
  const [saveError, setSaveError] = useState('');
  // Full last-loaded rows (not just the `comparable()` projection used for
  // dirty-checking) so `resetToSaved` can restore storagePath etc. locally
  // without a network round-trip.
  const savedSnapshotRef = useRef([]);

  const runLoad = useCallback(async () => {
    setStatus('loading');
    setLoadError('');
    try {
      const loaded = await load();
      setItems(loaded);
      setSavedItems(loaded.map(comparable));
      savedSnapshotRef.current = loaded;
      setPendingDeletions([]);
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

  const isDirty =
    items.some((item) => item.pendingFile) ||
    pendingDeletions.length > 0 ||
    JSON.stringify(items.map(comparable)) !== JSON.stringify(savedItems);

  useEffect(() => {
    setDirtyState(instanceId, isDirty);
    return () => setDirtyState(instanceId, false);
  }, [instanceId, isDirty]);

  function updateItem(index, patch) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    if (saveState !== 'idle') setSaveState('idle');
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        id: null,
        itemKey: `gallery-${crypto.randomUUID()}`,
        captionKo: '',
        captionEn: '',
        aspectRatio: '4 / 3',
        isWide: false,
        isActive: true,
        mediaId: null,
        storagePath: null,
        pendingFile: null,
        previewUrl: null,
      },
    ]);
  }

  function removeItem(index) {
    const item = items[index];
    if (!window.confirm('이 갤러리 사진을 삭제할까요? 저장해야 실제로 반영됩니다.')) return;
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (item.id) {
      setPendingDeletions((prev) => [...prev, { id: item.id, mediaId: item.mediaId, storagePath: item.storagePath }]);
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (saveState !== 'idle') setSaveState('idle');
  }

  function moveItem(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    if (saveState !== 'idle') setSaveState('idle');
  }

  function selectFileForItem(index, file) {
    const error = validateImageFile(file);
    if (error) {
      setSaveState('error');
      setSaveError(error);
      return;
    }
    const url = URL.createObjectURL(file);
    updateItem(index, { pendingFile: file, previewUrl: url });
  }

  async function save() {
    try {
      requireFilled(
        items.map((item, i) => ({ label: `Gallery item ${i + 1} caption`, ko: item.captionKo, en: item.captionEn })),
      );
    } catch (err) {
      setSaveState('error');
      setSaveError(extractErrorMessage(err));
      return;
    }

    if (!isSupabaseConfigured) {
      setSaveState('error');
      setSaveError('Supabase is not configured — cannot save. See supabase/README.md.');
      return;
    }

    setSaveState('saving');
    setSaveError('');
    try {
      for (const deletion of pendingDeletions) {
        await deleteRow('gallery_items', deletion.id);
        if (deletion.mediaId) {
          try {
            await removeStorageFile(deletion.storagePath);
            await deleteRow('media', deletion.mediaId);
            // eslint-disable-next-line no-unused-vars
          } catch (cleanupErr) {
            console.warn('Gallery image cleanup failed after delete:', cleanupErr);
          }
        }
      }

      for (const [index, item] of items.entries()) {
        let mediaId = item.mediaId;
        const previousMediaId = item.mediaId;
        const previousStoragePath = item.storagePath;

        if (item.pendingFile) {
          const path = await uploadImageFile('gallery', item.pendingFile);
          const mediaRow = await saveListRow('media', null, {
            storage_path: path,
            alt_ko: item.captionKo,
            alt_en: item.captionEn,
          });
          mediaId = mediaRow.id;
        }

        await upsertByNaturalKey('gallery_items', 'item_key', {
          item_key: item.itemKey,
          caption_ko: item.captionKo,
          caption_en: item.captionEn,
          aspect_ratio: item.aspectRatio,
          is_wide: item.isWide,
          is_active: item.isActive,
          sort_order: index,
          image_id: mediaId,
        });

        if (item.pendingFile && previousMediaId) {
          try {
            await removeStorageFile(previousStoragePath);
            await deleteRow('media', previousMediaId);
            // eslint-disable-next-line no-unused-vars
          } catch (cleanupErr) {
            console.warn('Old gallery image cleanup failed (new image is already live):', cleanupErr);
          }
        }
      }

      await runLoad();
      setSaveState('success');
      recordSave('images');
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setSaveState('error');
      setSaveError(extractErrorMessage(err));
    }
  }

  // Reverts every add/remove/reorder/edit/pending-upload back to the last
  // database-confirmed state (savedSnapshotRef) — a local, no-network undo.
  // If nothing has ever been saved, that snapshot is whatever load()
  // returned (possibly the src/data/profile.js fallback list) — this never
  // pulls in a separate "original" value on top of real DB content.
  function resetToSaved() {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setItems(savedSnapshotRef.current.map((item) => ({ ...item })));
    setPendingDeletions([]);
    setSaveState('idle');
    setSaveError('');
  }

  return {
    status,
    loadError,
    items,
    saveState,
    saveError,
    isDirty,
    updateItem,
    addItem,
    removeItem,
    moveItem,
    selectFileForItem,
    save,
    reset: resetToSaved,
    reload: runLoad,
  };
}
