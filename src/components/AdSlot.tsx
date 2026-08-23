import React, { useEffect, useRef, useState } from 'react';
import { PlacementPosition, Ad, AdPlacement, AdsSettings } from '../types';
import { api } from '../services/api';
import { ShieldCheck, ExternalLink, X, AlertCircle } from 'lucide-react';

interface AdSlotProps {
  position: PlacementPosition;
  slotKey?: string;
  placements?: AdPlacement[];
  ads?: Ad[];
  settings?: AdsSettings | any;
  currentArticleId?: string;
  currentCategoryId?: string;
  className?: string;
  isPreview?: boolean;
  previewDevice?: 'all' | 'desktop' | 'tablet' | 'mobile';
}

declare global {
  interface Window {
    adsbygoogle?: any[];
    atOptions?: any;
  }
}

export const AdSlot: React.FC<AdSlotProps> = ({
  position,
  slotKey,
  placements = [],
  ads = [],
  settings,
  currentArticleId,
  currentCategoryId,
  className = '',
  isPreview = false,
  previewDevice = 'all'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Hook 1: Handle window resize and mount state
  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Ad Determination & Visibility Logic (No early returns before remaining hooks!) ---
  const isSitewideDisabled = Boolean(settings?.disableAdsSitewide || settings?.disableAds);
  const isArticleDisabled = Boolean(currentArticleId && settings?.disabledArticleIds?.includes(currentArticleId));
  const isCategoryDisabled = Boolean(currentCategoryId && settings?.disabledCategoryIds?.includes(currentCategoryId));

  // Find matching placement configuration
  const placement =
    (placements || []).find((p) => (slotKey && p.slotKey === slotKey) || p.position === position) ||
    (placements || []).find((p) => p.position === position);

  const networkType = placement?.networkType || 'disabled';
  const isPlacementDisabled = !placement || networkType === 'disabled' || placement?.enabled === false;

  // Resolve active Ad campaign
  let ad: Ad | undefined;
  if (placement?.adId) {
    ad = (ads || []).find((a) => a.id === placement.adId);
  }
  if (!ad && networkType !== 'disabled') {
    ad = (ads || []).find((a) => a.type === networkType && (a.isActive || a.status === 'active'));
  }

  const isAdRestricted = Boolean(
    ad && (
      (currentArticleId && ad.disabledArticleIds?.includes(currentArticleId)) ||
      (currentCategoryId && ad.disabledCategoryIds?.includes(currentCategoryId))
    )
  );

  const isAdActive = ad ? (ad.isActive !== false && ad.status !== 'paused' && ad.status !== 'disabled') : false;

  // Device targeting check
  const targetDevice = isPreview && previewDevice !== 'all' ? previewDevice : (placement?.deviceTarget || ad?.deviceTarget || 'all');
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  let isDeviceMatched = true;
  if (!isPreview) {
    if (targetDevice === 'mobile' && !isMobile) isDeviceMatched = false;
    if (targetDevice === 'desktop' && !isDesktop) isDeviceMatched = false;
    if (targetDevice === 'tablet' && !isTablet) isDeviceMatched = false;
    if (ad && ad.mobileVisible === false && isMobile) isDeviceMatched = false;
    if (ad && ad.desktopVisible === false && isDesktop) isDeviceMatched = false;
  }

  // Combined validity check
  const shouldRender = isPreview || (
    !isDismissed &&
    !isSitewideDisabled &&
    !isArticleDisabled &&
    !isCategoryDisabled &&
    !isPlacementDisabled &&
    Boolean(ad) &&
    !isAdRestricted &&
    isAdActive &&
    isDeviceMatched
  );

  // Hook 2: Track impression if active and not in preview
  useEffect(() => {
    if (!isPreview && shouldRender && ad?.id && isAdActive) {
      api.trackAd(ad.id, 'impression').catch(() => {});
    }
  }, [ad?.id, isAdActive, isPreview, shouldRender]);

  // Hook 3: Safe Dynamic Script Execution for Adsterra & Google AdSense & Custom Scripts
  useEffect(() => {
    if (!isMounted || !shouldRender || !ad) return;

    // Reset error state
    setLoadError(null);

    // GOOGLE ADSENSE HANDLER
    if (ad.type === 'google_adsense') {
      try {
        const pubId = ad.publisherId || settings?.googleAdSense?.publisherId || 'ca-pub-1234567890123456';
        
        // Ensure Google AdSense script is in <head>
        const scriptId = 'google-adsense-script';
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`;
          script.async = true;
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }

        // Trigger adsbygoogle push after DOM attachment only on uninitialized tags
        const timer = setTimeout(() => {
          try {
            if (containerRef.current) {
              const insElements = containerRef.current.querySelectorAll('ins.adsbygoogle');
              insElements.forEach((ins) => {
                const isLoaded = ins.getAttribute('data-adsbygoogle-status') || ins.getAttribute('data-ad-status');
                if (!isLoaded) {
                  try {
                    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                  } catch (pushErr) {
                    console.debug('adsbygoogle push captured:', pushErr);
                  }
                }
              });
            }
          } catch (adsenseErr: any) {
            console.debug('AdSense initialization notice:', adsenseErr?.message || adsenseErr);
          }
        }, 150);

        return () => clearTimeout(timer);
      } catch (err: any) {
        console.warn('AdSense tag error:', err);
      }
    }

    // ADSTERRA SCRIPT / CUSTOM SCRIPT ISOLATION HANDLER
    if (ad.type === 'adsterra' || (ad.adCode && ad.adCode.includes('<script'))) {
      if (iframeRef.current) {
        try {
          const iframe = iframeRef.current;
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            // Build isolated HTML document inside the iframe so Adsterra scripts execute without colliding
            const htmlContent = `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body, html { margin: 0; padding: 0; background: transparent; overflow: hidden; font-family: sans-serif; display: flex; justify-content: center; align-items: center; }
                    img { max-width: 100%; height: auto; }
                  </style>
                </head>
                <body>
                  <div id="ad-wrapper" style="width: 100%; text-align: center;">
                    ${ad.adCode || ''}
                  </div>
                </body>
              </html>
            `;
            iframeDoc.write(htmlContent);
            iframeDoc.close();
          }
        } catch (iframeErr: any) {
          console.warn('Isolated ad rendering notice:', iframeErr);
          setLoadError('Ad script rendered with fallback.');
        }
      }
    }
  }, [ad, isMounted, settings, shouldRender]);

  // Early return safely AFTER all hook calls
  if (!shouldRender || isDismissed || (!ad && !isPreview)) {
    return null;
  }

  const handleCustomAdClick = () => {
    if (ad && ad.id) {
      if (!isPreview) {
        api.trackAd(ad.id, 'click').catch(() => {});
      }
      if (ad.destinationUrl) {
        window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Determine reserved container dimensions for CLS protection
  const reservedMinHeight = placement?.reservedHeight || (position.includes('Sidebar') ? 250 : position.includes('Middle') ? 250 : 90);

  // Mobile Sticky Banner Special Layout
  if (position === 'Mobile Sticky' || slotKey === 'AD_SLOT_MOBILE_STICKY') {
    return (
      <aside
        id={`ad-slot-${position.toLowerCase().replace(/\s+/g, '-')}`}
        aria-label="Sponsored Advertisement"
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-emerald-500/30 backdrop-blur-md shadow-2xl p-2 md:hidden flex flex-col items-center animate-in slide-in-from-bottom duration-300"
      >
        <div className="w-full max-w-md flex items-center justify-between px-2 pb-1 text-[9px] text-slate-400 font-mono">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <ShieldCheck className="w-3 h-3" />
            <span>SPONSORED ADVERTISEMENT</span>
          </span>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-white rounded bg-slate-800/80 cursor-pointer"
            aria-label="Close Advertisement"
            title="Close Advertisement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-full flex justify-center items-center min-h-[50px] overflow-hidden">
          {ad?.type === 'custom' && ad?.bannerUrl ? (
            <div onClick={handleCustomAdClick} className="cursor-pointer max-w-full">
              <img
                src={ad.bannerUrl}
                alt={ad.name}
                className="max-h-[50px] w-auto object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : ad?.type === 'adsterra' || (ad?.adCode && ad.adCode.includes('<script')) ? (
            <iframe
              ref={iframeRef}
              title="Advertisement Banner"
              className="w-full h-[50px] border-0 overflow-hidden"
              scrolling="no"
            />
          ) : (
            <div
              ref={containerRef}
              className="w-full text-center text-xs text-slate-300"
              dangerouslySetInnerHTML={{ __html: ad?.adCode || '' }}
            />
          )}
        </div>
      </aside>
    );
  }

  return (
    <section
      id={`ad-slot-${position.toLowerCase().replace(/\s+/g, '-')}`}
      aria-label="Sponsored Advertisement"
      className={`my-4 w-full max-w-full overflow-hidden transition-all ${className}`}
    >
      <div
        className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden shadow-md"
        style={{ minHeight: `${reservedMinHeight}px` }}
      >
        {/* Subtle, standard Advertisement Header Badge */}
        <div className="flex items-center justify-between text-[10px] uppercase font-mono px-3 py-1 bg-slate-950/80 border-b border-slate-800/80 text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="font-semibold tracking-wider text-slate-300">ADVERTISEMENT</span>
          </div>
          <div className="flex items-center space-x-2 text-[9px] text-slate-500">
            {ad?.type && <span className="text-amber-400 font-bold">{ad.type.replace('_', ' ')}</span>}
            <span>•</span>
            <span>{position}</span>
          </div>
        </div>

        {/* Ad Content Container */}
        <div ref={containerRef} className="p-2 sm:p-3 flex justify-center items-center overflow-hidden">
          {ad?.type === 'custom' && ad?.bannerUrl ? (
            <div
              onClick={handleCustomAdClick}
              className="cursor-pointer group relative w-full flex justify-center items-center overflow-hidden rounded-xl"
            >
              <img
                src={ad.bannerUrl}
                alt={ad.advertiserName || ad.name || 'Sponsored Advertisement'}
                className="w-full h-auto max-h-64 object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white flex items-center space-x-1">
                <span>Visit Sponsor</span>
                <ExternalLink className="w-3 h-3 text-emerald-400" />
              </div>
            </div>
          ) : ad?.type === 'adsterra' || (ad?.adCode && ad.adCode.includes('<script')) ? (
            <div className="w-full flex justify-center items-center">
              <iframe
                ref={iframeRef}
                title={`Adsterra Advertisement - ${position}`}
                className="w-full min-h-[90px] border-0 overflow-hidden"
                style={{ height: `${reservedMinHeight - 30}px`, maxWidth: '100%' }}
                scrolling="no"
              />
            </div>
          ) : ad?.type === 'google_adsense' ? (
            <div className="w-full text-center py-2">
              {ad.adCode && !ad.adCode.includes('ca-pub-1234567890123456') ? (
                <div dangerouslySetInnerHTML={{ __html: ad.adCode }} />
              ) : (
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block', textAlign: 'center' }}
                  data-ad-client={ad.publisherId || settings?.googleAdSense?.publisherId || 'ca-pub-1234567890123456'}
                  data-ad-slot={ad.adUnitId || '9876543210'}
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                ></ins>
              )}
            </div>
          ) : ad?.adCode ? (
            <div
              className="w-full text-slate-200 text-xs text-center py-2"
              dangerouslySetInnerHTML={{ __html: ad.adCode }}
            />
          ) : (
            <div className="p-6 text-center space-y-1 text-slate-400 text-xs">
              <div className="font-bold text-slate-200">{ad?.name || 'Advertisement Space'}</div>
              <div className="text-[11px] text-slate-500">Managed securely via NaijaTrendiInfo Ads Manager</div>
            </div>
          )}
        </div>

        {loadError && (
          <div className="px-3 py-1 bg-amber-500/10 border-t border-amber-500/20 text-[10px] text-amber-300 flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>{loadError}</span>
          </div>
        )}
      </div>
    </section>
  );
};
