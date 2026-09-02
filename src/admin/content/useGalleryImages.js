import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { gallery } from '../../data/profile.js';
import { isSupabaseConfigured, supabase } from '../../lib/supabase.js';
import { fetchList, upsertByNaturalKey, fetchRowById, saveListRow, deleteRow } from './supabaseTable.js';
import { uploadImageFile, removeStorageFile, validateGalleryFile } from './supabaseStorage.js';
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

function fromRow(r, mediaRow) {
  return {
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
    deletedAt: r.deleted_at ?? null,
    mediaId: r.image_id,
    storagePath: mediaRow?.storage_path ?? null,
    pendingFile: null,
    previewUrl: null,
  };
}

// Loads every gallery_items row regardless of deleted_at — the admin's
// own RLS write policy (is_admin()) already grants full access
// independent of the public-facing policy's `deleted_at is null`
// restriction (0007_gallery_soft_delete.sql), and the admin needs to see
// soft-deleted rows to offer restoring them (the Trash section below).
async function load() {
  if (!isSupabaseConfigured) return { items: fallbackItems(), trashedItems: [] };

  const rows = await fetchList('gallery_items');
  if (rows.length === 0) return { items: fallbackItems(), trashedItems: [] };

  const mediaRows = await Promise.all(rows.map((r) => fetchRowById('media', r.image_id)));
  const all = rows.map((r, i) => fromRow(r, mediaRows[i]));
  return {
    items: all.filter((item) => !item.deletedAt),
    trashedItems: all.filter((item) => item.deletedAt),
  };
}

/**
 * State machine behind the Gallery image editor: a variable-length list
 * (add/edit/reorder/upload, batch-saved together via one Save button —
 * unchanged from Phase 2-D/3-B) plus, since Phase 3-G, a Trash of
 * soft-deleted photos managed separately with immediate (non-draft)
 * restore/permanent-delete actions — the same "writes right away, no
 * Save step" pattern already used for Inquiries' status changes, since
 * each is a single, self-contained action rather than a field accumulating
 * into a larger draft.
 */
