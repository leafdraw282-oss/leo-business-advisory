import { useRef } from 'react';
import { isSupabaseConfigured } from '../../lib/supabase.js';
import { publicUrlFor, ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '../content/supabaseStorage.js';
import ImagePlaceholder from '../../components/ImagePlaceholder.jsx';
import BilingualField from './BilingualField.jsx';
import SectionStatus from './SectionStatus.jsx';

// One image slot's full editor UI: preview (via the same ImagePlaceholder
// the public site uses, so "no image yet" looks exactly like the public
// site's own fallback), file picker with validation, alt text, and
// save/reset. Used for Hero, About/Profile, and each Case Study — Gallery
// has its own list-shaped UI (see pages/images/GalleryImages.jsx).
function ImageSlotEditor({ title, aspectRatio = '4 / 3', slot }) {
  const fileInputRef = useRef(null);
  const {
    status,
    loadError,
    hasImage,
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
    resetSlot,
    reload,
  } = slot;

  const currentUrl = isSupabaseConfigured && storagePath ? publicUrlFor(storagePath) : null;
  const previewSrc = previewUrl ?? currentUrl ?? undefined;
  const previewLabel = altEn || altKo || title;

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) selectFile(file);
    event.target.value = '';
  }

  function handleReset() {
    if (window.confirm(`Remove the current ${title} image? This deletes it from storage.`)) {
      resetSlot();
    }
  }

  return (
    <div className="admin-image-slot">
      <h3>{title}</h3>
      <SectionStatus
        status={status}
        loadError={loadError}
        isDirty={isDirty}
        saveState={saveState}
        saveError={saveError}
        onSave={save}
        onReload={reload}
      />
      {status === 'ready' && (
        <div className="admin-image-slot-body">
          <ImagePlaceholder src={previewSrc} alt={previewLabel} label={previewLabel} aspectRatio={aspectRatio} />

          <div className="admin-image-slot-controls">
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              onChange={handleFileChange}
            />
            <p className="admin-image-hint">
              JPEG, PNG, WebP, or SVG — max {MAX_IMAGE_BYTES / 1024 / 1024} MB.
            </p>
            {fileError && (
              <p className="admin-status-error" role="alert">
                {fileError}
              </p>
            )}
            {pendingFile && (
              <p className="admin-image-pending">
                Selected: {pendingFile.name} — <button type="button" onClick={cancelPendingFile}>Cancel</button>
              </p>
            )}

            <BilingualField
              label="Alt text"
              ko={altKo}
              en={altEn}
              onKoChange={setAltKo}
              onEnChange={setAltEn}
            />

            {hasImage && (
              <button type="button" className="admin-image-reset" onClick={handleReset} disabled={saveState === 'saving'}>
                Remove image
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageSlotEditor;
