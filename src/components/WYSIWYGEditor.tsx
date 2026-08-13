import React, { useState } from 'react';
import { Bold, Italic, List, Heading, Link, Image, Sparkles, Quote, AlignLeft, Folder, X } from 'lucide-react';
import { api } from '../services/api';
import { MediaLibrary } from './MediaLibrary';
import { MediaFile } from '../types';

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
      onChange(value + '\n' + imgHtml);
      setImageUrl('');
    }
  };

  const handleSelectMediaItem = (file: MediaFile) => {
    const mime = (file.mimeType || '').toLowerCase();
    const name = file.originalName.toLowerCase();
    let insertSnippet = '';

    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/.test(name)) {
      insertSnippet = `<figure class="my-4"><img src="${file.url}" alt="${file.altText || file.title || file.originalName}" class="w-full rounded-xl shadow-md" /><figcaption class="text-xs text-slate-500 mt-1 text-center">${file.caption || file.title || 'Photo Credit: NaijaTrendiInfo Bureau'}</figcaption></figure>`;
    } else if (mime.startsWith('video/') || /\.(mp4|webm|mov)$/.test(name)) {
      insertSnippet = `<figure class="my-4"><video controls class="w-full rounded-xl shadow-md"><source src="${file.url}" type="${file.mimeType}"></video><figcaption class="text-xs text-slate-500 mt-1 text-center">${file.title || 'Video Report'}</figcaption></figure>`;
    } else if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/.test(name)) {
      insertSnippet = `<figure class="my-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700"><audio controls class="w-full"><source src="${file.url}" type="${file.mimeType}"></audio><figcaption class="text-xs text-slate-500 mt-2 text-center font-bold">${file.title || 'Audio Recording'}</figcaption></figure>`;
    } else {
      insertSnippet = `<p class="my-3"><a href="${file.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-2 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-emerald-500 transition-colors">📥 Download Attachment: ${file.title || file.originalName}</a></p>`;
    }

    onChange(value ? value + '\n' + insertSnippet : insertSnippet);
    setPickerOpen(false);
  };

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
      {/* Formatting Toolbar */}
      <div className="bg-slate-100 dark:bg-slate-800 p-2 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => insertTag('<h2>', '</h2>')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 font-bold flex items-center space-x-1"
          title="Heading 2"
        >
          <Heading className="w-4 h-4" />
          <span>H2</span>
        </button>

        <button
          type="button"
          onClick={() => insertTag('<h3>', '</h3>')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 font-bold flex items-center space-x-1"
          title="Heading 3"
        >
          <Heading className="w-3.5 h-3.5" />
          <span>H3</span>
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

        <button
          type="button"
          onClick={() => insertTag('<strong>', '风险')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag('<em>', '</em>')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag('<blockquote>', '</blockquote>')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200"
          title="Quote Block"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag('<p>', '</p>')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200"
          title="Paragraph"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200"
          title="Unordered List"
        >
          <List className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

        {/* Media Library Picker Trigger */}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-2.5 py-1 rounded flex items-center space-x-1 cursor-pointer"
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Insert from Media Library</span>
        </button>

        <div className="flex items-center space-x-1">
          <input
            type="text"
            placeholder="Paste image URL to insert..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] px-2 py-1 rounded w-36"
          />
          <button
            type="button"
            onClick={handleInsertImage}
            className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 p-1 rounded text-slate-800 dark:text-slate-200 font-medium text-[11px]"
          >
            Insert URL
          </button>
        </div>

        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={handleAiAssist}
            disabled={aiGenerating}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] px-3 py-1 rounded-md flex items-center space-x-1 shadow-2xs cursor-pointer"
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
        placeholder="Write or paste your article content here (HTML tags supported: <h2>, <p>, <ul>, <blockquote>, <strong>)..."
        className="w-full p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans text-xs leading-relaxed focus:outline-hidden font-mono"
      ></textarea>

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

