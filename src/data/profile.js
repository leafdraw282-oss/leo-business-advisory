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
  infoLabelKo: '연락처',
  infoLabelEn: 'Contact Details',
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

// Heading copy for the Impact section. Not a verbatim doc heading (the
// source document has no section title of its own for these four
// figures) — short, non-factual UI copy only.
export const impactSection = {
  eyebrowKo: '경영 성과',
  eyebrowEn: 'TRACK RECORD',
  titleKo: '숫자로 보는 임팩트',
  titleEn: 'Impact at a Glance',
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
  eyebrowKo: '이그제큐티브 프로필',
  eyebrowEn: 'EXECUTIVE PROFILE',
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
    // The functions built out, per the source document's own summary.
    highlights: [
      { ko: '콘셉트', en: 'Concept' },
      { ko: '상품', en: 'Product' },
      { ko: '가격', en: 'Pricing' },
      { ko: '유통', en: 'Distribution' },
      { ko: '마케팅', en: 'Marketing' },
    ],
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

// Heading copy for the case studies block (part of the "impact" flow),
// taken verbatim from the source document's own section headings.
export const caseStudiesSection = {
  titleKo: '주요 경영 성과',
  titleEn: 'SELECTED CAREER IMPACT',
};

// Advisory Focus section (id: "advisory"). Title + items are verbatim
// from the source document's own "핵심 자문 영역" / "ADVISORY FOCUS" list.
export const advisory = {
  eyebrowKo: '자문 영역',
  eyebrowEn: 'HOW I CAN HELP',
  titleKo: '핵심 자문 영역',
  titleEn: 'ADVISORY FOCUS',
  items: [
    { id: 'brand-portfolio', ko: '브랜드·포트폴리오 전략', en: 'Brand & portfolio strategy' },
    { id: 'growth-turnaround', ko: '성장전략 및 턴어라운드', en: 'Growth and turnaround' },
    { id: 'new-ventures', ko: '신사업 및 시장진입', en: 'New ventures and market entry' },
    { id: 'product-pricing-channel', ko: '상품/가격/채널', en: 'Product/pricing/channel' },
    { id: 'dtc-ecommerce-retail', ko: 'DTC/이커머스/리테일', en: 'DTC/e-commerce/retail' },
    { id: 'licensing-partnerships', ko: '라이선싱 및 파트너십', en: 'Licensing and strategic partnerships' },
    { id: 'pnl-organization', ko: 'P&L/조직/운영체계', en: 'P&L/organization/operating model' },
    { id: 'founder-advisory', ko: '창업자·경영진 자문', en: 'Founder and executive advisory' },
  ],
};

// Heading copy for the Career section. Title is taken verbatim from the
// source document; the eyebrow is short non-factual UI copy (the
// document has no separate kicker line for this section).
export const careerSection = {
  eyebrowKo: '경력 타임라인',
  eyebrowEn: 'CAREER TIMELINE',
  titleKo: '주요 경력',
  titleEn: 'EXECUTIVE CAREER',
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

// Heading copy for the Gallery / Visual Story section. Not present in the
// source document (it has no gallery); this is placeholder section copy.
export const gallerySection = {
  eyebrowKo: '비주얼 스토리',
  eyebrowEn: 'VISUAL STORY',
  titleKo: '기록으로 남은 순간들',
  titleEn: 'Moments Along the Way',
};

// Visual Story / Gallery (section id: "gallery"). Placeholder entries tied
// to real, already-documented ventures (same entities used in
// `caseStudies`) so the editorial rhythm can be previewed before real
// photography exists. `aspect` is a CSS aspect-ratio value and `wide`
// spans 2 grid columns — both are purely layout hints. Growing this list
// from 6 to 10+ entries needs no component change; a new entry with no
// `aspect`/`wide` still renders correctly (component provides defaults).
export const gallery = [
  { id: 'leo-portrait', src: '/images/gallery-leo-portrait.jpg', captionKo: 'LEO 포트레이트', captionEn: 'LEO Portrait', aspect: '4 / 5' },
  { id: 'samsonite-korea', src: '/images/gallery-samsonite-korea.jpg', captionKo: 'Samsonite Korea', captionEn: 'Samsonite Korea', aspect: '4 / 3' },
  { id: 'samsonite-red', src: '/images/gallery-samsonite-red.jpg', captionKo: 'Samsonite RED', captionEn: 'Samsonite RED', aspect: '3 / 4' },
  { id: 'traveldepot', src: '/images/gallery-traveldepot.jpg', captionKo: 'TravelDepot', captionEn: 'TravelDepot', aspect: '16 / 9', wide: true },
  { id: 'rcc-rawrow-nautica', src: '/images/gallery-rcc.jpg', captionKo: 'RCC · Rawrow · Nautica', captionEn: 'RCC · Rawrow · Nautica', aspect: '1 / 1' },
  { id: 'leoholdings-just-craft', src: '/images/gallery-leoholdings.jpg', captionKo: 'LEOHOLDINGS · Just Craft', captionEn: 'LEOHOLDINGS · Just Craft', aspect: '4 / 3' },
];

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

// Contact form copy (id: "contact"). No backend exists yet — submitting
// this form opens the visitor's email app with the message pre-filled
// (mailto:), per CLAUDE.md's Contact form rule. `noteKo`/`noteEn` must
// stay visible near the submit button so nobody mistakes this for a
// direct server submission.
export const contactForm = {
  labels: {
    name: { ko: '이름', en: 'Name' },
    company: { ko: '회사', en: 'Company' },
    email: { ko: '이메일', en: 'Email' },
    inquiryType: { ko: '문의 유형', en: 'Type of Inquiry' },
    message: { ko: '메시지', en: 'Message' },
  },
  inquiryPlaceholderKo: '유형을 선택해주세요',
  inquiryPlaceholderEn: 'Select an inquiry type',
  submitKo: '이메일 앱으로 보내기',
  submitEn: 'Send via Email',
  noteKo: '제출하시면 작성하신 내용으로 기본 이메일 앱이 열립니다. 앱에서 발송을 완료해야 실제로 전달됩니다.',
  noteEn: "Submitting opens your default email app with this message pre-filled — you'll need to hit send there for it to actually reach Leo.",
};

// Footer copy (id: none — persistent site-wide chrome, not a nav section).
export const footer = {
  copyrightKo: '모든 권리 보유.',
  copyrightEn: 'All rights reserved.',
  backToTopKo: '맨 위로',
  backToTopEn: 'Back to top',
};

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
  impactSection,
  impact,
  about,
  caseStudies,
  caseStudiesSection,
  advisory,
  career,
  careerSection,
  education,
  gallery,
  gallerySection,
  contactCta,
  inquiryTypes,
  contactForm,
  footer,
  images,
};

export default profile;
