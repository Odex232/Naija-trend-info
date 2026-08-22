import React from 'react';
import { Category, Article, Ad, AdPlacement } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { AdDisplay } from '../components/AdDisplay';
import { SEOHead } from '../components/SEOHead';
import { Layers } from 'lucide-react';

interface CategoryViewProps {
  categorySlug: string;
  categories: Category[];
  articles: Article[];
  ads: Ad[];
  adPlacements: AdPlacement[];
  onSelectArticle: (article: Article) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  categorySlug,
  categories = [],
  articles = [],
  ads = [],
  adPlacements = [],
  onSelectArticle,
  onNavigate
}) => {
  const category = (categories || []).find((c) => c?.slug?.toLowerCase() === categorySlug?.toLowerCase());
  const categoryName = category ? category.name : (categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1));
  const categoryDesc = category?.description || `Explore the latest news, updates, and in-depth reports in ${categoryName} from NaijaTrendiInfo.`;

  const categoryArticles = (articles || []).filter((a) => {
    if (!category) return a?.categoryName?.toLowerCase() === categorySlug?.toLowerCase();
    return a?.categoryId === category.id || a?.categoryName?.toLowerCase() === category.name?.toLowerCase();
  });

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': `${categoryName} News – NaijaTrendiInfo`,
      'description': categoryDesc,
      'url': `https://www.naijatrendinfo.com.ng/category/${categorySlug.toLowerCase()}`,
      'publisher': {
        '@type': 'NewsMediaOrganization',
        'name': 'NaijaTrendiInfo',
        'url': 'https://www.naijatrendinfo.com.ng/'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://www.naijatrendinfo.com.ng/'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': categoryName,
          'item': `https://www.naijatrendinfo.com.ng/category/${categorySlug.toLowerCase()}`
        }
      ]
    }
  ];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      <SEOHead
        title={`${categoryName} News & Updates – NaijaTrendiInfo`}
        description={categoryDesc}
        keywords={`${categoryName} news, Nigeria ${categoryName}, ${categoryName} news today, NaijaTrendiInfo`}
        canonicalPath={`/category/${categorySlug.toLowerCase()}`}
        ogType="website"
        structuredData={structuredData}
      />

      {/* Category Header Banner */}
      <div className="bg-white/5 backdrop-blur-2xl text-white rounded-3xl p-8 shadow-2xl border border-white/10">
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Category Desk</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-white tracking-tight">
          {categoryName}
        </h1>
        {category?.description && (
          <p className="text-slate-300 text-sm mt-2 max-w-2xl font-sans">
            {category.description}
          </p>
        )}
        <div className="text-xs text-emerald-400 mt-4 font-mono font-medium">
          Showing {categoryArticles.length} published stories in this channel
        </div>
      </div>

      <AdDisplay position="Below Breaking News" placements={adPlacements} ads={ads} />

      {/* Articles Grid */}
      {categoryArticles.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/10 shadow-xl">
          <p className="text-slate-300 text-sm">
            No published stories found in this category yet. Check back shortly for breaking updates!
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
          >
            Return to Homepage
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryArticles.map((art) => (
            <ArticleCard key={art.id} article={art} onSelect={onSelectArticle} variant="grid" />
          ))}
        </div>
      )}
    </div>
  );
};
