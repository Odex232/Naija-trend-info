import {
  Article,
  Category,
  BreakingNews,
  Ad,
  AdPlacement,
  WebsiteSettings,
  SocialMediaLink,
  QuickLink,
  EditorialDeskEntry,
  InformationEntry,
  User,
  SportsFixture
} from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Nigeria', slug: 'nigeria', description: 'National news and headline stories across Nigeria', order: 1, isVisible: true, icon: 'Flag' },
  { id: 'cat-2', name: 'Politics', slug: 'politics', description: 'Governance, elections, presidency, National Assembly, political parties', order: 2, isVisible: true, icon: 'Landmark' },
  { id: 'cat-3', name: 'Metro', slug: 'metro', description: 'City life, state affairs, security, police updates, local happenings', order: 3, isVisible: true, icon: 'Building2' },
  { id: 'cat-4', name: 'Business', slug: 'business', description: 'Markets, corporate Nigeria, banking, investments, entrepreneurship', order: 4, isVisible: true, icon: 'Briefcase' },
  { id: 'cat-5', name: 'Economy', slug: 'economy', description: 'Inflation, Central Bank (CBN), Naira rates, GDP, fiscal policies', order: 5, isVisible: true, icon: 'TrendingUp' },
  { id: 'cat-6', name: 'Technology', slug: 'technology', description: 'Nigerian tech ecosystem, startups, AI, telecom, fintech, gadgets', order: 6, isVisible: true, icon: 'Cpu' },
  { id: 'cat-7', name: 'Education', slug: 'education', description: 'Universities, JAMB, WAEC, ASUU, educational policies and developments', order: 7, isVisible: true, icon: 'GraduationCap' },
  { id: 'cat-8', name: 'Health', slug: 'health', description: 'Medical research, healthcare system, wellness, disease prevention in Nigeria', order: 8, isVisible: true, icon: 'HeartPulse' },
  { id: 'cat-9', name: 'Sports', slug: 'sports', description: 'Nigerian and global sports coverage, NPFL, athletics, combat sports', order: 9, isVisible: true, icon: 'Trophy' },
  { id: 'cat-10', name: 'Football', slug: 'football', description: 'Super Eagles, English Premier League, Champions League, NPFL, transfers', order: 10, isVisible: true, icon: 'Activity' },
  { id: 'cat-11', name: 'Entertainment', slug: 'entertainment', description: 'Nollywood, Afrobeats, celebrity news, music releases, lifestyle', order: 11, isVisible: true, icon: 'Film' },
  { id: 'cat-12', name: 'Lifestyle', slug: 'lifestyle', description: 'Fashion, food, culture, relationship, travel, wellness in Nigeria', order: 12, isVisible: true, icon: 'Sparkles' },
  { id: 'cat-13', name: 'World News', slug: 'world-news', description: 'Global developments, African affairs, international diplomacy', order: 13, isVisible: true, icon: 'Globe' },
  { id: 'cat-14', name: 'Crime', slug: 'crime', description: 'Crime reports, security operations, law enforcement updates', order: 14, isVisible: true, icon: 'ShieldAlert' },
  { id: 'cat-15', name: 'Investigations', slug: 'investigations', description: 'Deep-dive investigative journalism, accountability reports', order: 15, isVisible: true, icon: 'Search' },
  { id: 'cat-16', name: 'Opinion', slug: 'opinion', description: 'Columnists, guest op-eds, commentary, perspectives', order: 16, isVisible: true, icon: 'MessageSquareText' },
  { id: 'cat-17', name: 'Editorial', slug: 'editorial', description: 'Official position of NaijaTrendiInfo editorial board', order: 17, isVisible: true, icon: 'Newspaper' },
  { id: 'cat-18', name: 'Agriculture', slug: 'agriculture', description: 'Farming, food security, agribusiness, rural economy', order: 18, isVisible: true, icon: 'Wheat' },
  { id: 'cat-19', name: 'Science', slug: 'science', description: 'Scientific discoveries, climate change, space, innovation', order: 19, isVisible: true, icon: 'Atom' },
  { id: 'cat-20', name: 'Travel', slug: 'travel', description: 'Tourism, aviation, destinations across Nigeria and Africa', order: 20, isVisible: true, icon: 'Plane' },
  { id: 'cat-21', name: 'Religion', slug: 'religion', description: 'Faith communities, interfaith dialogue, religious affairs', order: 21, isVisible: true, icon: 'BookOpen' },
  { id: 'cat-22', name: 'Trending', slug: 'trending', description: 'Viral stories, social media buzz, trending topics in Nigeria', order: 22, isVisible: true, icon: 'Zap' }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Ajayi Odunayo',
    email: 'Ajayiodunayo28@gmail.com',
    password: 'Habiodun1990',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    bio: 'Editor-in-Chief & Publisher of NaijaTrendiInfo. Veteran investigative journalist with over 15 years experience in West African media.',
    createdAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'usr-2',
    name: 'Amina Bello',
    email: 'amina.bello@naijatrendinfo.com.ng',
    role: 'Editor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    bio: 'Senior Political Editor covering the National Assembly and diplomatic desk in Abuja.',
    createdAt: '2025-01-15T09:30:00Z'
  },
  {
    id: 'usr-3',
    name: 'Tunde Adebayo',
    email: 'tunde.adebayo@naijatrendinfo.com.ng',
    role: 'Author',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    bio: 'Tech, Economy & Business Analyst based in Lagos hub.',
    createdAt: '2025-02-01T10:00:00Z'
  },
  {
    id: 'usr-4',
    name: 'Oluchi Nnamdi',
    email: 'oluchi.sports@naijatrendinfo.com.ng',
    role: 'Reporter',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=250',
    bio: 'Lead Sports Correspondent covering Super Eagles, NPFL, and global football leagues.',
    createdAt: '2025-02-10T11:15:00Z'
  }
];

