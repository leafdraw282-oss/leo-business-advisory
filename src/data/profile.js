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
  // "LEO Business Advisory" is the brand/site name itself (a proper noun,
  // used as-is in both languages, same as index.html's og:site_name) —
  // only the person name half is swapped to Korean.
  titleTagKo: 'LEO Business Advisory | 서부석',
  // Advisory Sales repositioning — kept in sync with index.html's <head>
  // (title/description/OG/Twitter), which is a static file and doesn't
  // read this at build time; update both together. Every noun here
  // (Growth Strategy / Brand Turnaround / Global Expansion) is one of the
  // 4 named Advisory Products below, and "30+ year global CEO" restates
  // `impact`/`about.bioKo` — no new claim.
  descriptionEn:
    'Executive advisory for CEOs and founders — growth strategy, brand turnaround, new business launch and global expansion, led by a 30+ year global CEO and brand builder.',
  descriptionKo:
    '성장 전략, 브랜드 턴어라운드, 신사업 런칭, 글로벌 확장까지 — 30년 이상 글로벌 경영자로 브랜드를 키워온 CEO의 경영 자문.',
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
  // Placeholder label for the portrait ImagePlaceholder (Hero + About),
  // shown until a real photo replaces it.
  portraitLabelKo: '리오 포트레이트',
  portraitLabelEn: 'LEO Portrait',
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

// Hero copy — Advisory Sales repositioning (site owner's own copy, given
// directly for this restructuring; not sourced from the Founder Profile
// document, same as the marketing copy it replaces). Facts referenced in
// the supporting credential line (30+ years, 8x growth) are the same
// already-verified figures as `impact`/`about.bioKo` below — nothing new.
export const hero = {
  eyebrowKo: person.titleKo + ' · ' + person.positioningKo,
  eyebrowEn: person.titleEn + ' · ' + person.positioningEn,
  headlineKo: ['성장에는 전략보다', '실행이 필요합니다.'],
  headlineEn: ['Growth Needs Execution,', 'Not Just Strategy.'],
  subheadKo: '브랜드 성장, 사업 전환, 글로벌 확장을 CEO의 시각으로 함께 해결합니다.',
  subheadEn: "Brand growth, business transformation and global expansion — solved together, from a CEO's perspective.",
  // New supporting credential line, directly under the subhead — every
  // token here restates a fact already established elsewhere in this file
  // (30+ years: about.bioKo; Global CEO: career's most recent entries;
  // 8X Growth: impact Samsonite Korea figure; Brand Building/Turnaround/
  // Global Expansion: caseStudies below), never a new claim.
  credentialsKo: '30년+ · Global CEO · 8배 성장 · 브랜드 빌딩 · 턴어라운드 · 글로벌 확장',
  credentialsEn: '30+ Years · Global CEO · 8X Growth · Brand Building · Turnaround · Global Expansion',
  ctaPrimaryKo: '30분 자문 상담 신청',
  ctaPrimaryEn: 'Book a 30-Minute Consultation',
  ctaPrimaryTarget: 'contact',
  // No company brochure file/link exists in this project yet (checked
  // public/ and docs/) — per this phase's own instruction not to invent a
  // URL, this points at an on-page section that serves the same purpose
  // (proof of track record) until a real PDF/deck is supplied. See this
  // phase's completion report — "Content Requiring Confirmation".
  ctaSecondaryKo: '회사소개서 보기',
  ctaSecondaryEn: 'View Company Profile',
  // Matches CaseStudies.jsx's real section id ("case-studies", not
  // "cases") — see src/App.jsx / src/sections/CaseStudies.jsx.
  ctaSecondaryTarget: 'case-studies',
};

// Heading copy for the Impact section — repositioned as "Why Leo" (id:
// "impact", nav-facing as "Experience") under the Advisory Sales IA: the
// same four-stat component, admin-editable exactly as before, now framed
// around why the visitor should trust this advisor rather than a plain
// "track record" heading.
export const impactSection = {
  eyebrowKo: '왜 Leo인가',
  eyebrowEn: 'WHY LEO',
  titleKo: '결과로 증명된 경험',
  titleEn: 'Experience That Delivers Results',
};

