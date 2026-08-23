import React from 'react';
import { Article, Category, BreakingNews, Ad, AdPlacement, SportsFixture, WebsiteSettings } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { AdDisplay } from '../components/AdDisplay';
import { SportsSection } from '../components/SportsSection';
import { PublicMediaDownloadsSection } from '../components/PublicMediaDownloadsSection';
import { SEOHead } from '../components/SEOHead';
import { Flame, Star, TrendingUp, Sparkles, ChevronRight, Newspaper, Radio, Globe, Shield, Landmark } from 'lucide-react';

interface HomeViewProps {
  articles: Article[];
  categories: Category[];
  breakingNews: BreakingNews[];
  ads: Ad[];
  adPlacements: AdPlacement[];
  sportsFixtures: SportsFixture[];
  settings?: WebsiteSettings;
  onSelectArticle: (article: Article) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  articles = [],
  categories = [],
  breakingNews = [],
  ads = [],
  adPlacements = [],
  sportsFixtures = [],
  settings,
  onSelectArticle,
  onNavigate
}) => {
  const publishedArticles = (articles || []).filter((a) => a?.status === 'published');

  const leadStory = publishedArticles.find((a) => a?.isFeatured && a?.isPinned) || publishedArticles[0];
  const subHeroStories = publishedArticles.filter((a) => a?.id !== leadStory?.id && a?.isFeatured).slice(0, 4);

  const editorPicks = publishedArticles.filter((a) => a?.isEditorPick).slice(0, 5);
  const trendingStories = [...publishedArticles].sort((a, b) => (b?.views || 0) - (a?.views || 0)).slice(0, 5);
  const sportsArticles = publishedArticles.filter((a) => a?.categoryId === 'cat-9' || a?.categoryId === 'cat-10').slice(0, 3);

  const politicsArticles = publishedArticles.filter((a) => a?.categoryId === 'cat-2').slice(0, 4);
  const metroArticles = publishedArticles.filter((a) => a?.categoryId === 'cat-3').slice(0, 4);
  const businessArticles = publishedArticles.filter((a) => a?.categoryId === 'cat-4' || a?.categoryId === 'cat-5').slice(0, 4);

  return (
    <div className="space-y-10 py-6">
      <SEOHead
        title={settings?.seoTitle || 'NaijaTrendiInfo – Latest Nigerian News, Sports, Entertainment & Trending Stories'}
        description={settings?.seoDescription || settings?.siteDescription || 'Nigeria’s premier digital news and media platform providing breaking news, politics, business, sports, entertainment, tech, and investigative reporting.'}
        keywords={settings?.seoKeywords || 'NaijaTrendiInfo, Nigeria news, Nigerian news, breaking news Nigeria, sports news Nigeria, football news, entertainment news, tech news Nigeria, business news, Naija trend info'}
        canonicalPath="/"
        ogType="website"
        ogImage={settings?.defaultOgImage || leadStory?.featuredImage || 'https://www.naijatrendinfo.com.ng/icon.png'}
        googleSiteVerification={settings?.googleSiteVerification}
        bingSiteVerification={settings?.bingSiteVerification}
        pinterestVerificationCode={settings?.pinterestVerificationCode || '61e1ab291f2ad5fb3b64dd51934c2241'}
        isNoIndex={settings?.allowIndexing === false}
      />
      {/* Top Banner Ad Placement */}
      <AdDisplay position="Header" placements={adPlacements} ads={ads} className="max-w-7xl mx-auto px-4" />

      {/* 1. HERO / FEATURED NEWS GRID (1 Lead Story + 4 Sub Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Radio className="w-5 h-5 text-[#00B87C] animate-pulse" />
            <h2 className="text-xl font-black font-serif text-white uppercase tracking-tight">
              Top Headline Stories
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#00B87C] animate-ping"></span>
            <span>Live Nigerian Newsroom</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Lead Story (Col 7) */}
          <div className="lg:col-span-7">
            {leadStory && (
              <ArticleCard article={leadStory} onSelect={onSelectArticle} variant="featured" />
            )}
          </div>

          {/* Sub Featured Stories (Col 5) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subHeroStories.map((art) => (
              <ArticleCard key={art.id} article={art} onSelect={onSelectArticle} variant="hero-sub" />
            ))}
          </div>
        </div>
      </section>

      {/* Ad Placement Below Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <AdDisplay position="Below Hero Section" placements={adPlacements} ads={ads} />
      </div>

      {/* 2. MAIN CONTENT LAYOUT (Articles Feed + Rich Sidebar) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Feed Column (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Category Block 1: Politics & National Governance */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-6">
                <h3 className="text-lg font-bold font-serif text-white uppercase tracking-wider flex items-center space-x-2.5">
                  <span className="w-3.5 h-3.5 bg-[#00B87C] rounded-sm flex items-center justify-center text-[9px] text-slate-950 font-black">★</span>
                  <span>Politics & Governance</span>
                </h3>
                <button
                  onClick={() => onNavigate('category', 'politics')}
                  className="text-xs font-bold text-[#00B87C] hover:text-emerald-300 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>See All Politics</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {politicsArticles.map((art) => (
                  <ArticleCard key={art.id} article={art} onSelect={onSelectArticle} variant="grid" />
                ))}
              </div>
            </div>

            {/* In-Feed Ad Placement */}
            <AdDisplay position="Between Articles" placements={adPlacements} ads={ads} />

            {/* Sports Hub Banner & Live Scores */}
            <SportsSection
              fixtures={sportsFixtures}
              sportsArticles={sportsArticles}
              onSelectArticle={onSelectArticle}
              onNavigate={onNavigate}
            />

            {/* Category Block 2: Business, Economy & Markets */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-6">
                <h3 className="text-lg font-bold font-serif text-white uppercase tracking-wider flex items-center space-x-2.5">
                  <span className="w-3.5 h-3.5 bg-[#F5B942] rounded-sm flex items-center justify-center text-[9px] text-slate-950 font-black">₦</span>
                  <span>Business, Economy & Markets</span>
                </h3>
                <button
                  onClick={() => onNavigate('category', 'business')}
                  className="text-xs font-bold text-[#F5B942] hover:text-amber-300 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>See All Business</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessArticles.map((art) => (
                  <ArticleCard key={art.id} article={art} onSelect={onSelectArticle} variant="grid" />
                ))}
              </div>
            </div>

            {/* Latest News Feed Stream */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-6">
                <h3 className="text-lg font-bold font-serif text-white uppercase tracking-wider flex items-center space-x-2.5">
                  <Newspaper className="w-5 h-5 text-[#00B87C]" />
                  <span>Latest News Stream</span>
                </h3>
              </div>

              <div className="space-y-4">
                {publishedArticles.slice(0, 6).map((art) => (
                  <ArticleCard key={art.id} article={art} onSelect={onSelectArticle} variant="horizontal" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Sidebar Ad Top */}
            <AdDisplay position="Sidebar Top" placements={adPlacements} ads={ads} />

            {/* Trending in Nigeria Widget */}
            <div className="bg-[#0D1A2D] rounded-2xl p-5 border border-slate-800 shadow-xl">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800 mb-4">
                <Flame className="w-5 h-5 text-[#F5B942] fill-current" />
                <h3 className="text-sm font-extrabold font-serif text-white uppercase tracking-wider">
                  Trending in Nigeria
                </h3>
              </div>

              <div className="space-y-1">
                {trendingStories.map((art, idx) => (
                  <div
                    key={art.id}
                    onClick={() => onSelectArticle(art)}
                    className="cursor-pointer group flex items-start space-x-3 py-3 border-b border-slate-800/80 last:border-0 hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                  >
                    <span className="font-extrabold text-2xl font-serif text-[#00B87C]/50 group-hover:text-[#F5B942] shrink-0 w-6">
                      0{idx + 1}
                    </span>
                    <div className="flex-1">
                      <span className="text-[10px] font-extrabold text-[#00B87C] uppercase tracking-wider">
                        {art.categoryName}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-[#00B87C] transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                        {art.views.toLocaleString()} views
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor's Picks Widget */}
            <div className="bg-[#0D1A2D] text-white rounded-2xl p-5 border border-slate-800 shadow-xl">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800 mb-4">
                <Star className="w-5 h-5 text-[#F5B942] fill-current" />
                <h3 className="text-sm font-extrabold font-serif uppercase tracking-wider text-white">
                  Editor’s Picks
                </h3>
              </div>

              <div className="space-y-2">
                {editorPicks.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => onSelectArticle(art)}
                    className="cursor-pointer group p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700"
                  >
                    <span className="text-[10px] font-bold text-[#F5B942] uppercase">
                      {art.categoryName}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-[#00B87C] line-clamp-2 leading-snug mt-0.5">
                      {art.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Ad Middle */}
            <AdDisplay position="Sidebar Middle" placements={adPlacements} ads={ads} />

            {/* Fuel & Currency Quick Index Widget */}
            {settings?.economicIndex?.showEconomicWidget !== false && (
              <div className="bg-[#0D1A2D] text-slate-100 rounded-2xl p-5 border border-slate-800 text-xs shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="font-bold uppercase tracking-wider text-[#F5B942]">
                    {settings?.economicIndex?.widgetTitle || 'Nigeria Economic Index'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {settings?.economicIndex?.widgetSource || 'CBN / NNPC'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Official NGN / USD</span>
                    <span className="font-bold font-mono text-[#00B87C]">
                      {settings?.economicIndex?.officialRate || '₦1,485.50'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Parallel NGN / USD</span>
                    <span className="font-bold font-mono text-[#F5B942]">
                      {settings?.economicIndex?.parallelRate || '₦1,510.00'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">PMS Petrol (Lagos)</span>
                    <span className="font-bold font-mono text-white">
                      {settings?.economicIndex?.petrolPrice || '₦895 / L'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Inflation Rate</span>
                    <span className="font-bold font-mono text-[#E63946]">
                      {settings?.economicIndex?.inflationRate || '22.8%'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. OFFICIAL MEDIA & PUBLIC DOWNLOADS PORTAL SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <PublicMediaDownloadsSection />
      </section>
    </div>
  );
};