export const INITIAL_BREAKING_NEWS: BreakingNews[] = [
  {
    id: 'bn-1',
    title: 'BREAKING: Central Bank of Nigeria Adjusts Key Policy Interest Rate to Support Economic Growth',
    linkUrl: '/article/cbn-monetary-policy-rate-update',
    isActive: true,
    createdAt: '2026-08-08T06:30:00Z'
  },
  {
    id: 'bn-2',
    title: 'Federal Government Unveils ₦1.5 Trillion Infrastructure Initiative for Railway Expansion across Southwest & North Central',
    linkUrl: '/article/fg-unveils-railway-infrastructure-boost',
    isActive: true,
    createdAt: '2026-08-08T05:15:00Z'
  },
  {
    id: 'bn-3',
    title: 'Super Eagles Set to Play Friendlies Ahead of World Cup Qualifiers in Lagos & Abuja',
    linkUrl: '/article/super-eagles-friendly-match-announcement',
    isActive: true,
    createdAt: '2026-08-08T04:00:00Z'
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'CBN Unveils New Financial Policy to Stabilize Foreign Exchange Rates and Boost Local Industry Growth',
    slug: 'cbn-monetary-policy-rate-update',
    summary: 'The Central Bank of Nigeria has announced new measures aimed at strengthening the Naira, attracting foreign direct investment, and easing import pressures on key manufacturing sectors.',
    content: `
      <p>The Central Bank of Nigeria (CBN) has officially released its updated macroeconomic strategy aimed at strengthening the Naira and curbing inflation across domestic markets. Speaking at a press conference in Abuja, the apex bank governor outlined pivotal reforms focused on foreign exchange market transparency, support for local manufacturers, and streamlined liquidity controls.</p>

      <h2>Key Highlights of the New Monetary Directive</h2>
      <p>Under the new guidelines, commercial banks are mandated to prioritize forex allocation to critical sectors including raw material processing, agricultural machinery, and healthcare supply chains. Financial analysts in Lagos have welcomed the move as a timely intervention to boost industrial output and lower cost of living pressures.</p>

      <blockquote>"Our goal is sustained economic stability, ensuring that domestic enterprises receive required foreign exchange access without unnecessary speculative friction," stated the apex bank governor.</blockquote>

      <h2>Reactions from Manufacturers Association of Nigeria (MAN)</h2>
      <p>Representing indigenous businesses, the Manufacturers Association of Nigeria praised the decision, highlighting that reduced forex volatility will enable better long-term capital planning and job creation across the six geopolitical zones.</p>

      <p>Market experts anticipate a positive rally on the Nigerian Exchange (NGX) as investor sentiment strengthens following the announced policy parameters.</p>
    `,
    categoryId: 'cat-5', // Economy
    categoryName: 'Economy',
    tags: ['CBN', 'Naira', 'Economy', 'Forex', 'Lagos', 'Abuja', 'NGX'],
    featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200',
    imageCaption: 'The Central Bank of Nigeria headquarters in Abuja.',
    imageCredit: 'NaijaTrendiInfo Photo Bureau',
    authorId: 'usr-3',
    authorName: 'Tunde Adebayo',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    status: 'published',
    isFeatured: true,
    isPinned: true,
    isBreaking: true,
    isEditorPick: true,
    views: 14250,
    readTimeMinutes: 4,
    publishedAt: '2026-08-08T06:30:00Z',
    updatedAt: '2026-08-08T06:30:00Z'
  },
  {
    id: 'art-2',
    title: 'National Assembly Approves Benchmark Budget Allocation for Educational Infrastructure and Teacher Development',
    slug: 'national-assembly-approves-education-budget-boost',
    summary: 'In a landmark legislative session, lawmakers voted overwhelmingly to expand funding for federal universities, polytechnics, and primary education digital training programs.',
    content: `
      <p>The Senate and House of Representatives have passed a historic supplementary bill granting increased budgetary allocation to the federal ministry of education. The funds are designated for upgrading campus laboratories, constructing modern lecture halls, and providing digital teaching tools for over 120 public tertiary institutions.</p>

      <h2>Modernizing Higher Education Facilities</h2>
      <p>In addition to physical infrastructure, the legislation allocates funding for nationwide faculty training in artificial intelligence, software engineering, and renewable energy research.</p>

      <p>Student union bodies across Nigeria expressed optimism regarding the swift release of capital allocations, noting that improved campus amenities will significantly enhance learning outcomes.</p>
    `,
    categoryId: 'cat-7', // Education
    categoryName: 'Education',
    tags: ['Education', 'National Assembly', 'Universities', 'ASUU', 'Abuja'],
    featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
    imageCaption: 'Students attending a lecture at a Nigerian federal university campus.',
    imageCredit: 'Education Desk',
    authorId: 'usr-2',
    authorName: 'Amina Bello',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    status: 'published',
    isFeatured: true,
    isPinned: false,
    isBreaking: false,
    isEditorPick: true,
    views: 8900,
    readTimeMinutes: 3,
    publishedAt: '2026-08-08T05:00:00Z',
    updatedAt: '2026-08-08T05:00:00Z'
  },
  {
    id: 'art-3',
    title: 'Lagos Tech Ecosystem Raises $250M in Q2 Funding Round as Nigerian AI & Fintech Startups Expand Globally',
    slug: 'lagos-tech-startups-raise-q2-funding',
    summary: 'Venture capital investments into Yaba and Victoria Island technology hubs surged in the second quarter, led by cross-border payment platforms and agricultural tech innovators.',
    content: `
      <p>Lagos continues to cement its reputation as Africa’s top tech innovation engine. A quarterly investment report released by West Africa Tech Review highlights that Nigerian startups secured over $250 million in seed and Series A funding despite global macroeconomic shifts.</p>

      <h2>Growth Driven by Fintech and Agritech Solutions</h2>
      <p>Leading the surge are platforms bridging international trade payments and supply chain platforms empowering rural smallholder farmers with satellite crop monitoring.</p>
    `,
    categoryId: 'cat-6', // Technology
    categoryName: 'Technology',
    tags: ['Tech', 'Lagos', 'Startups', 'Fintech', 'AI', 'Yaba'],
    featuredImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200',
    imageCaption: 'Engineers collaborating at a tech innovation hub in Victoria Island, Lagos.',
    imageCredit: 'Tech Africa Media',
    authorId: 'usr-3',
    authorName: 'Tunde Adebayo',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    status: 'published',
    isFeatured: true,
    isPinned: false,
    isBreaking: false,
    isEditorPick: false,
    views: 11200,
    readTimeMinutes: 5,
    publishedAt: '2026-08-07T18:45:00Z',
    updatedAt: '2026-08-07T18:45:00Z'
  },
  {
    id: 'art-4',
    title: 'Super Eagles Coach Names 25-Man Squad for Upcoming World Cup Qualifier Match against Rivals',
    slug: 'super-eagles-friendly-match-announcement',
    summary: 'The Nigeria Football Federation (NFF) has published the official player roster featuring top European league stars alongside standout NPFL talents.',
    content: `
      <p>Nigeria's national football team head coach has officially unveiled a strong 25-player roster for the crucial World Cup qualifying double-header scheduled for later this month at the Godswill Akpabio International Stadium in Uyo.</p>

      <h2>Squad Mix Features In-Form European Strikers and NPFL Defenders</h2>
      <p>The squad includes high-profile Goalscorers performing exceptionally in Serie A, Premier League, and Bundesliga, supported by top defenders selected directly from the Nigerian Premier Football League (NPFL).</p>
    `,
    categoryId: 'cat-10', // Football
    categoryName: 'Football',
    tags: ['Super Eagles', 'NFF', 'Sports', 'Football', 'Uyo', 'NPFL'],
    featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200',
    imageCaption: 'Super Eagles players celebrating a goal in international competition.',
    imageCredit: 'Sports Desk',
    authorId: 'usr-4',
    authorName: 'Oluchi Nnamdi',
    authorAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=250',
    status: 'published',
    isFeatured: true,
    isPinned: false,
    isBreaking: false,
    isEditorPick: true,
    views: 19500,
    readTimeMinutes: 3,
    publishedAt: '2026-08-07T14:20:00Z',
    updatedAt: '2026-08-07T14:20:00Z'
  },
  {
    id: 'art-5',
    title: 'Nollywood Blockbuster Breaks Box Office Records across West Africa with Record Opening Weekend Revenue',
    slug: 'nollywood-blockbuster-breaks-box-office-records',
    summary: 'The acclaimed cinematic epic directed by prominent Nigerian filmmakers has achieved unprecedented viewership across cinemas in Lagos, Abuja, Accra, and London.',
    content: `
      <p>Nollywood continues its impressive global box office trajectory as the newly released historical drama smashed opening weekend sales records across West Africa and international diaspora screens.</p>
    `,
    categoryId: 'cat-11', // Entertainment
    categoryName: 'Entertainment',
    tags: ['Nollywood', 'Entertainment', 'Cinemas', 'Afrobeats', 'Lagos'],
    featuredImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200',
    imageCaption: 'Premiere night red carpet event celebrating Nigerian cinema.',
    imageCredit: 'Entertainment Desk',
    authorId: 'usr-1',
    authorName: 'Chidubem Okechukwu',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    status: 'published',
    isFeatured: false,
    isPinned: false,
    isBreaking: false,
    isEditorPick: true,
    views: 7400,
    readTimeMinutes: 3,
    publishedAt: '2026-08-07T11:10:00Z',
    updatedAt: '2026-08-07T11:10:00Z'
  },
  {
    id: 'art-6',
    title: 'Federal Ministry of Health Launches Nationwide Preventative Wellness Campaign Targeting Rural Communities',
    slug: 'federal-ministry-of-health-wellness-campaign',
    summary: 'Mobile healthcare clinics and free medical screening units have commenced deployment across 36 states to strengthen healthcare access and maternal health outcomes.',
    content: `
      <p>The Federal Ministry of Health has officially flagged off a comprehensive healthcare outreach program designed to bring preventive screenings, vaccinations, and essential medicines directly to underserved communities.</p>
    `,
    categoryId: 'cat-8', // Health
    categoryName: 'Health',
    tags: ['Health', 'Nigeria', 'Healthcare', 'Wellness', 'Abuja'],
    featuredImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200',
    imageCaption: 'Medical personnel conducting health checkups during the nationwide campaign.',
    imageCredit: 'Health Bureau',
    authorId: 'usr-2',
    authorName: 'Amina Bello',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    status: 'published',
    isFeatured: false,
    isPinned: false,
    isBreaking: false,
    isEditorPick: false,
    views: 5300,
    readTimeMinutes: 4,
    publishedAt: '2026-08-06T16:00:00Z',
    updatedAt: '2026-08-06T16:00:00Z'
  }
];

