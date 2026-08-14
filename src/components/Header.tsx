import React, { useState } from 'react';
import {
  Newspaper,
  TrendingUp,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  UserCheck,
  Shield,
  Zap,
  DollarSign,
  ChevronDown,
  LogOut,
  Radio,
  Clock,
  Sparkles,
  Flame,
  Globe,
  Share2,
  ExternalLink
} from 'lucide-react';
import { Category, BreakingNews, WebsiteSettings, SocialMediaLink } from '../types';

interface HeaderProps {
  settings: WebsiteSettings;
  categories?: Category[];
  breakingNews?: BreakingNews[];
  socialLinks?: SocialMediaLink[];
  currentView?: string;
  onNavigate: (view: string, param?: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isAdminLoggedIn?: boolean;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  categories = [],
  breakingNews = [],
  socialLinks = [],
  currentView = 'home',
  onNavigate,
  darkMode,
  onToggleDarkMode,
  isAdminLoggedIn = false,
  onOpenAdmin,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeBreaking = (breakingNews || [])
    .filter((b) => b?.isActive)
    .sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    });

  const visibleCategories = (categories || []).filter((c) => c?.isVisible);
  const mainNavCategories = visibleCategories.slice(0, 8);
  const extraCategories = visibleCategories.slice(8);

  const currentDateString = new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search', searchQuery.trim());
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="w-full bg-[#07111F] text-slate-100 sticky top-0 z-40 shadow-2xl border-b border-slate-800 transition-colors">
      {/* 1. TOP UTILITY & MARKET TICKER BAR */}
      <div className="bg-[#050B14] text-slate-300 text-xs py-1.5 px-4 sm:px-6 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Date, Location & Live Rates */}
          <div className="flex items-center space-x-3 overflow-x-auto text-[11px] whitespace-nowrap scrollbar-none">
            <div className="flex items-center space-x-1.5 font-medium text-slate-300">
              <Clock className="w-3 h-3 text-[#00B87C]" />
              <span>{currentDateString}</span>
            </div>

            <span className="text-slate-700">|</span>

            {/* Edition */}
            <span className="bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-700/60">
              Nigeria Edition
            </span>

            {settings?.economicIndex?.showTopTicker !== false && (
              <>
                <span className="text-slate-700">|</span>
                <span className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3 text-[#F5B942]" />
                  <span>USD/NGN: <strong className="text-[#00B87C] font-mono">{settings?.economicIndex?.usdNgnRate || '₦1,485.50'}</strong></span>
                </span>
                <span className="hidden md:inline text-slate-700">|</span>
                <span className="hidden md:inline-flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-[#00B87C]" />
                  <span>NGX Index: <strong className="text-[#00B87C] font-mono">{settings?.economicIndex?.ngxIndex || '+0.42%'}</strong></span>
                </span>
              </>
            )}
          </div>

          {/* Right: Quick Links, Social Icons, Theme & Auth */}
          <div className="flex items-center space-x-3 text-xs">
            {/* Quick Links */}
            <div className="hidden md:flex items-center space-x-3 text-[11px] text-slate-400 font-medium">
              <button
                onClick={() => onNavigate('editorial-desk')}
                className="hover:text-[#00B87C] transition-colors cursor-pointer"
              >
                Editorial Desk
              </button>
              <span>•</span>
              <button
                onClick={() => onNavigate('contact')}
                className="hover:text-[#00B87C] transition-colors cursor-pointer"
              >
                Contact & Bureaus
              </button>
            </div>

            <span className="hidden md:inline text-slate-700">|</span>

            {/* Social Links Icons */}
            {(socialLinks || []).filter((s) => s?.isActive).length > 0 && (
              <div className="hidden lg:flex items-center space-x-2 border-r border-slate-800 pr-3 mr-1">
                {(socialLinks || []).filter((s) => s?.isActive).slice(0, 5).map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-[#00B87C] transition-colors font-semibold text-[11px] capitalize"
                    title={s.displayName || s.platform}
                  >
                    {s.platform === 'facebook' ? 'FB' : s.platform === 'twitter' ? 'X' : s.platform === 'instagram' ? 'IG' : s.platform === 'youtube' ? 'YT' : s.platform === 'whatsapp' ? 'WA' : s.displayName || s.platform}
                  </a>
                ))}
              </div>
            )}

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="flex items-center space-x-1 text-slate-300 hover:text-[#F5B942] transition-colors px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 cursor-pointer"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-3 h-3 text-[#F5B942]" /> : <Moon className="w-3 h-3 text-[#00B87C]" />}
              <span className="hidden sm:inline text-[11px] font-medium">{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            <span className="text-slate-700">|</span>

            {/* Admin or Editor Login */}
            {isAdminLoggedIn ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center space-x-1 bg-[#F5B942] text-slate-950 px-2.5 py-0.5 rounded-md font-bold hover:bg-amber-400 transition-colors text-xs cursor-pointer shadow-sm"
                  title="Open Admin Dashboard"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-1 bg-red-950/80 text-red-300 border border-red-800/60 px-2 py-0.5 rounded-md text-xs hover:bg-red-900 transition-colors cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="w-3 h-3 text-red-400" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAdmin}
                className="flex items-center space-x-1 text-slate-300 hover:text-[#00B87C] transition-colors text-xs font-medium cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#00B87C]" />
                <span>Editor Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN BRANDING BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        {/* Brand Logo & Editorial Motto */}
        <div
          onClick={() => onNavigate('home')}
          className="cursor-pointer group flex items-center space-x-3.5 select-none"
        >
          {/* Insignia Icon */}
          <div className="w-11 h-11 bg-gradient-to-br from-[#00B87C] to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform border border-emerald-400/30">
            <span className="text-white font-black text-2xl font-serif">N</span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-2xl sm:text-3xl tracking-tight text-white font-serif">
                NAIJA<span className="text-[#00B87C]">TRENDI</span>
              </span>
              <span className="bg-[#F5B942] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase shadow-sm">
                INFO
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase flex items-center space-x-1.5 mt-0.5">
              <span>Truth</span>
              <span className="text-[#00B87C]">•</span>
              <span>Speed</span>
              <span className="text-[#00B87C]">•</span>
              <span>Credibility in Journalism</span>
            </p>
          </div>
        </div>

        {/* Center Search Bar - Desktop */}
        <div className="hidden lg:flex flex-col items-center max-w-md w-full">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search breaking stories, politics, business, sport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs rounded-full pl-4 pr-10 py-2.5 border border-slate-700 focus:outline-none focus:border-[#00B87C] focus:ring-1 focus:ring-[#00B87C] transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-[#00B87C] hover:bg-emerald-500 text-white rounded-full transition-colors shadow-sm cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Action: Tip Submission & Live Radar */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={() => onNavigate('submit-news')}
            className="bg-gradient-to-r from-[#00B87C] to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-2 cursor-pointer border border-emerald-400/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F5B942]" />
            <span>Submit News Tip</span>
          </button>
        </div>

        {/* Mobile Menu Hamburger */}
        <div className="flex items-center space-x-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. MAIN CATEGORY NAVIGATION BAR */}
      <nav className="hidden lg:block border-t border-slate-800 bg-[#050B14]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-semibold tracking-wide">
          <div className="flex items-center space-x-1 overflow-x-auto py-2">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentView === 'home'
                  ? 'bg-[#00B87C] text-white font-bold shadow-md shadow-emerald-950/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Home
            </button>

            {mainNavCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate('category', cat.slug)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  currentView === `category-${cat.slug}`
                    ? 'bg-[#00B87C] text-white font-bold shadow-md shadow-emerald-950/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {/* Extra Categories Dropdown */}
            {extraCategories.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-1 cursor-pointer"
                >
                  <span>More Sections</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {dropdownOpen && (
                  <div
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute left-0 mt-1 w-52 bg-[#07111F] border border-slate-700 rounded-xl shadow-2xl py-2 z-50 grid grid-cols-1"
                  >
                    {extraCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onNavigate('category', cat.slug);
                          setDropdownOpen(false);
                        }}
                        className="text-left px-4 py-2 text-xs text-slate-200 hover:bg-emerald-950/80 hover:text-[#00B87C] transition-colors cursor-pointer"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sports Hub with Gold Highlight */}
            <button
              onClick={() => onNavigate('sports')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ml-1 ${
                currentView === 'sports'
                  ? 'bg-[#F5B942] text-slate-950 font-bold shadow-md'
                  : 'bg-[#F5B942]/15 text-[#F5B942] border border-[#F5B942]/40 hover:bg-[#F5B942] hover:text-slate-950'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Sports Hub & Live Scores</span>
            </button>
          </div>

          {/* Quick Trending Indicator */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <Flame className="w-3.5 h-3.5 text-[#F5B942]" />
            <span className="font-semibold text-slate-300">Trending in Nigeria:</span>
            <span className="text-[#00B87C] font-medium">#Tinubu #AFCON #NGX #SuperEagles</span>
          </div>
        </div>
      </nav>

      {/* 4. BREAKING NEWS TICKER MARQUEE */}
      {activeBreaking.length > 0 && (
        <div className="bg-[#E63946] text-white text-xs py-1.5 px-4 sm:px-6 flex items-center overflow-hidden border-b border-red-500 shadow-md">
          <div className="max-w-7xl mx-auto w-full flex items-center space-x-3">
            <span className="bg-red-950 text-white font-black text-[10px] px-3 py-0.5 rounded uppercase tracking-widest italic shrink-0 border border-red-400/40 animate-pulse">
              Breaking News
            </span>

            <div className="flex-1 overflow-hidden relative flex items-center">
              <div className="whitespace-nowrap inline-flex animate-marquee hover:pause italic font-semibold">
                {activeBreaking.map((bn, i) => (
                  <span
                    key={`bn-1-${bn.id}-${i}`}
                    onClick={() => bn.linkUrl && onNavigate('article', bn.linkUrl.replace('/article/', ''))}
                    className="inline-flex items-center mr-8 cursor-pointer hover:underline text-white hover:text-amber-200 transition-colors"
                  >
                    <span className="text-[#F5B942] font-black mr-1.5 text-[11px] font-mono">#{i + 1}</span>
                    {bn.title}
                    <span className="ml-8 text-red-300 font-normal">•</span>
                  </span>
                ))}
                {activeBreaking.map((bn, i) => (
                  <span
                    key={`bn-2-${bn.id}-${i}`}
                    onClick={() => bn.linkUrl && onNavigate('article', bn.linkUrl.replace('/article/', ''))}
                    className="inline-flex items-center mr-8 cursor-pointer hover:underline text-white hover:text-amber-200 transition-colors"
                  >
                    <span className="text-[#F5B942] font-black mr-1.5 text-[11px] font-mono">#{i + 1}</span>
                    {bn.title}
                    <span className="ml-8 text-red-300 font-normal">•</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#07111F] text-white px-4 py-5 border-t border-slate-800 space-y-4 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <input
              type="text"
              placeholder="Search news, topics, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:border-[#00B87C]"
            />
            <button type="submit" className="absolute right-2 p-1.5 text-[#00B87C]">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2.5 bg-[#00B87C]/20 text-[#00B87C] border border-[#00B87C]/30 rounded-xl font-bold"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('sports');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2.5 bg-[#F5B942] text-slate-950 font-bold rounded-xl flex items-center justify-between"
            >
              <span>Sports Hub</span>
              <Zap className="w-3.5 h-3.5 fill-current" />
            </button>

            {visibleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onNavigate('category', cat.slug);
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-200"
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center text-xs gap-2">
            <button
              onClick={() => {
                onNavigate('submit-news');
                setMobileMenuOpen(false);
              }}
              className="bg-[#00B87C] hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl cursor-pointer shadow"
            >
              Submit News Tip
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (onOpenAdmin) onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="text-[#F5B942] font-semibold cursor-pointer text-xs"
              >
                Admin Portal
              </button>
              {isAdminLoggedIn && onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-red-950 text-red-300 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-red-800"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

