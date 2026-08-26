// ---------------------------------------------------------------------------
// SOURCE OF TRUTH
// All facts, numbers, titles, company names and career years below are taken
// directly from the official Founder Profile document
// ("Leo_Business_Advisory_Founder_Profile_KR_EN.docx"). Do not invent or
// estimate new facts/numbers here — only edit existing values to correct
// them against that source document, or add new fields the document
// supports.
//
// This file is the ONLY place page copy should live. Section/UI components
// must read from here rather than hardcoding text, so content can be
// extended (more case studies, gallery photos, career entries, etc.)
// without touching component code.
// ---------------------------------------------------------------------------

export const site = {
  name: 'LEO BUSINESS ADVISORY',
  titleTag: 'LEO Business Advisory | Boosuk Leo Suh',
  descriptionEn:
    'Global executive and business advisor with 30+ years of experience in brand growth, retail strategy, market expansion and business transformation.',
};

export const person = {
  nameKo: '서부석',
  nameKoFormatted: '서 부 석',
  nameEn: 'Boosuk "Leo" Suh',
  nameEnDisplay: 'BOOSUK "LEO" SUH',
  titleKo: 'FOUNDER & PRESIDENT',
  titleEn: 'FOUNDER & PRESIDENT',
  positioningKo: 'BRAND GROWTH · GLOBAL BUSINESS · RETAIL STRATEGY',
  positioningEn: 'BRAND GROWTH · GLOBAL BUSINESS · RETAIL STRATEGY',
};

export const contact = {
  locationKo: 'Seoul, Korea',
  locationEn: 'Seoul, Korea',
  email: 'leosuh00@gmail.com',
  emailHref: 'mailto:leosuh00@gmail.com',
  phoneDisplay: '+82 10-9033-2237',
  phoneHref: 'tel:+821090332237',
};

// Hero copy. Facts (name/title/positioning) come from the source document;
// the headline/CTA wording below is placeholder marketing copy to be
// refined once the Hero section itself is designed in a later phase.
export const hero = {
  eyebrowKo: person.titleKo + ' · ' + person.positioningKo,
  eyebrowEn: person.titleEn + ' · ' + person.positioningEn,
  headlineKo: ['브랜드를 만들고,', '사업을 성장시키고,', '가치를 창출합니다.'],
  headlineEn: ['Building Brands.', 'Scaling Businesses.', 'Creating Value.'],
  subheadKo: '글로벌 경영자 & 비즈니스 어드바이저',
  subheadEn: 'Global Executive & Business Advisor',
  ctaPrimaryKo: '성과 살펴보기',
  ctaPrimaryEn: 'Explore Experience',
  ctaPrimaryTarget: 'impact',
  ctaSecondaryKo: '프로젝트 문의하기',
  ctaSecondaryEn: 'Discuss a Project',
  ctaSecondaryTarget: 'contact',
};

// Headline impact metrics (Impact section, id: "impact").
export const impact = [
  {
    valueKo: '8×',
    labelKo: 'Samsonite Korea 성장',
    valueEn: '8×',
    labelEn: 'Samsonite Korea growth',
  },
  {
    valueKo: 'KRW 100B+',
    labelKo: 'Samsonite RED 매출',
    valueEn: 'KRW 100B+',
    labelEn: 'Samsonite RED sales',
  },
  {
    valueKo: 'USD 1B',
    labelKo: 'APAC·중동 P&L',
    valueEn: 'USD 1B',
    labelEn: 'APAC & ME P&L',
  },
  {
    valueKo: '20+개국',
    labelKo: '글로벌 시장 리더십',
    valueEn: '20+ markets',
    labelEn: 'Regional leadership',
  },
];

// Profile / About section (id: "about").
export const about = {
  headlineKo: '30년 이상, 브랜드를 만들고 성장시켜온 글로벌 경영자',
  headlineEn: '30+ Years of Building, Scaling and Transforming Brands.',
  bioKo:
    '30년 이상 소비재·패션·라이프스타일·트래블 산업에서 브랜드를 만들고 성장시켜 온 글로벌 경영자입니다. Samsonite Korea 대표와 Asia Pacific & Middle East President로서 대규모 P&L과 20개국 이상의 사업을 이끌었으며, 창업·신사업 구축·턴어라운드 경험을 바탕으로 전략을 실행 가능한 성장과 기업가치로 연결합니다.',
  bioEn:
    'Global consumer, fashion, lifestyle and travel executive with 30+ years of experience building, scaling and transforming brands. Former President of Samsonite Asia Pacific & Middle East and CEO of Samsonite Korea, combining leadership of a USD 1 billion regional P&L across 20+ markets with founder-level execution in new ventures, turnarounds and purpose-led business building.',
};

