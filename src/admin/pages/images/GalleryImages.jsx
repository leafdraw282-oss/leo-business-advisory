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
      <h2>Gallery</h2>
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
            const previewSrc =
              item.previewUrl ?? (isSupabaseConfigured && item.storagePath ? publicUrlFor(item.storagePath) : undefined);
            const label = item.captionEn || item.captionKo || `Photo ${index + 1}`;

            return (
              <div className="admin-gallery-item" key={item.itemKey}>
                <div className="admin-gallery-item-preview">
                  <ImagePlaceholder src={previewSrc} alt={label} label={label} aspectRatio={item.aspectRatio} />
                </div>
                <div className="admin-gallery-item-fields">
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
                    JPEG, PNG, WebP, or SVG — max {MAX_IMAGE_BYTES / 1024 / 1024} MB.
                  </p>
                  <BilingualField
                    label="Caption"
                    ko={item.captionKo}
                    en={item.captionEn}
                    onKoChange={(v) => updateItem(index, { captionKo: v })}
                    onEnChange={(v) => updateItem(index, { captionEn: v })}
                  />
                  <label className="admin-field">
                    <span className="admin-field-label">Aspect ratio</span>
                    <select
                      value={item.aspectRatio}
                      onChange={(event) => updateItem(index, { aspectRatio: event.target.value })}
                    >
                      <option value="1 / 1">Square (1 / 1)</option>
                      <option value="4 / 3">Landscape (4 / 3)</option>
                      <option value="4 / 5">Portrait (4 / 5)</option>
                      <option value="3 / 4">Portrait (3 / 4)</option>
                      <option value="16 / 9">Wide (16 / 9)</option>
                    </select>
                  </label>
                  <label className="admin-checkbox-field">
                    <input
                      type="checkbox"
                      checked={item.isWide}
                      onChange={(event) => updateItem(index, { isWide: event.target.checked })}
                    />
                    Span two grid columns
                  </label>
                  <div className="admin-gallery-item-actions">
                    <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                      Move up
                    </button>
                    <button type="button" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1}>
                      Move down
                    </button>
                    <button type="button" className="admin-image-reset" onClick={() => removeItem(index)}>
                      Delete photo
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <button type="button" onClick={addItem}>
            Add photo
          </button>
        </>
      )}
    </section>
  );
}

export default GalleryImages;
