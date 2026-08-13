import React, { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck } from 'lucide-react';
import { CookieSettings } from '../types';

interface CookieBannerProps {
  cookieSettings?: CookieSettings;
  onNavigate: (view: string, param?: string) => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ cookieSettings, onNavigate }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent && cookieSettings?.enabled !== false) {
      setVisible(true);
    }
  }, [cookieSettings]);

  if (!visible || !cookieSettings || cookieSettings.enabled === false) {
    return null;
  }

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'essential');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-xl z-50 animate-fade-in">
      <div className="bg-slate-900/95 text-white backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold font-serif text-sm text-white flex items-center gap-2">
                <span>Cookie & Privacy Policy Notice</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {cookieSettings.bannerText ||
                  'We use cookies to personalize content, analyze traffic, and deliver optimized news reporting across Nigeria.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 shrink-0"
            title="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
          <div className="flex gap-3 text-[11px] text-slate-400">
            <button
              onClick={() => onNavigate('info', 'privacy-policy')}
              className="hover:text-emerald-400 underline underline-offset-2"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('info', 'cookie-policy')}
              className="hover:text-emerald-400 underline underline-offset-2"
            >
              {cookieSettings.settingsButtonText || 'Cookie Policy'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReject}
              className="bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-medium px-3.5 py-2 rounded-xl transition-all"
            >
              {cookieSettings.rejectButtonText || 'Essential Only'}
            </button>
            <button
              onClick={handleAccept}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              {cookieSettings.acceptButtonText || 'Accept All Cookies'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
