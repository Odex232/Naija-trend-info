export type Role = 'Super Admin' | 'Admin' | 'Senior Editor' | 'Editor' | 'Author' | 'Reporter' | 'Contributor' | 'Advert Manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  bio?: string;
  phone?: string;
  createdAt: string;
  password?: string;
  lastPasswordChangedAt?: string;
}

export type ArticleStatus = 'published' | 'draft' | 'scheduled' | 'archived';

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  featuredImage: string;
  imageCaption?: string;
  imageCredit?: string;
  galleryImages?: string[];
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  status: ArticleStatus;
  isFeatured: boolean;
  isPinned: boolean;
  isBreaking: boolean;
  isEditorPick: boolean;
  views: number;
  readTimeMinutes: number;
  publishedAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  order: number;
  isVisible: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface BreakingNews {
  id: string;
  title: string;
  linkUrl?: string;
  articleId?: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export type AdType = 'google_adsense' | 'adsterra' | 'custom';

export interface Ad {
  id: string;
  name: string;
  type: AdType;
  publisherId?: string; // AdSense
  adUnitId?: string; // AdSense
  adCode?: string; // Raw HTML / Adsterra / AdSense
  bannerUrl?: string; // Custom
  destinationUrl?: string; // Custom
  advertiserName?: string; // Custom
  campaignName?: string;
  startDate?: string;
  endDate?: string;
  desktopVisible: boolean;
  mobileVisible: boolean;
  isActive: boolean;
  impressions: number;
  clicks: number;
}

export type PlacementPosition =
  | 'Header'
  | 'Top Homepage'
  | 'Below Breaking News'
  | 'Below Hero Section'
  | 'Homepage Content'
  | 'Between Articles'
  | 'Sidebar Top'
  | 'Sidebar Middle'
  | 'Sidebar Bottom'
  | 'Before Article'
  | 'After First Paragraph'
  | 'Middle of Article'
  | 'Before Related Articles'
  | 'After Article'
  | 'Footer'
  | 'Mobile Sticky';

export interface AdPlacement {
  id: string;
  position: PlacementPosition;
  adId?: string; // Selected Ad ID
  networkType: 'google_adsense' | 'adsterra' | 'custom' | 'disabled';
  deviceTarget: 'all' | 'mobile' | 'desktop';
}

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number; // bytes
  uploadedAt: string;
  title?: string;
  description?: string;
  altText?: string;
  caption?: string;
  dimensions?: string;
  uploadedBy?: string;
  fileType?: 'image' | 'video' | 'audio' | 'document' | 'office' | 'archive' | 'other';
  isPublished?: boolean;
  downloadCount?: number;
  storagePath?: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  articleId: string;
  articleTitle?: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export interface NewsSubmission {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  title: string;
  content: string;
  mediaUrl?: string;
  supportingLinks?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  status?: 'new' | 'read' | 'replied' | 'archived' | 'resolved';
  replyNotes?: string;
  repliedAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  targetTab?: '_self' | '_blank';
  status?: 'draft' | 'published' | 'unpublished';
  order: number;
  isActive: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SitePage {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  socialSharingImage?: string;
  customUrl?: string;
  authorName?: string;
  status: 'draft' | 'published' | 'unpublished';
  visibility: 'public' | 'private' | 'password';
  navigationPlacement?: 'header' | 'footer' | 'both' | 'none';
  publishedAt?: string;
  updatedAt?: string;
  isArchived?: boolean;
}

export interface PageVersion {
  id: string;
  pageId: string;
  title: string;
  content: string;
  updatedBy: string;
  createdAt: string;
}

export interface EditorialDeskEntry {
  id: string;
  department: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  order?: number;
  isActive?: boolean;
}

export interface CookieSettings {
  enabled: boolean;
  bannerText: string;
  acceptButtonText: string;
  rejectButtonText: string;
  settingsButtonText: string;
  privacyPolicyUrl: string;
  cookiePolicyUrl: string;
  position: 'bottom' | 'bottom-left' | 'bottom-right' | 'top';
}

export interface AdvertisingPackage {
  id: string;
  name: string;
  price: string;
  bannerSize: string;
  description: string;
  features: string[];
  isActive: boolean;
  order?: number;
}

export interface FooterSettings {
  quickLinksVisible: boolean;
  categoriesVisible: boolean;
  editorialDeskVisible: boolean;
  socialLinksVisible: boolean;
  newsletterVisible: boolean;
  copyrightText: string;
  footerDescription: string;
}

export interface InformationEntry {
  id: string;
  title: string;
  content: string;
  key: string;
}

export interface SocialMediaLink {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'tiktok' | 'telegram' | 'whatsapp' | 'linkedin' | 'pinterest' | 'snapchat' | 'threads' | string;
  url: string;
  displayName?: string;
  icon?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EconomicIndexSettings {
  showTopTicker: boolean;
  usdNgnRate: string;
  ngxIndex: string;
  showEconomicWidget: boolean;
  widgetTitle: string;
  widgetSource: string;
  officialRate: string;
  parallelRate: string;
  petrolPrice: string;
  inflationRate: string;
}

export interface SportsHubSettings {
  showLiveScoreboardWidget: boolean;
  featuredLeague: string;
  enableTransferTicker: boolean;
  widgetTitle: string;
}

export interface ContactPageSettings {
  pageTitle?: string;
  pageSubtitle?: string;
  officeAddress?: string;
  bureauLocations?: string[];
  contactEmail?: string;
  pressInquiriesEmail?: string;
  advertEmail?: string;
  contactPhone?: string;
  whatsappSupport?: string;
  workingHours?: string;
  enableNewsTipAlert?: boolean;
  newsTipBannerText?: string;
}

export interface EditorialCorrespondentSettings {
  correspondentName: string;
  avatarUrl: string;
  role: string;
  department: string;
  email: string;
  phone?: string;
  bio?: string;
  updatedAt?: string;
}

export interface WebsiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logoUrl: string;
  faviconUrl: string;
  copyrightText: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  timeZone: string;
  language: string;
  googleAdsensePubId: string;
  adsterraSmartlinkUrl?: string;
  analyticsId?: string;
  economicIndex?: EconomicIndexSettings;
  sportsHub?: SportsHubSettings;
  contactPage?: ContactPageSettings;
  editorialCorrespondent?: EditorialCorrespondentSettings;
}

export interface AuditLog {
  id: string;
  userEmail: string;
  userName: string;
  action: string;
  details: string;
  resource: string;
  ipAddress?: string;
  createdAt: string;
}

export interface SportsFixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'LIVE' | 'FINISHED' | 'UPCOMING';
  minute?: string;
  league: string;
  matchDate: string;
  venue?: string;
  isPublished?: boolean;
}

export interface DailyTrafficPoint {
  date: string;
  label: string;
  pageviews: number;
  uniqueVisitors: number;
  avgDurationSeconds: number;
  bounceRate: number;
}

export interface HourlyTrafficPoint {
  hour: string;
  pageviews: number;
  uniqueVisitors: number;
}

export interface GeoTrafficItem {
  location: string;
  stateOrCountry: string;
  region: 'Nigeria' | 'Diaspora / Global';
  visitors: number;
  pageviews: number;
  percentage: number;
}

export interface DeviceTrafficItem {
  device: string;
  visitors: number;
  pageviews: number;
  percentage: number;
  iconName?: string;
}

export interface BrowserTrafficItem {
  browser: string;
  visitors: number;
  pageviews: number;
  percentage: number;
}

export interface TrafficSourceItem {
  source: string;
  category: 'Search Engine' | 'Social Media' | 'Direct / Bookmark' | 'Messaging App' | 'News Aggregator';
  visitors: number;
  pageviews: number;
  percentage: number;
}

export interface LiveSessionEvent {
  id: string;
  path: string;
  title: string;
  articleId?: string;
  category?: string;
  location: string;
  device: string;
  browser: string;
  ip?: string;
  timestamp: string;
  timeAgo?: string;
}

export interface CategoryTrafficItem {
  categoryId: string;
  categoryName: string;
  articlesCount: number;
  totalViews: number;
  percentage: number;
  color?: string;
}

export interface ArticlePerformanceItem {
  id: string;
  title: string;
  slug: string;
  categoryName: string;
  views: number;
  uniqueReaders: number;
  avgReadTimeSeconds: number;
  shareCount: number;
  publishedAt: string;
}

export interface WebsiteAnalyticsData {
  totalPageviews: number;
  totalUniqueVisitors: number;
  activeLiveReaders: number;
  avgReadTimeSeconds: number;
  avgBounceRate: number;
  mobileTrafficShare: number;
  period: 'today' | '7d' | '30d' | '90d' | 'all';
  growth: {
    pageviewsGrowth: number;
    visitorsGrowth: number;
    readTimeGrowth: number;
    bounceRateChange: number;
  };
  dailyTrend: DailyTrafficPoint[];
  hourlyTrend: HourlyTrafficPoint[];
  categoryPerformance: CategoryTrafficItem[];
  deviceBreakdown: DeviceTrafficItem[];
  browserBreakdown: BrowserTrafficItem[];
  trafficSources: TrafficSourceItem[];
  geoBreakdown: GeoTrafficItem[];
  topArticles: ArticlePerformanceItem[];
  liveVisitorFeed: LiveSessionEvent[];
  lastUpdated: string;
}