// Selected Career Impact / editorial case studies (used within CaseStudies
// section, part of "impact" flow). Six entries per the source document —
// more can be appended here without touching layout code.
export const caseStudies = [
  {
    id: 'samsonite-korea',
    tag: 'CASE 01',
    titleKo: 'SAMSONITE KOREA',
    titleEn: 'SAMSONITE KOREA',
    summaryKo:
      'Samsonite Korea 매출을 KRW 30B에서 KRW 240B로 8배 성장시키고, 2018년 EBITDA KRW 53B(22%) 달성.',
    summaryEn:
      'Grew Samsonite Korea sales eightfold from KRW 30B to KRW 240B and delivered KRW 53B EBITDA at a 22% margin in 2018.',
    metrics: [
      { valueKo: 'KRW 30B → KRW 240B', valueEn: 'KRW 30B → KRW 240B', labelKo: '8배 성장', labelEn: '8× growth' },
      { valueKo: 'KRW 53B', valueEn: 'KRW 53B', labelKo: '2018 EBITDA (22%)', labelEn: '2018 EBITDA (22% margin)' },
    ],
    image: 'samsoniteKorea',
  },
  {
    id: 'samsonite-red',
    tag: 'CASE 02',
    titleKo: 'SAMSONITE RED',
    titleEn: 'SAMSONITE RED',
    summaryKo:
      'Samsonite RED 사업 기회를 발굴해 콘셉트·상품·가격·유통·마케팅을 구축하고 아시아 KRW 100B+ 브랜드로 성장.',
    summaryEn:
      'Originated the Samsonite RED opportunity and built the concept, product, pricing, distribution and marketing platform into a KRW 100B+ Asian brand.',
    metrics: [{ valueKo: 'KRW 100B+', valueEn: 'KRW 100B+', labelKo: '브랜드 매출', labelEn: 'Brand sales' }],
    image: 'samsoniteRed',
  },
  {
    id: 'apac-middle-east',
    tag: 'CASE 03',
    titleKo: 'ASIA PACIFIC & MIDDLE EAST',
    titleEn: 'ASIA PACIFIC & MIDDLE EAST',
    summaryKo:
      'Asia Pacific & Middle East President로 20개국 이상, USD 1B 규모 멀티브랜드 사업을 총괄하며 2013~2015년 38% 성장.',
    summaryEn:
      'Led a USD 1B multi-brand business across 20+ markets as President, Asia Pacific & Middle East, delivering 38% growth from 2013 to 2015.',
    metrics: [
      { valueKo: 'USD 1B', valueEn: 'USD 1B', labelKo: 'P&L', labelEn: 'P&L' },
      { valueKo: '20+', valueEn: '20+', labelKo: '시장', labelEn: 'Markets' },
      { valueKo: '38%', valueEn: '38%', labelKo: '성장 (2013–2015)', labelEn: 'Growth (2013–2015)' },
    ],
    image: 'apac',
  },
  {
    id: 'leoholdings',
    tag: 'CASE 04',
    titleKo: 'LEOHOLDINGS',
    titleEn: 'LEOHOLDINGS',
    summaryKo:
      'LEOHOLDINGS 창업 후 친환경 브랜드 Just Craft Lifestyle과 플랫폼 Just Craft Mall을 직접 기획·개발·운영.',
    summaryEn:
      'Founded LEOHOLDINGS and personally planned, built and operated eco-conscious brand Just Craft Lifestyle and platform Just Craft Mall.',
    metrics: [],
    image: 'leoholdings',
  },
  {
    id: 'rcc',
    tag: 'CASE 05',
    titleKo: 'RCC · RAWROW · NAUTICA',
    titleEn: 'RCC · RAWROW · NAUTICA',
    summaryKo:
      'RCC Co-CEO로 Rawrow·Nautica 사업을 재정비해 4개월 내 매출 흐름을 -2%에서 +19%로 전환하고 수익성을 개선.',
    summaryEn:
      'As Co-CEO of RCC, reset the Rawrow and Nautica businesses, improving sales momentum from -2% to +19% within four months while restoring profitability.',
    metrics: [
      { valueKo: '-2% → +19%', valueEn: '-2% → +19%', labelKo: '4개월 내 Turnaround', labelEn: 'Turnaround within 4 months' },
    ],
    image: 'rcc',
  },
  {
    id: 'traveldepot',
    tag: 'CASE 06',
    titleKo: 'TRAVELDEPOT',
    titleEn: 'TRAVELDEPOT',
    summaryKo:
      'TravelDepot Global CEO로 중국에서 8,000㎡ 여행 라이프스타일 공간을 4개월 내 구축하고 88개 브랜드·2,300+ SKU를 론칭.',
    summaryEn:
      'As Global CEO of TravelDepot, built and opened an 8,000 sqm travel-lifestyle destination in China in under four months, launching 88 brands and 2,300+ SKUs.',
    metrics: [
      { valueKo: '8,000㎡', valueEn: '8,000 sqm', labelKo: '공간', labelEn: 'Space' },
      { valueKo: '88', valueEn: '88', labelKo: '브랜드', labelEn: 'Brands' },
      { valueKo: '2,300+', valueEn: '2,300+', labelKo: 'SKU', labelEn: 'SKUs' },
      { valueKo: '4개월', valueEn: '4 months', labelKo: '구축 기간', labelEn: 'Build time' },
    ],
    image: 'travelDepot',
  },
];

