import React, { useEffect } from 'react';
import { PlacementPosition, Ad, AdPlacement } from '../types';
import { api } from '../services/api';

interface AdDisplayProps {
  position: PlacementPosition;
  placements?: AdPlacement[];
  ads?: Ad[];
  className?: string;
}

export const AdDisplay: React.FC<AdDisplayProps> = ({ position, placements = [], ads = [], className = '' }) => {
  const placement = (placements || []).find((p) => p.position === position);
  if (!placement || placement.networkType === 'disabled') return null;

  const ad = (ads || []).find((a) => a.id === placement.adId) || (ads || []).find((a) => a.type === placement.networkType && a.isActive);

  useEffect(() => {
    if (ad && ad.id) {
      api.trackAd(ad.id, 'impression').catch(() => {});
    }
  }, [ad?.id]);

  const handleAdClick = () => {
    if (ad && ad.id) {
      api.trackAd(ad.id, 'click').catch(() => {});
      if (ad.destinationUrl) {
        window.open(ad.destinationUrl, '_blank');
      }
    }
  };

  if (!ad || !ad.isActive) {
    return (
      <div className={`my-4 p-3 bg-white/5 backdrop-blur-md border border-dashed border-white/10 text-center rounded-xl text-slate-400 text-[11px] ${className}`}>
        <span>Advertisement Placement Area [{position}]</span>
      </div>
    );
  }

  return (
    <div className={`my-4 overflow-hidden rounded-xl shadow-lg border border-white/10 transition-transform hover:scale-[1.005] ${className}`}>
      <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest px-3 py-1 bg-white/5 backdrop-blur-md border-b border-white/10">
        <span>ADVERTISEMENT</span>
        <span>{ad.type.toUpperCase()}</span>
      </div>

      {ad.type === 'custom' && ad.bannerUrl ? (
        <div onClick={handleAdClick} className="cursor-pointer relative group">
          <img
            src={ad.bannerUrl}
            alt={ad.name}
            className="w-full h-auto max-h-48 object-cover rounded-b-xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
        </div>
      ) : ad.adCode ? (
        <div
          className="p-3 bg-white/5 backdrop-blur-md text-slate-200 text-xs overflow-hidden"
          dangerouslySetInnerHTML={{ __html: ad.adCode }}
        />
      ) : (
        <div className="p-4 bg-amber-500/10 backdrop-blur-md border border-amber-500/20 text-amber-300 text-center text-xs">
          <strong>{ad.name}</strong>
        </div>
      )}
    </div>
  );
};
