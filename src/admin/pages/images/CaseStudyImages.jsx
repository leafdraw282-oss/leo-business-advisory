import { caseStudies } from '../../../data/profile.js';

// Admin-facing recognition aid only (never written to the database or
// shown on the public site) — LEOHOLDINGS' own case-study text already
// refers to it by its consumer-facing sub-brand "Just Craft" (see its
// summary in profile.js and the matching Gallery caption), so the image
// slot label surfaces that name too, since "LEOHOLDINGS" alone isn't how
// a non-developer would recognize this case.
const RECOGNITION_HINT = {
  leoholdings: 'Just Craft',
};
import { isSupabaseConfigured } from '../../../lib/supabase.js';
import { fetchList, upsertByNaturalKey, fetchRowById } from '../../content/supabaseTable.js';
import { caseStudyRowDefaults } from '../../content/rowDefaults.js';
import { useImageSlot } from '../../content/useImageSlot.js';
import ImageSlotEditor from '../../components/ImageSlotEditor.jsx';

// One case study per slot, matched to its case_studies row by the same
// case_key used throughout Phase 2-C (see supabase/migrations/0001_init_schema.sql).
function CaseStudySlot({ caseStudy }) {
  async function loadParent() {
    if (!isSupabaseConfigured) return null;
    const rows = await fetchList('case_studies', { match: { case_key: caseStudy.id } });
    const media = await fetchRowById('media', rows[0]?.image_id);
    return media ? { media } : null;
  }

  async function applyParent(imageId) {
    const rows = await fetchList('case_studies', { match: { case_key: caseStudy.id } });
    await upsertByNaturalKey('case_studies', 'case_key', {
      ...caseStudyRowDefaults(caseStudy.id, rows[0]),
      image_id: imageId,
    });
  }

  const slot = useImageSlot({
    folder: `case-studies/${caseStudy.id}`,
    fallbackAlt: { ko: caseStudy.titleKo, en: caseStudy.titleEn },
    loadParent,
    applyParent,
  });

  const hint = RECOGNITION_HINT[caseStudy.id];
  const title = `${caseStudy.tag} — ${caseStudy.titleEn}${hint ? ` (${hint})` : ''}`;

  return <ImageSlotEditor title={title} aspectRatio="16 / 10" slot={slot} />;
}

function CaseStudyImages() {
  return (
    <div className="admin-case-study-images">
      {caseStudies.map((caseStudy) => (
        <CaseStudySlot key={caseStudy.id} caseStudy={caseStudy} />
      ))}
    </div>
  );
}

export default CaseStudyImages;
