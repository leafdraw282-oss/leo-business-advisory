import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { publicUrlFor, ALLOWED_GALLERY_TYPES, VIDEO_MIME_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from '../../content/supabaseStorage.js';
import { useGalleryImages } from '../../content/useGalleryImages.js';
import { recommendedSizeForRatio } from '../../content/imageGuidelines.js';
import BilingualField from '../../components/BilingualField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';
import ImageGuidelines from '../../components/ImageGuidelines.jsx';
import ImageActualInfo from '../../components/ImageActualInfo.jsx';
import ImagePlaceholder from '../../../components/ImagePlaceholder.jsx';

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function GalleryImages() {
  const {
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
    reset,
    reload,
  } = useGalleryImages();

  return (
    <section className="admin-section-form">
      <h2>Gallery ({items.length}장)</h2>
      <p className="admin-section-help">
        사진을 추가·삭제하거나 순서를 바꿀 수 있습니다. 새 사진을 선택하면 저장 전까지 현재 사진과 나란히
        미리보기가 표시됩니다. &quot;비활성&quot;으로 표시하면 삭제하지 않고 사진을 보관할 수 있습니다 (Public
        Website 반영은 다음 단계 작업입니다). &quot;삭제&quot;한 사진은 즉시 없어지지 않고 휴지통으로 이동하며,
        아래에서 언제든 복원하거나 영구 삭제할 수 있습니다.
      </p>
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
        <>
          {items.map((item, index) => {
            const currentSrc = isSupabaseConfigured && item.storagePath ? publicUrlFor(item.storagePath) : undefined;
            const caption = item.captionEn || item.captionKo || '';
            // Screen readers still need a real name even with no caption —
            // only the VISIBLE placeholder text (`caption` below) should stay
            // blank, so it doesn't flash "Photo 4" over a slow-loading photo.
            const altText = caption || `Photo ${index + 1}`;
            // Phase 5-E — a `wide` tile spans two grid columns and renders
            // roughly twice as wide as a standard tile (measured on the
            // real page: ~596px vs ~278px at this site's container cap),
            // so it needs a correspondingly larger recommended size, not
            // the same one every other photo gets.
            const guideline = recommendedSizeForRatio(item.aspectRatio, item.isWide ? 1200 : 600);

            return (
              <div
                className={`admin-gallery-item${item.isActive ? '' : ' admin-gallery-item--inactive'}`}
                key={item.itemKey}
              >
                <div className="admin-gallery-item-preview">
                  <div className="admin-image-compare admin-image-compare--stacked">
                    <div className="admin-image-compare-item">
                      <span className="admin-image-compare-label">현재 사진</span>
                      <ImagePlaceholder src={currentSrc} alt={altText} label={caption} aspectRatio={item.aspectRatio} />
                      <ImageActualInfo url={currentSrc} recommendedWidth={guideline.width} recommendedHeight={guideline.height} />
                    </div>
                    {item.previewUrl && (
                      <div className="admin-image-compare-item admin-image-compare-item--new">
                        <span className="admin-image-compare-label">새 사진 (저장 전 미리보기)</span>
                        <ImagePlaceholder
                          src={item.previewUrl}
                          alt={altText}
                          label={caption}
                          aspectRatio={item.aspectRatio}
                          // item.previewUrl is a blob: object URL (no file
                          // extension to auto-detect from), so this is the
                          // one case that must say explicitly whether the
                          // pending file is a video.
                          isVideo={VIDEO_MIME_TYPES.includes(item.pendingFile?.type)}
                        />
                        <ImageActualInfo
                          url={item.previewUrl}
                          recommendedWidth={guideline.width}
                          recommendedHeight={guideline.height}
                          fileSizeBytes={item.pendingFile?.size}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="admin-gallery-item-fields">
                  <div className="admin-gallery-item-heading">
                    <p className="admin-gallery-item-number">사진 {index + 1}</p>
                    <label className="admin-gallery-active-toggle">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(event) => updateItem(index, { isActive: event.target.checked })}
                      />
                      {item.isActive ? '활성 (공개)' : '비활성 (숨김)'}
                    </label>
                  </div>
                  <ImageGuidelines width={guideline.width} height={guideline.height} ratioLabel={guideline.ratioLabel} />
                  {!item.isActive && (
                    <p className="admin-gallery-inactive-note">
                      비활성 상태입니다. 저장해도 삭제되지 않고 그대로 보관됩니다.
                    </p>
                  )}
                  <input
                    type="file"
                    accept={ALLOWED_GALLERY_TYPES.join(',')}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      if (file) selectFileForItem(index, file);
                    }}
                  />
                  <p className="admin-image-hint">
                    JPEG, PNG, WebP, SVG, GIF 파일 — 최대 {MAX_IMAGE_BYTES / 1024 / 1024}MB. 동영상은 MP4, WebM, MOV,
                    AVI 가능 — 최대 {MAX_VIDEO_BYTES / 1024 / 1024}MB (AVI는 파일 업로드는 되지만 브라우저에서 재생되지
                    않을 수 있습니다).
                  </p>
                  {item.pendingFile && (
                    <p className="admin-image-pending">
                      선택한 파일: {item.pendingFile.name} ({formatFileSize(item.pendingFile.size)})
                    </p>
                  )}
                  <BilingualField
                    label="캡션 (Caption, 선택사항)"
                    ko={item.captionKo}
                    en={item.captionEn}
                    onKoChange={(v) => updateItem(index, { captionKo: v })}
                    onEnChange={(v) => updateItem(index, { captionEn: v })}
                  />
                  <label className="admin-field">
                    <span className="admin-field-label">가로세로 비율</span>
                    <select
                      value={item.aspectRatio}
                      onChange={(event) => updateItem(index, { aspectRatio: event.target.value })}
                    >
                      <option value="1 / 1">정사각형 (1 / 1)</option>
                      <option value="4 / 3">가로 (4 / 3)</option>
                      <option value="4 / 5">세로 (4 / 5)</option>
                      <option value="3 / 4">세로 (3 / 4)</option>
                      <option value="16 / 9">와이드 (16 / 9)</option>
                    </select>
                  </label>
                  <label className="admin-checkbox-field">
                    <input
                      type="checkbox"
                      checked={item.isWide}
                      onChange={(event) => updateItem(index, { isWide: event.target.checked })}
                    />
                    그리드에서 두 칸 차지 (와이드 타일)
                  </label>
                  <div className="admin-gallery-item-actions">
                    <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                      ↑ 위로
                    </button>
                    <button type="button" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1}>
                      ↓ 아래로
                    </button>
                    <button type="button" className="admin-image-reset" onClick={() => removeItem(index)}>
                      휴지통으로 이동
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <button type="button" className="admin-gallery-add" onClick={addItem}>
            + 사진 추가
          </button>

          <div className="admin-gallery-trash">
            <h3>휴지통 ({trashedItems.length}장)</h3>
            {trashedItems.length === 0 ? (
              <p className="admin-section-help">휴지통이 비어 있습니다.</p>
            ) : (
              <>
                <p className="admin-section-help">
                  삭제된 사진은 Public Website와 위 목록에 더 이상 표시되지 않습니다. 복원하면 목록 맨 끝에
                  다시 추가됩니다.
                </p>
                {trashedItems.map((item) => {
                  const trashSrc = isSupabaseConfigured && item.storagePath ? publicUrlFor(item.storagePath) : undefined;
                  const trashCaption = item.captionEn || item.captionKo || '';
                  const trashAltText = trashCaption || item.itemKey;
                  const rs = trashRowState[item.id];
                  return (
                    <div className="admin-gallery-trash-item" key={item.id}>
                      <ImagePlaceholder src={trashSrc} alt={trashAltText} label={trashCaption} aspectRatio={item.aspectRatio} />
                      <div className="admin-gallery-trash-item-body">
                        <p className="admin-gallery-trash-item-caption">{trashAltText}</p>
                        {rs?.error && (
                          <p className="admin-status-error" role="alert">
                            {rs.error}
                          </p>
                        )}
                        <div className="admin-gallery-item-actions">
                          <button
                            type="button"
                            disabled={rs?.action === 'restoring' || rs?.action === 'purging'}
                            onClick={() => restoreFromTrash(item)}
                          >
                            {rs?.action === 'restoring' ? '복원 중…' : '복원'}
                          </button>
                          <button
                            type="button"
                            className="admin-image-reset"
                            disabled={rs?.action === 'restoring' || rs?.action === 'purging'}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `"${trashAltText}" 사진을 영구 삭제할까요? 파일까지 완전히 삭제되며 되돌릴 수 없습니다.`,
                                )
                              ) {
                                permanentlyDelete(item);
                              }
                            }}
                          >
                            {rs?.action === 'purging' ? '영구 삭제 중…' : '영구 삭제'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default GalleryImages;