export const INITIAL_SPORTS_FIXTURES: SportsFixture[] = [
  {
    id: 'fix-1',
    homeTeam: 'Enyimba FC',
    awayTeam: 'Rangers International',
    homeScore: 2,
    awayScore: 1,
    status: 'LIVE',
    minute: "78'",
    league: 'NPFL (Nigerian Premier Football League)',
    matchDate: '2026-08-08T16:00:00Z',
    venue: 'Enyimba International Stadium, Aba'
  },
  {
    id: 'fix-2',
    homeTeam: 'Rivers United',
    awayTeam: 'Lobi Stars',
    homeScore: 1,
    awayScore: 0,
    status: 'FINISHED',
    league: 'NPFL (Nigerian Premier Football League)',
    matchDate: '2026-08-08T14:00:00Z',
    venue: 'Adokiye Amiesimaka Stadium, Port Harcourt'
  },
  {
    id: 'fix-3',
    homeTeam: 'Nigeria (Super Eagles)',
    awayTeam: 'Ghana (Black Stars)',
    status: 'UPCOMING',
    league: 'International Friendly',
    matchDate: '2026-08-15T17:00:00Z',
    venue: 'Godswill Akpabio International Stadium, Uyo'
  },
  {
    id: 'fix-4',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    homeScore: 3,
    awayScore: 2,
    status: 'FINISHED',
    league: 'English Premier League',
    matchDate: '2026-08-07T19:00:00Z',
    venue: 'Emirates Stadium, London'
  }
];