// Headline "Why Leo" metrics (Impact section, id: "impact"). Curated to
// the four figures the Advisory Sales repositioning calls out by name
// (30+ years / 8x growth / brand-building revenue / multi-market
// leadership) — every value below already existed verbatim elsewhere in
// this file before this edit (see the inline notes); the former "USD 1B
// APAC·중동 P&L" card is not deleted, just no longer one of these four —
// that same fact still appears in `caseStudies` below (the
// apac-middle-east case).
export const impact = [
  {
    // Restates about.bioKo's own "30년 이상" — not a new figure.
    valueKo: '30년+',
    labelKo: '소비재·라이프스타일 리더십',
    valueEn: '30+ Years',
    labelEn: 'Consumer & Lifestyle Leadership',
  },
  {
    valueKo: '8×',
    labelKo: 'Samsonite Korea 성장',
    valueEn: '8×',
    labelEn: 'Samsonite Korea growth',
  },
  {
    valueKo: 'KRW 100B+',
    labelKo: '브랜드 빌딩 경험 (Samsonite RED)',
    valueEn: 'KRW 100B+',
    labelEn: 'Brand Building Experience (Samsonite RED)',
  },
  {
    valueKo: '20+개국',
    labelKo: 'APAC·글로벌 리더십',
    valueEn: '20+ markets',
    labelEn: 'APAC & Global leadership',
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
    // Editorial keyword tags (Advisory Sales repositioning) — descriptive
    // labels for facts already stated in `summary`/`metrics` above, not
    // new claims.
    highlights: [
      { ko: 'Scale', en: 'Scale' },
      { ko: 'Market Leadership', en: 'Market Leadership' },
      { ko: 'Organization', en: 'Organization' },
      { ko: 'Growth Strategy', en: 'Growth Strategy' },
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
    highlights: [
      { ko: 'Regional Leadership', en: 'Regional Leadership' },
      { ko: 'P&L Management', en: 'P&L Management' },
      { ko: 'Multi-Brand Portfolio', en: 'Multi-Brand Portfolio' },
      { ko: 'Growth', en: 'Growth' },
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
      'Founded LEOHOLDINGS and operated eco-conscious brand Just Craft Lifestyle and curated platform Just Craft Mall across online and offline channels.',
    metrics: [],
    highlights: [
      { ko: 'Founder-Led', en: 'Founder-Led' },
      { ko: 'New Business', en: 'New Business' },
      { ko: 'Brand Building', en: 'Brand Building' },
      { ko: 'Platform', en: 'Platform' },
    ],
    image: 'leoholdings',
  },
  {
    id: 'rcc',
    tag: 'CASE 05',
    titleKo: 'RCC · RAWROW · NAUTICA',
    titleEn: 'RCC · RAWROW · NAUTICA',
    summaryKo:
      'RCC Co-CEO로 Rawrow·Nautica 사업을 재정비해 4개월 내 매출 흐름을 -2%에서 +19%로 전환하고 수익성 개선.',
    summaryEn:
      'As Co-CEO of RCC, reset the Rawrow and Nautica businesses, improving sales momentum from -2% to +19% within four months while restoring profitability.',
    metrics: [
      { valueKo: '-2% → +19%', valueEn: '-2% → +19%', labelKo: '4개월 내 Turnaround', labelEn: 'Turnaround within 4 months' },
    ],
    highlights: [
      { ko: 'Turnaround', en: 'Turnaround' },
      { ko: 'Co-CEO Leadership', en: 'Co-CEO Leadership' },
      { ko: 'Profitability', en: 'Profitability' },
      { ko: 'Execution', en: 'Execution' },
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
    highlights: [
      { ko: 'Platform', en: 'Platform' },
      { ko: 'Portfolio Strategy', en: 'Portfolio Strategy' },
      { ko: 'Merchandising', en: 'Merchandising' },
      { ko: 'Business Creation', en: 'Business Creation' },
    ],
    image: 'travelDepot',
  },
];

// Heading copy for the case studies block — repositioned as "Selected
// Cases" under the Advisory Sales IA (was "주요 경영 성과" / "SELECTED
// CAREER IMPACT"; the underlying six cases and every fact in them are
// unchanged, only this section's own framing copy).
export const caseStudiesSection = {
  eyebrowKo: '실제 결과',
  eyebrowEn: 'PROVEN OUTCOMES',
  titleKo: '엄선된 비즈니스 성과',
  titleEn: 'Selected Cases',
};

// Advisory Focus list — the section's ORIGINAL content (verbatim from the
// source document's own "핵심 자문 영역" / "ADVISORY FOCUS" list). Kept
// exported and intact (still admin-editable via its existing Supabase
// table/editor) but no longer the "advisory" section's primary rendering
// as of the Advisory Sales repositioning below — see `advisoryProducts`.
// Nothing here was deleted; the section id ("advisory") simply now
// renders the four named products instead of this flat list.
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

// ---------------------------------------------------------------------------
// Advisory Sales repositioning — new content, authored directly by the site
// owner for this restructuring (not sourced from the Founder Profile
// document, which has no "challenge / products / how we work / target
// clients / insights" sections of its own). Every number or fact these
// reference is one already established above in this file; see each
// block's own note for exactly which.
// ---------------------------------------------------------------------------

// "Your Challenge" (id: "challenge") — leads with the visitor's problem,
// not the founder's history, per the Advisory Sales IA.
export const challenge = {
  eyebrowKo: '이런 고민이 있으신가요',
  eyebrowEn: 'THE CHALLENGE',
  titleKo: '혹시 지금 이런 고민을 하고 계십니까?',
  titleEn: 'Does This Sound Like Where You Are Right Now?',
  items: [
    {
      ko: '매출은 정체되었는데 어디서부터 손대야 할지 모르겠다.',
      en: "Revenue has stalled, and it isn't clear where to start.",
    },
    {
      ko: '브랜드는 있는데 다음 성장동력이 보이지 않는다.',
      en: "The brand is established, but the next growth engine isn't visible.",
    },
    {
      ko: '새로운 브랜드나 사업을 시작하고 싶은데 내부에 경험자가 없다.',
      en: 'You want to launch a new brand or business, but no one in-house has done it before.',
    },
    {
      ko: '한국에서 성공했지만 해외 진출 방법이 막막하다.',
      en: 'The business has succeeded in Korea, but international expansion feels out of reach.',
    },
    {
      ko: '투자 또는 M&A 이후 회사를 어떻게 성장시킬지 고민이다.',
      en: 'After an investment or M&A, the path to the next stage of growth is unclear.',
    },
  ],
  statementKo: 'Leo Business Advisory는 보고서만 제안하지 않습니다.',
  statementEn: 'Leo Business Advisory does not stop at a report.',
  statementSubKo: '문제를 진단하고, 전략을 만들고, 실행까지 함께합니다.',
  statementSubEn: 'We diagnose the problem, build the strategy, and stay through execution.',
};

// "What We Do" (id: "advisory") — four named Advisory Products, replacing
// the flat `advisory.items` list above as this section's primary content.
export const advisorySection = {
  eyebrowKo: '우리가 하는 일',
  eyebrowEn: 'WHAT WE DO',
  titleKo: '실행까지 이어지는 4가지 자문 서비스',
  titleEn: 'Four Advisory Products, Built to Execute',
};

export const advisoryProducts = [
  {
    id: 'ceo-growth-advisory',
    nameKo: 'CEO Growth Advisory',
    nameEn: 'CEO Growth Advisory',
    targetKo: '성장이 정체된 기업',
    targetEn: 'Companies with stalled growth',
    focusKo: ['성장 전략', '사업 포트폴리오', '채널 전략', '수익성', '조직/실행'],
    focusEn: ['Growth Strategy', 'Business Portfolio', 'Channel Strategy', 'Profitability', 'Organization / Execution'],
    deliverableKo: '성장 전략 + 실행 로드맵',
    deliverableEn: 'Growth Strategy + Execution Roadmap',
  },
  {
    id: 'brand-turnaround',
    nameKo: 'Brand Turnaround',
    nameEn: 'Brand Turnaround',
    targetKo: '매출 또는 수익성이 하락하는 브랜드',
    targetEn: 'Brands facing declining sales or profitability',
    focusKo: ['비즈니스 진단', '브랜드 포지셔닝', '상품/채널 포트폴리오', '수익성', '실행 우선순위'],
    focusEn: ['Business Diagnosis', 'Brand Positioning', 'Product / Channel Portfolio', 'Profitability', 'Execution Priority'],
    deliverableKo: '100일 턴어라운드 플랜',
    deliverableEn: '100-Day Turnaround Plan',
  },
  {
    id: 'new-business-launch',
    nameKo: 'New Business / Brand Launch',
    nameEn: 'New Business / Brand Launch',
    targetKo: '신규 사업 또는 신규 브랜드를 검토하는 기업',
    targetEn: 'Companies evaluating a new business or brand',
    focusKo: ['사업 기회', '시장 검증', '비즈니스 모델', '브랜드 전략', 'Go-to-Market'],
    focusEn: ['Business Opportunity', 'Market Validation', 'Business Model', 'Brand Strategy', 'Go-to-Market'],
    deliverableKo: '사업 검증 + GTM 전략',
    deliverableEn: 'Business Validation + GTM Strategy',
  },
  {
    id: 'global-expansion',
    nameKo: 'Global Expansion',
    nameEn: 'Global Expansion',
    targetKo: '해외 또는 한국 시장 진출을 준비하는 기업',
    targetEn: 'Companies preparing to enter overseas or Korean markets',
    focusKo: ['시장 선정', '시장 진입', '유통 전략', '파트너 전략', '현지화'],
    focusEn: ['Market Selection', 'Market Entry', 'Distribution Strategy', 'Partner Strategy', 'Localization'],
    deliverableKo: '시장 진입 + 파트너 전략',
    deliverableEn: 'Market Entry + Partner Strategy',
  },
];

// "How We Work" (id: "how-we-work") — traditional consulting vs. Leo
// Business Advisory, plus the operator-vs-consultant positioning line.
export const howWeWork = {
  eyebrowKo: '일하는 방식',
  eyebrowEn: 'HOW WE WORK',
  titleKo: '컨설팅펌과는 다르게 일합니다',
  titleEn: 'A Different Kind of Advisory',
  traditionalLabelKo: '일반적인 컨설팅',
  traditionalLabelEn: 'Traditional Consulting',
  traditionalStepsKo: ['분석', '제안', '보고서'],
  traditionalStepsEn: ['Analyze', 'Recommend', 'Report'],
  leoLabelKo: 'LEO BUSINESS ADVISORY',
  leoLabelEn: 'LEO BUSINESS ADVISORY',
  leoStepsKo: ['진단', '전략 수립', '실행', '성장'],
  leoStepsEn: ['Diagnose', 'Strategize', 'Execute', 'Grow'],
  quoteKo: '자문만 해온 것이 아니라, 직접 회사를 경영해왔습니다.',
  quoteEn: 'I have advised businesses. More importantly, I have run them.',
  taglineKo: '컨설팅의 엄밀함, Operator의 실행력.',
  taglineEn: 'Consulting rigor. Operator execution.',
};

// "Target Clients" (id: "clients").
export const targetClientsSection = {
  eyebrowKo: '이런 분들과 함께합니다',
  eyebrowEn: 'TARGET CLIENTS',
  titleKo: 'Target Clients',
  titleEn: 'Who We Work With',
};

export const targetClients = [
  {
    ko: '성장 정체에 빠진 중견 Consumer / Fashion / Lifestyle 기업',
    en: 'Mid-market Consumer, Fashion or Lifestyle companies with stalled growth',
  },
  {
    ko: 'Portfolio Company 성장이 필요한 PE / Investment Firm',
    en: 'PE / Investment Firms seeking portfolio company growth',
  },
  {
    ko: '한국 또는 아시아 진출을 원하는 Global Consumer Brand',
    en: 'Global Consumer Brands entering Korea or Asia',
  },
  {
    ko: '새로운 브랜드 또는 사업을 만드는 Founder / CEO',
    en: 'Founders / CEOs building a new brand or business',
  },
];

// PE Portfolio Advisory — called out separately per the brief ("PE /
// Investment Firm 대상 영역은 별도로 강조해도 좋아").
export const peAdvisory = {
  labelKo: 'PE Portfolio Advisory',
  labelEn: 'PE Portfolio Advisory',
  introKo: 'PE 및 투자사의 Portfolio Company를 위한 자문 영역',
  introEn: 'Advisory scope for PE and investment firm portfolio companies',
  items: [
    { ko: '성장 전략', en: 'Growth Strategy' },
    { ko: '상업적 가속화', en: 'Commercial Acceleration' },
    { ko: '브랜드/채널 전략', en: 'Brand / Channel Strategy' },
    { ko: '경영진 자문', en: 'Management Advisory' },
    { ko: '100일 플랜', en: '100-Day Plan' },
    { ko: 'Value Creation', en: 'Value Creation' },
  ],
};

// "Insights" (id: "insights") — thought-leadership placeholder only; no
// real posts exist yet, so these are titles-to-come, not published
// content (per this phase's own "허위 내용을 작성하지 마" instruction).
export const insightsSection = {
  eyebrowKo: '인사이트',
  eyebrowEn: 'INSIGHTS',
  titleKo: 'Insights',
  titleEn: 'Insights',
  comingSoonKo: '준비 중입니다',
  comingSoonEn: 'Coming soon',
};

export const insights = [
  { id: 'why-good-brands-stop-growing', titleKo: '왜 좋은 브랜드도 성장을 멈추는가', titleEn: 'Why Even Good Brands Stop Growing' },
  {
    id: 'korea-brands-global-failure',
    titleKo: '한국 브랜드가 글로벌 시장에서 실패하는 5가지 이유',
    titleEn: '5 Reasons Korean Brands Struggle to Go Global',
  },
  { id: 'ceo-first-100-days', titleKo: 'CEO가 Turnaround 첫 100일에 해야 할 일', titleEn: "A CEO's First 100 Days in a Turnaround" },
];

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
    roleKo: 'President & Representative Director',
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
  emptyKo: '갤러리 사진은 추후 업데이트될 예정입니다.',
  emptyEn: 'Gallery photos will be added in a future phase.',
};

// Visual Story / Gallery (section id: "gallery"). Placeholder entries tied
// to real, already-documented ventures (same entities used in
// `caseStudies`) so the editorial rhythm can be previewed before real
// photography exists. `aspect` is a CSS aspect-ratio value and `wide`
// spans 2 grid columns — both are purely layout hints. Growing this list
// from 6 to 10+ entries needs no component change; a new entry with no
// `aspect`/`wide` still renders correctly (component provides defaults).
export const gallery = [
  { id: 'leo-portrait', src: '/images/gallery-leo-portrait.jpg', captionKo: '리오 포트레이트', captionEn: 'LEO Portrait', aspect: '4 / 5' },
  { id: 'samsonite-korea', src: '/images/gallery-samsonite-korea.jpg', captionKo: 'Samsonite Korea', captionEn: 'Samsonite Korea', aspect: '4 / 3' },
  { id: 'samsonite-red', src: '/images/gallery-samsonite-red.jpg', captionKo: 'Samsonite RED', captionEn: 'Samsonite RED', aspect: '3 / 4' },
  { id: 'traveldepot', src: '/images/gallery-traveldepot.jpg', captionKo: 'TravelDepot', captionEn: 'TravelDepot', aspect: '16 / 9', wide: true },
  { id: 'rcc-rawrow-nautica', src: '/images/gallery-rcc.jpg', captionKo: 'RCC · Rawrow · Nautica', captionEn: 'RCC · Rawrow · Nautica', aspect: '1 / 1' },
  { id: 'leoholdings-just-craft', src: '/images/gallery-leoholdings.jpg', captionKo: 'LEOHOLDINGS · Just Craft', captionEn: 'LEOHOLDINGS · Just Craft', aspect: '4 / 3' },
];

// Final CTA (Contact section, id: "contact") — Advisory Sales
// repositioning: lowers the barrier to reaching out ("Let's Talk About
// Your Business" rather than a generic "Contact Us"), and the button
// label matches Hero's own primary CTA verbatim so the conversion action
// reads identically everywhere it appears on the page.
export const contactCta = {
  eyebrowKo: '상담 신청',
  eyebrowEn: 'CONSULTATION',
  headlineKo: '당신의 비즈니스에 대해 이야기해봅시다',
  headlineEn: "Let's Talk About Your Business",
  introKo: '지금 고민하고 있는 사업의 문제를 알려주세요. 첫 미팅에서 함께 문제를 정의해 보겠습니다.',
  introEn: "Tell us the business problem you're facing right now. In the first meeting, we'll define it together.",
  buttonKo: '30분 자문 상담 신청',
  buttonEn: 'Book a 30-Minute Consultation',
  // Closing line at the very bottom of the page, above the same button
  // repeated as the page's last conversion point.
  finalLineKo: '다음 성장 단계는 대화에서 시작됩니다.',
  finalLineEn: 'Your next stage of growth starts with a conversation.',
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

// Advisory Sales repositioning: the contact form's own "문의 유형"
// dropdown (still required by inquiries.inquiry_type NOT NULL — see
// supabase/migrations/0005_inquiries.sql — never removed at the data
// layer) is no longer shown as a visible field, to keep the form to the
// four fields the brief asks for (name / company / email / the problem
// itself). This default value is submitted silently in its place — see
// src/components/ContactForm.jsx.
export const defaultInquiryType = { ko: '일반 자문 문의', en: 'General Advisory Inquiry' };

// Contact form copy (id: "contact"). Phase 3-C: submitting this form saves
// the inquiry directly to the database (supabase/migrations/0005_inquiries.sql)
// — see src/lib/inquiries.js and src/components/ContactForm.jsx. The direct
// mailto:/tel: links in the Contact section's info panel (src/lib/content/contactInfo.js)
// remain as a secondary contact method, independent of this form.
export const contactForm = {
  labels: {
    name: { ko: '이름', en: 'Name' },
    company: { ko: '회사', en: 'Company' },
    email: { ko: '이메일', en: 'Email' },
    inquiryType: { ko: '문의 유형', en: 'Type of Inquiry' },
    // Advisory Sales repositioning: relabeled from a generic "메시지"
    // field to name the exact thing this form asks for — the visitor's
    // current business problem — matching Contact.jsx's simplified
    // 4-field form (name / company / email / this field).
    message: { ko: '지금 가장 고민하고 있는 문제', en: 'Current Business Challenge' },
  },
  inquiryPlaceholderKo: '유형을 선택해주세요',
  inquiryPlaceholderEn: 'Select an inquiry type',
  submitKo: '문의 보내기',
  submitEn: 'Send Inquiry',
  sendingKo: '전송 중…',
  sendingEn: 'Sending…',
  successKo: '문의가 정상적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',
  successEn: 'Your inquiry has been received. We will get back to you shortly.',
  errorKo: '전송에 실패했습니다. 잠시 후 다시 시도해주세요.',
  errorEn: 'Something went wrong. Please try again in a moment.',
  requiredKo: '필수 입력 항목입니다.',
  requiredEn: 'This field is required.',
  invalidEmailKo: '올바른 이메일 주소를 입력해주세요.',
  invalidEmailEn: 'Please enter a valid email address.',
  noteKo: '입력하신 정보는 문의 응대 목적으로만 사용됩니다. 자세한 개인정보처리방침은 추후 별도로 안내드릴 예정입니다.',
  noteEn: 'Your information is used only to respond to this inquiry. A full privacy policy will be provided separately.',
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
  challenge,
  advisorySection,
  advisoryProducts,
  howWeWork,
  targetClientsSection,
  targetClients,
  peAdvisory,
  insightsSection,
  insights,
  career,
  careerSection,
  education,
  gallery,
  gallerySection,
  contactCta,
  inquiryTypes,
  defaultInquiryType,
  contactForm,
  footer,
  images,
};

export default profile;
