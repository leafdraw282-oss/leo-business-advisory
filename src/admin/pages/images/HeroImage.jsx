import { person } from '../../../data/profile.js';
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchSingleton, upsertSingleton, fetchRowById } from '../../content/supabaseTable.js';
import { heroRowDefaults } from '../../content/rowDefaults.js';
import { useImageSlot } from '../../content/useImageSlot.js';
import { HERO_IMAGE_GUIDELINE } from '../../content/imageGuidelines.js';
import ImageSlotEditor from '../../components/ImageSlotEditor.jsx';

async function loadParent() {
  if (!isSupabaseConfigured) return null;
  const row = await fetchSingleton('hero_content');
  const media = await fetchRowById('media', row?.hero_image_id);
  return media ? { media } : null;
}

async function applyParent(imageId) {
  const existing = await fetchSingleton('hero_content');
  await upsertSingleton('hero_content', { ...heroRowDefaults(existing), hero_image_id: imageId });
}

function HeroImage() {
  const slot = useImageSlot({
    folder: 'hero',
    fallbackAlt: { ko: person.portraitLabelKo, en: person.portraitLabelEn },
    loadParent,
    applyParent,
  });

  return (
    <ImageSlotEditor
      title="Hero Portrait (첫 화면 인물 사진)"
      aspectRatio="4 / 5"
      guideline={HERO_IMAGE_GUIDELINE}
      slot={slot}
    />
  );
}

export default HeroImage;
