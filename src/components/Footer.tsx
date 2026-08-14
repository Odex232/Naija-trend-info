import React, { useState } from 'react';
import { Newspaper, Send, Mail, Phone, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { WebsiteSettings, Category, QuickLink, EditorialDeskEntry, SocialMediaLink } from '../types';
import { api } from '../services/api';

interface FooterProps {
  settings: WebsiteSettings;
  categories?: Category[];
  quickLinks?: QuickLink[];
  editorialDesk?: EditorialDeskEntry[];
  socialLinks?: SocialMediaLink[];
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  categories = [],
  quickLinks = [],
  editorialDesk = [],
  socialLinks = [],
  onNavigate
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitting(true);
    try {
      await api.subscribeNewsletter(email);
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const activeCategories = (categories || []).filter((c) => c?.isVisible).slice(0, 12);
  const activeQuickLinks = (quickLinks || []).filter((q) => q?.isActive);
  const activeSocials = (socialLinks || []).filter((s) => s?.isActive);

  return (
    <footer className="bg-[#050B14] text-slate-300 pt-12 pb-8 border-t border-slate-800 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Newsletter & Brand Banner */}
        <div className="bg-[#0D1A2D] border border-slate-800 rounded-2xl p-6 sm:p-8 mb-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2 text-[#00B87C] font-bold text-xs tracking-wider uppercase mb-1">
              <Mail className="w-4 h-4 text-[#00B87C]" />
              <span>NaijaTrendiInfo Daily Digest</span>
            </div>
            <h3 className="text-2xl font-bold text-white font-serif">
              Stay Informed with Unbiased Nigerian News
            </h3>
            <p className="text-slate-300 text-xs mt-2 leading-relaxed">
              Subscribe to get major breaking headlines, political insights, market rates, and sports updates delivered directly to your inbox every morning.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2">
            {subscribed ? (
              <div className="flex items-center space-x-2 bg-[#00B87C]/20 text-emerald-300 text-xs px-4 py-3 rounded-xl border border-[#00B87C]/30">
                <CheckCircle2 className="w-5 h-5 text-[#00B87C]" />
                <span>Thank you! You are subscribed to our news alerts.</span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900 text-white placeholder-slate-500 text-xs rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-[#00B87C] min-w-[280px]"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#00B87C] hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Subscribing...' : 'Subscribe Now'}</span>
                </button>
              </>
            )}
          </form>
        </div>

        {/* 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800 text-xs">
          {/* Col 1: About & Contact */}
          <div className="space-y-4">
            <div
              onClick={() => onNavigate('home')}
              className="cursor-pointer flex items-center space-x-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-[#00B87C] text-slate-950 flex items-center justify-center font-serif font-black text-lg shadow-sm">
                N
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white font-serif">
                NAIJA<span className="text-[#00B87C]">TRENDI</span>INFO
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed">
              {settings.siteDescription}
            </p>

            <div className="space-y-2 text-slate-400">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#00B87C] shrink-0 mt-0.5" />
                <span>{settings.officeAddress}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#00B87C] shrink-0" />
                <span>{settings.contactEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#00B87C] shrink-0" />
                <span>{settings.contactPhone}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>News Categories</span>
              <span className="w-2 h-2 rounded-full bg-[#00B87C]"></span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-400">
              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onNavigate('category', cat.slug)}
                  className="text-left hover:text-[#00B87C] transition-colors py-1 cursor-pointer"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Quick Links & Information */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Quick Links & Pages</span>
              <span className="w-2 h-2 rounded-full bg-[#F5B942]"></span>
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('info', 'advertise-with-us')}
                  className="hover:text-[#F5B942] transition-colors py-0.5 text-left cursor-pointer flex items-center space-x-1"
                >
                  <span className="text-[#F5B942] font-bold">•</span>
                  <span>Advertise With Us</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('info', 'editorial-desk')}
                  className="hover:text-[#F5B942] transition-colors py-0.5 text-left cursor-pointer flex items-center space-x-1"
                >
                  <span className="text-[#F5B942] font-bold">•</span>
                  <span>Editorial Desk & Bureaus</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('info', 'about-us')}
                  className="hover:text-[#F5B942] transition-colors py-0.5 text-left cursor-pointer flex items-center space-x-1"
                >
                  <span className="text-[#F5B942] font-bold">•</span>
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('info', 'contact-us')}
                  className="hover:text-[#F5B942] transition-colors py-0.5 text-left cursor-pointer flex items-center space-x-1"
                >
                  <span className="text-[#F5B942] font-bold">•</span>
                  <span>Contact Us & Feedback</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('info', 'privacy-policy')}
                  className="hover:text-[#F5B942] transition-colors py-0.5 text-left cursor-pointer flex items-center space-x-1"
                >
                  <span className="text-[#F5B942] font-bold">•</span>
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('info', 'terms-of-service')}
                  className="hover:text-[#F5B942] transition-colors py-0.5 text-left cursor-pointer flex items-center space-x-1"
                >
                  <span className="text-[#F5B942] font-bold">•</span>
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('info', 'disclaimer')}
                  className="hover:text-[#F5B942] transition-colors py-0.5 text-left cursor-pointer flex items-center space-x-1"
                >
                  <span className="text-[#F5B942] font-bold">•</span>
                  <span>Disclaimer</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('info', 'cookie-policy')}
                  className="hover:text-[#F5B942] transition-colors py-0.5 text-left cursor-pointer flex items-center space-x-1"
                >
                  <span className="text-[#F5B942] font-bold">•</span>
                  <span>Cookie Policy</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Editorial Desk & Social Community */}
          <div>
            <div
              onClick={() => onNavigate('info', 'editorial-desk')}
              className="cursor-pointer group flex items-center justify-between mb-4 pb-2 border-b border-slate-800"
            >
              <h4 className="text-white font-bold text-sm tracking-wider uppercase group-hover:text-[#00B87C] transition-colors">
                Editorial Desk
              </h4>
              <ShieldCheck className="w-4 h-4 text-[#00B87C]" />
            </div>
            <div className="space-y-3 text-slate-400 mb-6">
              {(editorialDesk || []).slice(0, 2).map((ed) => (
                <div
                  key={ed.id}
                  onClick={() => onNavigate('info', 'editorial-desk')}
                  className="bg-[#0D1A2D] p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-emerald-500/50 transition-colors"
                >
                  <div className="text-[#00B87C] font-semibold">{ed.department}</div>
                  <div className="text-white font-medium">{ed.name}</div>
                  <div className="text-[11px] text-slate-400">{ed.email}</div>
                </div>
              ))}
            </div>

            {/* Social Links Badges */}
            {activeSocials.length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                  Follow Our Handles
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {activeSocials.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-900 hover:bg-[#00B87C] hover:text-slate-950 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 font-medium text-[11px] transition-all capitalize"
                    >
                      {s.displayName || s.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Domain Status */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            <p>{settings.copyrightText}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Domain: <span className="text-[#00B87C] font-mono">https://naijatrendinfo.com.ng</span> (Custom Domain Production Ready)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <button onClick={() => onNavigate('info', 'privacy-policy')} className="hover:text-[#00B87C] transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('info', 'terms-of-service')} className="hover:text-[#00B87C] transition-colors cursor-pointer">
              Terms of Service
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('info', 'disclaimer')} className="hover:text-[#00B87C] transition-colors cursor-pointer">
              Disclaimer
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('info', 'cookie-policy')} className="hover:text-[#00B87C] transition-colors cursor-pointer">
              Cookie Policy
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('info', 'about-us')} className="hover:text-[#00B87C] transition-colors cursor-pointer">
              About Us
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('info', 'editorial-desk')} className="hover:text-[#00B87C] transition-colors cursor-pointer">
              Editorial Desk
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('info', 'contact-us')} className="hover:text-[#00B87C] transition-colors cursor-pointer">
              Contact Us
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('info', 'advertise-with-us')} className="hover:text-[#00B87C] transition-colors cursor-pointer">
              Advertise
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
