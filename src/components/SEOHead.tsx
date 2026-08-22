import React, { useEffect } from 'react';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string | string[];
  canonicalPath?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  isNoIndex?: boolean;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
}

const PRODUCTION_ORIGIN = 'https://www.naijatrendinfo.com.ng';

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalPath,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  ogImageAlt,
  author,
  publishedTime,
  modifiedTime,
  section,
  isNoIndex = false,
  structuredData,
  googleSiteVerification,
  bingSiteVerification
}) => {
  useEffect(() => {
    // 1. Dynamic Page Title
    const siteTitleSuffix = 'NaijaTrendiInfo';
    let finalTitle = title || 'NaijaTrendiInfo – Latest Nigerian News, Sports, Entertainment & Trending Stories';
    if (title && !title.includes('NaijaTrendiInfo') && !title.includes('Naija Trend')) {
      finalTitle = `${title} | ${siteTitleSuffix}`;
    }
    document.title = finalTitle;

    // Helper to set or create <meta> tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, contentValue: string | undefined) => {
      if (contentValue === undefined || contentValue === null) return;
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentValue);
    };

    // Helper to set or create <link> tag
    const setLinkTag = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // 2. Canonical URL Resolution (Strict Clean Production Domain)
    let resolvedCanonical = canonicalUrl;
    if (!resolvedCanonical) {
      const cleanPath = canonicalPath || window.location.pathname;
      resolvedCanonical = `${PRODUCTION_ORIGIN}${cleanPath === '/' ? '' : cleanPath}`;
    }
    // Clean query parameters from canonical URL
    try {
      const parsed = new URL(resolvedCanonical, PRODUCTION_ORIGIN);
      resolvedCanonical = `${PRODUCTION_ORIGIN}${parsed.pathname === '/' ? '' : parsed.pathname}`;
    } catch (e) {
      resolvedCanonical = `${PRODUCTION_ORIGIN}${canonicalPath || ''}`;
    }
    setLinkTag('canonical', resolvedCanonical);

    // 3. Meta Description
    const finalDesc = description || 'Nigeria’s premier digital news and media platform providing breaking news, politics, business, sports, entertainment, tech, and investigative reporting.';
    setMetaTag('name', 'description', finalDesc);

    // 4. Meta Keywords
    const keywordStr = Array.isArray(keywords) ? keywords.join(', ') : (keywords || 'NaijaTrendiInfo, Nigeria news, Nigerian news, breaking news Nigeria, sports news Nigeria, football news, entertainment news, tech news Nigeria, business news');
    setMetaTag('name', 'keywords', keywordStr);

    // 5. Robots Tag (Strict Crawl Instructions)
    const robotsContent = isNoIndex
      ? 'noindex, follow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    setMetaTag('name', 'robots', robotsContent);
    setMetaTag('name', 'googlebot', robotsContent);
    setMetaTag('name', 'bingbot', robotsContent);

    // 6. Open Graph Metadata
    setMetaTag('property', 'og:site_name', 'NaijaTrendiInfo');
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', finalDesc);
    setMetaTag('property', 'og:url', resolvedCanonical);
    
    const finalImage = ogImage || `${PRODUCTION_ORIGIN}/icon.png`;
    setMetaTag('property', 'og:image', finalImage);
    if (ogImageAlt || finalTitle) {
      setMetaTag('property', 'og:image:alt', ogImageAlt || finalTitle);
    }
    setMetaTag('property', 'og:locale', 'en_NG');

    if (ogType === 'article') {
      if (publishedTime) setMetaTag('property', 'article:published_time', publishedTime);
      if (modifiedTime) setMetaTag('property', 'article:modified_time', modifiedTime);
      if (author) setMetaTag('property', 'article:author', author);
      if (section) setMetaTag('property', 'article:section', section);
    }

    // 7. Twitter / X Card Metadata
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:site', '@NaijaTrendiInfo');
    setMetaTag('name', 'twitter:creator', '@NaijaTrendiInfo');
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', finalDesc);
    setMetaTag('name', 'twitter:image', finalImage);

    // 8. Search Console & Webmaster Verification
    if (googleSiteVerification) {
      setMetaTag('name', 'google-site-verification', googleSiteVerification);
    }
    if (bingSiteVerification) {
      setMetaTag('name', 'msvalidate.01', bingSiteVerification);
    }

    // 9. Dynamic JSON-LD Structured Data Injection
    const scriptId = 'dynamic-seo-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    // Build structured data array
    const defaultSchemas: Array<Record<string, any>> = [
      {
        '@context': 'https://schema.org',
        '@type': 'NewsMediaOrganization',
        'name': 'NaijaTrendiInfo',
        'url': PRODUCTION_ORIGIN,
        'logo': {
          '@type': 'ImageObject',
          'url': `${PRODUCTION_ORIGIN}/icon.png`,
          'width': 512,
          'height': 512
        },
        'sameAs': [
          'https://facebook.com/NaijaTrendiInfo',
          'https://twitter.com/NaijaTrendiInfo',
          'https://instagram.com/NaijaTrendiInfo',
          'https://youtube.com/c/NaijaTrendiInfoTV',
          'https://t.me/NaijaTrendiInfoNews',
          'https://whatsapp.com/channel/NaijaTrendiInfoChannel'
        ],
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Lagos',
          'addressRegion': 'Lagos State',
          'addressCountry': 'NG'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'NaijaTrendiInfo',
        'alternateName': ['Naija Trendi Info', 'NaijaTrendInfo', 'NaijaTrendiInfo News'],
        'url': PRODUCTION_ORIGIN,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${PRODUCTION_ORIGIN}/search?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      }
    ];

    let finalJsonLd: any = defaultSchemas;
    if (structuredData) {
      if (Array.isArray(structuredData)) {
        finalJsonLd = [...defaultSchemas, ...structuredData];
      } else {
        finalJsonLd = [...defaultSchemas, structuredData];
      }
    }

    scriptTag.textContent = JSON.stringify(finalJsonLd);

  }, [
    title,
    description,
    keywords,
    canonicalPath,
    canonicalUrl,
    ogType,
    ogImage,
    ogImageAlt,
    author,
    publishedTime,
    modifiedTime,
    section,
    isNoIndex,
    structuredData,
    googleSiteVerification,
    bingSiteVerification
  ]);

  return null;
};
