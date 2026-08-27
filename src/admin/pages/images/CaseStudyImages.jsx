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
import { CASE_STUDY_STANDARD_GUIDELINE, CASE_STUDY_EMPHASIS_GUIDELINE } from '../../content/imageGuidelines.js';
import ImageSlotEditor from '../../components/ImageSlotEditor.jsx';

// One case study per slot, matched to its case_studies row by the same
// case_key used throughout Phase 2-C (see supabase/migrations/0001_init_schema.sql).
//
// `emphasis`: mirrors src/sections/CaseStudies.jsx's `emphasis={index === 0}`
// — the public site renders the first/flagship case at a different
// aspect ratio (4/3) than every other case (16/10). This assumes the
// default profile.js/fallback case order; if an admin ever reorders case
// studies via sort_order such that a different case becomes first on the
// live public site, this guide (like the rest of this static-order page)
// won't reflect that — a pre-existing limitation of this page, not
// something this pass changes.
function CaseStudySlot({ caseStudy, emphasis }) {
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
  const aspectRatio = emphasis ? '4 / 3' : '16 / 10';
  const guideline = emphasis ? CASE_STUDY_EMPHASIS_GUIDELINE : CASE_STUDY_STANDARD_GUIDELINE;

  return <ImageSlotEditor title={title} aspectRatio={aspectRatio} guideline={guideline} slot={slot} />;
}

function CaseStudyImages() {
  return (
    <div className="admin-case-study-images">
      {caseStudies.map((caseStudy, index) => (
        <CaseStudySlot key={caseStudy.id} caseStudy={caseStudy} emphasis={index === 0} />
      ))}
    </div>
  );
}

export default CaseStudyImages;
