import { person } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton, fetchRowById } from '../../content/supabaseTable.js';
import { aboutRowDefaults } from '../../content/rowDefaults.js';
import { useImageSlot } from '../../content/useImageSlot.js';
import { ABOUT_IMAGE_GUIDELINE } from '../../content/imageGuidelines.js';
import ImageSlotEditor from '../../components/ImageSlotEditor.jsx';

async function loadParent() {
  if (!isSupabaseConfigured) return null;
  const row = await fetchSingleton('about_content');
  const media = await fetchRowById('media', row?.portrait_image_id);
  return media ? { media } : null;
}

async function applyParent(imageId) {
  const existing = await fetchSingleton('about_content');
  await upsertSingleton('about_content', { ...aboutRowDefaults(existing), portrait_image_id: imageId });
}

function AboutImage() {
  const slot = useImageSlot({
    folder: 'about',
    fallbackAlt: { ko: person.portraitLabelKo, en: person.portraitLabelEn },
    loadParent,
    applyParent,
  });

  return (
    <ImageSlotEditor
      title="Founder Profile (소개 섹션 프로필 사진)"
      aspectRatio="4 / 5"
      guideline={ABOUT_IMAGE_GUIDELINE}
      slot={slot}
    />
  );
}

export default AboutImage;
