// Single source of truth for site navigation.
// Header nav links AND each section's `id` attribute must both derive from
// this file's `id` values — never hardcode a section id anywhere else.
export const navigation = [
  {
    id: 'about',
    labelKo: '소개',
    labelEn: 'About',
  },
  {
    id: 'impact',
    labelKo: '성과',
    labelEn: 'Impact',
  },
  {
    id: 'advisory',
    labelKo: '자문',
    labelEn: 'Advisory',
  },
  {
    id: 'career',
    labelKo: '경력',
    labelEn: 'Career',
  },
  {
    id: 'contact',
    labelKo: '문의',
    labelEn: 'Contact',
  },
];
