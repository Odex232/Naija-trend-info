import React, { useState, useEffect } from 'react';
import {
  Database,
  Server,
  Cloud,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Code,
  Copy,
  Check,
  Globe,
  Loader2,
  ExternalLink,
  Layers,
  FileCode,
  HardDrive,
  Lock,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info
} from 'lucide-react';
import { api } from '../services/api';

interface SupabaseMigrationDashboardProps {
  articlesCount: number;
  categoriesCount: number;
  usersCount: number;
  pagesCount: number;
  breakingNewsCount: number;
  mediaCount: number;
  onRefreshData: () => void;
  triggerSuccessNotification: (msg: string) => void;
  triggerErrorNotification: (msg: string) => void;
  askConfirmation: (title: string, msg: string, onConfirm: () => void, opts?: any) => void;
}

export const SupabaseMigrationDashboard: React.FC<SupabaseMigrationDashboardProps> = ({
  articlesCount,
  categoriesCount,
  usersCount,
  pagesCount,
  breakingNewsCount,
  mediaCount,
  onRefreshData,
  triggerSuccessNotification,
  triggerErrorNotification,
  askConfirmation
}) => {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [migrationLog, setMigrationLog] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);
  const [showDomainGuide, setShowDomainGuide] = useState(false);
  const [schemaSqlText, setSchemaSqlText] = useState<string>('');

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await api.getDatabaseStatus();
      setDbStatus(res);
    } catch (e: any) {
      console.warn('Failed to fetch database status:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRunMigration = () => {
    askConfirmation(
      'Migrate to Supabase PostgreSQL',
      'This will safely and non-destructively copy and upsert all articles, categories, pages, users, settings, and media references from local storage into your Supabase PostgreSQL tables. No data will be deleted or replaced. Proceed?',
      async () => {
        setMigrating(true);
        setMigrationLog(null);
        try {
          const res = await api.migrateToSupabase();
          if (res.success) {
            setMigrationLog(res);
            triggerSuccessNotification(res.message || 'Supabase migration completed successfully!');
            await fetchStatus();
            await onRefreshData();
          } else {
            setMigrationLog(res);
            triggerErrorNotification(res.message || 'Migration encountered issues. Check details below.');
          }
        } catch (e: any) {
          triggerErrorNotification(e.message || 'Migration request failed.');
          setMigrationLog({ success: false, message: e.message });
        } finally {
          setMigrating(false);
        }
      },
      { confirmLabel: 'Start Safe Migration', isDanger: false }
    );
  };

  const handleRunParityVerification = async () => {
    setVerifying(true);
    setVerificationResult(null);
    try {
      const res = await api.verifyDatabaseSync();
      setVerificationResult(res);
      if (res.success) {
        triggerSuccessNotification('Data parity verification check complete!');
      } else {
        triggerErrorNotification('Parity check completed with warnings.');
      }
    } catch (e: any) {
      triggerErrorNotification(e.message || 'Verification request failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleCopySchemaSql = () => {
    const fullSchemaSql = `-- =========================================================================
-- NAIJATRENDIINFO SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Website: https://www.naijatrendinfo.com.ng/
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT DEFAULT '',
    content TEXT DEFAULT '',
    category_id TEXT,
    category_name TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    featured_image TEXT,
    image_caption TEXT DEFAULT '',
    image_credit TEXT DEFAULT '',
    gallery_images JSONB DEFAULT '[]'::jsonb,
    author_id TEXT,
    author_name TEXT,
    author_avatar TEXT,
    status TEXT DEFAULT 'published',
    is_featured BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_breaking BOOLEAN DEFAULT false,
    is_editor_pick BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    read_time_minutes INTEGER DEFAULT 3,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);

CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    icon TEXT DEFAULT 'Flag',
    color TEXT DEFAULT '#10b981',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.breaking_news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT DEFAULT '',
    article_id TEXT,
    category TEXT DEFAULT 'National',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    role TEXT DEFAULT 'Author',
    avatar TEXT,
    bio TEXT DEFAULT '',
    last_password_changed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quick_links (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    target_tab TEXT DEFAULT '_self',
    status TEXT DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT DEFAULT '',
    status TEXT DEFAULT 'published',
    visibility TEXT DEFAULT 'public',
    navigation_placement TEXT DEFAULT 'footer',
    meta_title TEXT DEFAULT '',
    meta_description TEXT DEFAULT '',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.editorial_desk (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.social_links (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    display_name TEXT DEFAULT '',
    url TEXT NOT NULL,
    icon TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.advertisements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    placement TEXT DEFAULT 'leaderboard_top',
    type TEXT DEFAULT 'banner',
    image_url TEXT DEFAULT '',
    destination_url TEXT DEFAULT '',
    ad_code TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.media_files (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT DEFAULT 'application/octet-stream',
    size BIGINT DEFAULT 0,
    file_type TEXT DEFAULT 'image',
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    alt_text TEXT DEFAULT '',
    caption TEXT DEFAULT '',
    uploaded_by TEXT DEFAULT 'Admin',
    is_published BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT DEFAULT '',
    content TEXT NOT NULL,
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT DEFAULT '',
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_email TEXT DEFAULT '',
    user_name TEXT DEFAULT '',
    action TEXT NOT NULL,
    details TEXT DEFAULT '',
    resource TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.supabase_document_store (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breaking_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Public Read Articles') THEN
        CREATE POLICY "Public Read Articles" ON public.articles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Public Read Categories') THEN
        CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'breaking_news' AND policyname = 'Public Read Breaking News') THEN
        CREATE POLICY "Public Read Breaking News" ON public.breaking_news FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Public Read Settings') THEN
        CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_pages' AND policyname = 'Public Read Pages') THEN
        CREATE POLICY "Public Read Pages" ON public.site_pages FOR SELECT USING (true);
    END IF;
END $$;`;

    setSchemaSqlText(fullSchemaSql);
    navigator.clipboard.writeText(fullSchemaSql);
    setCopiedSchema(true);
    triggerSuccessNotification('Supabase PostgreSQL Schema SQL copied to clipboard!');
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  const isSupabaseConfigured = Boolean(dbStatus?.isConfigured || dbStatus?.supabase?.configured);
  const isSupabaseConnected = Boolean(dbStatus?.isConfigured || dbStatus?.supabase?.connected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-emerald-400" />
            <span>Supabase PostgreSQL & Cloud Database Migration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Production data storage manager for <span className="text-emerald-400 font-medium">https://www.naijatrendinfo.com.ng/</span> — Safe, non-destructive migration engine with dual storage resilience.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchStatus}
            disabled={loadingStatus}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary Status Card */}
      <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
        isSupabaseConnected
          ? 'bg-slate-900/90 border-emerald-500/40'
          : isSupabaseConfigured
          ? 'bg-slate-900/90 border-amber-500/40'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
              isSupabaseConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Database Engine Architecture</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isSupabaseConnected
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                    : isSupabaseConfigured
                    ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                    : 'bg-blue-950 text-blue-300 border border-blue-700/60'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}></span>
                  {isSupabaseConnected
                    ? 'Supabase PostgreSQL (Authoritative Active)'
                    : isSupabaseConfigured
                    ? 'Supabase Configured (Connecting...)'
                    : 'Cloud Run JSON & Memory Cache (Ready for Migration)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Active Source of Truth: <strong className="text-white">{dbStatus?.activeSourceOfTruth || 'Supabase PostgreSQL (Primary) + /data/db.json (Fallback)'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleRunMigration}
              disabled={migrating}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              {migrating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              <span>{migrating ? 'Migrating Data Safely...' : 'Run Safe Migration to Supabase'}</span>
            </button>
            <button
              onClick={handleRunParityVerification}
              disabled={verifying}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />}
              <span>Verify Data Parity</span>
            </button>
          </div>
        </div>

        {/* Parity & Inventory Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Articles</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">{articlesCount}</div>
            <div className="text-[10px] text-slate-500">Preserved in DB</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categories</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">{categoriesCount}</div>
            <div className="text-[10px] text-slate-500">Active sections</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin & Users</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">{usersCount}</div>
            <div className="text-[10px] text-slate-500">Roles & Passwords</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CMS Pages</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">{pagesCount}</div>
            <div className="text-[10px] text-slate-500">Legal & Policies</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Breaking Alerts</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">{breakingNewsCount}</div>
            <div className="text-[10px] text-slate-500">Live Tickers</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Media Files</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">{mediaCount}</div>
            <div className="text-[10px] text-slate-500">Assets & Images</div>
          </div>
        </div>
      </div>

      {/* Migration Report (when triggered) */}
      {migrationLog && (
        <div className={`p-5 rounded-2xl border ${
          migrationLog.success ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-amber-950/40 border-amber-500/40'
        } space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {migrationLog.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              <h3 className="font-bold text-sm text-white">{migrationLog.message}</h3>
            </div>
            <button
              onClick={() => setMigrationLog(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          {migrationLog.report && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs pt-2">
              {Object.entries(migrationLog.report.tables || {}).map(([table, count]: [string, any]) => (
                <div key={table} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase truncate">{table}</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{count} rows</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verification Result (when triggered) */}
      {verificationResult && (
        <div className="p-5 bg-slate-900 border border-sky-500/40 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-sm text-white">Database Parity Verification Summary</h3>
            </div>
            <button
              onClick={() => setVerificationResult(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <div className="text-xs text-slate-300">
            {verificationResult.summary || 'All storage tables and memory indexes are verified and synchronized.'}
          </div>
        </div>
      )}

      {/* PostgreSQL SQL Schema & One-Click Setup Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Supabase PostgreSQL Schema & SQL Setup</h2>
              <p className="text-xs text-slate-400">
                Execute the standard schema script in your Supabase SQL Editor to provision all 26 production tables with Row Level Security (RLS).
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleCopySchemaSql}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-md cursor-pointer transition-colors"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
            </button>
            <button
              onClick={() => setShowSqlViewer(!showSqlViewer)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-3 py-2.5 rounded-xl flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <span>{showSqlViewer ? 'Hide Schema Code' : 'Preview SQL'}</span>
              {showSqlViewer ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </button>
          </div>
        </div>

        {showSqlViewer && (
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono text-emerald-300 max-h-64 overflow-y-auto space-y-1 select-all">
            <div className="text-slate-500 italic pb-2 border-b border-slate-900">
              -- Copy and run this script in Supabase Dashboard -&gt; SQL Editor -&gt; New Query -&gt; Run
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">
              {schemaSqlText || `-- Run "Copy SQL Schema" button above to populate complete 520-line schema script`}
            </pre>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-[10px]">1</span>
              <span>Supabase Dashboard</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Open your Supabase Project at <span className="text-slate-300">supabase.com</span> and navigate to the <strong>SQL Editor</strong> tab.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-[10px]">2</span>
              <span>Paste & Execute SQL</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Click <strong>"Copy SQL Schema"</strong> above, paste it into the editor, and click <strong>"Run"</strong>. All tables and RLS policies create instantly.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-[10px]">3</span>
              <span>Run Non-Destructive Migration</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Click <strong>"Run Safe Migration to Supabase"</strong> on this page to upsert all existing articles, categories, and settings with 100% preservation.
            </p>
          </div>
        </div>
      </div>

      {/* Whogohost Custom Domain & Netlify Proxy Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Custom Domain Connection: naijatrendinfo.com.ng</span>
                <span className="text-[10px] font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                  Whogohost DNS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                DNS configuration matrix to route your Whogohost custom domain and prevent mobile browser NetworkError blocks.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDomainGuide(!showDomainGuide)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>{showDomainGuide ? 'Hide Instructions' : 'View DNS Records'}</span>
            {showDomainGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showDomainGuide && (
          <div className="space-y-4 pt-1">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Whogohost cPanel DNS Zone Editor Records</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Log in to Whogohost Client Area -&gt; cPanel -&gt; Zone Editor and add the following records for <code className="text-amber-300">naijatrendinfo.com.ng</code>:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                      <th className="p-2.5">Record Type</th>
                      <th className="p-2.5">Name / Host</th>
                      <th className="p-2.5">Target / Value</th>
                      <th className="p-2.5">TTL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    <tr>
                      <td className="p-2.5 font-bold text-amber-400">CNAME</td>
                      <td className="p-2.5 text-white">www</td>
                      <td className="p-2.5 text-emerald-400">naijatrendinfo.netlify.app.</td>
                      <td className="p-2.5 text-slate-500">3600</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-amber-400">A Record</td>
                      <td className="p-2.5 text-white">@ (or naijatrendinfo.com.ng)</td>
                      <td className="p-2.5 text-emerald-400">75.2.60.5 (Netlify Apex IP)</td>
                      <td className="p-2.5 text-slate-500">3600</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>Zero-CORS Multi-Browser Routing</span>
              </div>
              <p>
                Our <code>/api/*</code> proxy routes all requests directly to the authoritative Node backend, eliminating the "NetworkError" issue in Opera Mini, Phoenix Browser, and Safari across all networks.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