export function useGalleryImages() {
  const instanceId = useId();
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [items, setItems] = useState([]);
  const [trashedItems, setTrashedItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [saveState, setSaveState] = useState('idle');
  const [saveError, setSaveError] = useState('');
  // Per-trash-item action state (restoring/purging), mirroring
  // useInquiries.js's rowState — keyed by item id.
  const [trashRowState, setTrashRowState] = useState({});
  // Full last-loaded rows (not just the `comparable()` projection used for
  // dirty-checking) so `resetToSaved` can restore storagePath etc. locally
  // without a network round-trip.
  const savedSnapshotRef = useRef([]);

  const runLoad = useCallback(async () => {
    setStatus('loading');
    setLoadError('');
    try {
      const loaded = await load();
      setItems(loaded.items);
      setTrashedItems(loaded.trashedItems);
      setSavedItems(loaded.items.map(comparable));
      savedSnapshotRef.current = loaded.items;
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
    items.some((item) => item.pendingFile) || JSON.stringify(items.map(comparable)) !== JSON.stringify(savedItems);

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
        deletedAt: null,
        mediaId: null,
        storagePath: null,
        pendingFile: null,
        previewUrl: null,
      },
    ]);
  }

  // A never-yet-saved item (no id) just disappears locally — nothing was
  // ever written, so there's nothing to soft-delete. An already-saved
  // item is soft-deleted immediately (not deferred to Save): it's a safe,
  // reversible action now, so there's no reason to make it wait for a
  // batch save the way a destructive delete used to need to.
  async function removeItem(index) {
    const item = items[index];
    if (!window.confirm('이 사진을 휴지통으로 이동할까요? 나중에 Trash에서 복원할 수 있습니다.')) return;
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);

    if (!item.id) {
      setItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', item.id)
        .select()
        .single();
      if (error) throw error;
      // Also drop the item from savedItems/savedSnapshotRef, not just
      // items — this was already written to the database immediately, so
      // it must not still register as an "unsaved change" against the
      // draft-save flow (isDirty), and "되돌리기" (reset) must not bring a
      // soft-deleted item back into the draft either.
      setItems((prev) => prev.filter((_, i) => i !== index));
      setSavedItems((prev) => prev.filter((saved) => saved.id !== item.id));
      savedSnapshotRef.current = savedSnapshotRef.current.filter((saved) => saved.id !== item.id);
      setTrashedItems((prev) => [fromRow(data, { storage_path: item.storagePath }), ...prev]);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setSaveState('error');
      setSaveError(extractErrorMessage(err));
    }
  }

  async function restoreFromTrash(trashedItem) {
    setTrashRowState((prev) => ({ ...prev, [trashedItem.id]: { action: 'restoring', error: '' } }));
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .update({ deleted_at: null })
        .eq('id', trashedItem.id)
        .select()
        .single();
      if (error) throw error;
      const restored = fromRow(data, { storage_path: trashedItem.storagePath });
      setTrashedItems((prev) => prev.filter((t) => t.id !== trashedItem.id));
      // Mirrors removeItem's bookkeeping above: this already happened in
      // the database, so items/savedItems/savedSnapshotRef all need the
      // restored row, not just items — otherwise it would immediately
      // show as an "unsaved change," and "되돌리기" could discard it again.
      setItems((prev) => [...prev, restored]);
      setSavedItems((prev) => [...prev, comparable(restored)]);
      savedSnapshotRef.current = [...savedSnapshotRef.current, restored];
      setTrashRowState((prev) => ({ ...prev, [trashedItem.id]: { action: null, error: '' } }));
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setTrashRowState((prev) => ({ ...prev, [trashedItem.id]: { action: null, error: extractErrorMessage(err) } }));
    }
  }

  // The one genuinely irreversible action left in Gallery management —
  // removes the gallery_items row AND its media row/storage file for
  // real. Only reachable from the Trash view, on an already
  // soft-deleted item, so it always takes two deliberate steps.
  async function permanentlyDelete(trashedItem) {
    setTrashRowState((prev) => ({ ...prev, [trashedItem.id]: { action: 'purging', error: '' } }));
    try {
      await deleteRow('gallery_items', trashedItem.id);
      if (trashedItem.mediaId) {
        try {
          await removeStorageFile(trashedItem.storagePath);
          await deleteRow('media', trashedItem.mediaId);
          // eslint-disable-next-line no-unused-vars
        } catch (cleanupErr) {
          console.warn('Gallery image cleanup failed after permanent delete:', cleanupErr);
        }
      }
      setTrashedItems((prev) => prev.filter((t) => t.id !== trashedItem.id));
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setTrashRowState((prev) => ({ ...prev, [trashedItem.id]: { action: null, error: extractErrorMessage(err) } }));
    }
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
    const error = validateGalleryFile(file);
    if (error) {
      setSaveState('error');
      setSaveError(error);
      return;
    }
    const url = URL.createObjectURL(file);
    updateItem(index, { pendingFile: file, previewUrl: url });
  }

  async function save() {
    // Captions are optional — a photo with no name simply renders with no
    // visible label (ImagePlaceholder) and no caption line (Gallery.jsx),
    // instead of being blocked from saving at all.
    if (!isSupabaseConfigured) {
      setSaveState('error');
      setSaveError('Supabase is not configured — cannot save. See supabase/README.md.');
      return;
    }

    setSaveState('saving');
    setSaveError('');
    try {
      for (const [index, item] of items.entries()) {
        let mediaId = item.mediaId;

        if (item.pendingFile) {
          const path = await uploadImageFile('gallery', item.pendingFile);
          const mediaRow = await saveListRow('media', null, {
            storage_path: path,
            alt_ko: item.captionKo,
            alt_en: item.captionEn,
          });
          mediaId = mediaRow.id;
          // The previous media row/storage file (if any) is deliberately
          // NOT deleted here — see docs/BACKUP_RECOVERY.md's Storage
          // Strategy: keeping a replaced image recoverable is worth more
          // than reclaiming its storage automatically.
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

  // Reverts every add/reorder/edit/pending-upload back to the last
  // database-confirmed state (savedSnapshotRef) — a local, no-network undo.
  // If nothing has ever been saved, that snapshot is whatever load()
  // returned (possibly the src/data/profile.js fallback list) — this never
  // pulls in a separate "original" value on top of real DB content. Trash
  // actions (soft delete/restore/permanent delete) write immediately and
  // aren't part of this draft state, so they're unaffected by Reset.
  function resetToSaved() {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setItems(savedSnapshotRef.current.map((item) => ({ ...item })));
    setSaveState('idle');
    setSaveError('');
  }

  return {
    status,
    loadError,
    items,
    trashedItems,
    trashRowState,
    saveState,
    saveError,
    isDirty,
    updateItem,
    addItem,
    removeItem,
    restoreFromTrash,
    permanentlyDelete,
    moveItem,
    selectFileForItem,
    save,
    reset: resetToSaved,
    reload: runLoad,
  };
}