export const INITIAL_ADS: Ad[] = [
  {
    id: 'ad-1',
    name: 'Top Leaderboard Custom Campaign - Premium Telecom',
    type: 'custom',
    bannerUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200&h=200',
    destinationUrl: 'https://naijatrendinfo.com.ng/advertise-with-us',
    advertiserName: 'NextGen 5G Telecoms',
    campaignName: 'Connect Nigeria 2026',
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    desktopVisible: true,
    mobileVisible: true,
    isActive: true,
    impressions: 42100,
    clicks: 1840
  },
  {
    id: 'ad-2',
    name: 'Google AdSense Auto Responsive Banner',
    type: 'google_adsense',
    publisherId: 'ca-pub-1234567890123456',
    adUnitId: '9876543210',
    adCode: '<div style="padding:15px; background:#f0fdf4; border:1px solid #bbf7d0; text-align:center; color:#166534; font-weight:600; border-radius:8px;">[ Google AdSense Responsive Display Unit - ca-pub-1234567890123456 ]</div>',
    desktopVisible: true,
    mobileVisible: true,
    isActive: true,
    impressions: 115000,
    clicks: 3420
  },
  {
    id: 'ad-3',
    name: 'Adsterra Social Bar & Native Banner',
    type: 'adsterra',
    adCode: '<div style="padding:15px; background:#fef3c7; border:1px solid #fde68a; text-align:center; color:#92400e; font-weight:600; border-radius:8px;">[ Adsterra Native Ad Banner Widget - Managed via Ads Manager ]</div>',
    desktopVisible: true,
    mobileVisible: true,
    isActive: true,
    impressions: 89000,
    clicks: 2980
  }
];

