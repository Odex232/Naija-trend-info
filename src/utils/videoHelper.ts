export type VideoProvider = 'youtube' | 'vimeo' | 'tiktok' | 'facebook' | 'dailymotion' | 'direct' | 'iframe' | 'unknown';

export interface ParsedVideo {
  provider: VideoProvider;
  originalUrl: string;
  videoId?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  isValid: boolean;
  providerLabel: string;
}

/**
 * Parse any video URL or embed code to identify provider, extract video ID, generate safe embed URL and thumbnail
 */
export function parseVideoUrl(inputUrl: string): ParsedVideo {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return {
      provider: 'unknown',
      originalUrl: '',
      isValid: false,
      providerLabel: 'Unknown Provider'
    };
  }

  const raw = inputUrl.trim();

  // 1. Direct iframe embed snippet pasted by user
  if (raw.startsWith('<iframe') && raw.includes('src=')) {
    const srcMatch = raw.match(/src=["']([^"']+)["']/i);
    const src = srcMatch ? srcMatch[1] : '';
    return {
      provider: 'iframe',
      originalUrl: raw,
      embedUrl: src,
      isValid: Boolean(src),
      providerLabel: 'Custom Embed Code'
    };
  }

  // 2. YouTube Parsing (Regular, Shortened, Shorts, Embed, Live)
  // https://www.youtube.com/watch?v=dQw4w9WgXcQ
  // https://youtu.be/dQw4w9WgXcQ
  // https://www.youtube.com/shorts/3Xk_mY-tI-w
  // https://www.youtube.com/embed/dQw4w9WgXcQ
  // https://youtube.com/live/dQw4w9WgXcQ
  const ytMatch = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      provider: 'youtube',
      originalUrl: raw,
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&enablejsapi=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isValid: true,
      providerLabel: 'YouTube Video'
    };
  }

  // 3. Vimeo Parsing
  // https://vimeo.com/123456789 or https://player.vimeo.com/video/123456789
  const vimeoMatch = raw.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      provider: 'vimeo',
      originalUrl: raw,
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`,
      isValid: true,
      providerLabel: 'Vimeo Video'
    };
  }

  // 4. TikTok Parsing
  // https://www.tiktok.com/@user/video/1234567890123456789
  const tikTokMatch = raw.match(/tiktok\.com\/@[^/]+\/video\/([0-9]+)/i);
  if (tikTokMatch && tikTokMatch[1]) {
    const videoId = tikTokMatch[1];
    return {
      provider: 'tiktok',
      originalUrl: raw,
      videoId,
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      isValid: true,
      providerLabel: 'TikTok Video / Reel'
    };
  }

  // 5. Facebook Video Parsing
  if (/facebook\.com|fb\.watch/i.test(raw)) {
    const encodedUrl = encodeURIComponent(raw);
    return {
      provider: 'facebook',
      originalUrl: raw,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&t=0`,
      isValid: true,
      providerLabel: 'Facebook Video'
    };
  }

  // 6. Dailymotion Parsing
  const dmMatch = raw.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/i);
  if (dmMatch && dmMatch[1]) {
    const videoId = dmMatch[1];
    return {
      provider: 'dailymotion',
      originalUrl: raw,
      videoId,
      embedUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
      isValid: true,
      providerLabel: 'Dailymotion Video'
    };
  }

  // 7. Direct HTML5 Video (.mp4, .webm, .ogg, .mov, .m4v)
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(raw)) {
    return {
      provider: 'direct',
      originalUrl: raw,
      embedUrl: raw,
      isValid: true,
      providerLabel: 'Direct Video File (MP4/WebM)'
    };
  }

  // 8. Generic web URL with video keyword or protocol
  if (/^https?:\/\//i.test(raw)) {
    return {
      provider: 'direct',
      originalUrl: raw,
      embedUrl: raw,
      isValid: true,
      providerLabel: 'Web Video Stream'
    };
  }

  return {
    provider: 'unknown',
    originalUrl: raw,
    isValid: false,
    providerLabel: 'Invalid Video Link'
  };
}

/**
 * Generate clean, responsive HTML snippet for inserting into article content (WYSIWYG editor)
 */
export interface GenerateEmbedOptions {
  url: string;
  caption?: string;
  credit?: string;
  aspectRatio?: '16:9' | '9:16' | '4:3';
  isShorts?: boolean;
}

export function generateVideoEmbedHtml(options: GenerateEmbedOptions): string {
  const { url, caption = '', credit = '', aspectRatio = '16:9', isShorts = false } = options;
  const parsed = parseVideoUrl(url);

  if (!parsed.isValid) return '';

  const aspectClass = isShorts || aspectRatio === '9:16' 
    ? 'aspect-[9/16] max-w-sm mx-auto' 
    : aspectRatio === '4:3' 
      ? 'aspect-[4/3]' 
      : 'aspect-video';

  let playerSnippet = '';

  if (parsed.provider === 'direct') {
    playerSnippet = `<video controls playsinline preload="metadata" class="w-full h-full rounded-2xl bg-black shadow-lg">
  <source src="${parsed.embedUrl}" type="video/mp4">
  Your browser does not support HTML5 video streaming.
</video>`;
  } else {
    playerSnippet = `<iframe 
  src="${parsed.embedUrl}" 
  title="${caption || 'Video Report'}" 
  class="w-full h-full rounded-2xl border-0 shadow-lg" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
  allowfullscreen 
  loading="lazy">
</iframe>`;
  }

  const captionHtml = (caption || credit) ? `
  <figcaption class="mt-2.5 text-xs text-center text-slate-500 dark:text-slate-400 font-sans flex items-center justify-center space-x-1.5">
    <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>
    <span class="font-medium">${caption || 'Video Report'}</span>
    ${credit ? `<span class="opacity-75">| Source: ${credit}</span>` : ''}
  </figcaption>` : '';

  return `<figure class="article-video-embed my-6 w-full clear-both">
  <div class="relative w-full ${aspectClass} overflow-hidden rounded-2xl bg-slate-950 shadow-xl border border-slate-200 dark:border-slate-800">
    ${playerSnippet}
  </div>${captionHtml}
</figure>`;
}

/**
 * Extract YouTube thumbnail if possible
 */
export function getYouTubeThumbnail(url: string, quality: 'maxres' | 'hq' | 'mq' = 'hq'): string | null {
  const parsed = parseVideoUrl(url);
  if (parsed.provider === 'youtube' && parsed.videoId) {
    if (quality === 'maxres') {
      return `https://img.youtube.com/vi/${parsed.videoId}/maxresdefault.jpg`;
    }
    return `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`;
  }
  return null;
}
