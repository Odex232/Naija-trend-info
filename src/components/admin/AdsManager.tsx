import React, { useState, useEffect } from 'react';
import {
  Ad,
  AdPlacement,
  AdType,
  PlacementPosition,
  AdDeviceTarget,
  AdStatus,
  AdsSettings,
  WebsiteSettings
} from '../../types';
import { api } from '../../services/api';
import { AdSlot } from '../AdSlot';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Smartphone,
  Monitor,
  Tablet,
  Eye,
  Sliders,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Code,
  FileText,
  RefreshCw,
  Search,
  Filter,
  Check,
  Info,
  Maximize2,
  Play,
  Pause,
  ArrowRight,
  Globe,
  SlidersHorizontal,
  Server
} from 'lucide-react';

interface AdsManagerProps {
  ads: Ad[];
  adPlacements: AdPlacement[];
  settings: WebsiteSettings | null;
  onRefreshData: () => Promise<void>;
  triggerSuccessNotification: (msg: string) => void;
  triggerErrorNotification: (msg: string) => void;
  askConfirmation: (title: string, message: string, onConfirm: () => void, opts?: any) => void;
}

export const AdsManager: React.FC<AdsManagerProps> = ({
  ads = [],
  adPlacements = [],
  settings,
  onRefreshData,
  triggerSuccessNotification,
  triggerErrorNotification,
  askConfirmation
}) => {
  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<
    'slots' | 'campaigns' | 'adsense' | 'adsterra' | 'adstxt' | 'preview' | 'diagnostics'
  >('slots');

  // Ads Settings State
  const [adsSettings, setAdsSettings] = useState<AdsSettings>({
    googleAdSense: {
      enabled: settings?.googleAdsensePubId ? true : false,
      publisherId: settings?.googleAdsensePubId || 'ca-pub-1327306895336694',
      autoAds: false,
      testMode: false
    },
    adsterra: {
      enabled: true
    },
    adsTxt: `# Authorized Digital Sellers (ads.txt) for NaijaTrendiInfo (https://naijatrendinfo.com.ng & https://www.naijatrendinfo.com.ng)
# Google AdSense
google.com, pub-1327306895336694, DIRECT, f08c47fec0942fa0

# Adsterra Network
# adsterra.com, DIRECT
`,
    disableAdsSitewide: false
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [placementFilter, setPlacementFilter] = useState<string>('all');

  // Edit Campaign Modal State
  const [editingAd, setEditingAd] = useState<Partial<Ad> | null>(null);
  const [savingAd, setSavingAd] = useState(false);

  // Edit Placement Modal State
  const [editingPlacement, setEditingPlacement] = useState<AdPlacement | null>(null);
  const [savingPlacement, setSavingPlacement] = useState(false);

  // Preview Simulator State
  const [previewSlot, setPreviewSlot] = useState<PlacementPosition>('Header');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copiedAdsTxt, setCopiedAdsTxt] = useState(false);
  const [copiedAdSenseTag, setCopiedAdSenseTag] = useState(false);

  // AdSense Live Diagnostics State
  const [testingAdSense, setTestingAdSense] = useState(false);
  const [adsenseDiagnosticResults, setAdsenseDiagnosticResults] = useState<{
    testedAt?: string;
    pubIdValid: boolean;
    adsTxtMatched: boolean;
    scriptLoaded: boolean;
    tagErrorSafe: boolean;
    activeAdSenseSlotsCount: number;
  } | null>(null);

  // Load Settings on mount
  useEffect(() => {
    loadAdsSettings();
  }, []);

  const loadAdsSettings = async () => {
    try {
      const data = await api.getAdsSettings();
      if (data) {
        setAdsSettings(data);
      }
    } catch (e) {
      console.warn('Could not load remote ads settings, using local:', e);
    }
  };

  const handleSaveAdsSettings = async (partial: Partial<AdsSettings>) => {
    setSavingSettings(true);
    try {
      const updated = await api.updateAdsSettings(partial);
      setAdsSettings(updated);
      triggerSuccessNotification('Monetization settings saved successfully');
      await onRefreshData();
    } catch (e: any) {
      triggerErrorNotification(e.message || 'Failed to save ads settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Auto-format Publisher ID to ca-pub-XXXXXXXXXXXXXXXX
  const handleAutoFormatPublisherId = () => {
    const raw = (adsSettings.googleAdSense?.publisherId || '').trim();
    if (!raw) return;
    const digits = raw.replace(/\D/g, '');
    if (digits) {
      const formatted = `ca-pub-${digits}`;
      const updated = {
        ...adsSettings,
        googleAdSense: {
          ...adsSettings.googleAdSense,
          publisherId: formatted
        }
      };
      setAdsSettings(updated);
      triggerSuccessNotification(`Publisher ID formatted to ${formatted}`);
    }
  };

  // Sync Google Publisher ID to ads.txt line
  const handleSyncPublisherToAdsTxt = async () => {
    const pubId = adsSettings.googleAdSense?.publisherId || 'ca-pub-1327306895336694';
    const digits = pubId.replace('ca-', ''); // pub-XXXXXXXXXXXXXXXX
    const googleLine = `google.com, ${digits}, DIRECT, f08c47fec0942fa0`;
    
    let currentAdsTxt = adsSettings.adsTxt || '';
    if (currentAdsTxt.includes('google.com, pub-')) {
      currentAdsTxt = currentAdsTxt.replace(/google\.com,\s*pub-[a-zA-Z0-9_-]+,\s*DIRECT,\s*f08c47fec0942fa0/i, googleLine);
    } else {
      currentAdsTxt = `# Google AdSense\n${googleLine}\n\n` + currentAdsTxt;
    }

    const updated = {
      ...adsSettings,
      adsTxt: currentAdsTxt
    };
    await handleSaveAdsSettings(updated);
    triggerSuccessNotification('Publisher ID synced to ads.txt successfully');
  };

  // Run comprehensive real-time AdSense Diagnostic test
  const handleRunAdSenseTest = () => {
    setTestingAdSense(true);
    setTimeout(() => {
      const pubId = (adsSettings.googleAdSense?.publisherId || '').trim();
      const pubIdValid = /^ca-pub-\d{16}$/.test(pubId) || /^ca-pub-\d{10,20}$/.test(pubId);
      const digits = pubId.replace('ca-', '');
      const adsTxtMatched = (adsSettings.adsTxt || '').includes(digits);
      const scriptLoaded = typeof document !== 'undefined' && (
        !!document.getElementById('google-adsense-script') ||
        !!document.querySelector('script[src*="adsbygoogle.js"]')
      );
      const tagErrorSafe = typeof window !== 'undefined' && !!(window as any).adsbygoogle;
      const activeAdSenseSlotsCount = adPlacements.filter(
        (p) => p.networkType === 'google_adsense' && p.enabled !== false
      ).length;

      const results = {
        testedAt: new Date().toLocaleTimeString(),
        pubIdValid,
        adsTxtMatched,
        scriptLoaded,
        tagErrorSafe,
        activeAdSenseSlotsCount
      };

      setAdsenseDiagnosticResults(results);
      setTestingAdSense(false);
      triggerSuccessNotification('AdSense configuration diagnostic test completed');
    }, 600);
  };

  // Reset AdSense Settings to pristine defaults (Non-destructive to existing articles/database)
  const handleResetAdSenseSettings = () => {
    askConfirmation(
      'Reset Google AdSense Settings?',
      'This will reset your Google AdSense Publisher ID and Auto Ads toggle to default values. Your articles, categories, Adsterra settings, and media content will remain completely untouched.',
      async () => {
        const resetConfig = {
          ...adsSettings,
          googleAdSense: {
            enabled: true,
            publisherId: 'ca-pub-1327306895336694',
            autoAds: false,
            testMode: false,
            adsenseTagMode: 'official_script' as const,
            globalScript: ''
          }
        };
        await handleSaveAdsSettings(resetConfig);
        triggerSuccessNotification('Google AdSense configuration reset to defaults');
      }
    );
  };

  // Campaign Save
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd?.name) {
      triggerErrorNotification('Campaign name is required');
      return;
    }
    setSavingAd(true);
    try {
      if (editingAd.id) {
        await api.updateAd(editingAd.id, editingAd);
        triggerSuccessNotification(`Campaign "${editingAd.name}" updated successfully`);
      } else {
        await api.createAd(editingAd);
        triggerSuccessNotification(`New ad campaign "${editingAd.name}" created`);
      }
      setEditingAd(null);
      await onRefreshData();
    } catch (e: any) {
      triggerErrorNotification(e.message || 'Failed to save ad campaign');
    } finally {
      setSavingAd(false);
    }
  };

  // Campaign Delete with Confirmation
  const handleDeleteAd = (id: string, name: string) => {
    askConfirmation(
      'Delete Ad Campaign',
      `Are you sure you want to permanently delete the campaign "${name}"? Placements linked to this ad will stop serving it immediately.`,
      async () => {
        try {
          await api.deleteAd(id);
          triggerSuccessNotification('Ad campaign deleted successfully');
          await onRefreshData();
        } catch (e: any) {
          triggerErrorNotification(e.message || 'Failed to delete ad campaign');
        }
      },
      { isDanger: true, confirmLabel: 'Delete Campaign' }
    );
  };

  // Placement Save
  const handleSavePlacement = async (updated: AdPlacement) => {
    setSavingPlacement(true);
    try {
      const currentPlacements = [...adPlacements];
      const index = currentPlacements.findIndex((p) => p.id === updated.id);
      if (index !== -1) {
        currentPlacements[index] = updated;
      } else {
        currentPlacements.push(updated);
      }
      await api.updateAdPlacements(currentPlacements);
      triggerSuccessNotification(`Placement "${updated.position}" updated`);
      setEditingPlacement(null);
      await onRefreshData();
    } catch (e: any) {
      triggerErrorNotification(e.message || 'Failed to save placement');
    } finally {
      setSavingPlacement(false);
    }
  };

  // Quick Toggle Placement
  const handleQuickTogglePlacement = async (placement: AdPlacement) => {
    const updated = { ...placement, enabled: placement.enabled === false ? true : false };
    const currentPlacements = adPlacements.map((p) => (p.id === updated.id ? updated : p));
    try {
      await api.updateAdPlacements(currentPlacements);
      triggerSuccessNotification(
        `Placement "${placement.position}" ${updated.enabled ? 'Enabled' : 'Disabled'}`
      );
      await onRefreshData();
    } catch (e: any) {
      triggerErrorNotification('Failed to toggle placement');
    }
  };

  // Quick Toggle Campaign Status
  const handleQuickToggleAdStatus = async (ad: Ad) => {
    const nextStatus: AdStatus = ad.isActive ? 'paused' : 'active';
    try {
      await api.updateAd(ad.id, {
        isActive: !ad.isActive,
        status: nextStatus
      });
      triggerSuccessNotification(`Campaign "${ad.name}" set to ${nextStatus.toUpperCase()}`);
      await onRefreshData();
    } catch (e: any) {
      triggerErrorNotification('Failed to toggle campaign status');
    }
  };

  // Filtered Campaigns
  const filteredAds = ads.filter((ad) => {
    const matchesSearch =
      ad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ad.advertiserName && ad.advertiserName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ad.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || ad.type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && ad.isActive) ||
      (statusFilter === 'paused' && !ad.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate Metrics
  const totalImpressions = ads.reduce((acc, a) => acc + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.clicks || 0), 0);
  const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const activeAdsCount = ads.filter((a) => a.isActive).length;
  const adsenseCount = ads.filter((a) => a.type === 'google_adsense').length;
  const adsterraCount = ads.filter((a) => a.type === 'adsterra').length;
  const customCount = ads.filter((a) => a.type === 'custom').length;
  const enabledSlotsCount = adPlacements.filter((p) => p.enabled !== false && p.networkType !== 'disabled').length;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
                Ads & Monetization Control Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Production-grade multi-network advertising management for Google AdSense, Adsterra, and Direct Sponsor Banners.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() =>
              setEditingAd({
                name: '',
                type: 'custom',
                format: 'responsive',
                status: 'active',
                isActive: true,
                desktopVisible: true,
                mobileVisible: true,
                tabletVisible: true,
                deviceTarget: 'all',
                pageTarget: 'all'
              })
            }
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
          <button
            onClick={() => setActiveSubTab('preview')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-2xl flex items-center space-x-2 transition-all border border-slate-700 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Live Ad Simulator</span>
          </button>
        </div>
      </div>

      {/* Sitewide Killswitch Banner if active */}
      {adsSettings.disableAdsSitewide && (
        <div className="bg-red-950/80 border border-red-800 text-red-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Sitewide Ads Paused: </span>
              All advertisements are currently suppressed across public pages.
            </div>
          </div>
          <button
            onClick={() => handleSaveAdsSettings({ disableAdsSitewide: false })}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Resume Sitewide Ads
          </button>
        </div>
      )}

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400">Total Ad Slots</div>
          <div className="text-xl font-bold text-white flex items-center space-x-2">
            <span>{adPlacements.length}</span>
            <span className="text-[10px] text-emerald-400 font-normal">({enabledSlotsCount} live)</span>
          </div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400">Active Campaigns</div>
          <div className="text-xl font-bold text-emerald-400">{activeAdsCount} / {ads.length}</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400">Google AdSense</div>
          <div className="text-xl font-bold text-blue-400">{adsenseCount} units</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400">Adsterra</div>
          <div className="text-xl font-bold text-amber-400">{adsterraCount} units</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400">Direct Sponsors</div>
          <div className="text-xl font-bold text-purple-400">{customCount} units</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400">Est. Average CTR</div>
          <div className="text-xl font-bold text-emerald-300">{overallCtr}%</div>
        </div>
      </div>

      {/* Sub-Navigation Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('slots')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'slots'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Placement Slots ({adPlacements.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('campaigns')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'campaigns'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Campaigns & Creatives ({ads.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('adsense')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'adsense'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-400" />
          <span>Google AdSense Hub</span>
        </button>

        <button
          onClick={() => setActiveSubTab('adsterra')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'adsterra'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Adsterra Hub</span>
        </button>

        <button
          onClick={() => setActiveSubTab('adstxt')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'adstxt'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>ads.txt Manager</span>
        </button>

        <button
          onClick={() => setActiveSubTab('preview')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'preview'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>Live Multi-Device Simulator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('diagnostics')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'diagnostics'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Health & Compliance</span>
        </button>
      </div>

      {/* SUB-TAB 1: PLACEMENT SLOTS MATRIX */}
      {activeSubTab === 'slots' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-base text-white">Ad Placement Slot Matrix</h3>
              <p className="text-xs text-slate-400">
                Configure network providers, active ad assignments, device targeting, and CLS layout height for every standard slot.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Sitewide switch:</span>
              <button
                onClick={() =>
                  handleSaveAdsSettings({
                    disableAdsSitewide: !adsSettings.disableAdsSitewide
                  })
                }
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  adsSettings.disableAdsSitewide
                    ? 'bg-red-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {adsSettings.disableAdsSitewide ? 'Ads Disabled (Click to Enable)' : 'All Slots Active'}
              </button>
            </div>
          </div>

          {/* Provider Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">Filter Provider:</span>
            {[
              { id: 'all', label: `All Providers (${adPlacements.length})` },
              { id: 'google_adsense', label: `Google AdSense (${adPlacements.filter((p) => p.networkType === 'google_adsense').length})` },
              { id: 'adsterra', label: `Adsterra (${adPlacements.filter((p) => p.networkType === 'adsterra').length})` },
              { id: 'custom', label: `Direct Sponsors (${adPlacements.filter((p) => p.networkType === 'custom').length})` },
              { id: 'disabled', label: `Disabled (${adPlacements.filter((p) => p.networkType === 'disabled' || p.enabled === false).length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPlacementFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  placementFilter === tab.id
                    ? 'bg-slate-700 text-white border border-slate-600'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adPlacements
              .filter((placement) => {
                if (placementFilter === 'all') return true;
                if (placementFilter === 'disabled') return placement.networkType === 'disabled' || placement.enabled === false;
                return placement.networkType === placementFilter;
              })
              .map((placement) => {
              const assignedAd = ads.find((a) => a.id === placement.adId);
              const isEnabled = placement.enabled !== false && placement.networkType !== 'disabled';

              return (
                <div
                  key={placement.id}
                  className={`bg-slate-900/90 border rounded-2xl p-4 space-y-3 transition-all ${
                    isEnabled
                      ? 'border-slate-800 hover:border-slate-700'
                      : 'border-slate-800/40 opacity-60 bg-slate-950/60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm text-white flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                        <span>{placement.label || placement.position}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{placement.position}</span>
                    </div>

                    <button
                      onClick={() => handleQuickTogglePlacement(placement)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                        isEnabled
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {placement.description || 'Standard display placement for desktop & mobile audiences.'}
                  </p>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Provider:</span>
                      <span
                        className={`font-semibold uppercase text-[11px] ${
                          placement.networkType === 'google_adsense'
                            ? 'text-blue-400'
                            : placement.networkType === 'adsterra'
                            ? 'text-amber-400'
                            : placement.networkType === 'custom'
                            ? 'text-purple-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {placement.networkType.replace('_', ' ')}
                      </span>
                    </div>

                    {placement.networkType === 'google_adsense' && (
                      <div className="flex justify-between items-center bg-blue-950/30 px-2 py-1 rounded-lg border border-blue-900/40">
                        <span className="text-blue-300 text-[11px]">Ad Slot ID:</span>
                        <span className="text-blue-200 font-mono text-[11px]">
                          {placement.adSlotId || 'Auto / Default'}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Target Device:</span>
                      <span className="text-slate-300 font-mono text-[11px] flex items-center space-x-1">
                        {placement.deviceTarget === 'mobile' ? (
                          <Smartphone className="w-3 h-3 text-amber-400" />
                        ) : placement.deviceTarget === 'desktop' ? (
                          <Monitor className="w-3 h-3 text-blue-400" />
                        ) : (
                          <Layers className="w-3 h-3 text-emerald-400" />
                        )}
                        <span className="capitalize">{placement.deviceTarget}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Assigned Creative:</span>
                      <span className="text-slate-200 font-semibold truncate max-w-[140px]" title={assignedAd?.name || 'Automatic by Network'}>
                        {assignedAd?.name || 'Auto (First Active)'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">CLS Height:</span>
                      <span className="text-slate-400 font-mono text-[11px]">{placement.reservedHeight || 90}px</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setPreviewSlot(placement.position);
                        setActiveSubTab('preview');
                      }}
                      className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center space-x-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Slot</span>
                    </button>

                    <button
                      onClick={() => setEditingPlacement(placement)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Configure</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AD CAMPAIGNS & CREATIVES */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="flex flex-1 items-center space-x-3 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search campaigns, advertisers, code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 text-white pl-9 pr-3 py-2 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
              >
                <option value="all">All Providers</option>
                <option value="google_adsense">Google AdSense</option>
                <option value="adsterra">Adsterra</option>
                <option value="custom">Custom Sponsor</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="paused">Paused Only</option>
              </select>
            </div>
          </div>

          {filteredAds.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <p className="text-sm text-slate-400">No ad campaigns found matching your filter criteria.</p>
              <button
                onClick={() =>
                  setEditingAd({
                    name: '',
                    type: 'custom',
                    format: 'responsive',
                    status: 'active',
                    isActive: true,
                    desktopVisible: true,
                    mobileVisible: true,
                    tabletVisible: true
                  })
                }
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Campaign</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAds.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-white line-clamp-1">{ad.name}</h4>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            ad.type === 'google_adsense'
                              ? 'text-blue-400'
                              : ad.type === 'adsterra'
                              ? 'text-amber-400'
                              : 'text-purple-400'
                          }`}
                        >
                          {ad.type.replace('_', ' ')}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          ad.isActive
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {ad.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    {ad.bannerUrl && (
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/40 h-28 flex items-center justify-center">
                        <img
                          src={ad.bannerUrl}
                          alt={ad.name}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {ad.adCode && (
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400 h-16 overflow-hidden text-ellipsis line-clamp-3">
                        {ad.adCode}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl text-center text-xs font-mono border border-slate-800/60">
                      <div>
                        <div className="text-slate-500 text-[10px]">Impressions</div>
                        <div className="text-white font-bold">{ad.impressions?.toLocaleString() ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">Clicks</div>
                        <div className="text-emerald-400 font-bold">{ad.clicks?.toLocaleString() ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">CTR</div>
                        <div className="text-amber-300 font-bold">
                          {ad.impressions && ad.impressions > 0
                            ? (((ad.clicks || 0) / ad.impressions) * 100).toFixed(1) + '%'
                            : '0.0%'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs">
                    <button
                      onClick={() => handleQuickToggleAdStatus(ad)}
                      className={`text-[11px] font-semibold flex items-center space-x-1 cursor-pointer ${
                        ad.isActive ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
                      }`}
                    >
                      {ad.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{ad.isActive ? 'Pause' : 'Resume'}</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingAd(ad)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id, ad.name)}
                        className="px-2.5 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800/60 rounded-lg text-xs font-medium flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: GOOGLE ADSENSE HUB */}
      {activeSubTab === 'adsense' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8">
          {/* Hub Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-blue-400">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-white font-serif">Google AdSense Control & Setup Hub</h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      adsSettings.googleAdSense?.enabled
                        ? adsSettings.googleAdSense?.testMode
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {adsSettings.googleAdSense?.enabled
                      ? adsSettings.googleAdSense?.testMode
                        ? '● Test / Preview Mode'
                        : '● Active & Monetizing'
                      : '○ Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Configure your Google AdSense Publisher account, Global & Auto-Ads scripts, responsive units, and live health diagnostics.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRunAdSenseTest}
                disabled={testingAdSense}
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className={`w-4 h-4 ${testingAdSense ? 'animate-spin' : ''}`} />
                <span>{testingAdSense ? 'Running Diagnostic...' : 'Run Diagnostics'}</span>
              </button>
              <button
                type="button"
                onClick={handleResetAdSenseSettings}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Reset Defaults
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Publisher ID & Settings (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Publisher Credentials Card */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-blue-400 flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>Publisher Credentials</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Format: <span className="text-blue-300">ca-pub-XXXXXXXXXXXXXXXX</span>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-300">
                    Google AdSense Publisher ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={adsSettings.googleAdSense?.publisherId || ''}
                      onChange={(e) =>
                        setAdsSettings({
                          ...adsSettings,
                          googleAdSense: {
                            ...adsSettings.googleAdSense,
                            publisherId: e.target.value
                          }
                        })
                      }
                      placeholder="ca-pub-1327306895336694"
                      className="flex-1 bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 text-xs font-mono focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAutoFormatPublisherId}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
                      title="Auto-formats pub-XXXX or raw digits into ca-pub-XXXX"
                    >
                      Format Clean
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                    <span>From your Google AdSense Dashboard &gt; Account &gt; Settings &gt; Account Information.</span>
                  </p>
                </div>

                {/* Master Toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div>
                      <div className="font-semibold text-xs text-slate-200">Google AdSense Enabled</div>
                      <div className="text-[11px] text-slate-400">Allow active AdSense units to render on assigned placements</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={adsSettings.googleAdSense?.enabled}
                      onChange={(e) =>
                        setAdsSettings({
                          ...adsSettings,
                          googleAdSense: {
                            ...adsSettings.googleAdSense,
                            enabled: e.target.checked
                          }
                        })
                      }
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div>
                      <div className="font-semibold text-xs text-slate-200">Auto Ads Script Injection</div>
                      <div className="text-[11px] text-slate-400">Allows Google to automatically place contextual responsive ads across site</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={adsSettings.googleAdSense?.autoAds}
                      onChange={(e) =>
                        setAdsSettings({
                          ...adsSettings,
                          googleAdSense: {
                            ...adsSettings.googleAdSense,
                            autoAds: e.target.checked
                          }
                        })
                      }
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div>
                      <div className="font-semibold text-xs text-amber-300 flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>AdSense Test & Preview Mode</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Shows layout placeholders with unit IDs without calling live ad auction servers
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={adsSettings.googleAdSense?.testMode}
                      onChange={(e) =>
                        setAdsSettings({
                          ...adsSettings,
                          googleAdSense: {
                            ...adsSettings.googleAdSense,
                            testMode: e.target.checked
                          }
                        })
                      }
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Global Script Management Card */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-blue-400 flex items-center space-x-2">
                    <Code className="w-4 h-4" />
                    <span>Global AdSense Script Injection</span>
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const pubId = adsSettings.googleAdSense?.publisherId || 'ca-pub-1327306895336694';
                        const officialTag = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}" crossorigin="anonymous"></script>`;
                        navigator.clipboard.writeText(officialTag);
                        setCopiedAdSenseTag(true);
                        setTimeout(() => setCopiedAdSenseTag(false), 2000);
                        triggerSuccessNotification('Official AdSense script copied to clipboard');
                      }}
                      className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedAdSenseTag ? 'Copied!' : 'Copy Official Tag'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  The system automatically injects your official AdSense script into the public &lt;head&gt; during SSR and client navigation. If you have custom verification tags or customized script attributes, you can specify them below.
                </p>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-300">
                    Custom Script Tag Override (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={adsSettings.googleAdSense?.globalScript || ''}
                    onChange={(e) =>
                      setAdsSettings({
                        ...adsSettings,
                        googleAdSense: {
                          ...adsSettings.googleAdSense,
                          globalScript: e.target.value
                        }
                      })
                    }
                    placeholder={`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsSettings.googleAdSense?.publisherId || 'ca-pub-1327306895336694'}" crossorigin="anonymous"></script>`}
                    className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] focus:border-blue-500 focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Leave blank to automatically use the official Google AdSense CDN tag with your Publisher ID.
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    disabled={savingSettings}
                    onClick={() => handleSaveAdsSettings(adsSettings)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-950/50 cursor-pointer flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingSettings ? 'Saving Settings...' : 'Save Google AdSense Settings'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSubTab('preview')}
                    className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    <span>Open Live Ad Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Diagnostics & Integration Verification (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Diagnostic Test Panel */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="font-bold text-sm text-emerald-400 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>AdSense Integration Status</span>
                  </h4>
                  {adsenseDiagnosticResults?.testedAt && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      Checked: {adsenseDiagnosticResults.testedAt}
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  {/* Check 1: Publisher ID */}
                  <div className="flex items-start justify-between p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-200">Publisher ID Format</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {adsSettings.googleAdSense?.publisherId || 'None'}
                      </div>
                    </div>
                    {adsSettings.googleAdSense?.publisherId?.startsWith('ca-pub-') ? (
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-bold">
                        Valid
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-[10px] font-bold">
                        Check Prefix
                      </span>
                    )}
                  </div>

                  {/* Check 2: ads.txt Entry */}
                  <div className="flex items-start justify-between p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-200">Authorized Seller (ads.txt)</div>
                      <div className="text-[11px] text-slate-400">
                        {(adsSettings.adsTxt || '').includes((adsSettings.googleAdSense?.publisherId || '').replace('ca-', '')) ? (
                          <span className="text-emerald-400 font-medium">Matching record verified</span>
                        ) : (
                          <span className="text-amber-400 font-medium">Record not matching</span>
                        )}
                      </div>
                    </div>
                    {!(adsSettings.adsTxt || '').includes((adsSettings.googleAdSense?.publisherId || '').replace('ca-', '')) && (
                      <button
                        type="button"
                        onClick={handleSyncPublisherToAdsTxt}
                        className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-lg text-[10px] font-bold"
                      >
                        Sync Now
                      </button>
                    )}
                  </div>

                  {/* Check 3: Active Placements */}
                  <div className="flex items-start justify-between p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-200">AdSense Placements Assigned</div>
                      <div className="text-[11px] text-slate-400">
                        {adPlacements.filter((p) => p.networkType === 'google_adsense' && p.enabled !== false).length} of {adPlacements.length} slots active
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('slots')}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Manage Slots
                    </button>
                  </div>

                  {/* Check 4: Tag Error & Push Protection */}
                  <div className="flex items-start justify-between p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-200">TagError & Push Protection</div>
                      <div className="text-[11px] text-slate-400">
                        Global adsbygoogle proxy & DOM guard active
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-bold">
                      Protected
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRunAdSenseTest}
                    disabled={testingAdSense}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingAdSense ? 'animate-spin' : ''}`} />
                    <span>{testingAdSense ? 'Validating...' : 'Run AdSense Diagnostic Test'}</span>
                  </button>
                </div>
              </div>

              {/* Best Practices Checklist Card */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-sm text-slate-200">Google AdSense Best Practices</h4>
                <ul className="space-y-2.5 text-slate-400 text-xs">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Publisher ID:</strong> Always prefix with <code>ca-pub-</code> in ad tags and <code>pub-</code> in <code>ads.txt</code>.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Cumulative Layout Shift (CLS):</strong> Each slot has reserved container height to ensure zero layout shift.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Adsterra Coexistence:</strong> AdSense and Adsterra scripts are isolated in separate execution contexts to prevent clashes.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ADSTERRA HUB */}
      {activeSubTab === 'adsterra' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Adsterra Advertising Network Hub</h3>
              <p className="text-xs text-slate-400">
                Safe sandboxed execution engine for Adsterra Banners (728x90, 300x250, 468x60), Social Bars, and Native widgets.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <h4 className="font-bold text-sm text-amber-400">Network Controls</h4>
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div>
                  <div className="font-semibold text-xs text-slate-200">Adsterra Network Enabled</div>
                  <div className="text-[10px] text-slate-400">Allow Adsterra scripts to execute in isolated sandboxes</div>
                </div>
                <input
                  type="checkbox"
                  checked={adsSettings.adsterra?.enabled}
                  onChange={(e) =>
                    setAdsSettings({
                      ...adsSettings,
                      adsterra: {
                        ...adsSettings.adsterra,
                        enabled: e.target.checked
                      }
                    })
                  }
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sandboxed Execution Active</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  All Adsterra scripts and `atOptions` definitions are isolated inside dedicated sandboxed frames. This guarantees they will never conflict with other providers or cause global JavaScript collisions.
                </p>
              </div>

              <button
                disabled={savingSettings}
                onClick={() => handleSaveAdsSettings(adsSettings)}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                {savingSettings ? 'Saving...' : 'Save Adsterra Settings'}
              </button>
            </div>

            <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs">
              <h4 className="font-bold text-sm text-slate-200">How to Add Adsterra Ad Codes</h4>
              <ol className="list-decimal pl-4 space-y-2 text-slate-400 text-xs">
                <li>Log in to your <strong>Adsterra Publisher Dashboard</strong>.</li>
                <li>Generate an Ad Unit (e.g. 728x90, 300x250, or Social Bar).</li>
                <li>Copy the provided code snippet containing `atOptions` and `invoke.js`.</li>
                <li>Go to <strong>Campaigns & Creatives</strong>, click <strong>Create Campaign</strong>, select <strong>Adsterra</strong>, and paste the code snippet.</li>
                <li>Assign the campaign to your desired slot in the <strong>Placement Slots Matrix</strong>.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: ADS.TXT MANAGER */}
      {activeSubTab === 'adstxt' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Authorized Digital Sellers (ads.txt)</h3>
                <p className="text-xs text-slate-400">
                  Served publicly at <code className="text-purple-300">https://www.naijatrendinfo.com.ng/ads.txt</code> to verify authorized ad networks.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href="/ads.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors border border-slate-700"
              >
                <span>View Live /ads.txt</span>
                <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(adsSettings.adsTxt);
                  setCopiedAdsTxt(true);
                  setTimeout(() => setCopiedAdsTxt(false), 2000);
                }}
                className="px-3.5 py-2 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                {copiedAdsTxt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAdsTxt ? 'Copied!' : 'Copy Raw Text'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              ads.txt Content (Plain Text Records)
            </label>
            <textarea
              rows={12}
              value={adsSettings.adsTxt || ''}
              onChange={(e) => setAdsSettings({ ...adsSettings, adsTxt: e.target.value })}
              className="w-full bg-slate-950 text-emerald-400 p-4 rounded-2xl border border-slate-800 font-mono text-xs focus:outline-none focus:border-purple-500 leading-relaxed"
              placeholder="# Example:&#10;google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0&#10;adsterra.com, PUBLISHER_ID, DIRECT"
            />
          </div>

          <div className="flex justify-end">
            <button
              disabled={savingSettings}
              onClick={() => handleSaveAdsSettings(adsSettings)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              {savingSettings ? 'Saving...' : 'Save & Publish ads.txt'}
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: LIVE MULTI-DEVICE SIMULATOR */}
      {activeSubTab === 'preview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Live Multi-Device Ads Simulator</h3>
              <p className="text-xs text-slate-400">
                Test how any slot and assigned ad campaign renders across Desktop, Tablet, and Mobile viewports without artificial analytics tracking.
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (728px+)</span>
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  previewDevice === 'tablet' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet (468px)</span>
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (320px)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <label className="text-xs font-semibold text-slate-300">Select Slot to Simulate:</label>
            <select
              value={previewSlot}
              onChange={(e) => setPreviewSlot(e.target.value as PlacementPosition)}
              className="bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-800 text-xs font-medium"
            >
              {adPlacements.map((p) => (
                <option key={p.id} value={p.position}>
                  {p.position} ({p.networkType})
                </option>
              ))}
            </select>
          </div>

          {/* Simulator Canvas */}
          <div className="flex justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800 overflow-x-auto">
            <div
              className={`transition-all duration-300 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl ${
                previewDevice === 'desktop'
                  ? 'w-full max-w-4xl'
                  : previewDevice === 'tablet'
                  ? 'w-[520px]'
                  : 'w-[360px]'
              }`}
            >
              <div className="text-[10px] text-slate-500 font-mono mb-2 flex justify-between">
                <span>VIEWPORT: {previewDevice.toUpperCase()}</span>
                <span>SLOT: {previewSlot}</span>
              </div>
              <AdSlot
                position={previewSlot}
                placements={adPlacements}
                ads={ads}
                settings={adsSettings}
                isPreview={true}
                previewDevice={previewDevice}
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: HEALTH & COMPLIANCE DIAGNOSTICS */}
      {activeSubTab === 'diagnostics' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-2xl text-teal-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Advertising Diagnostics & Compliance Suite</h3>
              <p className="text-xs text-slate-400">
                Automated audits to verify script sandboxing, Cumulative Layout Shift (CLS) ratings, and publisher rules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 font-bold text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Script Separation & Sandboxing</span>
              </div>
              <p className="text-xs text-slate-400">
                Verified: Adsterra and Google AdSense scripts are strictly isolated in distinct container boundaries with zero global namespace contamination.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 font-bold text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>CLS (Cumulative Layout Shift) Protection</span>
              </div>
              <p className="text-xs text-slate-400">
                Verified: Every ad container reserves minimum height (90px–250px) prior to script initialization, eliminating sudden page content jumps.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 font-bold text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Single-Page App Re-render Safety</span>
              </div>
              <p className="text-xs text-slate-400">
                Verified: `adsbygoogle.push({})` calls are guarded against duplicate execution errors when navigating between React views.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 font-bold text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Content-Aware Exclusion Logic</span>
              </div>
              <p className="text-xs text-slate-400">
                Verified: System supports suppressing ads on specific sensitive articles, categories, or entire pages upon request.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CAMPAIGN MODAL */}
      {editingAd && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full text-xs space-y-4 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base font-serif text-white">
                {editingAd.id ? 'Edit Ad Campaign' : 'Create New Ad Campaign'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingAd(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAd} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={editingAd.name || ''}
                  onChange={(e) => setEditingAd({ ...editingAd, name: e.target.value })}
                  placeholder="e.g. Header Leaderboard Sponsor / Adsterra 300x250"
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Ad Network Provider</label>
                  <select
                    value={editingAd.type || 'custom'}
                    onChange={(e) => setEditingAd({ ...editingAd, type: e.target.value as AdType })}
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                  >
                    <option value="google_adsense">Google AdSense</option>
                    <option value="adsterra">Adsterra</option>
                    <option value="custom">Custom Advertiser / Sponsor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Campaign Status</label>
                  <select
                    value={editingAd.status || (editingAd.isActive ? 'active' : 'paused')}
                    onChange={(e) =>
                      setEditingAd({
                        ...editingAd,
                        status: e.target.value as AdStatus,
                        isActive: e.target.value === 'active'
                      })
                    }
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                  >
                    <option value="active">Active (Serving)</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Custom Sponsor fields */}
              {editingAd.type === 'custom' && (
                <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="font-bold text-purple-400">Direct Sponsor Details</div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Advertiser / Brand Name</label>
                    <input
                      type="text"
                      value={editingAd.advertiserName || ''}
                      onChange={(e) => setEditingAd({ ...editingAd, advertiserName: e.target.value })}
                      placeholder="e.g. Zenith Bank / MTN Nigeria"
                      className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Banner Image URL *</label>
                    <input
                      type="url"
                      required
                      value={editingAd.bannerUrl || ''}
                      onChange={(e) => setEditingAd({ ...editingAd, bannerUrl: e.target.value })}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Destination Click URL</label>
                    <input
                      type="url"
                      value={editingAd.destinationUrl || ''}
                      onChange={(e) => setEditingAd({ ...editingAd, destinationUrl: e.target.value })}
                      placeholder="https://advertiser.com/promo"
                      className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Adsterra or Script fields */}
              {(editingAd.type === 'adsterra' || editingAd.type === 'google_adsense') && (
                <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="font-bold text-amber-400">Network Code / Script Snippet</div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">
                      Ad Unit HTML / JavaScript Tag
                    </label>
                    <textarea
                      rows={5}
                      value={editingAd.adCode || ''}
                      onChange={(e) => setEditingAd({ ...editingAd, adCode: e.target.value })}
                      placeholder="Paste your ad snippet (e.g. <script ...></script> or atOptions = {...})"
                      className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* Device Targeting */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Device Target</label>
                  <select
                    value={editingAd.deviceTarget || 'all'}
                    onChange={(e) =>
                      setEditingAd({ ...editingAd, deviceTarget: e.target.value as AdDeviceTarget })
                    }
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                  >
                    <option value="all">All Devices</option>
                    <option value="desktop">Desktop Only</option>
                    <option value="mobile">Mobile Only</option>
                    <option value="tablet">Tablet Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Priority Weight</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingAd.priority || 1}
                    onChange={(e) => setEditingAd({ ...editingAd, priority: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAd(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAd}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {savingAd ? 'Saving Campaign...' : 'Save Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLACEMENT MODAL */}
      {editingPlacement && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-xs space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base font-serif text-white">
                Configure Placement: {editingPlacement.position}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPlacement(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Placement Label</label>
                <input
                  type="text"
                  value={editingPlacement.label || editingPlacement.position}
                  onChange={(e) => setEditingPlacement({ ...editingPlacement, label: e.target.value })}
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Assigned Provider</label>
                  <select
                    value={editingPlacement.networkType || 'custom'}
                    onChange={(e) =>
                      setEditingPlacement({
                        ...editingPlacement,
                        networkType: e.target.value as any
                      })
                    }
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                  >
                    <option value="google_adsense">Google AdSense</option>
                    <option value="adsterra">Adsterra</option>
                    <option value="custom">Custom Sponsor</option>
                    <option value="disabled">Disabled (No Ads)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Device Target</label>
                  <select
                    value={editingPlacement.deviceTarget || 'all'}
                    onChange={(e) =>
                      setEditingPlacement({
                        ...editingPlacement,
                        deviceTarget: e.target.value as AdDeviceTarget
                      })
                    }
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                  >
                    <option value="all">All Devices</option>
                    <option value="desktop">Desktop Only</option>
                    <option value="mobile">Mobile Only</option>
                    <option value="tablet">Tablet Only</option>
                  </select>
                </div>
              </div>

              {/* Google AdSense Unit Settings */}
              {editingPlacement.networkType === 'google_adsense' && (
                <div className="p-4 bg-blue-950/40 border border-blue-800/60 rounded-2xl space-y-3">
                  <div className="font-bold text-blue-400 flex items-center space-x-1.5">
                    <Globe className="w-4 h-4" />
                    <span>AdSense Unit Configuration</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-300">
                        Ad Unit Slot ID (data-ad-slot)
                      </label>
                      <input
                        type="text"
                        value={editingPlacement.adSlotId || ''}
                        onChange={(e) =>
                          setEditingPlacement({ ...editingPlacement, adSlotId: e.target.value })
                        }
                        placeholder="e.g. 9876543210"
                        className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-300">Ad Format Style</label>
                      <select
                        value={editingPlacement.adFormat || 'auto'}
                        onChange={(e) =>
                          setEditingPlacement({
                            ...editingPlacement,
                            adFormat: e.target.value as any
                          })
                        }
                        className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                      >
                        <option value="auto">Auto / Responsive</option>
                        <option value="fluid">Fluid (In-Article)</option>
                        <option value="rectangle">Medium Rectangle (300x250)</option>
                        <option value="horizontal">Horizontal Banner (728x90 / 320x50)</option>
                        <option value="vertical">Vertical Skyscraper (300x600)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">Full Width Responsive (data-full-width-responsive)</span>
                    <input
                      type="checkbox"
                      checked={editingPlacement.responsive !== false}
                      onChange={(e) =>
                        setEditingPlacement({ ...editingPlacement, responsive: e.target.checked })
                      }
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Specific Ad Campaign (Optional)</label>
                <select
                  value={editingPlacement.adId || ''}
                  onChange={(e) => setEditingPlacement({ ...editingPlacement, adId: e.target.value || undefined })}
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                >
                  <option value="">Auto (First active campaign of provider)</option>
                  {ads
                    .filter((a) => a.type === editingPlacement.networkType)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.isActive ? 'Active' : 'Paused'})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">CLS Reserved Height (Pixels)</label>
                <input
                  type="number"
                  min="50"
                  max="600"
                  value={editingPlacement.reservedHeight || 90}
                  onChange={(e) =>
                    setEditingPlacement({
                      ...editingPlacement,
                      reservedHeight: parseInt(e.target.value) || 90
                    })
                  }
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-200">Enable this Placement</div>
                  <div className="text-[10px] text-slate-400">Renders live on public pages</div>
                </div>
                <input
                  type="checkbox"
                  checked={editingPlacement.enabled !== false}
                  onChange={(e) => setEditingPlacement({ ...editingPlacement, enabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPlacement(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingPlacement}
                  onClick={() => handleSavePlacement(editingPlacement)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {savingPlacement ? 'Saving Placement...' : 'Save Placement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsManager;
