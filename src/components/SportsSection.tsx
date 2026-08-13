import React from 'react';
import { Trophy, Activity, Calendar, MapPin, Zap } from 'lucide-react';
import { SportsFixture, Article } from '../types';

interface SportsSectionProps {
  fixtures: SportsFixture[];
  sportsArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const SportsSection: React.FC<SportsSectionProps> = ({
  fixtures,
  sportsArticles,
  onSelectArticle,
  onNavigate
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-2xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-serif text-white tracking-wide uppercase flex items-center space-x-2">
              <span>NaijaTrendiInfo Sports Hub</span>
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded tracking-widest">
                LIVE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              NPFL • Super Eagles • Premier League • Champions League • Boxing & Athletics
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('sports')}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20"
        >
          View Full Sports Center & Fixtures
        </button>
      </div>

      {/* Live Scores Ticker Row */}
      <div className="py-6 border-b border-white/10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Matchday Scoreboard & Upcoming Fixtures</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {fixtures.slice(0, 4).map((fix) => (
            <div
              key={fix.id}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex flex-col justify-between hover:border-amber-400/50 transition-colors"
            >
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-2">
                <span className="text-amber-400 truncate max-w-[120px]">{fix.league}</span>
                {fix.status === 'LIVE' ? (
                  <span className="bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    <span>{fix.minute}</span>
                  </span>
                ) : fix.status === 'FINISHED' ? (
                  <span className="text-slate-400">FT</span>
                ) : (
                  <span className="text-emerald-400">UPCOMING</span>
                )}
              </div>

              <div className="space-y-1.5 my-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white">{fix.homeTeam}</span>
                  <span className="text-amber-400 font-mono text-sm">{fix.homeScore ?? '-'}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white">{fix.awayTeam}</span>
                  <span className="text-amber-400 font-mono text-sm">{fix.awayScore ?? '-'}</span>
                </div>
              </div>

              {fix.venue && (
                <div className="text-[10px] text-slate-400 mt-2 flex items-center space-x-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{fix.venue}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Featured Sports News Grid */}
      <div className="pt-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Latest Sports Headlines
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sportsArticles.slice(0, 3).map((art) => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="group cursor-pointer bg-white/5 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 hover:border-emerald-400 transition-all flex flex-col justify-between"
            >
              <div className="h-32 overflow-hidden relative">
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <h4 className="font-bold text-xs text-white group-hover:text-emerald-400 line-clamp-2 leading-snug">
                  {art.title}
                </h4>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>{art.authorName}</span>
                  <span>{art.readTimeMinutes} min read</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
