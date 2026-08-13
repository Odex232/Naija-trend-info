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
  LogOut
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
    <header className="w-full bg-slate-900/60 backdrop-blur-xl border-b border-white/10 text-slate-50 sticky top-0 z-40 shadow-xl transition-all">
      {/* Top Utility Bar */}
      <div className="bg-slate-950/80 backdrop-blur-md text-emerald-100 text-xs py-1.5 px-4 sm:px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Date & Market Indices */}
          <div className="flex items-center space-x-4 overflow-x-auto text-slate-300 text-[11px] whitespace-nowrap">
            <span className="font-semibold text-emerald-400">{currentDateString}</span>
            {settings?.economicIndex?.showTopTicker !== false && (
              <>
                <span className="text-white/20">|</span>
                <span className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3 text-amber-400" />
                  <span>USD/NGN: <strong className="text-emerald-400 font-mono">{settings?.economicIndex?.usdNgnRate || '₦1,485.50'}</strong></span>
                </span>
                <span className="hidden md:inline text-white/20">|</span>
                <span className="hidden md:inline-flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>NGX Index: <strong className="text-emerald-400 font-mono">{settings?.economicIndex?.ngxIndex || '+0.42%'}</strong></span>
                </span>
              </>
            )}
          </div>

          {/* Right: Social Links & Controls */}
          <div className="flex items-center space-x-3 text-xs">
            {/* Social Links Icons */}
            {(socialLinks || []).filter((s) => s?.isActive).length > 0 && (
              <div className="hidden lg:flex items-center space-x-2 border-r border-white/10 pr-3 mr-1">
                {(socialLinks || []).filter((s) => s?.isActive).slice(0, 6).map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-400 transition-colors font-semibold text-[11px] capitalize"
                    title={s.displayName || s.platform}
                  >
                    {s.platform === 'facebook' ? 'FB' : s.platform === 'twitter' ? 'X' : s.platform === 'instagram' ? 'IG' : s.platform === 'youtube' ? 'YT' : s.platform === 'tiktok' ? 'TT' : s.platform === 'whatsapp' ? 'WA' : s.platform === 'telegram' ? 'TG' : s.displayName || s.platform}
                  </a>
                ))}
              </div>
            )}

            <button
              onClick={onToggleDarkMode}
              className="flex items-center space-x-1 text-slate-300 hover:text-amber-300 transition-colors px-2 py-0.5 rounded-full bg-white/5 border border-white/10 cursor-pointer"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-3 h-3 text-amber-300" /> : <Moon className="w-3 h-3 text-emerald-300" />}
              <span className="hidden sm:inline text-[11px] font-medium">{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            <span className="text-white/20">|</span>

            {isAdminLoggedIn ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center space-x-1 bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-md font-bold hover:bg-amber-400 transition-colors text-xs cursor-pointer"
                  title="Open Admin Dashboard"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-1 bg-red-900/60 text-red-200 border border-red-700/50 px-2 py-0.5 rounded-md text-xs hover:bg-red-800 transition-colors cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="w-3 h-3 text-red-300" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAdmin}
                className="flex items-center space-x-1 text-slate-300 hover:text-emerald-400 transition-colors text-xs font-medium cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Editor Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Branding & Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="cursor-pointer group flex items-center space-x-3 select-none"
        >
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl font-serif">N</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-2xl tracking-tight text-white font-serif">
                NAIJA<span className="text-emerald-400">TRENDI</span>
              </span>
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">
                INFO
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Truth • Speed • Credibility in Journalism
            </p>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search news, topics, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-full pl-4 pr-10 py-2 border border-white/10 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
          />
          <button
            type="submit"
            className="absolute right-1 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-colors shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center space-x-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="hidden lg:block border-t border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-semibold tracking-wide">
          <div className="flex items-center space-x-1.5 overflow-x-auto py-2">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentView === 'home' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'hover:bg-white/5 text-slate-300'
              }`}
            >
              Home
            </button>

            {mainNavCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate('category', cat.slug)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  currentView === `category-${cat.slug}` ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold' : 'hover:bg-white/5 text-slate-300'
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
                  className="px-3 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 flex items-center space-x-1"
                >
                  <span>More</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {dropdownOpen && (
                  <div
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute left-0 mt-1 w-48 bg-slate-900/95 border border-white/10 backdrop-blur-xl rounded-xl shadow-2xl py-2 z-50 grid grid-cols-1"
                  >
                    {extraCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onNavigate('category', cat.slug);
                          setDropdownOpen(false);
                        }}
                        className="text-left px-4 py-2 text-xs text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => onNavigate('sports')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                currentView === 'sports' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Sports Hub</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 py-1.5">
            <button
              onClick={() => onNavigate('submit-news')}
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg transition-all shadow-md shadow-emerald-600/20"
            >
              Submit News Tip
            </button>
          </div>
        </div>
      </nav>

      {/* Breaking News Ticker Bar */}
      {activeBreaking.length > 0 && (
        <div className="bg-rose-600/90 backdrop-blur-md text-white text-xs py-1.5 px-4 sm:px-6 flex items-center overflow-hidden border-b border-rose-500/30">
          <div className="max-w-7xl mx-auto w-full flex items-center space-x-3">
            <span className="bg-rose-800/90 text-white font-bold text-[10px] px-3 py-1 rounded uppercase tracking-widest italic shrink-0 shadow-xs border border-rose-400/30">
              Breaking
            </span>

            <div className="flex-1 overflow-hidden relative flex items-center">
              <div className="whitespace-nowrap inline-flex animate-marquee hover:pause italic font-medium">
                {activeBreaking.map((bn, i) => (
                  <span
                    key={`bn-1-${bn.id}-${i}`}
                    onClick={() => bn.linkUrl && onNavigate('article', bn.linkUrl.replace('/article/', ''))}
                    className="inline-flex items-center mr-8 cursor-pointer hover:underline text-white hover:text-amber-200 transition-colors"
                  >
                    <span className="text-amber-300 font-bold mr-1.5 text-[11px] font-mono">#{i + 1}</span>
                    {bn.title}
                    <span className="ml-8 text-rose-300">•</span>
                  </span>
                ))}
                {activeBreaking.map((bn, i) => (
                  <span
                    key={`bn-2-${bn.id}-${i}`}
                    onClick={() => bn.linkUrl && onNavigate('article', bn.linkUrl.replace('/article/', ''))}
                    className="inline-flex items-center mr-8 cursor-pointer hover:underline text-white hover:text-amber-200 transition-colors"
                  >
                    <span className="text-amber-300 font-bold mr-1.5 text-[11px] font-mono">#{i + 1}</span>
                    {bn.title}
                    <span className="ml-8 text-rose-300">•</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/95 backdrop-blur-2xl text-white px-4 py-4 border-t border-white/10 space-y-4 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-slate-100 text-xs rounded-xl pl-4 pr-10 py-2.5"
            />
            <button type="submit" className="absolute right-2 p-1.5 text-emerald-400">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('sports');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
            >
              Sports Hub
            </button>

            {visibleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onNavigate('category', cat.slug);
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-slate-200"
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs gap-2">
            <button
              onClick={() => {
                onNavigate('submit-news');
                setMobileMenuOpen(false);
              }}
              className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl cursor-pointer"
            >
              Submit News
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (onOpenAdmin) onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="text-amber-400 font-semibold cursor-pointer"
              >
                Admin Dashboard
              </button>
              {isAdminLoggedIn && onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-red-900/80 text-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
