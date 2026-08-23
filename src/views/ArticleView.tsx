import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Eye,
  Share2,
  Bookmark,
  Check,
  ChevronLeft,
  User,
  MessageCircle,
  Twitter,
  Facebook,
  Linkedin,
  Send,
  Link2,
  Video,
  Play,
  Film
} from 'lucide-react';
import { Article, Ad, AdPlacement, Comment } from '../types';
import { AdDisplay } from '../components/AdDisplay';
import { CommentSection } from '../components/CommentSection';
import { ArticleCard } from '../components/ArticleCard';
import { SEOHead } from '../components/SEOHead';
import { parseVideoUrl } from '../utils/videoHelper';

interface ArticleViewProps {
  article: Article;
  relatedArticles: Article[];
  ads: Ad[];
  adPlacements: AdPlacement[];
  comments: Comment[];
  onSelectArticle: (article: Article) => void;
  onNavigate: (view: string, param?: string) => void;
  onCommentAdded: () => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  relatedArticles = [],
  ads = [],
  adPlacements = [],
  comments = [],
  onSelectArticle,
  onNavigate,
  onCommentAdded
}) => {
  const [copied, setCopied] = useState(false);

  const publishedDate = new Date(article.publishedAt).toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const pageUrl = window.location.href;
  const canonicalArticleUrl = article.canonicalUrl || `https://www.naijatrendinfo.com.ng/article/${article.slug}`;

  // Structured Data Schema for Google News and Search
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': canonicalArticleUrl
      },
      'headline': article.seoTitle || article.title,
      'description': article.seoDescription || article.summary,
      'image': [
        article.featuredImage || 'https://www.naijatrendinfo.com.ng/icon.png'
      ],
      'datePublished': article.publishedAt,
      'dateModified': article.updatedAt || article.publishedAt,
      'author': {
        '@type': 'Person',
        'name': article.authorName || 'NaijaTrendiInfo Editorial Desk',
        'jobTitle': 'Editorial Correspondent'
      },
      'publisher': {
        '@type': 'NewsMediaOrganization',
        'name': 'NaijaTrendiInfo',
        'url': 'https://www.naijatrendinfo.com.ng/',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://www.naijatrendinfo.com.ng/icon.png',
          'width': 512,
          'height': 512
        }
      },
      'articleSection': article.categoryName,
      'keywords': (article.tags || []).join(', '),
      'inLanguage': 'en-NG'
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
          'name': article.categoryName,
          'item': `https://www.naijatrendinfo.com.ng/category/${article.categoryName.toLowerCase()}`
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': article.title,
          'item': canonicalArticleUrl
        }
      ]
    }
  ];

  const handleShare = (platform: string) => {
    const text = encodeURIComponent(`${article.title} - NaijaTrendiInfo`);
    const url = encodeURIComponent(pageUrl);

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6">
      <SEOHead
        title={article.seoTitle || `${article.title} | NaijaTrendiInfo`}
        description={article.seoDescription || article.summary}
        keywords={article.tags}
        canonicalUrl={canonicalArticleUrl}
        ogType="article"
        ogImage={article.featuredImage}
        ogImageAlt={article.imageAlt || article.imageCaption || article.title}
        author={article.authorName}
        publishedTime={article.publishedAt}
        modifiedTime={article.updatedAt || article.publishedAt}
        section={article.categoryName}
        isNoIndex={article.isNoIndex}
        structuredData={structuredData}
      />

      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 mb-6">
        <button
          onClick={() => onNavigate('home')}
          className="hover:text-emerald-600 flex items-center space-x-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate('category', article.categoryName.toLowerCase())}
          className="hover:text-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold"
        >
          {article.categoryName}
        </button>
        <span>/</span>
        <span className="truncate max-w-xs">{article.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Story Column (Col 8) */}
        <main className="lg:col-span-8">
          <article className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl text-slate-100">
            {/* Category Tag & Meta */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-md tracking-wider uppercase shadow-sm">
                {article.categoryName}
              </span>
              {article.isBreaking && (
                <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-md uppercase animate-pulse">
                  Breaking
                </span>
              )}
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-white leading-tight mb-4">
              {article.title}
            </h1>

            {/* Sub-summary */}
            <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed mb-6 font-medium">
              {article.summary}
            </p>

            {/* Author & Date Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-white/10 mb-6 text-xs text-slate-400">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-white/10 shrink-0">
                  {article.authorAvatar ? (
                    <img src={article.authorAvatar} alt={article.authorName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">
                    {article.authorName}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    NaijaTrendiInfo Editorial Correspondent
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>{publishedDate}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>{article.readTimeMinutes} min read</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 font-mono">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>{article.views.toLocaleString()}</span>
                </span>
              </div>
            </div>

            {/* Social Sharing Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-8 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mr-2 flex items-center space-x-1">
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>Share:</span>
              </span>

              <button
                onClick={() => handleShare('whatsapp')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare('twitter')}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1"
              >
                <Twitter className="w-3.5 h-3.5" />
                <span>X/Twitter</span>
              </button>

              <button
                onClick={() => handleShare('facebook')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1"
              >
                <Facebook className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </button>

              <button
                onClick={() => handleShare('telegram')}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </button>

              <button
                onClick={() => handleShare('copy')}
                className="bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 ml-auto"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Link2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Video Player Component */}
            {article.videoUrl && parseVideoUrl(article.videoUrl).isValid && (() => {
              const parsed = parseVideoUrl(article.videoUrl);
              const isVertical = article.videoType === 'short' || parsed.isShort;
              const videoElement = (
                <div className={`mb-8 overflow-hidden rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-2xl ${isVertical ? 'max-w-md mx-auto' : 'w-full'}`}>
                  <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{isVertical ? 'Vertical Short / Reel' : 'Featured Video Report'}</span>
                      </span>
                      <span className="text-[10px] bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-800">
                        {parsed.providerLabel}
                      </span>
                    </div>
                    {article.videoDuration && (
                      <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        ⏱ {article.videoDuration}
                      </span>
                    )}
                  </div>

                  <div className={`relative w-full ${isVertical ? 'aspect-[9/16]' : 'aspect-video'} bg-black`}>
                    {parsed.provider === 'direct' ? (
                      <video controls playsInline className="w-full h-full object-contain">
                        <source src={parsed.embedUrl} type="video/mp4" />
                        Your browser does not support HTML5 video.
                      </video>
                    ) : (
                      <iframe
                        src={parsed.embedUrl}
                        title={article.videoCaption || article.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    )}
                  </div>

                  {article.videoCaption && (
                    <div className="p-3 bg-slate-900/95 text-slate-300 text-xs flex items-center justify-between border-t border-slate-800">
                      <span className="font-medium">{article.videoCaption}</span>
                      <span className="text-[11px] text-slate-400">NaijaTrendiInfo Broadcast Desk</span>
                    </div>
                  )}
                </div>
              );

              if (article.videoPlacement === 'hero' || !article.videoPlacement) {
                return videoElement;
              }
              return null;
            })()}

            {/* Featured Image (when not overridden by hero video or when static image is also preserved) */}
            {(!article.videoUrl || article.videoPlacement !== 'hero') && (
              <figure className="mb-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
                <img
                  src={article.featuredImage}
                  alt={article.imageAlt || article.imageCaption || article.title}
                  className="w-full h-auto max-h-[500px] object-cover"
                  referrerPolicy="no-referrer"
                />
                {article.imageCaption && (
                  <figcaption className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs text-center border-t border-slate-200 dark:border-slate-700">
                    {article.imageCaption} {article.imageCredit && `| Credit: ${article.imageCredit}`}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Video Player when placement is before_content */}
            {article.videoUrl && article.videoPlacement === 'before_content' && parseVideoUrl(article.videoUrl).isValid && (() => {
              const parsed = parseVideoUrl(article.videoUrl);
              const isVertical = article.videoType === 'short' || parsed.isShort;
              return (
                <div className={`mb-8 overflow-hidden rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-2xl ${isVertical ? 'max-w-md mx-auto' : 'w-full'}`}>
                  <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isVertical ? 'Vertical Short / Reel' : 'Video Coverage'}</span>
                    </span>
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-800">
                      {parsed.providerLabel}
                    </span>
                  </div>
                  <div className={`relative w-full ${isVertical ? 'aspect-[9/16]' : 'aspect-video'} bg-black`}>
                    {parsed.provider === 'direct' ? (
                      <video controls playsInline className="w-full h-full object-contain">
                        <source src={parsed.embedUrl} type="video/mp4" />
                      </video>
                    ) : (
                      <iframe
                        src={parsed.embedUrl}
                        title={article.videoCaption || article.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Ad Placement: Before Article */}
            <AdDisplay position="Before Article" placements={adPlacements} ads={ads} />

            {/* Article Content */}
            <div
              className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 font-sans text-sm sm:text-base leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Video Player when placement is after_content */}
            {article.videoUrl && article.videoPlacement === 'after_content' && parseVideoUrl(article.videoUrl).isValid && (() => {
              const parsed = parseVideoUrl(article.videoUrl);
              const isVertical = article.videoType === 'short' || parsed.isShort;
              return (
                <div className={`my-8 overflow-hidden rounded-2xl bg-slate-950 border border-indigo-500/30 shadow-2xl ${isVertical ? 'max-w-md mx-auto' : 'w-full'}`}>
                  <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isVertical ? 'Vertical Short / Reel' : 'Supplementary Video Coverage'}</span>
                    </span>
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-800">
                      {parsed.providerLabel}
                    </span>
                  </div>
                  <div className={`relative w-full ${isVertical ? 'aspect-[9/16]' : 'aspect-video'} bg-black`}>
                    {parsed.provider === 'direct' ? (
                      <video controls playsInline className="w-full h-full object-contain">
                        <source src={parsed.embedUrl} type="video/mp4" />
                      </video>
                    ) : (
                      <iframe
                        src={parsed.embedUrl}
                        title={article.videoCaption || article.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Ad Placement: Middle of Article */}
            <AdDisplay position="Middle of Article" placements={adPlacements} ads={ads} />

            {/* Article Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Related Tags:
                </span>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => onNavigate('search', t)}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs px-3 py-1 rounded-full transition-colors font-medium"
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <CommentSection
              articleId={article.id}
              articleTitle={article.title}
              comments={comments}
              onCommentAdded={onCommentAdded}
            />
          </article>
        </main>

        {/* Right Sidebar (Col 4) */}
        <aside className="lg:col-span-4 space-y-8">
          <AdDisplay position="Sidebar Top" placements={adPlacements} ads={ads} />

          {/* Related Articles Box */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <h3 className="text-sm font-extrabold font-serif text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              More From {article.categoryName}
            </h3>

            <div className="space-y-3">
              {relatedArticles.slice(0, 5).map((art) => (
                <ArticleCard key={art.id} article={art} onSelect={onSelectArticle} variant="compact" />
              ))}
            </div>
          </div>

          <AdDisplay position="Sidebar Bottom" placements={adPlacements} ads={ads} />
        </aside>
      </div>
    </div>
  );
};
