import React, { useState, useEffect, useMemo } from 'react';
import { MediaFile } from '../types';
import { api } from '../services/api';
import {
  Download,
  Search,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as AudioIcon,
  Archive as ArchiveIcon,
  FileSpreadsheet as OfficeIcon,
  HardDrive,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Filter,
  ArrowDownToLine
} from 'lucide-react';

interface PublicMediaDownloadsSectionProps {
  className?: string;
}

export const PublicMediaDownloadsSection: React.FC<PublicMediaDownloadsSectionProps> = ({ className = '' }) => {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch published media dynamically from backend API
  const fetchPublishedMedia = async () => {
    try {
      const data = await api.getMedia(true);
      setMediaList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Unable to fetch public media files from API:', err);
      setMediaList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishedMedia();
  }, []);

  // Helper to categorize media
  const getCategory = (file: MediaFile): string => {
    const ext = file.originalName.split('.').pop()?.toLowerCase() || '';
    const mime = (file.mimeType || '').toLowerCase();

    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) return 'image';
    if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video';
    if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
    if (ext === 'pdf' || mime.includes('pdf')) return 'pdf';
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv'].includes(ext)) return 'document';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
    return 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Filtered Media Calculation
  const filteredMedia = useMemo(() => {
    return mediaList.filter((item) => {
      const cat = getCategory(item);

      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'pdf' && cat !== 'pdf') return false;
        if (activeCategory === 'document' && cat !== 'document' && cat !== 'pdf') return false;
        if (activeCategory === 'image' && cat !== 'image') return false;
        if (activeCategory === 'video' && cat !== 'video') return false;
        if (activeCategory === 'audio' && cat !== 'audio') return false;
        if (activeCategory === 'archive' && cat !== 'archive') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const nameMatch = (item.originalName || '').toLowerCase().includes(q);
        const descMatch = (item.description || '').toLowerCase().includes(q);
        const extMatch = (item.originalName.split('.').pop() || '').toLowerCase().includes(q);
        return titleMatch || nameMatch || descMatch || extMatch;
      }

      return true;
    });
  }, [mediaList, activeCategory, searchQuery]);

  const handleCopyLink = (url: string, id: string) => {
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderIcon = (file: MediaFile) => {
    const cat = getCategory(file);
    if (cat === 'image') return <ImageIcon className="w-6 h-6 text-emerald-400" />;
    if (cat === 'video') return <VideoIcon className="w-6 h-6 text-blue-400" />;
    if (cat === 'audio') return <AudioIcon className="w-6 h-6 text-purple-400" />;
    if (cat === 'pdf') return <FileText className="w-6 h-6 text-rose-400" />;
    if (cat === 'document') return <OfficeIcon className="w-6 h-6 text-amber-400" />;
    if (cat === 'archive') return <ArchiveIcon className="w-6 h-6 text-amber-500" />;
    return <HardDrive className="w-6 h-6 text-slate-400" />;
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center animate-pulse">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-300">Loading Media & Official Downloads Library...</p>
      </div>
    );
  }

  if (mediaList.length === 0) {
    return null; // Don't show if empty unless searched
  }

  return (
    <section className={`bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden ${className}`}>
      {/* Decorative Gradient Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6 relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>NaijaTrendiInfo Media & Download Portal</span>
          </div>
          <h2 className="text-2xl font-black font-serif text-white tracking-tight">
            Official Media, Press Reports & Downloads
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Access, stream, and download verified press statements, audio bulletins, infographs, whitepapers, and official reports directly from our media desk.
          </p>
        </div>

        {/* Live Counter Pill */}
        <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl shrink-0">
          <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Files</span>
            <span className="text-sm font-extrabold font-mono text-white">{mediaList.length} Items</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="space-y-4 mb-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search published media by title, description or file extension..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 text-white placeholder-slate-400 text-xs rounded-2xl pl-10 pr-4 py-3 border border-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Quick Clear Filter Button */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-slate-400 hover:text-white px-3 py-2 bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
          {[
            { id: 'all', label: 'All Media', icon: HardDrive },
            { id: 'document', label: 'Documents & Reports', icon: FileText },
            { id: 'image', label: 'Images & Photos', icon: ImageIcon },
            { id: 'video', label: 'Videos', icon: VideoIcon },
            { id: 'audio', label: 'Audio & Podcasts', icon: AudioIcon },
            { id: 'archive', label: 'ZIP & Archives', icon: ArchiveIcon }
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Display of Published Files */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800/80">
          <Filter className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-300">No media files match your current search criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try searching with a different keyword or selecting 'All Media'.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
          {filteredMedia.map((file) => {
            const cat = getCategory(file);
            const isImg = cat === 'image';
            const ext = file.originalName.split('.').pop()?.toUpperCase() || 'FILE';

            return (
              <div
                key={file.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col justify-between group"
              >
                {/* Media Header / Preview Container */}
                <div>
                  <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center border-b border-slate-800/80">
                    {isImg ? (
                      <img
                        src={file.url}
                        alt={file.title || file.originalName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2 p-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shadow-inner">
                          {renderIcon(file)}
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                          .{ext.toLowerCase()}
                        </span>
                      </div>
                    )}

                    {/* File Size Badge */}
                    <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md text-slate-200 text-[10px] font-mono px-2.5 py-1 rounded-lg border border-white/10 font-bold">
                      {formatFileSize(file.size)}
                    </div>

                    {/* Quick Action Preview Buttons */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(file.url, file.id)}
                        className="p-1.5 bg-slate-950/80 hover:bg-emerald-600 text-white rounded-lg backdrop-blur-md transition-colors cursor-pointer"
                        title="Copy Share Link"
                      >
                        {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-950/80 hover:bg-blue-600 text-white rounded-lg backdrop-blur-md transition-colors cursor-pointer"
                        title="Preview File in New Tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Card Content Info */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                      {file.title || file.originalName}
                    </h3>

                    {file.description ? (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {file.description}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        File: {file.originalName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer: Download Trigger & Stats */}
                <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3 bg-slate-900/30">
                  <div className="text-[10px] text-slate-400 space-y-0.5">
                    <div className="font-mono text-emerald-400 font-bold">
                      {(file.downloadCount || 0).toLocaleString()} Downloads
                    </div>
                    <div>{new Date(file.uploadedAt).toLocaleDateString()}</div>
                  </div>

                  <a
                    href={`/api/media/${file.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      // Optimistic increment download count locally for snappy feedback
                      setMediaList((prev) =>
                        prev.map((item) =>
                          item.id === file.id ? { ...item, downloadCount: (item.downloadCount || 0) + 1 } : item
                        )
                      );
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-emerald-600/30 flex items-center space-x-1.5 shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
