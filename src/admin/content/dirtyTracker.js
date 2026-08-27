// Module-level "does anything in the admin currently have unsaved edits"
// flag, backing the navigation-away confirmation (Content/Images sub-nav,
// the top-level Dashboard sidebar, Logout, and closing/refreshing the
// tab). Each open form/slot/list registers its own dirty state under a
// unique id (useAdminForm/useImageSlot/useGalleryImages call this
// directly, so no section component needs to know it exists) — a Set
// rather than a single boolean, since several image slots (Case Studies)
// can be mounted and independently dirty at once.
const dirtyIds = new Set();

export function setDirtyState(id, dirty) {
  if (dirty) dirtyIds.add(id);
  else dirtyIds.delete(id);
}

export function isAnyDirty() {
  return dirtyIds.size > 0;
}

export const UNSAVED_CHANGES_MESSAGE =
  '저장하지 않은 변경사항이 있습니다. 지금 이동하면 변경사항이 사라집니다. 계속하시겠습니까?';