export const INITIAL_AD_PLACEMENTS: AdPlacement[] = [
  { id: 'place-1', position: 'Header', adId: 'ad-1', networkType: 'custom', deviceTarget: 'all' },
  { id: 'place-2', position: 'Below Breaking News', adId: 'ad-2', networkType: 'google_adsense', deviceTarget: 'all' },
  { id: 'place-3', position: 'Sidebar Top', adId: 'ad-3', networkType: 'adsterra', deviceTarget: 'desktop' },
  { id: 'place-4', position: 'Between Articles', adId: 'ad-2', networkType: 'google_adsense', deviceTarget: 'all' },
  { id: 'place-5', position: 'Middle of Article', adId: 'ad-1', networkType: 'custom', deviceTarget: 'all' },
  { id: 'place-6', position: 'Mobile Sticky', adId: 'ad-3', networkType: 'adsterra', deviceTarget: 'mobile' }
];

export const INITIAL_SETTINGS: WebsiteSettings = {
  siteName: 'NaijaTrendiInfo',
  siteDescription: 'Nigeria’s premier digital platform for breaking news, political analysis, business insights, sports, entertainment, and investigative reporting.',
  siteUrl: 'https://naijatrendinfo.com.ng',
  logoUrl: '',
  faviconUrl: '',
  copyrightText: '© 2026 NaijaTrendiInfo Media Group. All rights reserved.',
  contactEmail: 'contact@naijatrendinfo.com.ng',
  contactPhone: '+234 803 123 4567',
  officeAddress: '14 Broad Street, Marina, Lagos State / Plot 502 Central Business District, Abuja, Nigeria',
  timeZone: 'Africa/Lagos (GMT+1)',
  language: 'English (NG)',
  googleAdsensePubId: 'ca-pub-1234567890123456',
  adsterraSmartlinkUrl: 'https://adsterra.example.com/smartlink-naijatrendiinfo',
  analyticsId: 'G-NAIJA2026TREND',
  economicIndex: {
    showTopTicker: true,
    usdNgnRate: '₦1,485.50',
    ngxIndex: '+0.42%',
    showEconomicWidget: true,
    widgetTitle: 'Nigeria Economic Index',
    widgetSource: 'CBN / NNPC',
    officialRate: '₦1,485.50',
    parallelRate: '₦1,510.00',
    petrolPrice: '₦895 / L',
    inflationRate: '22.8%'
  }
};

export const INITIAL_SOCIAL_LINKS: SocialMediaLink[] = [
  { id: 'soc-1', platform: 'facebook', url: 'https://facebook.com/NaijaTrendiInfo', isActive: true, order: 1 },
  { id: 'soc-2', platform: 'twitter', url: 'https://twitter.com/NaijaTrendiInfo', isActive: true, order: 2 },
  { id: 'soc-3', platform: 'instagram', url: 'https://instagram.com/NaijaTrendiInfo', isActive: true, order: 3 },
  { id: 'soc-4', platform: 'youtube', url: 'https://youtube.com/c/NaijaTrendiInfoTV', isActive: true, order: 4 },
  { id: 'soc-5', platform: 'telegram', url: 'https://t.me/NaijaTrendiInfoNews', isActive: true, order: 5 },
  { id: 'soc-6', platform: 'whatsapp', url: 'https://whatsapp.com/channel/NaijaTrendiInfoChannel', isActive: true, order: 6 }
];

export const INITIAL_QUICK_LINKS: QuickLink[] = [
  { id: 'ql-1', title: 'Breaking News Ticker', url: '/breaking-news', description: 'Real-time breaking updates and urgent headlines ticker', icon: 'Zap', targetTab: '_self', status: 'published', order: 1, isActive: true },
  { id: 'ql-2', title: 'Live Sports & NPFL Scores', url: '/sports', description: 'NPFL matches, Super Eagles scores, and live football coverage', icon: 'Trophy', targetTab: '_self', status: 'published', order: 2, isActive: true },
  { id: 'ql-3', title: 'Politics & Governance', url: '/category/politics', description: 'National Assembly, presidency, election news, and governance', icon: 'Landmark', targetTab: '_self', status: 'published', order: 3, isActive: true },
  { id: 'ql-4', title: 'Submit News Tip', url: '/submit-news', description: 'Send confidential story tips, images, or documents to our investigative desk', icon: 'Send', targetTab: '_self', status: 'published', order: 4, isActive: true },
  { id: 'ql-5', title: 'Advertise With Us', url: '/advertise-with-us', description: 'Explore banner placement, sponsored posts, and media advert packages', icon: 'Megaphone', targetTab: '_self', status: 'published', order: 5, isActive: true },
  { id: 'ql-6', title: 'NaijaTrendiInfo Editorial Desk', url: '/editorial-desk', description: 'Meet our editors, correspondents, and view editorial guidelines', icon: 'Users', targetTab: '_self', status: 'published', order: 6, isActive: true },
  { id: 'ql-7', title: 'About Us', url: '/about-us', description: 'Learn about our mission, history, and independent journalism values', icon: 'Info', targetTab: '_self', status: 'published', order: 7, isActive: true },
  { id: 'ql-8', title: 'Contact Us & Feedback', url: '/contact', description: 'Get in touch with our Lagos & Abuja offices or send feedback', icon: 'Mail', targetTab: '_self', status: 'published', order: 8, isActive: true },
  { id: 'ql-9', title: 'Privacy Policy', url: '/privacy-policy', description: 'Our commitment to data protection and user privacy rights', icon: 'ShieldCheck', targetTab: '_self', status: 'published', order: 9, isActive: true },
  { id: 'ql-10', title: 'Terms of Service', url: '/terms-of-service', description: 'Terms and conditions governing the use of NaijaTrendiInfo', icon: 'FileText', targetTab: '_self', status: 'published', order: 10, isActive: true },
  { id: 'ql-11', title: 'Disclaimer', url: '/disclaimer', description: 'General content disclaimer and copyright notices', icon: 'AlertTriangle', targetTab: '_self', status: 'published', order: 11, isActive: true },
  { id: 'ql-12', title: 'Cookie Policy', url: '/cookie-policy', description: 'Information about how we use cookies and tracking technologies', icon: 'Cookie', targetTab: '_self', status: 'published', order: 12, isActive: true }
];

