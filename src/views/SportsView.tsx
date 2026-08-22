import React, { useState } from 'react';
import { Trophy, Activity, Calendar, MapPin, Search } from 'lucide-react';
import { SportsFixture, Article } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { SEOHead } from '../components/SEOHead';

interface SportsViewProps {
  sportsFixtures: SportsFixture[];
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const SportsView: React.FC<SportsViewProps> = ({
  sportsFixtures = [],
  articles = [],
  onSelectArticle,
  onNavigate
}) => {
  const [selectedLeague, setSelectedLeague] = useState<string>('all');

  const sportsArticles = (articles || []).filter(
    (a) => a?.categoryId === 'cat-9' || a?.categoryId === 'cat-10' || a?.categoryName?.toLowerCase().includes('sport')
  );

  const publishedFixtures = (sportsFixtures || []).filter((f) => f && f.isPublished !== false);

  const filteredFixtures = publishedFixtures.filter((fix) => {
    if (selectedLeague === 'all') return true;
    if (selectedLeague === 'npfl') return fix.league.toLowerCase().includes('npfl');
    if (selectedLeague === 'international') return fix.league.toLowerCase().includes('international') || fix.league.toLowerCase().includes('eagles');
    if (selectedLeague === 'epl') return fix.league.toLowerCase().includes('premier league');
    return true;
  });

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <SEOHead
        title="Sports News, NPFL Fixtures & Live Football Scores – NaijaTrendiInfo"
        description="Comprehensive Nigerian sports news, NPFL matchday fixtures, Super Eagles updates, Premier League coverage, and transfer news."
        keywords="Nigerian sports news, NPFL fixtures, Super Eagles, Nigerian football news, NPFL live scores, Naija sports"
        canonicalPath="/sports"
        ogType="website"
      />

      {/* Banner */}
      <div className="bg-white/5 backdrop-blur-2xl text-white rounded-3xl p-8 shadow-2xl border border-white/10">
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>NaijaTrendiInfo Sports Arena</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-serif text-white uppercase tracking-tight">
          Live Scores, NPFL & Global Football
        </h1>
        <p className="text-slate-300 text-sm mt-2 max-w-2xl">
          Complete coverage of the Nigerian Premier Football League, Super Eagles international campaigns, European leagues, transfer news, and athletics.
        </p>

        {/* League Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/10 text-xs font-bold">
          <button
            onClick={() => setSelectedLeague('all')}
            className={`px-4 py-2 rounded-xl transition-all ${
              selectedLeague === 'all' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            All Sports
          </button>
          <button
            onClick={() => setSelectedLeague('npfl')}
            className={`px-4 py-2 rounded-xl transition-all ${
              selectedLeague === 'npfl' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            NPFL Nigeria
          </button>
          <button
            onClick={() => setSelectedLeague('international')}
            className={`px-4 py-2 rounded-xl transition-all ${
              selectedLeague === 'international' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            Super Eagles & AFCON
          </button>
          <button
            onClick={() => setSelectedLeague('epl')}
            className={`px-4 py-2 rounded-xl transition-all ${
              selectedLeague === 'epl' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            English Premier League
          </button>
        </div>
      </div>

      {/* Fixtures & Scoreboard Section */}
      {filteredFixtures.length > 0 && (
        <div>
          <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Match Scoreboard ({filteredFixtures.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFixtures.map((fix) => (
              <div
                key={fix.id}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-xl space-y-3"
              >
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-emerald-400">{fix.league}</span>
                  {fix.status === 'LIVE' ? (
                    <span className="bg-rose-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                      LIVE {fix.minute}
                    </span>
                  ) : fix.status === 'FINISHED' ? (
                    <span className="text-slate-400 text-[10px] uppercase font-mono">Full Time</span>
                  ) : (
                    <span className="text-amber-400 text-[10px] uppercase">Upcoming</span>
                  )}
                </div>

                <div className="space-y-2 py-2 border-y border-white/10">
                  <div className="flex justify-between items-center text-sm font-extrabold text-white">
                    <span>{fix.homeTeam}</span>
                    <span className="text-amber-400 font-mono text-base">{fix.homeScore ?? '-'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-extrabold text-white">
                    <span>{fix.awayTeam}</span>
                    <span className="text-amber-400 font-mono text-base">{fix.awayScore ?? '-'}</span>
                  </div>
                </div>

                {fix.venue && (
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{fix.venue}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sports Articles */}
      <div>
        <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wider mb-6">
          Latest Sports Analysis & Transfer News
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sportsArticles.map((art) => (
            <ArticleCard key={art.id} article={art} onSelect={onSelectArticle} variant="grid" />
          ))}
        </div>
      </div>
    </div>
  );
};
