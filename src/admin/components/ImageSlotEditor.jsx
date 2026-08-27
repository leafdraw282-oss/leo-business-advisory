import { useRef } from 'react';
import { isSupabaseConfigured } from '../../lib/supabase.js';
import { publicUrlFor, ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '../content/supabaseStorage.js';
import ImagePlaceholder from '../../components/ImagePlaceholder.jsx';
import BilingualField from './BilingualField.jsx';
import SectionStatus from './SectionStatus.jsx';

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// One image slot's full editor UI: preview (via the same ImagePlaceholder
// the public site uses, so "no image yet" looks exactly like the public
// site's own fallback), file picker with validation, alt text, and
// save/reset. Used for Hero, About/Profile, and each Case Study — Gallery
// has its own list-shaped UI (see pages/images/GalleryImages.jsx).
//
// While a new file is staged but not yet saved, the current (live) image
// and the new one are shown side by side, each clearly labeled — an
// admin should never have to guess which one is still live.
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
    reset,
    resetSlot,
    reload,
  } = slot;

  const currentUrl = isSupabaseConfigured && storagePath ? publicUrlFor(storagePath) : null;
  const previewLabel = altEn || altKo || title;

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) selectFile(file);
    event.target.value = '';
  }

  function handleReset() {
    if (window.confirm(`현재 ${title} 이미지를 이 위치에서 제거할까요? 파일 자체는 삭제되지 않고 그대로 보관됩니다.`)) {
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
        onReset={reset}
        onReload={reload}
      />
      {status === 'ready' && (
        <div className="admin-image-slot-body">
          <div className="admin-image-compare">
            <div className="admin-image-compare-item">
              <span className="admin-image-compare-label">현재 이미지</span>
              <ImagePlaceholder src={currentUrl} alt={previewLabel} label={previewLabel} aspectRatio={aspectRatio} />
            </div>
            {previewUrl && (
              <div className="admin-image-compare-item admin-image-compare-item--new">
                <span className="admin-image-compare-label">새 이미지 (저장 전 미리보기)</span>
                <ImagePlaceholder src={previewUrl} alt={previewLabel} label={previewLabel} aspectRatio={aspectRatio} />
              </div>
            )}
          </div>

          <div className="admin-image-slot-controls">
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              onChange={handleFileChange}
            />
            <p className="admin-image-hint">
              JPEG, PNG, WebP, SVG 파일만 가능 — 최대 {MAX_IMAGE_BYTES / 1024 / 1024}MB.
            </p>
            {fileError && (
              <p className="admin-status-error" role="alert">
                {fileError}
              </p>
            )}
            {pendingFile && (
              <p className="admin-image-pending">
                선택한 파일: {pendingFile.name} ({formatFileSize(pendingFile.size)}) —{' '}
                <button type="button" onClick={cancelPendingFile}>
                  취소
                </button>
              </p>
            )}

            <BilingualField
              label="대체 텍스트 (Alt text)"
              ko={altKo}
              en={altEn}
              onKoChange={setAltKo}
              onEnChange={setAltEn}
            />

            {hasImage && (
              <button type="button" className="admin-image-reset" onClick={handleReset} disabled={saveState === 'saving'}>
                이미지 제거
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageSlotEditor;