export const INITIAL_PAGES = [
  {
    id: 'page-about',
    title: 'About Us',
    slug: 'about-us',
    content: `<h2>About NaijaTrendiInfo</h2><p>NaijaTrendiInfo is an independent, non-partisan Nigerian digital news, media, and investigative journalism platform dedicated to delivering fast, accurate, unbiased, and credible news from across the 36 states of Nigeria and around the globe.</p><h3>Our Editorial Mission</h3><p>Founded with the pledge to deliver accurate, non-partisan, fast, and transparent media, NaijaTrendiInfo operates state bureaus across Lagos, Abuja, Port Harcourt, Enugu, and Kano. We report politics, economy, crime, technology, entertainment, and sports with rigorous verification.</p>`,
    description: 'Learn about NaijaTrendiInfo mission, history, and independent journalism values in Nigeria.',
    seoTitle: 'About Us | NaijaTrendiInfo - Nigeria News Platform',
    seoDescription: 'NaijaTrendiInfo is Nigeria’s premier digital platform for breaking news, political analysis, business insights, sports, and investigative journalism.',
    seoKeywords: 'NaijaTrendiInfo, About Us, Nigerian News, Lagos Bureau, Abuja Bureau, Investigative Journalism',
    authorName: 'Ajayi Odunayo',
    status: 'published',
    visibility: 'public',
    navigationPlacement: 'footer',
    publishedAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-08T10:00:00Z'
  },
  {
    id: 'page-advertise',
    title: 'Advertise With Us',
    slug: 'advertise-with-us',
    content: `<h2>Advertise With NaijaTrendiInfo</h2><p>NaijaTrendiInfo reaches millions of engaged readers, business executives, policymakers, tech founders, and diaspora Nigerians daily across our digital channels.</p><h3>Custom Advertising Solutions</h3><ul><li><strong>High-Impact Header & Homepage Banners:</strong> Maximize visibility with premium top-of-page placements.</li><li><strong>Sponsored Articles & Native Content:</strong> Share your brand narrative through customized editorial features.</li><li><strong>Newsletter & Social Amplification:</strong> Engage our verified subscribers across WhatsApp, Telegram, and Social Media.</li></ul><p>For custom campaign rates and media kits, contact our advert team at <strong>advertise@naijatrendinfo.com.ng</strong> or call <strong>+234 803 123 4567</strong>.</p>`,
    description: 'Explore banner advertising, sponsored articles, and partnership packages with NaijaTrendiInfo.',
    seoTitle: 'Advertise With Us | NaijaTrendiInfo Brand Media Kits',
    seoDescription: 'Reach millions of Nigerian consumers, decision makers, and diaspora audience through high-converting ad packages on NaijaTrendiInfo.',
    seoKeywords: 'Advertise in Nigeria, NaijaTrendiInfo Ad Rates, Banner Ads Nigeria, Sponsored Posts Lagos, Media Partnership',
    authorName: 'Admin Desk',
    status: 'published',
    visibility: 'public',
    navigationPlacement: 'both',
    publishedAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-08T10:00:00Z'
  },
  {
    id: 'page-editorial',
    title: 'NaijaTrendiInfo Editorial Desk',
    slug: 'editorial-desk',
    content: `<h2>NaijaTrendiInfo Editorial Desk</h2><p>Our editorial team comprises veteran Nigerian journalists, bureau leads, political analysts, and investigative reporters across all geopolitical zones.</p><h3>Editorial Principles & Code of Ethics</h3><p>We adhere strictly to the Code of Ethics of the Nigerian Guild of Editors. Truth, factual accuracy, objectivity, independence, and accountability guide every published story.</p>`,
    description: 'Meet our editorial leadership, state bureau editors, and review our journalistic code of ethics.',
    seoTitle: 'Editorial Desk & Leadership | NaijaTrendiInfo',
    seoDescription: 'Discover the editors and correspondents powering truth and investigative reporting at NaijaTrendiInfo.',
    seoKeywords: 'Editorial Desk, Nigerian Journalists, Managing Editor, Lagos Newsroom, Abuja Bureau',
    authorName: 'Ajayi Odunayo',
    status: 'published',
    visibility: 'public',
    navigationPlacement: 'footer',
    publishedAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-08T10:00:00Z'
  },
  {
    id: 'page-privacy',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: `<h2>Privacy Policy</h2><p>At NaijaTrendiInfo Media Group, accessible from https://naijatrendinfo.com.ng, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information collected and how it is protected.</p><h3>1. Information We Collect</h3><p>We collect information you voluntarily provide through contact forms, news tip submissions, or newsletter subscriptions (such as name, email address, and phone number).</p><h3>2. Cookie Usage & Analytics</h3><p>NaijaTrendiInfo uses standard browser cookies and analytics scripts to analyze traffic trends and deliver personalized content or non-intrusive advertisements.</p><h3>3. Data Protection Rights</h3><p>Under Nigerian Data Protection Regulations (NDPR), users have the right to request access, correction, or deletion of their personal data.</p>`,
    description: 'NaijaTrendiInfo official Privacy Policy and data protection compliance details.',
    seoTitle: 'Privacy Policy | NaijaTrendiInfo NDPR Compliance',
    seoDescription: 'Read how NaijaTrendiInfo protects visitor privacy and complies with Nigerian Data Protection Regulations.',
    seoKeywords: 'Privacy Policy, NDPR Compliance, Data Protection Nigeria, Cookie Usage',
    authorName: 'Legal Desk',
    status: 'published',
    visibility: 'public',
    navigationPlacement: 'footer',
    publishedAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-08T10:00:00Z'
  },
  {
    id: 'page-terms',
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: `<h2>Terms of Service</h2><p>Welcome to NaijaTrendiInfo! By accessing or using our website, mobile interface, or RSS feeds, you agree to comply with and be bound by the following terms and conditions.</p><h3>1. Intellectual Property</h3><p>All news reports, graphics, original photographs, and branding elements published on NaijaTrendiInfo are protected by copyright laws of the Federal Republic of Nigeria.</p><h3>2. User Comments & Community Rules</h3><p>Users are expected to refrain from posting defamatory, hate speech, or unlawful commentary. We reserve the right to moderate or delete violating comments.</p>`,
    description: 'Terms and conditions governing the use of NaijaTrendiInfo digital platform.',
    seoTitle: 'Terms of Service | NaijaTrendiInfo Legal Guidelines',
    seoDescription: 'Official terms and conditions governing reader access, user comments, and content usage on NaijaTrendiInfo.',
    seoKeywords: 'Terms of Service, User Agreement, Copyright Notice, Comment Policy',
    authorName: 'Legal Desk',
    status: 'published',
    visibility: 'public',
    navigationPlacement: 'footer',
    publishedAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-08T10:00:00Z'
  },
  {
    id: 'page-disclaimer',
    title: 'Disclaimer',
    slug: 'disclaimer',
    content: `<h2>General Content Disclaimer</h2><p>The information provided by NaijaTrendiInfo on https://naijatrendinfo.com.ng is for general informational and news reporting purposes only. All information is provided in good faith with thorough editorial verification.</p><h3>External Links Disclaimer</h3><p>Our articles may contain links to third-party websites or external resources. NaijaTrendiInfo does not endorse or assume responsibility for content hosted on third-party domains.</p>`,
    description: 'General content disclaimer and copyright notices for NaijaTrendiInfo.',
    seoTitle: 'General Disclaimer | NaijaTrendiInfo',
    seoDescription: 'Editorial disclaimer regarding news reporting accuracy and external resource links on NaijaTrendiInfo.',
    seoKeywords: 'Disclaimer, News Verification, External Links, Content Notice',
    authorName: 'Legal Desk',
    status: 'published',
    visibility: 'public',
    navigationPlacement: 'footer',
    publishedAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-08T10:00:00Z'
  },
  {
    id: 'page-cookie',
    title: 'Cookie Policy',
    slug: 'cookie-policy',
    content: `<h2>Cookie Policy</h2><p>NaijaTrendiInfo uses cookies and related web tracking technologies to enhance user browsing experience, remember site settings, and support essential advertisement networks.</p><h3>What Are Cookies?</h3><p>Cookies are small text files stored on your browser or mobile device when visiting a web application.</p><h3>Managing Your Preferences</h3><p>You can manage your cookie consent preferences at any time using our Cookie Consent Banner or browser settings.</p>`,
    description: 'Information regarding cookie usage and consent choices on NaijaTrendiInfo.',
    seoTitle: 'Cookie Policy | NaijaTrendiInfo Tracking & Consent',
    seoDescription: 'Learn how NaijaTrendiInfo uses browser cookies for analytics and advertising preferences.',
    seoKeywords: 'Cookie Policy, Cookie Consent, Tracking Technologies, Adsterra Cookies',
    authorName: 'Legal Desk',
    status: 'published',
    visibility: 'public',
    navigationPlacement: 'footer',
    publishedAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-08T10:00:00Z'
  }
];

