import React, { useState, useEffect } from 'react';
import {
  Article,
  Category,
  BreakingNews,
  Ad,
  AdPlacement,
  WebsiteSettings,
  User,
  Comment,
  NewsSubmission,
  ContactMessage,
  AuditLog,
  QuickLink,
  EditorialDeskEntry,
  InformationEntry,
  SocialMediaLink,
  MediaFile,
  SportsFixture,
  SitePage,
  CookieSettings,
  FooterSettings,
  AdvertisingPackage
} from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { HomeView } from './views/HomeView';
import { ArticleView } from './views/ArticleView';
import { CategoryView } from './views/CategoryView';
import { SportsView } from './views/SportsView';
import { SearchView } from './views/SearchView';
import { InfoView } from './views/InfoView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { Lock, X, Newspaper, Key } from 'lucide-react';

export default function App() {
  // Application Data States
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Core Entity State
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [adPlacements, setAdPlacements] = useState<AdPlacement[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [submissions, setSubmissions] = useState<NewsSubmission[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [editorialDesk, setEditorialDesk] = useState<EditorialDeskEntry[]>([]);
  const [information, setInformation] = useState<InformationEntry[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [sportsFixtures, setSportsFixtures] = useState<SportsFixture[]>([]);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [cookieSettings, setCookieSettings] = useState<CookieSettings | null>(null);
  const [footerSettings, setFooterSettings] = useState<FooterSettings | null>(null);
  const [advertisingPackages, setAdvertisingPackages] = useState<AdvertisingPackage[]>([]);

  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'article' | 'category' | 'sports' | 'search' | 'info' | 'admin'>('home');
  const [viewParam, setViewParam] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Admin Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      const savedToken = localStorage.getItem('authToken');
      if (savedUser && savedToken) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Failed to parse saved user:', e);
    }
    return null;
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (currentUser && !localStorage.getItem('authToken')) {
      localStorage.setItem('authToken', 'token-admin-session');
    }
  }, [currentUser]);

  // Bootstrap Load Data from Express Backend API
  const loadData = async () => {
    try {
      const data = await api.bootstrap();
      setArticles(data.articles || []);
      setCategories(data.categories || []);
      setBreakingNews(data.breakingNews || []);
      setAds(data.ads || []);
      setAdPlacements(data.adPlacements || []);
      setSettings(data.settings || null);
      setUsers(data.users || []);

      // Verify active session only if explicit auth token and saved user exist
      const savedUserStr = localStorage.getItem('currentUser');
      const savedToken = localStorage.getItem('authToken');
      if (savedUserStr && savedToken && data.users && data.users.length > 0) {
        try {
          const parsed = JSON.parse(savedUserStr);
          const matched = (data.users as User[]).find(
            (u) => u.id === parsed.id || u.email.toLowerCase() === parsed.email.toLowerCase()
          );
          if (matched) {
            setCurrentUser(matched);
            localStorage.setItem('currentUser', JSON.stringify(matched));
          } else {
            setCurrentUser(null);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
          }
        } catch (e) {
          console.error('Error parsing saved session:', e);
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
        }
      } else {
        // Strict Security: Do NOT auto-login if user logged out or no stored session exists
        setCurrentUser(null);
      }
      setComments(data.comments || []);
      setSubmissions(data.submissions || []);
      setContacts(data.contacts || []);
      setSubscribers(data.subscribers || []);
      setAuditLogs(data.auditLogs || []);
      setQuickLinks(data.quickLinks || []);
      setEditorialDesk(data.editorialDesk || []);
      setInformation(data.information || []);
      setSocialLinks(data.socialLinks || []);
      setMediaFiles(data.mediaFiles || []);
      setSportsFixtures(data.sportsFixtures || []);
      setPages(data.pages || []);
      setCookieSettings(data.cookieSettings || null);
      setFooterSettings(data.footerSettings || null);
      setAdvertisingPackages(data.advertisingPackages || []);

      // Trigger initial route synchronization from URL
      syncRouteFromUrl(data.articles || []);
    } catch (err) {
      console.error('Failed to bootstrap app state from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync dark class on html document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // URL Route Parser
  const syncRouteFromUrl = (allArticles: Article[]) => {
    try {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);

      if (path.startsWith('/article/')) {
        const slug = path.replace('/article/', '');
        const found = allArticles.find((a) => a.slug === slug || a.id === slug);
        if (found) {
          setSelectedArticle(found);
          setCurrentView('article');
          setViewParam(slug);
        } else {
          setCurrentView('home');
        }
      } else if (path.startsWith('/category/')) {
        const catSlug = path.replace('/category/', '');
        setCurrentView('category');
        setViewParam(catSlug);
      } else if (path === '/sports') {
        setCurrentView('sports');
      } else if (path === '/search') {
        const q = searchParams.get('q') || '';
        setCurrentView('search');
        setViewParam(q);
      } else if (path === '/admin') {
        setCurrentView('admin');
      } else if (path !== '/' && path.length > 1) {
        const pageSlug = path.replace('/', '');
        setCurrentView('info');
        setViewParam(pageSlug);
      } else {
        setCurrentView('home');
      }
    } catch (e) {
      console.error('Error syncing route from URL:', e);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      syncRouteFromUrl(articles);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [articles]);

  // Navigate Handler with History PushState
  const handleNavigate = (view: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    let targetUrl = '/';

    if (view === 'article' && param) {
      const found = articles.find((a) => a.slug === param || a.id === param);
      if (found) {
        setSelectedArticle(found);
        api.incrementArticleViews(found.id);
      }
      setCurrentView('article');
      if (param) setViewParam(param);
      targetUrl = `/article/${param}`;
    } else if (view === 'category' && param) {
      setCurrentView('category');
      setViewParam(param);
      targetUrl = `/category/${param}`;
    } else if (view === 'sports') {
      setCurrentView('sports');
      targetUrl = '/sports';
    } else if (view === 'search') {
      setCurrentView('search');
      if (param) setViewParam(param);
      targetUrl = param ? `/search?q=${encodeURIComponent(param)}` : '/search';
    } else if (view === 'admin') {
      setCurrentView('admin');
      targetUrl = '/admin';
    } else if (view === 'home') {
      setCurrentView('home');
      targetUrl = '/';
    } else {
      setCurrentView('info');
      const pageKey = param || (view.startsWith('/') ? view.replace('/', '') : view);
      setViewParam(pageKey);
      targetUrl = `/${pageKey}`;
    }

    try {
      if (window.location.pathname + window.location.search !== targetUrl) {
        window.history.pushState({}, '', targetUrl);
      }
    } catch (e) {}
  };

  // Article Click
  const handleSelectArticle = (art: Article) => {
    setSelectedArticle(art);
    api.incrementArticleViews(art.id);
    setCurrentView('article');
    setViewParam(art.slug || art.id);
    try {
      window.history.pushState({}, '', `/article/${art.slug || art.id}`);
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Error logging out:', e);
    }
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setCurrentView('home');
    setViewParam('');
  };

  // Admin Login Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await api.login(loginEmail, loginPassword);
      if (res.user) {
        setCurrentUser(res.user);
        setLoginModalOpen(false);
        setLoginEmail('');
        setLoginPassword('');
        setCurrentView('admin');
      } else {
        setLoginError(res.error || 'Invalid Admin Credentials');
      }
    } catch (err) {
      setLoginError('Authentication error');
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="font-serif text-xl font-bold tracking-tight">
          NAIJA<span className="text-emerald-400">TRENDI</span>INFO
        </div>
        <p className="text-xs text-slate-400">Loading Latest Nigerian News Bureau Feed...</p>
      </div>
    );
  }

  // Render Admin View independently if logged in and in admin route
  if (currentView === 'admin' && currentUser) {
    return (
      <AdminDashboardView
        currentUser={currentUser}
        articles={articles}
        categories={categories}
        breakingNews={breakingNews}
        ads={ads}
        adPlacements={adPlacements}
        settings={settings}
        users={users}
        comments={comments}
        submissions={submissions}
        contacts={contacts}
        subscribers={subscribers}
        auditLogs={auditLogs}
        quickLinks={quickLinks}
        editorialDesk={editorialDesk}
        information={information}
        socialLinks={socialLinks}
        mediaFiles={mediaFiles}
        sportsFixtures={sportsFixtures}
        pages={pages}
        onRefreshData={loadData}
        onLogout={handleLogout}
        onNavigateSite={(v, p) => handleNavigate(v, p)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Frosted Glass Ambient Lighting Effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      
      {/* Top Header Navigation */}
      <div className="relative z-10 flex-1 flex flex-col">
        <Header
          settings={settings}
          categories={categories}
          breakingNews={breakingNews}
          socialLinks={socialLinks}
          currentView={currentView}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onNavigate={handleNavigate}
          isAdminLoggedIn={!!currentUser}
          onLogout={handleLogout}
          onOpenAdmin={() => {
            if (currentUser) {
              setCurrentView('admin');
            } else {
              setLoginModalOpen(true);
            }
          }}
        />

        {/* Main View Router Canvas */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            articles={articles}
            categories={categories}
            breakingNews={breakingNews}
            ads={ads}
            adPlacements={adPlacements}
            sportsFixtures={sportsFixtures}
            settings={settings}
            onSelectArticle={handleSelectArticle}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'article' && selectedArticle && (
          <ArticleView
            article={selectedArticle}
            relatedArticles={articles.filter(
              (a) => a.id !== selectedArticle.id && a.categoryId === selectedArticle.categoryId
            )}
            ads={ads}
            adPlacements={adPlacements}
            comments={comments.filter((c) => c.articleId === selectedArticle.id)}
            onSelectArticle={handleSelectArticle}
            onNavigate={handleNavigate}
            onCommentAdded={loadData}
          />
        )}

        {currentView === 'category' && (
          <CategoryView
            categorySlug={viewParam}
            categories={categories}
            articles={articles}
            ads={ads}
            adPlacements={adPlacements}
            onSelectArticle={handleSelectArticle}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'sports' && (
          <SportsView
            sportsFixtures={sportsFixtures}
            articles={articles}
            onSelectArticle={handleSelectArticle}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'search' && (
          <SearchView
            initialQuery={viewParam}
            articles={articles}
            categories={categories}
            onSelectArticle={handleSelectArticle}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'info' && (
          <InfoView
            pageKey={viewParam || 'about-us'}
            settings={settings}
            editorialDesk={editorialDesk}
            information={information}
            pages={pages}
            advertisingPackages={advertisingPackages}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Cookie Consent Banner */}
      <CookieBanner cookieSettings={cookieSettings || undefined} onNavigate={handleNavigate} />

      {/* Global Footer */}
      <Footer
        settings={settings}
        categories={categories}
        quickLinks={quickLinks}
        editorialDesk={editorialDesk}
        socialLinks={socialLinks}
        onNavigate={handleNavigate}
      />
      </div>

      {/* Admin Security Login Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-md w-full text-white shadow-2xl relative">
            <button
              onClick={() => setLoginModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Lock className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-serif">Admin Portal Access</h2>
                <p className="text-xs text-slate-400">NaijaTrendiInfo Media Operations</p>
              </div>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-950 text-red-200 text-xs rounded-xl border border-red-800">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Admin Email *</label>
                <input
                  type="email"
                  required
                  placeholder="Enter admin email address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Security Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter security password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs flex items-center justify-center space-x-2"
              >
                <Key className="w-4 h-4" />
                <span>{loginLoading ? 'Authenticating...' : 'Sign In To Dashboard'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
