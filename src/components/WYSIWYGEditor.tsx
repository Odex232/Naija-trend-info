import React, { useState } from 'react';
import {
  Bold,
  Italic,
  List,
  Heading,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Sparkles,
  Quote,
  AlignLeft,
  Folder,
  X,
  Play,
  Check,
  Film,
  ExternalLink,
  Info,
  Youtube
} from 'lucide-react';
import { api } from '../services/api';
import { MediaLibrary } from './MediaLibrary';
import { MediaFile } from '../types';
import { parseVideoUrl, generateVideoEmbedHtml } from '../utils/videoHelper';

interface WYSIWYGEditorProps {
  value: string;
  onChange: (val: string) => void;
  topicTitle?: string;
  categoryName?: string;
  mediaFiles?: MediaFile[];
  onRefreshMedia?: () => void;
}

export const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({
  value,
  onChange,
  topicTitle = '',
  categoryName = '',
  mediaFiles = [],
  onRefreshMedia
}) => {
  const [aiGenerating, setAiGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  // Video URL Editor Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoInputUrl, setVideoInputUrl] = useState('');
  const [videoCaption, setVideoCaption] = useState('');
  const [videoCredit, setVideoCredit] = useState('');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16' | '4:3'>('16:9');
  const [inlineVideoUrl, setInlineVideoUrl] = useState('');

  const insertTag = (tagOpen: string, tagClose: string = '') => {
    const textarea = document.getElementById('article-wysiwyg-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = tagOpen + (selectedText || 'Text here') + tagClose;

    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    onChange(newValue);
  };

  const handleAiAssist = async () => {
    if (!topicTitle) {
      alert('Please enter an article title first to use AI editing assist.');
      return;
    }
    setAiGenerating(true);
    try {
      const res = await api.suggestHeadline(topicTitle, categoryName);
      if (res.headlines && res.headlines.length > 0) {
        const formatted = `
<p>${res.headlines[0]}</p>
<h2>Key Developments and Official Statements</h2>
<p>Official sources in Nigeria have released detailed commentary regarding recent events. Strategic stakeholders across government and industry remain focused on key outcomes.</p>
<blockquote>"We remain committed to transparent governance, rapid response, and sustainable development across all sectors," stated official representatives.</blockquote>
<h2>Market Impact and Public Reaction</h2>
<p>Reactions across major hubs including Lagos, Abuja, Port Harcourt, and Kano highlight widespread engagement with the policy directions announced.</p>
        `.trim();
        onChange(value ? value + '\n\n' + formatted : formatted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      const imgHtml = `<figure class="my-4"><img src="${imageUrl}" alt="Article Image" class="w-full rounded-xl shadow-md" /><figcaption class="text-xs text-slate-500 mt-1 text-center">Photo/Graphics Credit: NaijaTrendiInfo Bureau</figcaption></figure>`;
      onChange(value ? value + '\n' + imgHtml : imgHtml);
      setImageUrl('');
    }
  };

  // Insert parsed video into article content
  const handleInsertVideoSnippet = (urlToInsert?: string) => {
    const targetUrl = urlToInsert || videoInputUrl;
    if (!targetUrl || !targetUrl.trim()) return;

    const embedHtml = generateVideoEmbedHtml({
      url: targetUrl.trim(),
      caption: videoCaption.trim(),
      credit: videoCredit.trim(),
      aspectRatio: videoAspectRatio
    });

    if (embedHtml) {
      const textarea = document.getElementById('article-wysiwyg-textarea') as HTMLTextAreaElement;
      if (textarea && textarea.selectionStart !== undefined) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = textarea.value.substring(0, start);
        const after = textarea.value.substring(end);
        onChange((before ? before + '\n\n' : '') + embedHtml + (after ? '\n\n' + after : ''));
      } else {
        onChange(value ? value + '\n\n' + embedHtml : embedHtml);
      }

      setVideoInputUrl('');
      setVideoCaption('');
      setVideoCredit('');
      setInlineVideoUrl('');
      setVideoModalOpen(false);
    }
  };

  const handleQuickInlineVideo = () => {
    if (!inlineVideoUrl.trim()) return;
    const embedHtml = generateVideoEmbedHtml({
      url: inlineVideoUrl.trim(),
      caption: 'Video Report',
      credit: 'NaijaTrendiInfo Media',
      aspectRatio: '16:9'
    });
    if (embedHtml) {
      onChange(value ? value + '\n\n' + embedHtml : embedHtml);
      setInlineVideoUrl('');
    }
  };

  const handleSelectMediaItem = (file: MediaFile) => {
    const mime = (file.mimeType || '').toLowerCase();
    const name = file.originalName.toLowerCase();
    let insertSnippet = '';

    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/.test(name)) {
      insertSnippet = `<figure class="my-4"><img src="${file.url}" alt="${file.altText || file.title || file.originalName}" class="w-full rounded-xl shadow-md" /><figcaption class="text-xs text-slate-500 mt-1 text-center">${file.caption || file.title || 'Photo Credit: NaijaTrendiInfo Bureau'}</figcaption></figure>`;
    } else if (mime.startsWith('video/') || /\.(mp4|webm|mov)$/.test(name)) {
      insertSnippet = `<figure class="article-video-embed my-6 w-full"><div class="relative w-full aspect-video overflow-hidden rounded-2xl bg-black shadow-xl"><video controls playsinline class="w-full h-full rounded-2xl"><source src="${file.url}" type="${file.mimeType}"></video></div><figcaption class="mt-2 text-xs text-slate-500 text-center font-medium">${file.title || 'Video Report'}</figcaption></figure>`;
    } else if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/.test(name)) {
      insertSnippet = `<figure class="my-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700"><audio controls class="w-full"><source src="${file.url}" type="${file.mimeType}"></audio><figcaption class="text-xs text-slate-500 mt-2 text-center font-bold">${file.title || 'Audio Recording'}</figcaption></figure>`;
    } else {
      insertSnippet = `<p class="my-3"><a href="${file.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-2 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-emerald-500 transition-colors">📥 Download Attachment: ${file.title || file.originalName}</a></p>`;
    }

    onChange(value ? value + '\n' + insertSnippet : insertSnippet);
    setPickerOpen(false);
  };

  const parsedCurrentVideo = parseVideoUrl(videoInputUrl);

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      {/* Formatting Toolbar */}
      <div className="bg-slate-100 dark:bg-slate-800/90 p-2.5 border-b border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => insertTag('<h2>', '</h2>')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold flex items-center space-x-1 transition-colors"
          title="Heading 2"
        >
          <Heading className="w-4 h-4" />
          <span>H2</span>
        </button>

        <button
          type="button"
          onClick={() => insertTag('<h3>', '</h3>')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold flex items-center space-x-1 transition-colors"
          title="Heading 3"
        >
          <Heading className="w-3.5 h-3.5" />
          <span>H3</span>
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

        <button
          type="button"
          onClick={() => insertTag('<strong>', '</strong>')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag('<em>', '</em>')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 italic transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag('<blockquote>', '</blockquote>')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
          title="Quote Block"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag('<p>', '</p>')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
          title="Paragraph"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
          title="Unordered List"
        >
          <List className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

        {/* Dedicated Video URL Embed Editor Button */}
        <button
          type="button"
          onClick={() => setVideoModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
          title="Embed Video from YouTube, Vimeo, TikTok, or Direct MP4 link"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Video URL Editor</span>
        </button>

        {/* Media Library Picker Trigger */}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
        >
          <Folder className="w-3.5 h-3.5 text-emerald-500" />
          <span>Media Library</span>
        </button>

        {/* Quick Inline Video URL input */}
        <div className="hidden sm:flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-0.5">
          <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <input
            type="url"
            placeholder="Paste video link (YouTube / MP4)..."
            value={inlineVideoUrl}
            onChange={(e) => setInlineVideoUrl(e.target.value)}
            className="bg-transparent text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none w-36 lg:w-44"
          />
          <button
            type="button"
            onClick={handleQuickInlineVideo}
            disabled={!inlineVideoUrl.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-[10px] px-2 py-1 rounded transition-colors"
          >
            Embed
          </button>
        </div>

        {/* AI Writer */}
        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={handleAiAssist}
            disabled={aiGenerating}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{aiGenerating ? 'AI Generating...' : 'Gemini AI Writer'}</span>
          </button>
        </div>
      </div>

      {/* Editor Textarea */}
      <textarea
        id="article-wysiwyg-textarea"
        rows={14}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write or paste your article content here (HTML tags supported: <h2>, <p>, <ul>, <blockquote>, <figure class='article-video-embed'>)..."
        className="w-full p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans text-xs leading-relaxed focus:outline-hidden font-mono"
      ></textarea>

      {/* VIDEO URL EMBED EDITOR MODAL */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-2xl w-full text-xs space-y-5 text-white shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base font-serif text-white">Video URL Editor & Embedder</h3>
                  <p className="text-[11px] text-slate-400">Embed YouTube, Vimeo, TikTok, Facebook, or direct MP4 videos with responsive formatting.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1.5 text-slate-200">
                  Video URL / Link *
                  <span className="text-[10px] text-slate-400 font-normal ml-2">
                    (YouTube, YouTube Shorts, Vimeo, TikTok, Facebook, or MP4)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={videoInputUrl}
                    onChange={(e) => setVideoInputUrl(e.target.value)}
                    className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                  {parsedCurrentVideo.isValid && (
                    <div className="absolute right-3 top-2.5 px-2.5 py-1 bg-emerald-950 border border-emerald-700/80 rounded-lg text-emerald-300 text-[10px] font-bold flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>{parsedCurrentVideo.providerLabel}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Video Player Preview */}
              {parsedCurrentVideo.isValid && (
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-indigo-300 flex items-center space-x-1.5">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Live Video Player Preview</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">Verify playback before inserting</span>
                  </div>

                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner border border-slate-800">
                    {parsedCurrentVideo.provider === 'direct' ? (
                      <video controls className="w-full h-full object-contain">
                        <source src={parsedCurrentVideo.embedUrl} type="video/mp4" />
                      </video>
                    ) : (
                      <iframe
                        src={parsedCurrentVideo.embedUrl}
                        title="Video Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Video Caption / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Watch: Key highlights from the official press conference"
                    value={videoCaption}
                    onChange={(e) => setVideoCaption(e.target.value)}
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Video Source / Credit</label>
                  <input
                    type="text"
                    placeholder="e.g. Channels TV / Arise News / Reuters"
                    value={videoCredit}
                    onChange={(e) => setVideoCredit(e.target.value)}
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Aspect Ratio / Layout</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('16:9')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      videoAspectRatio === '16:9'
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    16:9 Widescreen (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('9:16')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      videoAspectRatio === '9:16'
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    9:16 Vertical (Shorts / Reels)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('4:3')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      videoAspectRatio === '4:3'
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    4:3 Classic TV
                  </button>
                </div>
              </div>

              {/* Sample Quick Links for One-Click Testing */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sample News Video Links (Click to test):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setVideoInputUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                      setVideoCaption('Special Broadcast: National Economic & Industrial Strategy Briefing');
                      setVideoCredit('NaijaTrendiInfo News Channel');
                    }}
                    className="text-[10px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                  >
                    YouTube Broadcast Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoInputUrl('https://www.youtube.com/shorts/3Xk_mY-tI-w');
                      setVideoCaption('Breaking Snapshot: Super Eagles Training Camp Highlights');
                      setVideoCredit('Sports Desk');
                      setVideoAspectRatio('9:16');
                    }}
                    className="text-[10px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                  >
                    YouTube Shorts (Vertical) Sample
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!parsedCurrentVideo.isValid}
                onClick={() => handleInsertVideoSnippet()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed font-bold rounded-xl text-white flex items-center space-x-2 shadow-lg transition-all cursor-pointer"
              >
                <Film className="w-4 h-4" />
                <span>Insert Video into Article</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white font-serif">Select Asset from Media Library</h3>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <MediaLibrary
              mediaFiles={mediaFiles}
              onRefresh={() => onRefreshMedia && onRefreshMedia()}
              onAskConfirmation={() => {}}
              onErrorNotification={(msg) => alert(msg)}
              mode="picker"
              onSelectMedia={handleSelectMediaItem}
            />
          </div>
        </div>
      )}
    </div>
  );
};