export const INITIAL_COOKIE_SETTINGS = {
  enabled: true,
  bannerText: 'We use essential cookies and tracking technologies to optimize your news browsing experience, remember site settings, and serve relevant advertisements.',
  acceptButtonText: 'Accept All Cookies',
  rejectButtonText: 'Essential Only',
  settingsButtonText: 'Cookie Policy',
  privacyPolicyUrl: '/privacy-policy',
  cookiePolicyUrl: '/cookie-policy',
  position: 'bottom'
};

export const INITIAL_FOOTER_SETTINGS = {
  quickLinksVisible: true,
  categoriesVisible: true,
  editorialDeskVisible: true,
  socialLinksVisible: true,
  newsletterVisible: true,
  copyrightText: '© 2026 NaijaTrendiInfo Media Group. All rights reserved.',
  footerDescription: 'Nigeria’s premier digital platform for breaking news, political analysis, business insights, sports, and investigative journalism.'
};

export const INITIAL_ADVERTISING_PACKAGES = [
  {
    id: 'pkg-1',
    name: 'Standard Leaderboard Banner',
    price: '₦250,000 / month',
    bannerSize: '728 x 90 px (Desktop) & 320 x 100 px (Mobile)',
    description: 'High visibility banner fixed at the header top across all pages.',
    features: ['Header placement on desktop & mobile', 'Real-time impression tracking', 'Direct CTA URL destination', 'Monthly performance report'],
    isActive: true,
    order: 1
  },
  {
    id: 'pkg-2',
    name: 'Sponsored Editorial Article',
    price: '₦400,000 / publication',
    bannerSize: 'Native Article Layout with Featured Image',
    description: 'In-depth native article or brand spotlight written or published by our desk.',
    features: ['Pinned on homepage for 72 hours', 'Indexed in news categories & search', 'Social media broadcast on Facebook/X', 'Permanent archival in database'],
    isActive: true,
    order: 2
  },
  {
    id: 'pkg-3',
    name: 'Sidebar Sticky Billboard',
    price: '₦180,000 / month',
    bannerSize: '300 x 600 px or 300 x 250 px',
    description: 'Persistent sidebar banner accompanying article readers down the page.',
    features: ['High engagement CTR', 'Mobile & desktop sidebar placement', 'Custom campaign scheduling'],
    isActive: true,
    order: 3
  }
];

