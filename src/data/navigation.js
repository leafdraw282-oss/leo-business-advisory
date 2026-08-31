// Single source of truth for site navigation.
// Header nav links AND each section's `id` attribute must both derive from
// this file's `id` values — never hardcode a section id anywhere else.
//
// Advisory Sales repositioning: simplified from the original 5-item
// résumé-style nav (소개/성과/자문/경력/문의) to a 5-item sales-site nav
// (Home / What We Do / Experience / Insights / Contact). Every target id
// below matches an existing or newly added `<section id="...">` — see
// src/App.jsx for the full section list and src/components/Header.jsx,
// which renders this list with no id/label logic of its own.
export const navigation = [
  {
    id: 'top',
    labelKo: '홈',
    labelEn: 'Home',
  },
  {
    id: 'advisory',
    labelKo: '자문 서비스',
    labelEn: 'What We Do',
  },
  {
    id: 'impact',
    labelKo: '경험',
    labelEn: 'Experience',
  },
  {
    id: 'insights',
    labelKo: '인사이트',
    labelEn: 'Insights',
  },
  {
    id: 'contact',
    labelKo: '문의',
    labelEn: 'Contact',
  },
];
