import React, { useState } from 'react';
import {
  Share2,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  X,
  ArrowUp,
  ArrowDown,
  Globe,
  Radio
} from 'lucide-react';
import { SocialMediaLink } from '../types';
import { api } from '../services/api';

interface SocialMediaManagerProps {
  socialLinks: SocialMediaLink[];
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
}

const PLATFORM_OPTIONS = [
  { id: 'facebook', name: 'Facebook', defaultUrl: 'https://facebook.com/', color: 'text-blue-400 bg-blue-500/10' },
  { id: 'instagram', name: 'Instagram', defaultUrl: 'https://instagram.com/', color: 'text-pink-400 bg-pink-500/10' },
  { id: 'twitter', name: 'X / Twitter', defaultUrl: 'https://x.com/', color: 'text-sky-400 bg-sky-500/10' },
  { id: 'tiktok', name: 'TikTok', defaultUrl: 'https://tiktok.com/@', color: 'text-slate-200 bg-slate-700/50' },
  { id: 'youtube', name: 'YouTube', defaultUrl: 'https://youtube.com/@', color: 'text-red-400 bg-red-500/10' },
  { id: 'whatsapp', name: 'WhatsApp Channel', defaultUrl: 'https://whatsapp.com/channel/', color: 'text-emerald-400 bg-emerald-500/10' },
  { id: 'telegram', name: 'Telegram Channel', defaultUrl: 'https://t.me/', color: 'text-cyan-400 bg-cyan-500/10' },
  { id: 'linkedin', name: 'LinkedIn', defaultUrl: 'https://linkedin.com/company/', color: 'text-blue-500 bg-blue-600/10' },
  { id: 'pinterest', name: 'Pinterest', defaultUrl: 'https://pinterest.com/', color: 'text-red-500 bg-red-600/10' },
  { id: 'snapchat', name: 'Snapchat', defaultUrl: 'https://snapchat.com/add/', color: 'text-amber-300 bg-amber-400/10' },
  { id: 'threads', name: 'Threads', defaultUrl: 'https://threads.net/@', color: 'text-slate-100 bg-slate-800' },
  { id: 'custom', name: 'Custom Website / Channel', defaultUrl: 'https://', color: 'text-emerald-400 bg-emerald-500/10' }
];

export const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({
  socialLinks,
  onRefresh,
  onAskConfirmation,
  onErrorNotification
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SocialMediaLink | null>(null);

  // Form Fields
  const [platform, setPlatform] = useState('facebook');
  const [url, setUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingItem(null);
    setPlatform('facebook');
    setUrl('https://facebook.com/NaijaTrendiInfo');
    setDisplayName('NaijaTrendiInfo Facebook');
    setIsActive(true);
    setOrder((socialLinks.length || 0) + 1);
    setModalOpen(true);
  };

  const openEditModal = (item: SocialMediaLink) => {
    setEditingItem(item);
    setPlatform(item.platform || 'facebook');
    setUrl(item.url || '');
    setDisplayName(item.displayName || item.platform);
    setIsActive(item.isActive !== false);
    setOrder(item.order || 1);
    setModalOpen(true);
  };

  const handlePlatformChange = (p: string) => {
    setPlatform(p);
    const plat = PLATFORM_OPTIONS.find((opt) => opt.id === p);
    if (plat && (!url || url.includes('facebook') || url.includes('instagram') || url.includes('x.com') || url.includes('t.me'))) {
      setUrl(plat.defaultUrl);
      if (!displayName || displayName.startsWith('NaijaTrendiInfo')) {
        setDisplayName(`NaijaTrendiInfo ${plat.name}`);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      onErrorNotification('URL / Handle cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        platform,
        url: url.trim(),
        displayName: displayName.trim() || platform,
        isActive,
        order: Number(order) || 1
      };

      if (editingItem) {
        await api.updateSocialLink(editingItem.id, payload);
      } else {
        await api.createSocialLink(payload);
      }

      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      onErrorNotification(err.message || 'Failed to save social media account');
    } fontFinally: {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: SocialMediaLink) => {
    try {
      await api.toggleSocialLink(item.id);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      onErrorNotification(err.message || 'Failed to toggle social handle state');
    }
  };

  const handleDelete = (item: SocialMediaLink) => {
    onAskConfirmation({
      title: 'Delete Social Account?',
      message: `Are you sure you want to remove the social media handle "${item.displayName || item.platform}"? It will no longer appear on the website.`,
      confirmText: 'Delete Account',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteSocialLink(item.id);
          onRefresh();
        } catch (err: any) {
          console.error(err);
          onErrorNotification(err.message || 'Failed to delete social account');
        }
      }
    });
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Social Handles & Community Links</span>
          </div>
          <h3 className="text-xl font-bold text-white font-serif">
            Social Media Handles Management
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Configure, reorder, and toggle social media presence displayed across the header top bar, sidebar, and website footer.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Social Handle</span>
        </button>
      </div>

      {/* Social Accounts Table */}
      {socialLinks.length === 0 ? (
        <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center text-slate-400">
          <Globe className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-300">No social media handles configured yet.</p>
          <button
            onClick={openAddModal}
            className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-bold underline"
          >
            Click here to add your first social media link
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300 min-w-[650px]">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Platform / Badge</th>
                <th className="py-3 px-4">Display Name</th>
                <th className="py-3 px-4">Handle / URL</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
              {socialLinks.map((item) => {
                const opt = PLATFORM_OPTIONS.find((p) => p.id === item.platform) || PLATFORM_OPTIONS[PLATFORM_OPTIONS.length - 1];

                return (
                  <tr key={item.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">
                      #{item.order || 1}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border border-white/10 ${opt.color}`}>
                        <Radio className="w-3 h-3" />
                        <span className="capitalize">{opt.name}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {item.displayName || item.platform}
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] flex items-center space-x-1 max-w-xs truncate"
                      >
                        <span className="truncate">{item.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                          item.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {item.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{item.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Edit Handle"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Delete Handle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-serif">
                {editingItem ? 'Edit Social Account' : 'Add Social Media Account'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-200 font-bold mb-1">
                  Social Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  className="w-full bg-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  {PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-200 font-bold mb-1">
                  Display Label / Account Title
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., NaijaTrendiInfo Official X"
                  className="w-full bg-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-200 font-bold mb-1">
                  Direct URL or Channel Link
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-800 text-white font-mono text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-200 font-bold mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full bg-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1">
                    Status
                  </label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="social-active-chk"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-800 border-slate-700"
                    />
                    <label htmlFor="social-active-chk" className="text-slate-300 font-semibold cursor-pointer">
                      Visible on Website
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Social Handle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