// Advisory Focus section (id: "advisory").
export const advisory = {
  titleKo: '핵심 자문 영역',
  titleEn: 'ADVISORY FOCUS',
  items: [
    { ko: '브랜드·포트폴리오 전략', en: 'Brand & portfolio strategy' },
    { ko: '성장전략 및 턴어라운드', en: 'Growth strategy & turnaround' },
    { ko: '신사업 및 시장진입', en: 'New ventures & market entry' },
    { ko: '상품/가격/채널 전략', en: 'Product / pricing / channel strategy' },
    { ko: 'DTC/이커머스/리테일', en: 'DTC / e-commerce / retail' },
    { ko: '라이선싱 및 전략적 파트너십', en: 'Licensing & strategic partnerships' },
    { ko: 'P&L/조직/운영체계', en: 'P&L / organization / operating model' },
    { ko: '창업자·경영진 자문', en: 'Founder & executive advisory' },
  ],
};

// Executive Career timeline (id: "career"), chronological ascending.
export const career = [
  {
    period: '1994–2005',
    roleKo: 'Sales & Marketing Leadership',
    roleEn: 'Sales & Marketing Leadership',
    companyKo: 'Prada · Bally · A. Testoni · Chanel Korea',
    companyEn: 'Prada · Bally · A. Testoni · Chanel Korea',
  },
  {
    period: '2005–2019',
    roleKo: '대표이사 (President & Representative Director)',
    roleEn: 'President & Representative Director',
    companyKo: 'Samsonite Korea',
    companyEn: 'Samsonite Korea',
  },
  {
    period: '2013–2015',
    roleKo: 'President, Asia Pacific & Middle East (한국 대표 겸임)',
    roleEn: 'President, Asia Pacific & Middle East (concurrent Korea leadership)',
    companyKo: 'Samsonite Asia',
    companyEn: 'Samsonite Asia',
  },
  {
    period: '2020–2024',
    roleKo: 'Founder & President',
    roleEn: 'Founder & President',
    companyKo: 'LEOHOLDINGS Corp. / Just Craft',
    companyEn: 'LEOHOLDINGS Corp. / Just Craft',
  },
  {
    period: '2024–2025',
    roleKo: 'GM, APAC & Hong Kong',
    roleEn: 'GM, APAC & Hong Kong',
    companyKo: 'KP Retail Trading (K-Swiss · Palladium)',
    companyEn: 'KP Retail Trading (K-Swiss · Palladium)',
  },
  {
    period: '2025',
    roleKo: 'Co-CEO & President',
    roleEn: 'Co-CEO & President',
    companyKo: 'RCC Inc. (Rawrow · Nautica)',
    companyEn: 'RCC Inc. (Rawrow · Nautica)',
  },
  {
    period: '2025–2026',
    roleKo: 'Global CEO',
    roleEn: 'Global CEO',
    companyKo: 'TravelDepot / League Holdings Group, China',
    companyEn: 'TravelDepot / League Holdings Group, China',
  },
];

export const education = {
  ko: ['연세대학교 경영학 학사', 'UC San Diego 경제학 교환학생', '한국어 Native · 영어 Business Fluent'],
  en: [
    'B.A. in Business Administration, Yonsei University',
    'Exchange Student in Economics, UC San Diego',
    'Korean: Native · English: Business Fluent',
  ],
};

// Visual Story / Gallery (id within Gallery section). Empty for Phase 1 —
// populate as photos become available:
// { id: 'unique-id', src: '/images/example.jpg', captionKo: '...', captionEn: '...' }
export const gallery = [];

// Final CTA (Contact section, id: "contact").
export const contactCta = {
  headlineKo: '다음 성장을 함께 만듭니다.',
  headlineEn: "Let's Build What's Next.",
  buttonKo: '대화 시작하기',
  buttonEn: 'Start a Conversation',
};

export const inquiryTypes = [
  { ko: '브랜드 전략', en: 'Brand Strategy' },
  { ko: '성장/턴어라운드', en: 'Growth / Turnaround' },
  { ko: '신사업', en: 'New Business' },
  { ko: '시장 진입', en: 'Market Entry' },
  { ko: '리테일/DTC', en: 'Retail / DTC' },
  { ko: '파트너십', en: 'Partnership' },
  { ko: '경영진 자문', en: 'Executive Advisory' },
  { ko: '기타', en: 'Other' },
];

// Image registry — components must resolve images through this map, never
// hardcode a path inline. Files are expected under public/images/ and are
// not yet present in Phase 1; ImagePlaceholder handles the fallback.
export const images = {
  hero: '/images/hero.jpg',
  portrait: '/images/portrait.jpg',
  samsoniteKorea: '/images/samsonite-korea.jpg',
  samsoniteRed: '/images/samsonite-red.jpg',
  apac: '/images/apac.jpg',
  leoholdings: '/images/leoholdings.jpg',
  rcc: '/images/rcc.jpg',
  travelDepot: '/images/traveldepot.jpg',
};

export const profile = {
  site,
  person,
  contact,
  hero,
  impact,
  about,
  caseStudies,
  advisory,
  career,
  education,
  gallery,
  contactCta,
  inquiryTypes,
  images,
};

export default profile;
