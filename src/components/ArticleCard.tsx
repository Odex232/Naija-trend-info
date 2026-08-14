import React from 'react';
import { Eye, Clock, Calendar, Flame, Pin, Sparkles, User } from 'lucide-react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onSelect: (article: Article) => void;
  variant?: 'featured' | 'grid' | 'horizontal' | 'compact' | 'hero-sub';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSelect, variant = 'grid' }) => {
  const publishedDate = new Date(article.publishedAt).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric'
  });

  if (variant === 'featured') {
    return (
      <div
        onClick={() => onSelect(article)}
        className="group cursor-pointer relative overflow-hidden rounded-2xl shadow-2xl bg-[#0D1A2D] border border-slate-800 h-[430px] lg:h-[500px] flex flex-col justify-end p-6 sm:p-8 text-white transition-all hover:border-emerald-500/40 hover:shadow-emerald-950/40"
      >
        <img
          src={article.featuredImage}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-90"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/70 to-transparent"></div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-[#00B87C] text-white font-extrabold px-3 py-1 rounded-md tracking-wider uppercase text-[10px] shadow-sm">
              {article.categoryName}
            </span>
            {article.isBreaking && (
              <span className="bg-[#E63946] text-white font-black px-2.5 py-1 rounded-md tracking-wider uppercase text-[10px] animate-pulse">
                Breaking News
              </span>
            )}
            {article.isPinned && (
              <span className="bg-[#F5B942] text-slate-950 font-black px-2 py-1 rounded-md flex items-center space-x-1 text-[10px]">
                <Pin className="w-3 h-3 fill-current" />
                <span>Featured Lead</span>
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif leading-tight group-hover:text-[#00B87C] transition-colors drop-shadow-md">
            {article.title}
          </h2>

          <p className="text-slate-200 text-xs sm:text-sm line-clamp-2 max-w-2xl font-sans leading-relaxed text-shadow-sm">
            {article.summary}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-2 font-medium">
            <span className="text-[#00B87C] font-bold flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>{article.authorName}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center space-x-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{publishedDate}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center space-x-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{article.readTimeMinutes} min read</span>
            </span>
            {article.views > 0 && (
              <>
                <span className="text-slate-600">•</span>
                <span className="flex items-center space-x-1 font-mono text-[#F5B942]">
                  <Eye className="w-3.5 h-3.5 text-[#F5B942]" />
                  <span>{article.views.toLocaleString()}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'hero-sub') {
    return (
      <div
        onClick={() => onSelect(article)}
        className="group cursor-pointer relative overflow-hidden rounded-2xl shadow-lg bg-[#0D1A2D] border border-slate-800 h-[235px] flex flex-col justify-end p-4 text-white transition-all hover:border-emerald-500/40 hover:bg-[#07111F]"
      >
        <img
          src={article.featuredImage}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/70 to-transparent"></div>

        <div className="relative z-10 space-y-1.5">
          <span className="bg-[#00B87C] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider inline-block">
            {article.categoryName}
          </span>

          <h3 className="text-sm font-bold font-serif leading-snug line-clamp-2 group-hover:text-[#00B87C] transition-colors">
            {article.title}
          </h3>

          <div className="flex items-center space-x-2 text-[11px] text-slate-300">
            <span>{publishedDate}</span>
            <span>•</span>
            <span>{article.readTimeMinutes}m read</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div
        onClick={() => onSelect(article)}
        className="group cursor-pointer flex flex-col sm:flex-row gap-4 bg-[#0D1A2D]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/30 hover:bg-[#0D1A2D] shadow-lg transition-all"
      >
        <div className="w-full sm:w-48 h-32 shrink-0 rounded-xl overflow-hidden relative bg-slate-900 border border-slate-800">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <span className="absolute top-2 left-2 bg-[#00B87C] text-white font-extrabold text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">
            {article.categoryName}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-between py-0.5">
          <div>
            <h3 className="font-bold font-serif text-base text-slate-100 group-hover:text-[#00B87C] transition-colors line-clamp-2 leading-snug">
              {article.title}
            </h3>
            <p className="text-slate-300 text-xs mt-1.5 line-clamp-2 font-sans leading-relaxed">
              {article.summary}
            </p>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
            <span className="font-semibold text-[#00B87C]">{article.authorName}</span>
            <span>•</span>
            <span>{publishedDate}</span>
            <span>•</span>
            <span>{article.readTimeMinutes} min read</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        onClick={() => onSelect(article)}
        className="group cursor-pointer flex items-start space-x-3 py-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
      >
        <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 relative">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex-1">
          <span className="text-[10px] font-bold text-[#00B87C] uppercase tracking-wider">
            {article.categoryName}
          </span>
          <h4 className="font-bold text-xs text-slate-100 group-hover:text-[#00B87C] transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h4>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{publishedDate}</span>
        </div>
      </div>
    );
  }

  // Standard Grid Variant
  return (
    <div
      onClick={() => onSelect(article)}
      className="group cursor-pointer bg-[#0D1A2D]/90 rounded-2xl overflow-hidden border border-slate-800 hover:border-emerald-500/30 hover:bg-[#0D1A2D] shadow-lg transition-all flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden bg-slate-900">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          <span className="bg-[#00B87C] text-white font-extrabold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
            {article.categoryName}
          </span>
          {article.isBreaking && (
            <span className="bg-[#E63946] text-white font-black text-[10px] px-2 py-1 rounded-md uppercase animate-pulse">
              Breaking
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold font-serif text-base text-slate-100 group-hover:text-[#00B87C] transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>
          <p className="text-slate-300 text-xs mt-2 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-800">
          <span className="font-semibold text-slate-200">{article.authorName}</span>
          <div className="flex items-center space-x-2">
            <span>{publishedDate}</span>
            <span>•</span>
            <span>{article.readTimeMinutes}m read</span>
          </div>
        </div>
      </div>
    </div>
  );
};

