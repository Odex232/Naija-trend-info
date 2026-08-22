import React, { useState } from 'react';
import {
  Info,
  Mail,
  Send,
  Upload,
  Phone,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  HelpCircle,
  FileText,
  Lock,
  Globe,
  Megaphone,
  Users,
  AlertTriangle,
  Cookie,
  ExternalLink,
  Clock
} from 'lucide-react';
import { WebsiteSettings, EditorialDeskEntry, InformationEntry, SitePage, AdvertisingPackage } from '../types';
import { api } from '../services/api';
import { SEOHead } from '../components/SEOHead';

interface InfoViewProps {
  pageKey: string;
  settings: WebsiteSettings;
  editorialDesk?: EditorialDeskEntry[];
  information?: InformationEntry[];
  pages?: SitePage[];
  advertisingPackages?: AdvertisingPackage[];
  onNavigate: (view: string, param?: string) => void;
}

export const InfoView: React.FC<InfoViewProps> = ({
  pageKey,
  settings,
  editorialDesk = [],
  information = [],
  pages = [],
  advertisingPackages = [],
  onNavigate
}) => {
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Submit News Form State
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [supportingLinks, setSupportingLinks] = useState('');
  const [newsSubmitted, setNewsSubmitted] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setContactLoading(true);
    try {
      await api.sendContactMessage({
        name: contactName,
        email: contactEmail,
        subject: contactSubject || 'General Inquiry',
        message: contactMsg
      });
      setContactSent(true);
      setContactMsg('');
    } catch (err) {
      console.error(err);
    } finally {
      setContactLoading(false);
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !newsTitle || !newsContent) return;
    setNewsLoading(true);
    try {
      await api.submitNewsTip({
        senderName,
        senderEmail,
        senderPhone,
        title: newsTitle,
        content: newsContent,
        mediaUrl,
        supportingLinks
      });
      setNewsSubmitted(true);
      setNewsTitle('');
      setNewsContent('');
      setMediaUrl('');
      setSupportingLinks('');
    } catch (err) {
      console.error(err);
    } finally {
      setNewsLoading(false);
    }
  };

  if (pageKey === 'submit-news' || pageKey === 'submit-news-tip') {
    return (
      <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6">
        <SEOHead
          title="Submit News Tip & Whistleblower Reports – NaijaTrendiInfo"
          description="Submit breaking news tips, eyewitness photos, videos, or confidential reports securely to the NaijaTrendiInfo editorial desk."
          canonicalPath="/submit-news"
          ogType="website"
        />
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl text-slate-100 space-y-6">
          <div className="flex items-center space-x-3 text-emerald-400">
            <Upload className="w-8 h-8" />
            <h1 className="text-3xl font-extrabold font-serif text-white">
              Submit News Tip / Eyewitness Report
            </h1>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            Do you have breaking news, investigative evidence, whistleblower documentation, or eyewitness video from your community in Nigeria? Submit your report securely to our editorial team below.
          </p>

          {newsSubmitted && (
            <div className="p-4 bg-emerald-500/20 text-emerald-200 text-sm rounded-2xl border border-emerald-500/30 flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <strong>News Tip Received!</strong> Our editorial desk is reviewing your submission. Thank you for contributing to truthful Nigerian journalism.
              </div>
            </div>
          )}

          <form onSubmit={handleNewsSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Segun Adeyemi"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="segun@example.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Story Title / Headline *
              </label>
              <input
                type="text"
                required
                placeholder="Give a clear summary title of the event..."
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Story Details / Full Narrative *
              </label>
              <textarea
                required
                rows={6}
                placeholder="Provide accurate who, what, when, where, and why details..."
                value={newsContent}
                onChange={(e) => setNewsContent(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-xl p-4 border border-white/10 focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Image or Media Link (Google Drive / Direct URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supporting Web Links / References
                </label>
                <input
                  type="text"
                  placeholder="e.g. social media posts, official statements"
                  value={supportingLinks}
                  onChange={(e) => setSupportingLinks(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={newsLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{newsLoading ? 'Submitting...' : 'Submit Story Tip'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (pageKey === 'contact' || pageKey === 'contact-us') {
    return (
      <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <SEOHead
          title="Contact Us, Bureau Locations & Editorial Feedback – NaijaTrendiInfo"
          description="Get in touch with the NaijaTrendiInfo newsroom, leadership desk, advertising team, or submit feedback regarding our Nigerian news coverage."
          canonicalPath="/contact-us"
          ogType="website"
          structuredData={[
            {
              '@context': 'https://schema.org',
              '@type': 'ContactPage',
              'name': 'Contact NaijaTrendiInfo',
              'url': 'https://www.naijatrendinfo.com.ng/contact-us',
              'mainEntity': {
                '@type': 'NewsMediaOrganization',
                'name': 'NaijaTrendiInfo',
                'telephone': settings.contactPhone || '+234 800 000 0000',
                'email': settings.contactEmail || 'contact@naijatrendinfo.com.ng',
                'address': {
                  '@type': 'PostalAddress',
                  'streetAddress': settings.officeAddress || 'Abuja / Lagos, Nigeria',
                  'addressCountry': 'NG'
                }
              }
            }
          ]}
        />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Contact Details (Col 5) */}
          <div className="md:col-span-5 bg-white/5 backdrop-blur-2xl text-white rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
            <h1 className="text-2xl font-extrabold font-serif text-white flex items-center gap-2">
              <Mail className="w-6 h-6 text-emerald-400" />
              <span>{settings.contactPage?.pageTitle || 'Contact Us & Feedback'}</span>
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              {settings.contactPage?.pageSubtitle || 'We welcome inquiries from readers, media partners, advertisers, and institutional stakeholders across Nigeria and globally.'}
            </p>

            <div className="space-y-4 text-xs text-slate-300 pt-2 border-t border-white/10">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold">Headquarters & Bureau</strong>
                  <span>{settings.contactPage?.officeAddress || settings.officeAddress}</span>
                  {settings.contactPage?.bureauLocations && settings.contactPage.bureauLocations.length > 0 && (
                    <div className="mt-1 text-[11px] text-slate-400">
                      <span className="font-semibold text-emerald-400">Bureaus: </span>
                      {settings.contactPage.bureauLocations.join(' • ')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-white font-semibold">Email Inquiries</strong>
                  <div>General: <span className="text-emerald-300 font-mono">{settings.contactPage?.contactEmail || settings.contactEmail}</span></div>
                  {settings.contactPage?.pressInquiriesEmail && (
                    <div>Press & Editorial: <span className="text-emerald-300 font-mono">{settings.contactPage.pressInquiriesEmail}</span></div>
                  )}
                  {settings.contactPage?.advertEmail && (
                    <div>Adverts & Partnerships: <span className="text-amber-300 font-mono">{settings.contactPage.advertEmail}</span></div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-white font-semibold">Telephone & WhatsApp</strong>
                  <div>Phone: <span className="text-slate-200">{settings.contactPage?.contactPhone || settings.contactPhone}</span></div>
                  {settings.contactPage?.whatsappSupport && (
                    <div>WhatsApp Hotline: <span className="text-emerald-400 font-mono font-semibold">{settings.contactPage.whatsappSupport}</span></div>
                  )}
                </div>
              </div>

              {settings.contactPage?.workingHours && (
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Newsroom Hours</strong>
                    <span>{settings.contactPage.workingHours}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs space-y-2">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Submit Confidential News Tip</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                {settings.contactPage?.newsTipBannerText || 'Have an investigative tip or whistleblowing evidence? Send it directly to our secure newsdesk.'}
              </p>
              <button
                onClick={() => onNavigate('info', 'submit-news')}
                className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1 mt-1"
              >
                <span>Go to News Submission Form</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Contact Form (Col 7) */}
          <div className="md:col-span-7 bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl text-slate-100">
            <h2 className="text-xl font-bold font-serif text-white mb-6">
              Send us a Message
            </h2>

            {contactSent && (
              <div className="mb-6 p-4 bg-emerald-500/20 text-emerald-200 text-sm rounded-2xl border border-emerald-500/30 flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Message dispatched! Our team will respond shortly.</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Regarding editorial feedback, advertising, or partnerships"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Message Details *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write your message here..."
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-xs rounded-xl p-4 border border-white/10 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={contactLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{contactLoading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Normalize Page Key
  const normalizedKey =
    (pageKey === 'about' || pageKey === 'about-us') ? 'about-us' :
    (pageKey === 'privacy' || pageKey === 'privacy-policy') ? 'privacy-policy' :
    (pageKey === 'terms' || pageKey === 'terms-of-service') ? 'terms-of-service' :
    (pageKey === 'advertise' || pageKey === 'advertise-with-us') ? 'advertise-with-us' :
    (pageKey === 'editorial' || pageKey === 'editorial-desk') ? 'editorial-desk' :
    (pageKey === 'cookie' || pageKey === 'cookie-policy') ? 'cookie-policy' :
    (pageKey === 'disclaimer') ? 'disclaimer' :
    pageKey;

  const cmsPage = (pages || []).find(
    (p) => p.status === 'published' && (p.slug === normalizedKey || p.slug === pageKey || p.id === pageKey)
  );

  const pageTitle = cmsPage ? cmsPage.title :
    normalizedKey === 'about-us' ? 'About Us – NaijaTrendiInfo' :
    normalizedKey === 'advertise-with-us' ? 'Advertise With Us – NaijaTrendiInfo' :
    normalizedKey === 'editorial-desk' ? 'Editorial Desk & Leadership – NaijaTrendiInfo' :
    normalizedKey === 'privacy-policy' ? 'Privacy Policy – NaijaTrendiInfo' :
    normalizedKey === 'terms-of-service' ? 'Terms of Service – NaijaTrendiInfo' :
    normalizedKey === 'disclaimer' ? 'General Disclaimer – NaijaTrendiInfo' :
    normalizedKey === 'cookie-policy' ? 'Cookie Policy – NaijaTrendiInfo' :
    `${pageKey.replace('-', ' ')} – NaijaTrendiInfo`;

  const pageDescription = cmsPage?.description ||
    `Official publication of NaijaTrendiInfo regarding ${pageTitle}. Leading Nigerian digital news organization.`;

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalPath={`/${normalizedKey}`}
        ogType="website"
      />
      <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl space-y-6 text-slate-100">
        {/* Page Header */}
        <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block mb-1">
              NaijaTrendiInfo Official Publication
            </span>
            <h1 className="text-3xl font-extrabold font-serif text-white">
              {cmsPage ? cmsPage.title :
                normalizedKey === 'about-us' ? 'About Us' :
                normalizedKey === 'advertise-with-us' ? 'Advertise With Us' :
                normalizedKey === 'editorial-desk' ? 'NaijaTrendiInfo Editorial Desk' :
                normalizedKey === 'privacy-policy' ? 'Privacy Policy' :
                normalizedKey === 'terms-of-service' ? 'Terms of Service' :
                normalizedKey === 'disclaimer' ? 'General Disclaimer' :
                normalizedKey === 'cookie-policy' ? 'Cookie Policy' :
                pageKey.replace('-', ' ')}
            </h1>
          </div>
        </div>

        {/* Page Content Body */}
        {cmsPage ? (
          <div className="space-y-6">
            {cmsPage.description && (
              <p className="text-emerald-300 font-medium text-base italic border-l-2 border-emerald-500 pl-4 py-1">
                {cmsPage.description}
              </p>
            )}

            <div
              className="cms-rendered-html space-y-4 text-slate-200 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: cmsPage.content }}
            />

            {/* Extra Custom Sections depending on Page Type */}
            {normalizedKey === 'editorial-desk' && (
              <div className="pt-8 border-t border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Editorial Board & Bureau Leadership</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(editorialDesk || []).map((ed) => (
                    <div key={ed.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex items-center space-x-3">
                        {ed.photoUrl ? (
                          <img src={ed.photoUrl} alt={ed.name} className="w-10 h-10 rounded-full object-cover border border-emerald-500/40 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                            {ed.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-emerald-400 text-xs uppercase tracking-wider">{ed.department}</div>
                          <div className="font-extrabold text-white text-sm">{ed.name}</div>
                          <div className="text-[11px] text-slate-300">{ed.role}</div>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 pt-2 border-t border-white/10">
                        <div>Email: <span className="text-slate-200">{ed.email}</span></div>
                        {ed.bio && <p className="text-slate-300 italic mt-1 leading-normal">"{ed.bio}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {normalizedKey === 'advertise-with-us' && (
              <div className="pt-8 border-t border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-400" />
                  <span>Available Advertising Packages & Rates</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(advertisingPackages || []).map((pkg) => (
                    <div key={pkg.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Advert Package</span>
                        <h4 className="font-bold text-white text-base mt-1">{pkg.name}</h4>
                        <div className="text-amber-400 font-black text-lg mt-1">{pkg.price}</div>
                        <p className="text-xs text-slate-300 mt-2">{pkg.description}</p>
                        <div className="text-[11px] text-slate-400 mt-1 font-mono">Format: {pkg.bannerSize}</div>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1 pt-2 border-t border-white/10">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={() => onNavigate('info', 'contact-us')}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-md text-xs"
                  >
                    Contact Advertising Desk
                  </button>
                </div>
              </div>
            )}

            {cmsPage.updatedAt && (
              <div className="text-xs text-slate-400 pt-6 border-t border-white/10 flex items-center justify-between">
                <span>Author/Desk: {cmsPage.authorName || 'Editorial Board'}</span>
                <span>Last Updated: {new Date(cmsPage.updatedAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</span>
              </div>
            )}
          </div>
        ) : normalizedKey === 'about-us' ? (
          <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
            <p className="text-base text-slate-200 font-serif">
              NaijaTrendiInfo is an independent, non-partisan Nigerian digital news, media, and investigative journalism platform dedicated to delivering fast, accurate, unbiased, and credible news from across the 36 states of Nigeria and around the globe.
            </p>

            <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Our Editorial Mission</h2>
            <p>
              Founded with the pledge to deliver accurate, non-partisan, fast, and transparent media, NaijaTrendiInfo operates state bureaus across Lagos, Abuja, Port Harcourt, Enugu, and Kano. We report politics, economy, crime, technology, entertainment, and sports with rigorous verification.
            </p>

            <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">National Bureau Network</h2>
            <p>
              With reporters posted across the National Assembly, Central Bank of Nigeria, Federal High Courts, Lagos financial center, and major geopolitical zones, our coverage guarantees prompt verified reporting.
            </p>

            <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">NaijaTrendiInfo Editorial Desk Leadership</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {(editorialDesk || []).map((ed) => (
                <div key={ed.id} className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
                  <div className="font-bold text-emerald-400 text-xs">{ed.department}</div>
                  <div className="font-extrabold text-white text-base">{ed.name}</div>
                  <div className="text-xs text-slate-300">{ed.role}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{ed.email}</div>
                </div>
              ))}
            </div>
          </div>
        ) : normalizedKey === 'editorial-desk' ? (
          <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
            <p className="text-base text-slate-200">
              Our editorial leadership oversees newsrooms and state bureaus across all geopolitical zones of Nigeria, upholding journalistic integrity, balance, and investigative independence.
            </p>

            <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Code of Ethics & Standards</h2>
            <p>
              NaijaTrendiInfo journalists adhere strictly to the Code of Ethics of the Nigerian Guild of Editors. We verify all breaking news items through multiple independent sources before publishing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {editorialDesk.map((ed) => (
                <div key={ed.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center space-x-3">
                    {ed.photoUrl ? (
                      <img src={ed.photoUrl} alt={ed.name} className="w-12 h-12 rounded-full object-cover border border-emerald-500/40 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shrink-0">
                        {ed.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-emerald-400 text-xs uppercase tracking-wider">{ed.department}</div>
                      <div className="font-extrabold text-white text-base">{ed.name}</div>
                      <div className="text-xs text-slate-300 font-medium">{ed.role}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-white/10">
                    <div><span className="text-slate-300 font-semibold">Email:</span> {ed.email}</div>
                    {ed.phone && <div><span className="text-slate-300 font-semibold">Phone:</span> {ed.phone}</div>}
                    {ed.bio && <p className="text-slate-300 italic pt-1 leading-relaxed">"{ed.bio}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : normalizedKey === 'advertise-with-us' ? (
          <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
            <p className="text-base text-slate-200">
              NaijaTrendiInfo reaches millions of engaged readers, business leaders, policy makers, tech founders, and diaspora Nigerians daily across digital platforms.
            </p>

            <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Advertising Solutions</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Header & High-Impact Banners:</strong> Top desktop and mobile banner placements for high CTR.</li>
              <li><strong>Sponsored Native Articles:</strong> In-depth brand features published on our homepage and indexed across search engines.</li>
              <li><strong>Google AdSense & Adsterra Placement:</strong> Programmatic display integration across all news channels.</li>
              <li><strong>Newsletter & Community Broadcasts:</strong> Direct subscriber engagement across WhatsApp and Telegram channels.</li>
            </ul>

            <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Advertising Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(advertisingPackages || []).map((pkg) => (
                <div key={pkg.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Advert Package</span>
                    <h4 className="font-bold text-white text-base mt-1">{pkg.name}</h4>
                    <div className="text-amber-400 font-black text-lg mt-1">{pkg.price}</div>
                    <p className="text-xs text-slate-300 mt-2">{pkg.description}</p>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 pt-2 border-t border-white/10">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={() => onNavigate('info', 'contact-us')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3 rounded-xl cursor-pointer shadow-md text-xs"
              >
                Get In Touch with Sales Desk
              </button>
            </div>
          </div>
        ) : normalizedKey === 'privacy-policy' ? (
          <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
            <p className="text-base text-slate-200">
              At NaijaTrendiInfo Media Group, accessible from https://naijatrendinfo.com.ng, visitor privacy is a top priority. This Privacy Policy outlines our compliance under the Nigerian Data Protection Regulations (NDPR).
            </p>

            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              We collect information voluntarily submitted via contact forms, news tip submissions, or newsletter signups (e.g., name, email address, phone number).
            </p>

            <h2 className="text-lg font-bold text-white">2. Log Files & Analytics</h2>
            <p>
              NaijaTrendiInfo follows standard log file procedures. Information collected includes IP addresses, browser types, ISP provider, date/time stamps, and referring pages.
            </p>

            <h2 className="text-lg font-bold text-white">3. Third-Party Advertising (AdSense & Adsterra)</h2>
            <p>
              Third-party ad servers use cookies and web beacons to serve personalized advertisements. Readers may manage cookie preferences via their browser settings or our Cookie Consent Banner.
            </p>
          </div>
        ) : normalizedKey === 'terms-of-service' ? (
          <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
            <p className="text-base text-slate-200">
              By accessing or using NaijaTrendiInfo (https://naijatrendinfo.com.ng), you agree to be bound by these Terms of Service.
            </p>

            <h2 className="text-lg font-bold text-white">1. Intellectual Property Rights</h2>
            <p>
              All published articles, investigative reporting, photographs, and logos belong to NaijaTrendiInfo Media Group and are protected under Nigerian copyright laws.
            </p>

            <h2 className="text-lg font-bold text-white">2. Reader Conduct & Moderation</h2>
            <p>
              Defamatory, obscene, or illegal commentary in the discussion section is strictly prohibited and subject to immediate removal.
            </p>
          </div>
        ) : normalizedKey === 'disclaimer' ? (
          <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
            <p className="text-base text-slate-200">
              All information provided on NaijaTrendiInfo is published in good faith for general news and informational purposes.
            </p>

            <h2 className="text-lg font-bold text-white">1. Accuracy & Verification</h2>
            <p>
              While we make every effort to ensure factual precision, NaijaTrendiInfo assumes no liability for external omissions or third-party declarations.
            </p>
          </div>
        ) : normalizedKey === 'cookie-policy' ? (
          <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
            <p className="text-base text-slate-200">
              NaijaTrendiInfo uses cookies and web beacons to optimize page speed, remember user preferences, and support display ad networks.
            </p>

            <h2 className="text-lg font-bold text-white">Managing Cookies</h2>
            <p>
              You may adjust your browser options or use our site banner to accept or decline non-essential cookies at any time.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>
              This official page details the operating guidelines and publication standards of NaijaTrendiInfo Media Group.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

