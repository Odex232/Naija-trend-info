import React, { useState, useMemo, useRef } from 'react';
import {
  UploadCloud,
  Grid,
  List as ListIcon,
  Search,
  Filter,
  Trash2,
  Edit3,
  Copy,
  ExternalLink,
  Check,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as AudioIcon,
  Archive as ArchiveIcon,
  Briefcase as OfficeIcon,
  FileCode,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive
} from 'lucide-react';
import { MediaFile } from '../types';
import { api } from '../services/api';

interface MediaLibraryProps {
  mediaFiles: MediaFile[];
  onRefresh: () => void;
  onAskConfirmation: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }) => void;
  onErrorNotification: (msg: string) => void;
  mode?: 'standalone' | 'picker';
  onSelectMedia?: (media: MediaFile) => void;
  allowedTypes?: Array<'image' | 'video' | 'audio' | 'document' | 'office' | 'archive' | 'other'>;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  mediaFiles,
  onRefresh,
  onAskConfirmation,
  onErrorNotification,
  mode = 'standalone',
  onSelectMedia,
  allowedTypes
}) => {
  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'audio' | 'document' | 'office' | 'archive'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Uploading state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string; name: string; progress: number; status: 'uploading' | 'done' | 'error'; errorMsg?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newExternalUrl, setNewExternalUrl] = useState('');
  const [newIsPublished, setNewIsPublished] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  // Edit Modal State
  const [editingMedia, setEditingMedia] = useState<MediaFile | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublished, setEditIsPublished] = useState(true);
  const [editUrl, setEditUrl] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Clipboard Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helper: Classify or get file type
  const getCategory = (file: MediaFile): string => {
    if (file.fileType) return file.fileType;
    const mime = (file.mimeType || '').toLowerCase();
    const name = file.originalName.toLowerCase();

    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/.test(name)) return 'image';
    if (mime.startsWith('video/') || /\.(mp4|webm|mov|avi)$/.test(name)) return 'video';
    if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/.test(name)) return 'audio';
    if (/\.(pdf|txt|rtf)$/.test(name) || mime.includes('pdf')) return 'document';
    if (/\.(doc|docx|ppt|pptx|xls|xlsx|csv)$/.test(name) || mime.includes('word') || mime.includes('excel') || mime.includes('presentation')) return 'office';
    if (/\.(zip|rar|7z|tar|gz)$/.test(name) || mime.includes('zip')) return 'archive';
    return 'other';
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = mediaFiles.length;
    let images = 0;
    let videos = 0;
    let audio = 0;
    let docs = 0;
    let downloads = 0;

    mediaFiles.forEach((m) => {
      const cat = getCategory(m);
      if (cat === 'image') images++;
      else if (cat === 'video') videos++;
      else if (cat === 'audio') audio++;
      else if (cat === 'document' || cat === 'office') docs++;
      downloads += m.downloadCount || 0;
    });

    return { total, images, videos, audio, docs, downloads };
  }, [mediaFiles]);

  // Helper: Format bytes to human readable string
  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper: Get file extension
  const getExtension = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()!.toUpperCase() : 'FILE';
  };

  // Icon mapping
  const renderFileIcon = (file: MediaFile, className = 'w-8 h-8') => {
    const cat = getCategory(file);
    switch (cat) {
      case 'image':
        return <ImageIcon className={`${className} text-emerald-400`} />;
      case 'video':
        return <VideoIcon className={`${className} text-blue-400`} />;
      case 'audio':
        return <AudioIcon className={`${className} text-purple-400`} />;
      case 'document':
        return <FileText className={`${className} text-amber-400`} />;
      case 'office':
        return <OfficeIcon className={`${className} text-emerald-400`} />;
      case 'archive':
        return <ArchiveIcon className={`${className} text-rose-400`} />;
      default:
        return <FileCode className={`${className} text-slate-400`} />;
    }
  };

  // Handle Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFileUploads(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFileUploads(Array.from(e.target.files));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Process and Upload Files
  const processFileUploads = async (files: File[]) => {
    // Basic Client-side validation
    const BLOCKED_EXT = ['.exe', '.bat', '.sh', '.php', '.js', '.py', '.asp', '.aspx', '.vbs', '.cmd', '.msi'];
    const validFiles: File[] = [];

    for (const f of files) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (BLOCKED_EXT.includes(ext)) {
        onErrorNotification(`Executable file type "${f.name}" is prohibited for security.`);
        continue;
      }
      if (f.size > 50 * 1024 * 1024) {
        onErrorNotification(`File "${f.name}" exceeds the maximum limit of 50MB.`);
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 0) return;

    // Track upload progress UI
    const trackerItems = validFiles.map((f, idx) => ({
      id: `upload-${Date.now()}-${idx}`,
      name: f.name,
      progress: 10,
      status: 'uploading' as const
    }));

    setUploadingFiles((prev) => [...prev, ...trackerItems]);

    try {
      // Simulate progress & call API batch upload
      const uploadedResults = await api.uploadMediaBatch(validFiles);

      setUploadingFiles((prev) =>
        prev.map((item) =>
          trackerItems.some((t) => t.id === item.id)
            ? { ...item, progress: 100, status: 'done' }
            : item
        )
      );

      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((item) => !trackerItems.some((t) => t.id === item.id)));
      }, 3000);

      onRefresh();
    } catch (err: any) {
      console.error(err);
      onErrorNotification(err.message || 'File upload failed. Please try again.');
      setUploadingFiles((prev) =>
        prev.map((item) =>
          trackerItems.some((t) => t.id === item.id)
            ? { ...item, status: 'error', errorMsg: err.message || 'Failed' }
            : item
        )
      );
    }
  };

  // Handle Save and Publish New Media
  const openUploadModal = () => {
    setUploadMode('file');
    setNewFile(null);
    setNewTitle('');
    setNewDescription('');
    setNewExternalUrl('');
    setNewIsPublished(true);
    setUploadModalOpen(true);
  };

  const handleSaveAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim()) {
      onErrorNotification('Public Title / Name is required.');
      return;
    }

    if (uploadMode === 'file' && !newFile) {
      onErrorNotification('Please select a file to upload.');
      return;
    }

    if (uploadMode === 'url' && !newExternalUrl.trim()) {
      onErrorNotification('Please provide a valid file or picture URL.');
      return;
    }

    setIsPublishing(true);

    try {
      if (uploadMode === 'file' && newFile) {
        await api.uploadMedia(newFile, {
          title: newTitle.trim(),
          description: newDescription.trim(),
          isPublished: newIsPublished
        });
      } else {
        await api.createExternalMedia({
          url: newExternalUrl.trim(),
          title: newTitle.trim(),
          description: newDescription.trim(),
          isPublished: newIsPublished
        });
      }

      setUploadModalOpen(false);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      onErrorNotification(err.message || 'Failed to save and publish media asset');
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle Edit Media Modal
  const openEditModal = (file: MediaFile) => {
    setEditingMedia(file);
    setEditTitle(file.title || file.originalName.replace(/\.[^/.]+$/, ''));
    setEditAltText(file.altText || file.title || '');
    setEditCaption(file.caption || '');
    setEditDescription(file.description || '');
    setEditIsPublished(file.isPublished !== false);
    setEditUrl(file.url || '');
  };

  const handleSaveEdit = async () => {
    if (!editingMedia) return;
    setIsSavingEdit(true);
    try {
      await api.updateMedia(editingMedia.id, {
        title: editTitle.trim(),
        altText: editAltText.trim(),
        caption: editCaption.trim(),
        description: editDescription.trim(),
        isPublished: editIsPublished,
        url: editUrl.trim() || editingMedia.url
      });
      setEditingMedia(null);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      onErrorNotification(err.message || 'Failed to update media details');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Delete Media
  const handleDeleteMedia = (file: MediaFile) => {
    onAskConfirmation({
      title: 'Permanently Delete File?',
      message: `Are you sure you want to permanently delete "${file.originalName}"? This action cannot be undone and will remove the file from storage.`,
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteMedia(file.id);
          onRefresh();
        } catch (err: any) {
          console.error(err);
          onErrorNotification(err.message || 'Failed to delete media file');
        }
      }
    });
  };

  // Copy URL to Clipboard
  const handleCopyUrl = (file: MediaFile) => {
    const fullUrl = window.location.origin + file.url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtering & Sorting Logic
  const filteredFiles = useMemo(() => {
    return mediaFiles
      .filter((file) => {
        // Allowed types constraint (if used as picker)
        if (allowedTypes && allowedTypes.length > 0) {
          const cat = getCategory(file);
          if (!allowedTypes.includes(cat as any)) return false;
        }

        // Active tab category filter
        if (activeTab !== 'all') {
          const cat = getCategory(file);
          if (cat !== activeTab) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = file.originalName.toLowerCase().includes(q);
          const titleMatch = (file.title || '').toLowerCase().includes(q);
          const descMatch = (file.description || '').toLowerCase().includes(q);
          return nameMatch || titleMatch || descMatch;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        }
        if (sortBy === 'name') {
          return (a.title || a.originalName).localeCompare(b.title || b.originalName);
        }
        if (sortBy === 'size') {
          return (b.size || 0) - (a.size || 0);
        }
        return 0;
      });
  }, [mediaFiles, activeTab, searchQuery, sortBy, allowedTypes]);

  // Pagination Math
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage) || 1;
  const paginatedFiles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFiles.slice(start, start + itemsPerPage);
  }, [filteredFiles, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Summary Bar (Requirement #16) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Media</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-white font-mono">{stats.total}</span>
            <HardDrive className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Images</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{stats.images}</span>
            <ImageIcon className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Videos</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-blue-400 font-mono">{stats.videos}</span>
            <VideoIcon className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audio</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-purple-400 font-mono">{stats.audio}</span>
            <AudioIcon className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Documents</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">{stats.docs}</span>
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Downloads</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-rose-400 font-mono">{stats.downloads}</span>
            <Copy className="w-5 h-5 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Primary Actions Header Bar */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-white font-serif flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-emerald-400" />
            <span>Centralized File Publishing System</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Upload images, videos, audio recordings, or documents to publish directly to the frontend home page and media downloads area.
          </p>
        </div>

        <button
          type="button"
          onClick={openUploadModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload & Publish New Media</span>
        </button>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
            : 'border-slate-700 hover:border-slate-500 bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.zip,.rar"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-serif">
              Upload Media & Documents
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Drag and drop files here, or click the button below. Supports Images, Videos, Audio, PDF, Office documents, and Archives up to 50MB.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Choose Files to Upload</span>
            </button>
          </div>
        </div>

        {/* Upload Progress Tracker */}
        {uploadingFiles.length > 0 && (
          <div className="mt-6 border-t border-slate-800 pt-4 text-left max-w-2xl mx-auto space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Uploading Queue ({uploadingFiles.length})</span>
            </h4>
            {uploadingFiles.map((file) => (
              <div key={file.id} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium truncate max-w-xs">{file.name}</span>
                  {file.status === 'uploading' && <span className="text-emerald-400 font-mono text-[11px]">{file.progress}%</span>}
                  {file.status === 'done' && (
                    <span className="text-emerald-400 flex items-center space-x-1 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Uploaded</span>
                    </span>
                  )}
                  {file.status === 'error' && (
                    <span className="text-rose-400 flex items-center space-x-1 font-semibold text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Failed</span>
                    </span>
                  )}
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      file.status === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${file.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none text-xs font-semibold">
            {[
              { id: 'all', label: 'All Files', icon: HardDrive },
              { id: 'image', label: 'Images', icon: ImageIcon },
              { id: 'video', label: 'Videos', icon: VideoIcon },
              { id: 'audio', label: 'Audio', icon: AudioIcon },
              { id: 'document', label: 'Documents', icon: FileText },
              { id: 'office', label: 'Office', icon: OfficeIcon },
              { id: 'archive', label: 'Archives', icon: ArchiveIcon }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center space-x-2 w-full lg:w-auto justify-end">
            {/* Search Input */}
            <div className="relative flex-1 lg:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search media by title or filename..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">Size (Largest)</option>
            </select>

            {/* Grid / List Mode Toggle */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span>
            Showing <strong className="text-white font-mono">{filteredFiles.length}</strong> {filteredFiles.length === 1 ? 'file' : 'files'}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>
      </div>

      {/* Main Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
          <HardDrive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-200 font-serif">No Media Files Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery ? 'Try clearing your search query or choosing a different filter.' : 'Upload your first image, video, audio, or document using the upload area above.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedFiles.map((file) => {
            const cat = getCategory(file);
            const isImage = cat === 'image';

            return (
              <div
                key={file.id}
                className="group relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-600 transition-all shadow-md hover:shadow-xl flex flex-col"
              >
                {/* Media Thumbnail Container */}
                <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/80">
                  {isImage ? (
                    <img
                      src={file.url}
                      alt={file.altText || file.title || file.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 p-4">
                      {renderFileIcon(file, 'w-10 h-10')}
                      <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase bg-slate-800 px-2 py-0.5 rounded">
                        {getExtension(file.originalName)}
                      </span>
                    </div>
                  )}

                  {/* Top Floating Badges */}
                  <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                    <span className="bg-slate-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 font-bold">
                      {formatFileSize(file.size)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border backdrop-blur-md ${
                        file.isPublished !== false
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                          : 'bg-amber-950/80 text-amber-400 border-amber-800'
                      }`}
                    >
                      {file.isPublished !== false ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {/* Hover Overlay Action Controls */}
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                    {mode === 'picker' && onSelectMedia ? (
                      <button
                        type="button"
                        onClick={() => onSelectMedia(file)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-lg cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Select</span>
                      </button>
                    ) : (
                      <>
                        <a
                          href={`/api/media/${file.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-800 hover:bg-emerald-600 text-white rounded-xl transition-colors cursor-pointer"
                          title="Download File"
                        >
                          <UploadCloud className="w-4 h-4 rotate-180" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(file)}
                          className="p-2 bg-slate-800 hover:bg-emerald-600 text-white rounded-xl transition-colors cursor-pointer"
                          title="Copy Public URL"
                        >
                          {copiedId === file.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-800 hover:bg-blue-600 text-white rounded-xl transition-colors cursor-pointer"
                          title="Open File in New Tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEditModal(file)}
                          className="p-2 bg-slate-800 hover:bg-amber-600 text-white rounded-xl transition-colors cursor-pointer"
                          title="Edit Metadata"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(file)}
                          className="p-2 bg-slate-800 hover:bg-rose-600 text-white rounded-xl transition-colors cursor-pointer"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* File Metadata Details */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white truncate" title={file.title || file.originalName}>
                        {file.title || file.originalName}
                      </h4>
                    </div>
                    {file.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={file.description}>
                        {file.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                    <span className="text-emerald-400 font-bold">Downloads: {(file.downloadCount || 0).toLocaleString()}</span>
                    <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Preview</th>
                <th className="py-3 px-4">Title / Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Uploaded</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedFiles.map((file) => {
                const cat = getCategory(file);
                const isImage = cat === 'image';

                return (
                  <tr key={file.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-4 w-16">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                        {isImage ? (
                          <img src={file.url} alt={file.title || file.originalName} className="w-full h-full object-cover" />
                        ) : (
                          renderFileIcon(file, 'w-5 h-5')
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 max-w-xs">
                      <div className="font-bold text-white truncate">{file.title || file.originalName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{file.originalName}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="bg-slate-800 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {getExtension(file.originalName)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 font-mono">{formatFileSize(file.size)}</td>
                    <td className="py-2.5 px-4 text-slate-400">{new Date(file.uploadedAt).toLocaleDateString()}</td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {mode === 'picker' && onSelectMedia ? (
                          <button
                            type="button"
                            onClick={() => onSelectMedia(file)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Select</span>
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCopyUrl(file)}
                              className="p-1.5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 rounded-lg transition-colors"
                              title="Copy Public URL"
                            >
                              {copiedId === file.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 rounded-lg transition-colors"
                              title="Open File"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => openEditModal(file)}
                              className="p-1.5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 rounded-lg transition-colors"
                              title="Edit Metadata"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMedia(file)}
                              className="p-1.5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-lg transition-colors"
                              title="Delete File"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center space-x-1 cursor-pointer font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  currentPage === p
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center space-x-1 cursor-pointer font-semibold"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Edit Media Metadata Modal */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white font-serif">Edit Media Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMedia(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Media Preview Box */}
              <div className="space-y-3">
                <div className="aspect-square bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-2">
                  {getCategory(editingMedia) === 'image' ? (
                    <img src={editingMedia.url} alt={editingMedia.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      {renderFileIcon(editingMedia, 'w-12 h-12')}
                      <span className="text-xs font-mono text-emerald-400">{getExtension(editingMedia.originalName)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1.5 text-slate-400 font-mono">
                  <div><strong className="text-slate-300">File Name:</strong> <span className="text-slate-100">{editingMedia.originalName}</span></div>
                  <div><strong className="text-slate-300">File Size:</strong> <span className="text-emerald-400">{formatFileSize(editingMedia.size)}</span></div>
                  <div><strong className="text-slate-300">MIME Type:</strong> {editingMedia.mimeType}</div>
                  <div><strong className="text-slate-300">Uploaded:</strong> {new Date(editingMedia.uploadedAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Form Metadata Fields */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Title / Asset Name
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Alt Text (For Accessibility & SEO)
                  </label>
                  <input
                    type="text"
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    placeholder="Describe image for screen readers and SEO..."
                    className="w-full bg-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Caption
                  </label>
                  <input
                    type="text"
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Optional photo credit or caption..."
                    className="w-full bg-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Internal notes or context about this file..."
                    className="w-full bg-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Direct Asset URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl px-3 py-2 border border-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(editingMedia)}
                      className="bg-slate-800 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      {copiedId === editingMedia.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsPublished}
                      onChange={(e) => setEditIsPublished(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-800 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white">Publish Immediately to Frontend</span>
                  </label>
                  <p className="text-[11px] text-slate-400 ml-6 mt-0.5">
                    Uncheck to keep this file as a private draft hidden from public frontend visitors.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingMedia(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                {isSavingEdit ? 'Saving...' : 'Save Media Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Publish New Media Modal (Requirement #1) */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white font-serif">Upload & Publish New Media</h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2 text-center rounded-lg transition-colors cursor-pointer ${
                  uploadMode === 'file' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Upload File from Device
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex-1 py-2 text-center rounded-lg transition-colors cursor-pointer ${
                  uploadMode === 'url' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Paste External File/Picture URL
              </button>
            </div>

            <form onSubmit={handleSaveAndPublish} className="space-y-4">
              {uploadMode === 'file' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Select File <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const f = e.target.files[0];
                        setNewFile(f);
                        if (!newTitle) {
                          setNewTitle(f.name.replace(/\.[^/.]+$/, ''));
                        }
                      }
                    }}
                    className="w-full bg-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports JPG, PNG, WEBP, GIF, SVG, MP4, WEBM, MOV, MP3, WAV, PDF, DOCX, XLSX, PPTX, ZIP, TXT up to 50MB.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    File or Picture URL <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={newExternalUrl}
                    onChange={(e) => setNewExternalUrl(e.target.value)}
                    placeholder="https://example.com/assets/report.pdf or photo.jpg"
                    className="w-full bg-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Name / Public Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g., Nigeria Economic Report 2026 PDF"
                  className="w-full bg-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Short description of what this media/file contains for users..."
                  className="w-full bg-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsPublished}
                    onChange={(e) => setNewIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-800 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white">Publish Immediately to Frontend Home Page</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-600/20 flex items-center space-x-2 disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save & Publish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