export const INITIAL_EDITORIAL_DESK: EditorialDeskEntry[] = [
  { id: 'ed-1', department: 'Editor-in-Chief', name: 'Ajayi Odunayo', role: 'Executive Managing Editor & Publisher', email: 'editor@naijatrendinfo.com.ng', phone: '+234 803 111 2233', bio: 'Veteran investigative journalist with 15+ years experience in Nigerian media.', isActive: true },
  { id: 'ed-2', department: 'Politics & State House', name: 'Amina Bello', role: 'Abuja Bureau Chief', email: 'politics@naijatrendinfo.com.ng', phone: '+234 803 444 5566', bio: 'Senior political correspondent leading National Assembly & Villa reporting.', isActive: true },
  { id: 'ed-3', department: 'Business & Economy', name: 'Tunde Adebayo', role: 'Senior Financial Desk Lead', email: 'business@naijatrendinfo.com.ng', phone: '+234 803 777 8899', bio: 'Lagos-based financial analyst covering CBN, NGX, and corporate Nigeria.', isActive: true },
  { id: 'ed-4', department: 'Sports Desk', name: 'Oluchi Nnamdi', role: 'Chief Sports Correspondent', email: 'sports@naijatrendinfo.com.ng', phone: '+234 803 999 0011', bio: 'Leading coverage on NPFL, Super Eagles, and global football.', isActive: true }
];

export const INITIAL_INFORMATION: InformationEntry[] = [
  { id: 'info-1', key: 'about', title: 'About NaijaTrendiInfo', content: 'NaijaTrendiInfo is an independent, non-partisan Nigerian digital news, media, and investigative journalism platform dedicated to delivering fast, accurate, unbiased, and credible news from across the 36 states of Nigeria and around the globe.' },
  { id: 'info-2', key: 'ethics', title: 'Editorial Ethics & Journalism Policy', content: 'We adhere strictly to the Code of Ethics of the Nigerian Guild of Editors and international journalism standards. Fairness, balance, truthfulness, and verified sourcing are the cornerstones of our reporting.' },
  { id: 'info-3', key: 'ad_policy', title: 'Advertising Policy', content: 'We maintain clear separation between editorial decision-making and commercial advertisements. Sponsored content and custom brand partnerships are explicitly labeled for audience transparency.' }
];
