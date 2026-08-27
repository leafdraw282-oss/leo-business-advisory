import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { publicUrlFor, ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '../../content/supabaseStorage.js';
import { useGalleryImages } from '../../content/useGalleryImages.js';
import BilingualField from '../../components/BilingualField.jsx';
import SectionStatus from '../../components/SectionStatus.jsx';
import ImagePlaceholder from '../../../components/ImagePlaceholder.jsx';

function GalleryImages() {
  const {
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
    reload,
  } = useGalleryImages();

  return (
    <section className="admin-section-form">
      <h2>Gallery ({items.length}장)</h2>
      <p className="admin-section-help">
        사진을 추가·삭제하거나 순서를 바꿀 수 있습니다. 새 사진을 선택하면 저장 전까지 현재 사진과 나란히
        미리보기가 표시됩니다.
      </p>
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
        <>
          {items.map((item, index) => {
            const currentSrc = isSupabaseConfigured && item.storagePath ? publicUrlFor(item.storagePath) : undefined;
            const label = item.captionEn || item.captionKo || `Photo ${index + 1}`;

            return (
              <div className="admin-gallery-item" key={item.itemKey}>
                <div className="admin-gallery-item-preview">
                  <div className="admin-image-compare admin-image-compare--stacked">
                    <div className="admin-image-compare-item">
                      <span className="admin-image-compare-label">현재 사진</span>
                      <ImagePlaceholder src={currentSrc} alt={label} label={label} aspectRatio={item.aspectRatio} />
                    </div>
                    {item.previewUrl && (
                      <div className="admin-image-compare-item admin-image-compare-item--new">
                        <span className="admin-image-compare-label">새 사진 (저장 전 미리보기)</span>
                        <ImagePlaceholder src={item.previewUrl} alt={label} label={label} aspectRatio={item.aspectRatio} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="admin-gallery-item-fields">
                  <p className="admin-gallery-item-number">사진 {index + 1}</p>
                  <input
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(',')}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      if (file) selectFileForItem(index, file);
                    }}
                  />
                  <p className="admin-image-hint">
                    JPEG, PNG, WebP, SVG 파일만 가능 — 최대 {MAX_IMAGE_BYTES / 1024 / 1024}MB.
                  </p>
                  <BilingualField
                    label="캡션 (Caption)"
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
                      이 사진 삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <button type="button" className="admin-gallery-add" onClick={addItem}>
            + 사진 추가
          </button>
        </>
      )}
    </section>
  );
}

export default GalleryImages;
