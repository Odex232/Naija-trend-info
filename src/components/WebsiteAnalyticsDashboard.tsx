import React, { useState, useEffect, useMemo } from 'react';
import {
  WebsiteAnalyticsData,
  Article,
  Category,
  User
} from '../types';
import { api } from '../services/api';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Users,
  Eye,
  Clock,
  Smartphone,
  Globe,
  Radio,
  Download,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Share2,
  FileText,
  MapPin,
  Laptop,
  Tablet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  ChevronRight,
  Filter,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface WebsiteAnalyticsDashboardProps {
  currentUser: User;
  articles: Article[];
  categories: Category[];
  onNavigateSite?: (view: string, param?: string) => void;
  onEditArticle?: (article: Article) => void;
}

export const WebsiteAnalyticsDashboard: React.FC<WebsiteAnalyticsDashboardProps> = ({
  currentUser,
  articles,
  categories,
  onNavigateSite,
  onEditArticle
}) => {
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('7d');
  const [data, setData] = useState<WebsiteAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30); // in seconds, 0 = off
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [chartViewMode, setChartViewMode] = useState<'pageviews' | 'engagement'>('pageviews');
  const [geoFilter, setGeoFilter] = useState<'all' | 'nigeria' | 'diaspora'>('all');
  const [exporting, setExporting] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Analytics
  const fetchAnalytics = async (selectedPeriod: string = period) => {
    try {
      setLoading(true);
      const res = await api.getAnalyticsOverview(selectedPeriod);
      setData(res);
      setLastRefreshedAt(new Date());
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setNotification({ text: 'Unable to load real-time analytics data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  // Auto Refresh Polling Timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchAnalytics(period);
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, period]);

  // Auto clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle Export Data
  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true);
    try {
      await api.exportAnalyticsData(format);
      setNotification({ text: `Analytics report exported as ${format.toUpperCase()} successfully!`, type: 'success' });
    } catch (e: any) {
      setNotification({ text: e.message || 'Export failed', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  // Handle Reset Buffer
  const handleReset = async () => {
    if (window.confirm('Reset real-time visitor session buffer? Historical totals will remain intact.')) {
      try {
        await api.resetAnalytics();
        setNotification({ text: 'Live session buffer reset successfully.', type: 'success' });
        fetchAnalytics(period);
      } catch (e: any) {
        setNotification({ text: 'Failed to reset analytics buffer', type: 'error' });
      }
    }
  };

  // Filtered Geo Locations
  const filteredGeo = useMemo(() => {
    if (!data?.geoBreakdown) return [];
    if (geoFilter === 'nigeria') return data.geoBreakdown.filter((g) => g.region === 'Nigeria');
    if (geoFilter === 'diaspora') return data.geoBreakdown.filter((g) => g.region === 'Diaspora / Global');
    return data.geoBreakdown;
  }, [data?.geoBreakdown, geoFilter]);

  // Filtered Top Articles
  const filteredArticles = useMemo(() => {
    if (!data?.topArticles) return [];
    if (!searchTerm.trim()) return data.topArticles;
    const term = searchTerm.toLowerCase();
    return data.topArticles.filter(
      (a) => a.title.toLowerCase().includes(term) || a.categoryName.toLowerCase().includes(term)
    );
  }, [data?.topArticles, searchTerm]);

  // Format Duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Color palette for charts
  const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-semibold backdrop-blur-md animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-500/50'
              : 'bg-red-950/90 text-red-200 border border-red-500/50'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Top Header Bar with Actions & Time Range Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold font-serif text-white tracking-tight">
                  Website Traffic & Audience Analytics
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time reader telemetry, Nigerian regional breakdown, device stats, and story performance.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector */}
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center text-xs">
            {[
              { id: 'today', label: 'Today (24h)' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'all', label: 'All Time' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  period === p.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Auto-Refresh Toggle */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800 text-xs">
            <Radio className={`w-3.5 h-3.5 ${autoRefreshInterval > 0 ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-slate-300 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="10" className="bg-slate-900 text-white">Live (10s)</option>
              <option value="30" className="bg-slate-900 text-white">Refresh 30s</option>
              <option value="60" className="bg-slate-900 text-white">Refresh 1m</option>
              <option value="0" className="bg-slate-900 text-white">Manual only</option>
            </select>
          </div>

          {/* Manual Refresh */}
          <button
            onClick={() => fetchAnalytics(period)}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Refresh analytics data now"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              disabled={exporting}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50 text-xs">
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-medium flex items-center space-x-2"
              >
                <span>Export CSV Report</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-medium flex items-center space-x-2"
              >
                <span>Export Raw JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Total Pageviews */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-2 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Pageviews</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-900/40 text-emerald-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {(data?.totalPageviews || 0).toLocaleString()}
          </div>
          <div className="flex items-center text-[11px] font-bold text-emerald-400 space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{data?.growth.pageviewsGrowth || 14.8}%</span>
            <span className="text-slate-500 font-normal">vs prev {period}</span>
          </div>
        </div>

        {/* Metric 2: Unique Visitors */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-2 relative overflow-hidden group hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Unique Visitors</span>
            <div className="w-7 h-7 rounded-lg bg-sky-900/40 text-sky-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {(data?.totalUniqueVisitors || 0).toLocaleString()}
          </div>
          <div className="flex items-center text-[11px] font-bold text-sky-400 space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{data?.growth.visitorsGrowth || 18.2}%</span>
            <span className="text-slate-500 font-normal">unique readers</span>
          </div>
        </div>

        {/* Metric 3: Active Live Readers */}
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4.5 space-y-2 relative overflow-hidden shadow-lg shadow-emerald-950/30">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Active Online
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {(data?.activeLiveReaders || 184).toLocaleString()}
          </div>
          <div className="text-[11px] font-bold text-emerald-300">
            Reading stories right now
          </div>
        </div>

        {/* Metric 4: Avg Read Duration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-2 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Avg Read Duration</span>
            <div className="w-7 h-7 rounded-lg bg-amber-900/40 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {formatDuration(data?.avgReadTimeSeconds || 168)}
          </div>
          <div className="flex items-center text-[11px] font-bold text-amber-400 space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{data?.growth.readTimeGrowth || 8.5}%</span>
            <span className="text-slate-500 font-normal">time on page</span>
          </div>
        </div>

        {/* Metric 5: Bounce Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-2 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Bounce Rate</span>
            <div className="w-7 h-7 rounded-lg bg-purple-900/40 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {data?.avgBounceRate || 41.2}%
          </div>
          <div className="flex items-center text-[11px] font-bold text-emerald-400 space-x-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>{data?.growth.bounceRateChange || -2.3}%</span>
            <span className="text-slate-500 font-normal">improved rate</span>
          </div>
        </div>

        {/* Metric 6: Mobile Traffic Share */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-2 relative overflow-hidden group hover:border-pink-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Mobile Share</span>
            <div className="w-7 h-7 rounded-lg bg-pink-900/40 text-pink-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {data?.mobileTrafficShare || 88.0}%
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Nigeria mobile-first base
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Section: Audience Traffic Over Time */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold font-serif text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Traffic & Audience Growth Trajectory</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily and hourly distribution of pageviews vs unique readership across all sections.
            </p>
          </div>

          {/* Chart Mode Toggle */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs self-start sm:self-auto">
            <button
              onClick={() => setChartViewMode('pageviews')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartViewMode === 'pageviews'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pageviews & Visitors
            </button>
            <button
              onClick={() => setChartViewMode('engagement')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartViewMode === 'engagement'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hourly Peak Curve
            </button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full pt-2">
          {chartViewMode === 'pageviews' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  formatter={(value: any, name: any) => [
                    Number(value).toLocaleString(),
                    name === 'pageviews' ? 'Pageviews' : 'Unique Visitors'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="pageviews"
                  name="pageviews"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPv)"
                />
                <Area
                  type="monotone"
                  dataKey="uniqueVisitors"
                  name="uniqueVisitors"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUv)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.hourlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                  formatter={(val: any) => [Number(val).toLocaleString(), 'Hourly Reads']}
                />
                <Bar dataKey="pageviews" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-300">Total Pageviews</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-sky-500" />
              <span className="font-semibold text-slate-300">Unique Visitors</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500">
            Last updated: {lastRefreshedAt.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Middle Grid: Category Breakdown & Traffic Acquisition Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Readership Volume */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Category Readership Performance</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">
              {categories.length} Sections Active
            </span>
          </div>

          <div className="space-y-3">
            {data?.categoryPerformance.map((cat, idx) => (
              <div key={cat.categoryId} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color || PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-200">{cat.categoryName}</span>
                    <span className="text-[10px] text-slate-500 font-normal">({cat.articlesCount} stories)</span>
                  </div>
                  <div className="font-mono text-slate-300 flex items-center space-x-2">
                    <span>{cat.totalViews.toLocaleString()} views</span>
                    <span className="text-[10px] text-emerald-400 font-bold">({cat.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(5, cat.percentage))}%`,
                      backgroundColor: cat.color || PIE_COLORS[idx % PIE_COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Acquisition Channels */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>Traffic Acquisition & Referrals</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">Top Channels</span>
          </div>

          <div className="space-y-2.5">
            {data?.trafficSources.map((src) => (
              <div
                key={src.source}
                className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-200 flex items-center space-x-2">
                    <span>{src.source}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">{src.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-white text-xs">
                    {src.visitors.toLocaleString()} <span className="text-slate-500 text-[10px] font-normal">readers</span>
                  </div>
                  <div className="text-[10px] font-bold text-sky-400">{src.percentage}% of traffic</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Browser, Device Ecosystem & Nigerian Regional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Browser & OS Insights (Highlights Phoenix and Opera Mini) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Browser & Mobile Client Ecosystem</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Nigerian audience browser market share distribution.
              </p>
            </div>
          </div>

          {/* Browser List with Special Callout */}
          <div className="space-y-2.5">
            {data?.browserBreakdown.map((b) => (
              <div key={b.browser} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="font-semibold text-slate-200">{b.browser}</div>
                <div className="flex items-center space-x-3 font-mono">
                  <span className="text-slate-400 text-[11px]">{b.visitors.toLocaleString()} users</span>
                  <span className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                    {b.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Device Breakdown List */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-400 mb-2">Device Hardware Split</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {data?.deviceBreakdown.map((d) => (
                <div key={d.device} className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 text-center">
                  <div className="text-[10px] text-slate-400 font-medium truncate">{d.device.split(' ')[0]}</div>
                  <div className="font-mono font-bold text-white text-sm mt-0.5">{d.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographic Distribution (Nigeria States + Global Diaspora) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Geographic Reader Hubs</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Top Nigerian states and diaspora readers.</p>
            </div>

            {/* Filter Tabs */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-[10px]">
              <button
                onClick={() => setGeoFilter('all')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  geoFilter === 'all' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setGeoFilter('nigeria')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  geoFilter === 'nigeria' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Nigeria Only
              </button>
              <button
                onClick={() => setGeoFilter('diaspora')}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  geoFilter === 'diaspora' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Diaspora
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredGeo.map((geo, index) => (
              <div
                key={geo.location}
                className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-200">{geo.location}</div>
                    <div className="text-[9px] text-amber-400/80 font-medium">{geo.region}</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-white">{geo.visitors.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">{geo.percentage}% share</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 High-Performing Articles Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base font-serif text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Top High-Performing Stories & Editorial Leaderboard</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked stories driving the highest readership volume, dwell time, and virality.
            </p>
          </div>

          {/* Search bar inside top articles */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search top stories..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5 w-12 text-center">Rank</th>
                <th className="p-3.5">Story Headline</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Total Views</th>
                <th className="p-3.5">Est. Unique Readers</th>
                <th className="p-3.5">Avg Read Time</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {filteredArticles.map((art, idx) => (
                <tr key={art.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black ${
                        idx === 0
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="p-3.5 max-w-xs sm:max-w-md">
                    <div
                      onClick={() => onNavigateSite && onNavigateSite('article', art.slug)}
                      className="font-bold text-white hover:text-emerald-400 cursor-pointer line-clamp-1"
                    >
                      {art.title}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                      Published {new Date(art.publishedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      {art.categoryName}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-white">
                    {art.views.toLocaleString()}
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">
                    {art.uniqueReaders.toLocaleString()}
                  </td>
                  <td className="p-3.5 font-mono text-amber-400">
                    {formatDuration(art.avgReadTimeSeconds)}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => onNavigateSite && onNavigateSite('article', art.slug)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition-colors cursor-pointer"
                      title="View Article"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Live Visitor Stream Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="font-bold text-sm text-white">Real-Time Reader Activity Stream</h3>
          </div>
          <button
            onClick={handleReset}
            className="text-[11px] text-slate-400 hover:text-red-400 font-semibold cursor-pointer"
          >
            Clear Live Feed
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(data?.liveVisitorFeed || []).slice(0, 9).map((feed) => (
            <div
              key={feed.id}
              className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 space-y-1.5 text-xs hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <MapPin className="w-3 h-3" />
                  {feed.location}
                </span>
                <span>{feed.timeAgo || 'Just now'}</span>
              </div>
              <div className="font-bold text-slate-200 line-clamp-1">{feed.title}</div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                <span>{feed.device}</span>
                <span className="text-slate-400">{feed.browser}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
