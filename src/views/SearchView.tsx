import React, { useState } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Article, Category } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { SEOHead } from '../components/SEOHead';

interface SearchViewProps {
  initialQuery: string;
  articles: Article[];
  categories: Category[];
  onSelectArticle: (article: Article) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  initialQuery = '',
  articles = [],
  categories = [],
  onSelectArticle,
  onNavigate
}) => {
  const [term, setTerm] = useState(initialQuery || '');
  const [selectedCat, setSelectedCat] = useState('all');

  const filtered = (articles || []).filter((a) => {
    const matchesTerm =
      !term ||
      a?.title?.toLowerCase().includes(term.toLowerCase()) ||
      a?.summary?.toLowerCase().includes(term.toLowerCase()) ||
      (a?.tags || []).some((t) => t?.toLowerCase().includes(term.toLowerCase())) ||
      a?.authorName?.toLowerCase().includes(term.toLowerCase());

    const matchesCat = selectedCat === 'all' || a?.categoryId === selectedCat || a?.categoryName?.toLowerCase() === selectedCat.toLowerCase();

    return matchesTerm && matchesCat && a?.status === 'published';
  });

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      <SEOHead
        title={term ? `Search Results for "${term}" – NaijaTrendiInfo` : 'Search News Archive – NaijaTrendiInfo'}
        description="Search published news, reports, sports coverage, politics, business, and entertainment articles on NaijaTrendiInfo."
        canonicalPath="/search"
        isNoIndex={true}
      />

      {/* Search Bar Header */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        <h1 className="text-2xl font-bold font-serif text-white mb-4 flex items-center space-x-2">
          <Search className="w-6 h-6 text-emerald-400" />
          <span>Search NaijaTrendiInfo Archive</span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Type keywords (e.g., CBN, Super Eagles, Lagos, Budget, Election)..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-md text-white placeholder-slate-400 text-sm rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="bg-slate-900/90 text-white text-sm rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-400 font-medium">
          Found {filtered.length} relevant results
        </div>
      </div>

      {/* Search Results */}
      {filtered.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/10 shadow-xl">
          <p className="text-slate-300 text-sm">
            No stories match your search criteria. Try using broader search keywords or reset category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((art) => (
            <ArticleCard key={art.id} article={art} onSelect={onSelectArticle} variant="grid" />
          ))}
        </div>
      )}
    </div>
  );
};
