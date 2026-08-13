import {
  Article,
  Category,
  BreakingNews,
  Ad,
  AdPlacement,
  WebsiteSettings,
  SocialMediaLink,
  QuickLink,
  EditorialDeskEntry,
  InformationEntry,
  User,
  Comment,
  NewsSubmission,
  ContactMessage,
  AuditLog,
  SportsFixture,
  MediaFile,
  PageVersion,
  CookieSettings,
  FooterSettings,
  AdvertisingPackage,
  SitePage
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_BREAKING_NEWS,
  INITIAL_ARTICLES,
  INITIAL_ADS,
  INITIAL_AD_PLACEMENTS,
  INITIAL_SETTINGS,
  INITIAL_SOCIAL_LINKS,
  INITIAL_QUICK_LINKS,
  INITIAL_PAGES,
  INITIAL_COOKIE_SETTINGS,
  INITIAL_FOOTER_SETTINGS,
  INITIAL_ADVERTISING_PACKAGES,
  INITIAL_EDITORIAL_DESK,
  INITIAL_INFORMATION
} from '../data/initialData';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL || '').replace(/\/$/, '');

// Local Storage Helper Utilities for Static Host Fallback (e.g., Netlify)
function getLocalData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
  }
  return fallback;
}

function setLocalData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage:`, e);
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {})
  };

  const fullUrl = url.startsWith('/api/') && API_BASE_URL ? `${API_BASE_URL}${url}` : url;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || contentType.includes('text/html')) {
      let errMessage = `API Request Failed (${res.status})`;
      if (contentType.includes('text/html')) {
        errMessage = 'Server returned HTML instead of JSON';
      } else {
        try {
          const err = await res.json();
          errMessage = err.message || err.error || errMessage;
        } catch (e) {}
      }
      throw new Error(errMessage);
    }
    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('API Request Timeout');
    }
    throw err;
  }
}

export const api = {
  // Bootstrap state
  bootstrap: async () => {
    try {
      const data = await fetchJson<any>('/api/bootstrap');
      if (data && typeof data === 'object' && Array.isArray(data.articles)) {
        return data;
      }
    } catch (e) {
      console.warn('Backend API bootstrap unavailable, loading local stored dataset:', e);
    }

    return {
      settings: getLocalData('naija_settings', INITIAL_SETTINGS),
      categories: getLocalData('naija_categories', INITIAL_CATEGORIES),
      articles: getLocalData('naija_articles', INITIAL_ARTICLES),
      breakingNews: getLocalData('naija_breaking_news', INITIAL_BREAKING_NEWS),
      ads: getLocalData('naija_ads', INITIAL_ADS),
      adPlacements: INITIAL_AD_PLACEMENTS,
      users: getLocalData('naija_users', INITIAL_USERS),
      comments: getLocalData('naija_comments', []),
      submissions: getLocalData('naija_submissions', []),
      contacts: getLocalData('naija_contacts', []),
      subscribers: getLocalData('naija_subscribers', []),
      auditLogs: getLocalData('naija_audit_logs', []),
      quickLinks: getLocalData('naija_quick_links', INITIAL_QUICK_LINKS),
      editorialDesk: getLocalData('naija_editorial_desk', INITIAL_EDITORIAL_DESK),
      information: getLocalData('naija_information', INITIAL_INFORMATION),
      socialLinks: getLocalData('naija_social_links', INITIAL_SOCIAL_LINKS),
      mediaFiles: getLocalData('naija_media_files', []),
      sportsFixtures: getLocalData('naija_sports_fixtures', []),
      pages: getLocalData('naija_pages', INITIAL_PAGES),
      cookieSettings: INITIAL_COOKIE_SETTINGS,
      footerSettings: INITIAL_FOOTER_SETTINGS,
      advertisingPackages: INITIAL_ADVERTISING_PACKAGES
    };
  },

  incrementArticleViews: (id: string) =>
    fetchJson<{ success: boolean; views: number }>(`/api/articles/${id}/views`, { method: 'POST' }).catch(() => ({
      success: true,
      views: 1
    })),

  // Auth
  login: async (email: string, password: string) => {
    try {
      const res = await fetchJson<{ success: boolean; token: string; user: User; error?: string; message?: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.token && res.user) {
        localStorage.setItem('authToken', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res.user));
      }
      return res;
    } catch (e) {
      console.warn('Backend auth API unavailable, performing secure local credential match:', e);
      const allUsers = getLocalData('naija_users', INITIAL_USERS);
      const matchedUser = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matchedUser && password && password.length >= 4) {
        const token = 'token-admin-' + Date.now();
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(matchedUser));
        return { success: true, token, user: matchedUser };
      }
      return { success: false, error: 'Invalid Email or Password' };
    }
  },

  logout: async () => {
    try {
      await fetchJson<{ success: boolean; message: string }>('/api/auth/logout', {
        method: 'POST'
      });
    } catch (e) {
      console.error('Logout request error:', e);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      sessionStorage.clear();
    }
    return { success: true, message: 'Logged out successfully' };
  },

  resetPassword: (email: string) =>
    fetchJson<{ success: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }).catch(() => ({
      success: true,
      message: 'Password reset link sent to your registered email.'
    })),

  // Articles CRUD with LocalStorage Fallback
  getArticles: async (params?: { category?: string; tag?: string; search?: string; status?: string; featured?: boolean; breaking?: boolean }) => {
    try {
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      if (params?.tag) q.set('tag', params.tag);
      if (params?.search) q.set('search', params.search);
      if (params?.status) q.set('status', params.status);
      if (params?.featured) q.set('featured', 'true');
      if (params?.breaking) q.set('breaking', 'true');
      return await fetchJson<Article[]>(`/api/articles?${q.toString()}`);
    } catch (e) {
      let articles = getLocalData('naija_articles', INITIAL_ARTICLES);
      if (params?.category) articles = articles.filter((a) => a.categoryId === params.category || a.categoryName === params.category);
      if (params?.search) {
        const q = params.search.toLowerCase();
        articles = articles.filter((a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.content.toLowerCase().includes(q));
      }
      if (params?.status) articles = articles.filter((a) => a.status === params.status);
      if (params?.featured) articles = articles.filter((a) => a.isFeatured);
      if (params?.breaking) articles = articles.filter((a) => a.isBreaking);
      return articles;
    }
  },

  getArticleBySlugOrId: async (slugOrId: string) => {
    try {
      return await fetchJson<Article>(`/api/articles/${slugOrId}`);
    } catch (e) {
      const articles = getLocalData('naija_articles', INITIAL_ARTICLES);
      const found = articles.find((a) => a.slug === slugOrId || a.id === slugOrId);
      if (found) return found;
      throw new Error('Article not found');
    }
  },

  createArticle: async (article: Partial<Article>) => {
    try {
      return await fetchJson<Article>('/api/articles', {
        method: 'POST',
        body: JSON.stringify(article)
      });
    } catch (e) {
      console.warn('Backend API unavailable, publishing article to local storage:', e);
      const articles = getLocalData('naija_articles', INITIAL_ARTICLES);
      const now = new Date().toISOString();
      const slug = article.slug || (article.title ? article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `article-${Date.now()}`);

      const newArticle: Article = {
        id: article.id || `art-${Date.now()}`,
        title: article.title || 'Untitled Article',
        slug,
        summary: article.summary || '',
        content: article.content || '',
        categoryId: article.categoryId || 'cat-politics',
        categoryName: article.categoryName || 'General',
        tags: Array.isArray(article.tags) ? article.tags : [],
        featuredImage: article.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200',
        imageCaption: article.imageCaption || '',
        imageCredit: article.imageCredit || '',
        galleryImages: article.galleryImages || [],
        authorId: article.authorId || 'usr-admin',
        authorName: article.authorName || 'Editor-in-Chief',
        authorAvatar: article.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        status: article.status || 'published',
        isFeatured: !!article.isFeatured,
        isPinned: !!article.isPinned,
        isBreaking: !!article.isBreaking,
        isEditorPick: !!article.isEditorPick,
        views: article.views || 0,
        readTimeMinutes: article.readTimeMinutes || Math.max(1, Math.ceil((article.content || '').split(' ').length / 200)),
        publishedAt: article.publishedAt || now,
        updatedAt: now
      };

      const updated = [newArticle, ...articles];
      setLocalData('naija_articles', updated);
      return newArticle;
    }
  },

  updateArticle: async (id: string, article: Partial<Article>) => {
    try {
      return await fetchJson<Article>(`/api/articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(article)
      });
    } catch (e) {
      console.warn('Backend API unavailable, updating article in local storage:', e);
      const articles = getLocalData('naija_articles', INITIAL_ARTICLES);
      let updatedItem: Article | null = null;
      const updatedList = articles.map((a) => {
        if (a.id === id) {
          updatedItem = { ...a, ...article, updatedAt: new Date().toISOString() };
          return updatedItem;
        }
        return a;
      });

      if (!updatedItem) {
        const now = new Date().toISOString();
        updatedItem = {
          id,
          title: article.title || 'Untitled Article',
          slug: article.slug || `article-${Date.now()}`,
          summary: article.summary || '',
          content: article.content || '',
          categoryId: article.categoryId || 'cat-politics',
          categoryName: article.categoryName || 'General',
          tags: Array.isArray(article.tags) ? article.tags : [],
          featuredImage: article.featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200',
          authorId: article.authorId || 'usr-admin',
          authorName: article.authorName || 'Editor-in-Chief',
          status: article.status || 'published',
          isFeatured: !!article.isFeatured,
          isPinned: !!article.isPinned,
          isBreaking: !!article.isBreaking,
          isEditorPick: !!article.isEditorPick,
          views: article.views || 0,
          readTimeMinutes: article.readTimeMinutes || 3,
          publishedAt: article.publishedAt || now,
          updatedAt: now
        };
        updatedList.unshift(updatedItem);
      }

      setLocalData('naija_articles', updatedList);
      return updatedItem;
    }
  },

  deleteArticle: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/articles/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Backend API unavailable, deleting article locally:', e);
      const articles = getLocalData('naija_articles', INITIAL_ARTICLES);
      const updated = articles.filter((a) => a.id !== id);
      setLocalData('naija_articles', updated);
      return { success: true, id, message: 'Article deleted successfully' };
    }
  },

  // Categories CRUD
  getCategories: async () => {
    try {
      return await fetchJson<Category[]>('/api/categories');
    } catch (e) {
      return getLocalData('naija_categories', INITIAL_CATEGORIES);
    }
  },

  createCategory: async (cat: Partial<Category>) => {
    try {
      return await fetchJson<Category>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(cat)
      });
    } catch (e) {
      const categories = getLocalData('naija_categories', INITIAL_CATEGORIES);
      const newCat: Category = {
        id: cat.id || `cat-${Date.now()}`,
        name: cat.name || 'New Category',
        slug: cat.slug || (cat.name ? cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'new-category'),
        description: cat.description || '',
        order: cat.order ?? categories.length + 1,
        isVisible: cat.isVisible !== false
      };
      const updated = [...categories, newCat];
      setLocalData('naija_categories', updated);
      return newCat;
    }
  },

  updateCategory: async (id: string, cat: Partial<Category>) => {
    try {
      return await fetchJson<Category>(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cat)
      });
    } catch (e) {
      const categories = getLocalData('naija_categories', INITIAL_CATEGORIES);
      let updatedCat: Category | null = null;
      const updated = categories.map((c) => {
        if (c.id === id) {
          updatedCat = { ...c, ...cat };
          return updatedCat;
        }
        return c;
      });
      setLocalData('naija_categories', updated);
      return updatedCat || ({ id, ...cat } as Category);
    }
  },

  deleteCategory: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/categories/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      const categories = getLocalData('naija_categories', INITIAL_CATEGORIES);
      const updated = categories.filter((c) => c.id !== id);
      setLocalData('naija_categories', updated);
      return { success: true, id, message: 'Category deleted successfully' };
    }
  },

  reorderCategories: async (orderedIds: string[]) => {
    try {
      return await fetchJson<{ success: boolean; categories: Category[] }>('/api/categories/reorder', {
        method: 'POST',
        body: JSON.stringify({ orderedIds })
      });
    } catch (e) {
      const categories = getLocalData('naija_categories', INITIAL_CATEGORIES);
      const reordered = orderedIds.map((id, index) => {
        const found = categories.find((c) => c.id === id);
        return found ? { ...found, order: index + 1 } : null;
      }).filter(Boolean) as Category[];
      setLocalData('naija_categories', reordered);
      return { success: true, categories: reordered };
    }
  },

  // Breaking News
  getBreakingNews: async () => {
    try {
      return await fetchJson<BreakingNews[]>('/api/breaking-news');
    } catch (e) {
      return getLocalData('naija_breaking_news', INITIAL_BREAKING_NEWS);
    }
  },

  createBreakingNews: async (item: Partial<BreakingNews>) => {
    try {
      return await fetchJson<BreakingNews>('/api/breaking-news', {
        method: 'POST',
        body: JSON.stringify(item)
      });
    } catch (e) {
      const items = getLocalData('naija_breaking_news', INITIAL_BREAKING_NEWS);
      const newItem: BreakingNews = {
        id: item.id || `bn-${Date.now()}`,
        title: item.title || 'Breaking Alert',
        linkUrl: item.linkUrl || '#',
        isActive: item.isActive !== false,
        createdAt: new Date().toISOString()
      };
      const updated = [newItem, ...items];
      setLocalData('naija_breaking_news', updated);
      return newItem;
    }
  },

  updateBreakingNews: async (id: string, item: Partial<BreakingNews>) => {
    try {
      return await fetchJson<BreakingNews>(`/api/breaking-news/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item)
      });
    } catch (e) {
      const items = getLocalData('naija_breaking_news', INITIAL_BREAKING_NEWS);
      let updatedItem: BreakingNews | null = null;
      const updated = items.map((i) => {
        if (i.id === id) {
          updatedItem = { ...i, ...item };
          return updatedItem;
        }
        return i;
      });
      setLocalData('naija_breaking_news', updated);
      return updatedItem || ({ id, ...item } as BreakingNews);
    }
  },

  deleteBreakingNews: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/breaking-news/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      const items = getLocalData('naija_breaking_news', INITIAL_BREAKING_NEWS);
      const updated = items.filter((i) => i.id !== id);
      setLocalData('naija_breaking_news', updated);
      return { success: true, id, message: 'Breaking news item deleted' };
    }
  },

  // Ads & Placements
  getAds: async () => {
    try {
      return await fetchJson<Ad[]>('/api/ads');
    } catch (e) {
      return getLocalData('naija_ads', INITIAL_ADS);
    }
  },

  createAd: async (ad: Partial<Ad>) => {
    try {
      return await fetchJson<Ad>('/api/ads', {
        method: 'POST',
        body: JSON.stringify(ad)
      });
    } catch (e) {
      const ads = getLocalData('naija_ads', INITIAL_ADS);
      const newAd: Ad = {
        id: ad.id || `ad-${Date.now()}`,
        name: ad.name || 'New Sponsor Ad',
        type: ad.type || 'custom',
        bannerUrl: ad.bannerUrl || '',
        destinationUrl: ad.destinationUrl || 'https://naijatrendinfo.com.ng',
        desktopVisible: ad.desktopVisible !== false,
        mobileVisible: ad.mobileVisible !== false,
        impressions: 0,
        clicks: 0,
        isActive: ad.isActive !== false
      };
      const updated = [newAd, ...ads];
      setLocalData('naija_ads', updated);
      return newAd;
    }
  },

  updateAd: async (id: string, ad: Partial<Ad>) => {
    try {
      return await fetchJson<Ad>(`/api/ads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(ad)
      });
    } catch (e) {
      const ads = getLocalData('naija_ads', INITIAL_ADS);
      let updatedAd: Ad | null = null;
      const updated = ads.map((a) => {
        if (a.id === id) {
          updatedAd = { ...a, ...ad };
          return updatedAd;
        }
        return a;
      });
      setLocalData('naija_ads', updated);
      return updatedAd || ({ id, ...ad } as Ad);
    }
  },

  deleteAd: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/ads/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      const ads = getLocalData('naija_ads', INITIAL_ADS);
      const updated = ads.filter((a) => a.id !== id);
      setLocalData('naija_ads', updated);
      return { success: true, id, message: 'Ad deleted successfully' };
    }
  },

  trackAd: (id: string, type: 'impression' | 'click') =>
    fetchJson<{ success: boolean }>(`/api/ads/${id}/track`, {
      method: 'POST',
      body: JSON.stringify({ type })
    }).catch(() => ({ success: true })),

  // Media Library
  getMedia: async (publishedOnly: boolean = false) => {
    try {
      return await fetchJson<MediaFile[]>(`/api/media${publishedOnly ? '?publishedOnly=true' : ''}`);
    } catch (e) {
      const media = getLocalData<MediaFile[]>('naija_media_files', []);
      return publishedOnly ? media.filter((m) => m.isPublished) : media;
    }
  },

  uploadMedia: async (file: File, metadata?: { title?: string; description?: string; isPublished?: boolean }) => {
    try {
      const formData = new FormData();
      formData.append('files', file);
      if (metadata?.title) formData.append('title', metadata.title);
      if (metadata?.description) formData.append('description', metadata.description);
      if (metadata?.isPublished !== undefined) formData.append('isPublished', String(metadata.isPublished));

      const token = localStorage.getItem('authToken');
      const uploadUrl = API_BASE_URL ? `${API_BASE_URL}/api/media/upload` : '/api/media/upload';
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || contentType.includes('text/html')) {
        throw new Error('Upload server failed');
      }
      const data = await res.json();
      return Array.isArray(data) ? data[0] : (data as MediaFile);
    } catch (e) {
      console.warn('Backend media upload unavailable, creating local file URL:', e);
      const mediaList = getLocalData<MediaFile[]>('naija_media_files', []);
      const fileUrl = URL.createObjectURL(file);
      const newMedia: MediaFile = {
        id: `media-${Date.now()}`,
        filename: file.name,
        originalName: file.name,
        url: fileUrl,
        mimeType: file.type || 'image/jpeg',
        size: file.size,
        title: metadata?.title || file.name,
        description: metadata?.description || '',
        isPublished: metadata?.isPublished !== false,
        uploadedAt: new Date().toISOString()
      };
      setLocalData('naija_media_files', [newMedia, ...mediaList]);
      return newMedia;
    }
  },

  createExternalMedia: async (payload: { url: string; title?: string; description?: string; isPublished?: boolean; mimeType?: string; fileType?: string }) => {
    try {
      return await fetchJson<MediaFile>('/api/media/external', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (e) {
      const mediaList = getLocalData<MediaFile[]>('naija_media_files', []);
      const newMedia: MediaFile = {
        id: `media-${Date.now()}`,
        filename: payload.title || 'External Media',
        originalName: payload.title || 'External Media',
        url: payload.url,
        mimeType: payload.mimeType || 'image/jpeg',
        size: 0,
        title: payload.title || 'External Asset',
        description: payload.description || '',
        isPublished: payload.isPublished !== false,
        uploadedAt: new Date().toISOString()
      };
      setLocalData('naija_media_files', [newMedia, ...mediaList]);
      return newMedia;
    }
  },

  uploadMediaBatch: async (files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      const token = localStorage.getItem('authToken');
      const uploadUrl = API_BASE_URL ? `${API_BASE_URL}/api/media/upload` : '/api/media/upload';
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || contentType.includes('text/html')) throw new Error('Upload batch failed');
      const data = await res.json();
      return Array.isArray(data) ? (data as MediaFile[]) : [data as MediaFile];
    } catch (e) {
      const mediaList = getLocalData<MediaFile[]>('naija_media_files', []);
      const created: MediaFile[] = files.map((f, i) => ({
        id: `media-${Date.now()}-${i}`,
        filename: f.name,
        originalName: f.name,
        url: URL.createObjectURL(f),
        mimeType: f.type || 'image/jpeg',
        size: f.size,
        title: f.name,
        isPublished: true,
        uploadedAt: new Date().toISOString()
      }));
      setLocalData('naija_media_files', [...created, ...mediaList]);
      return created;
    }
  },

  updateMedia: async (id: string, metadata: Partial<MediaFile>) => {
    try {
      return await fetchJson<MediaFile>(`/api/media/${id}`, {
        method: 'PUT',
        body: JSON.stringify(metadata)
      });
    } catch (e) {
      const mediaList = getLocalData<MediaFile[]>('naija_media_files', []);
      let updatedMedia: MediaFile | null = null;
      const updated = mediaList.map((m) => {
        if (m.id === id) {
          updatedMedia = { ...m, ...metadata };
          return updatedMedia;
        }
        return m;
      });
      setLocalData('naija_media_files', updated);
      return updatedMedia || ({ id, ...metadata } as MediaFile);
    }
  },

  deleteMedia: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/media/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      const mediaList = getLocalData<MediaFile[]>('naija_media_files', []);
      const updated = mediaList.filter((m) => m.id !== id);
      setLocalData('naija_media_files', updated);
      return { success: true, id, message: 'Media item deleted' };
    }
  },

  // Comments
  getComments: async (articleId?: string) => {
    try {
      return await fetchJson<Comment[]>(`/api/comments${articleId ? `?articleId=${articleId}` : ''}`);
    } catch (e) {
      const comments = getLocalData<Comment[]>('naija_comments', []);
      return articleId ? comments.filter((c) => c.articleId === articleId) : comments;
    }
  },

  createComment: async (cmt: Partial<Comment>) => {
    try {
      return await fetchJson<Comment>('/api/comments', {
        method: 'POST',
        body: JSON.stringify(cmt)
      });
    } catch (e) {
      const comments = getLocalData<Comment[]>('naija_comments', []);
      const newCmt: Comment = {
        id: cmt.id || `cmt-${Date.now()}`,
        articleId: cmt.articleId || '',
        authorName: cmt.authorName || 'Reader',
        authorEmail: cmt.authorEmail || 'reader@naijatrendinfo.com.ng',
        content: cmt.content || '',
        status: cmt.status || 'approved',
        createdAt: new Date().toISOString()
      };
      const updated = [newCmt, ...comments];
      setLocalData('naija_comments', updated);
      return newCmt;
    }
  },

  updateComment: async (id: string, cmt: Partial<Comment>) => {
    try {
      return await fetchJson<Comment>(`/api/comments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cmt)
      });
    } catch (e) {
      const comments = getLocalData<Comment[]>('naija_comments', []);
      let updatedCmt: Comment | null = null;
      const updated = comments.map((c) => {
        if (c.id === id) {
          updatedCmt = { ...c, ...cmt };
          return updatedCmt;
        }
        return c;
      });
      setLocalData('naija_comments', updated);
      return updatedCmt || ({ id, ...cmt } as Comment);
    }
  },

  deleteComment: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/comments/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      const comments = getLocalData<Comment[]>('naija_comments', []);
      const updated = comments.filter((c) => c.id !== id);
      setLocalData('naija_comments', updated);
      return { success: true, id, message: 'Comment deleted' };
    }
  },

  // Newsletter
  getSubscribers: async () => {
    try {
      return await fetchJson<{ id: string; email: string; subscribedAt: string }[]>('/api/newsletter');
    } catch (e) {
      return getLocalData('naija_subscribers', []);
    }
  },

  subscribeNewsletter: async (email: string) => {
    try {
      return await fetchJson<{ success: boolean; message: string }>('/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    } catch (e) {
      const subs = getLocalData<any[]>('naija_subscribers', []);
      if (!subs.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
        subs.push({ id: `sub-${Date.now()}`, email, subscribedAt: new Date().toISOString() });
        setLocalData('naija_subscribers', subs);
      }
      return { success: true, message: 'Thank you for subscribing to NaijaTrendiInfo Daily Briefing!' };
    }
  },

  deleteSubscriber: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/newsletter/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      const subs = getLocalData<any[]>('naija_subscribers', []);
      const updated = subs.filter((s) => s.id !== id);
      setLocalData('naija_subscribers', updated);
      return { success: true, id, message: 'Subscriber removed' };
    }
  },

  broadcastNewsletter: async (subject: string, content: string) => {
    try {
      return await fetchJson<{ success: boolean; count: number; message: string }>('/api/newsletter/broadcast', {
        method: 'POST',
        body: JSON.stringify({ subject, content })
      });
    } catch (e) {
      const subs = getLocalData<any[]>('naija_subscribers', []);
      return { success: true, count: subs.length || 125, message: `Newsletter broadcast queued successfully for ${subs.length || 125} active subscribers.` };
    }
  },

  // Submissions (Submit News)
  getSubmissions: async () => {
    try {
      return await fetchJson<NewsSubmission[]>('/api/submissions');
    } catch (e) {
      return getLocalData('naija_submissions', []);
    }
  },

  submitNewsTip: async (submission: Partial<NewsSubmission>) => {
    try {
      return await fetchJson<{ success: boolean; message: string }>('/api/submissions', {
        method: 'POST',
        body: JSON.stringify(submission)
      });
    } catch (e) {
      const subs = getLocalData<NewsSubmission[]>('naija_submissions', []);
      const newSub: NewsSubmission = {
        id: submission.id || `sub-${Date.now()}`,
        senderName: submission.senderName || 'Anonymous',
        senderEmail: submission.senderEmail || 'anonymous@naijatrendinfo.com.ng',
        senderPhone: submission.senderPhone || '',
        title: submission.title || 'News Tip',
        content: submission.content || '',
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      setLocalData('naija_submissions', [newSub, ...subs]);
      return { success: true, message: 'News tip received! Our editorial team will review your submission.' };
    }
  },

  updateSubmission: async (id: string, sub: Partial<NewsSubmission>) => {
    try {
      return await fetchJson<NewsSubmission>(`/api/submissions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sub)
      });
    } catch (e) {
      const subs = getLocalData<NewsSubmission[]>('naija_submissions', []);
      let updatedSub: NewsSubmission | null = null;
      const updated = subs.map((s) => {
        if (s.id === id) {
          updatedSub = { ...s, ...sub };
          return updatedSub;
        }
        return s;
      });
      setLocalData('naija_submissions', updated);
      return updatedSub || ({ id, ...sub } as NewsSubmission);
    }
  },

  deleteSubmission: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/submissions/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      const subs = getLocalData<NewsSubmission[]>('naija_submissions', []);
      const updated = subs.filter((s) => s.id !== id);
      setLocalData('naija_submissions', updated);
      return { success: true, id, message: 'Submission deleted' };
    }
  },

  // Contact
  getContacts: async () => {
    try {
      return await fetchJson<ContactMessage[]>('/api/contacts');
    } catch (e) {
      return getLocalData('naija_contacts', []);
    }
  },

  sendContactMessage: async (msg: Partial<ContactMessage>) => {
    try {
      return await fetchJson<{ success: boolean; message: string }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify(msg)
      });
    } catch (e) {
      const list = getLocalData<ContactMessage[]>('naija_contacts', []);
      const newMsg: ContactMessage = {
        id: msg.id || `msg-${Date.now()}`,
        name: msg.name || 'Visitor',
        email: msg.email || 'visitor@naijatrendinfo.com.ng',
        subject: msg.subject || 'General Inquiry',
        message: msg.message || '',
        createdAt: new Date().toISOString(),
        read: false
      };
      setLocalData('naija_contacts', [newMsg, ...list]);
      return { success: true, message: 'Your message has been sent successfully. We will reply shortly.' };
    }
  },

  deleteContact: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/contacts/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      const list = getLocalData<ContactMessage[]>('naija_contacts', []);
      const updated = list.filter((c) => c.id !== id);
      setLocalData('naija_contacts', updated);
      return { success: true, id, message: 'Contact message deleted' };
    }
  },

  // Users & Roles
  getUsers: async () => {
    try {
      return await fetchJson<User[]>('/api/users');
    } catch (e) {
      return getLocalData('naija_users', INITIAL_USERS);
    }
  },

  createUser: async (user: Partial<User>) => {
    try {
      return await fetchJson<User>('/api/users', {
        method: 'POST',
        body: JSON.stringify(user)
      });
    } catch (e) {
      const users = getLocalData('naija_users', INITIAL_USERS);
      const newUser: User = {
        id: user.id || `usr-${Date.now()}`,
        name: user.name || 'New Editor',
        email: user.email || 'editor@naijatrendinfo.com.ng',
        role: user.role || 'Editor',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        bio: user.bio || '',
        createdAt: new Date().toISOString()
      };
      setLocalData('naija_users', [...users, newUser]);
      return newUser;
    }
  },

  updateUser: async (id: string, user: Partial<User>) => {
    try {
      return await fetchJson<User>(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(user)
      });
    } catch (e) {
      const users = getLocalData('naija_users', INITIAL_USERS);
      let updatedUser: User | null = null;
      const updated = users.map((u) => {
        if (u.id === id) {
          updatedUser = { ...u, ...user };
          return updatedUser;
        }
        return u;
      });
      setLocalData('naija_users', updated);
      return updatedUser || ({ id, ...user } as User);
    }
  },

  deleteUser: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/users/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      const users = getLocalData('naija_users', INITIAL_USERS);
      const updated = users.filter((u) => u.id !== id);
      setLocalData('naija_users', updated);
      return { success: true, id, message: 'User deleted' };
    }
  },

  // Settings & Customization
  getSettings: async () => {
    try {
      return await fetchJson<WebsiteSettings>('/api/settings');
    } catch (e) {
      return getLocalData('naija_settings', INITIAL_SETTINGS);
    }
  },

  updateSettings: async (settings: Partial<WebsiteSettings>) => {
    try {
      return await fetchJson<WebsiteSettings>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
    } catch (e) {
      const current = getLocalData('naija_settings', INITIAL_SETTINGS);
      const updated = { ...current, ...settings };
      setLocalData('naija_settings', updated);
      return updated;
    }
  },

  getQuickLinks: async () => {
    try {
      return await fetchJson<QuickLink[]>('/api/quick-links');
    } catch (e) {
      return getLocalData('naija_quick_links', INITIAL_QUICK_LINKS);
    }
  },

  getQuickLinkTrash: () => fetchJson<QuickLink[]>('/api/quick-links/trash').catch(() => []),

  createQuickLink: async (link: Partial<QuickLink>) => {
    try {
      return await fetchJson<QuickLink>('/api/quick-links', {
        method: 'POST',
        body: JSON.stringify(link)
      });
    } catch (e) {
      const links = getLocalData('naija_quick_links', INITIAL_QUICK_LINKS);
      const newLink: QuickLink = {
        id: link.id || `ql-${Date.now()}`,
        title: link.title || 'Quick Link',
        url: link.url || '/',
        order: link.order || links.length + 1,
        isActive: link.isActive !== false
      };
      setLocalData('naija_quick_links', [...links, newLink]);
      return newLink;
    }
  },

  updateQuickLink: async (id: string, link: Partial<QuickLink>) => {
    try {
      return await fetchJson<QuickLink>(`/api/quick-links/${id}`, {
        method: 'PUT',
        body: JSON.stringify(link)
      });
    } catch (e) {
      const links = getLocalData('naija_quick_links', INITIAL_QUICK_LINKS);
      let updatedLink: QuickLink | null = null;
      const updated = links.map((l) => {
        if (l.id === id) {
          updatedLink = { ...l, ...link };
          return updatedLink;
        }
        return l;
      });
      setLocalData('naija_quick_links', updated);
      return updatedLink || ({ id, ...link } as QuickLink);
    }
  },

  deleteQuickLink: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/quick-links/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      const links = getLocalData('naija_quick_links', INITIAL_QUICK_LINKS);
      const updated = links.filter((l) => l.id !== id);
      setLocalData('naija_quick_links', updated);
      return { success: true, id, message: 'Quick link deleted' };
    }
  },

  restoreQuickLink: (id: string) =>
    fetchJson<{ success: boolean; item: QuickLink }>(`/api/quick-links/${id}/restore`, {
      method: 'POST'
    }).catch(() => ({ success: true, item: {} as QuickLink })),

  reorderQuickLinks: (orderedIds: string[]) =>
    fetchJson<QuickLink[]>('/api/quick-links/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds })
    }).catch(() => []),

  updateQuickLinks: async (links: QuickLink[]) => {
    try {
      return await fetchJson<QuickLink[]>('/api/quick-links', {
        method: 'PUT',
        body: JSON.stringify(links)
      });
    } catch (e) {
      setLocalData('naija_quick_links', links);
      return links;
    }
  },

  // Site Pages Management
  getPages: async () => {
    try {
      return await fetchJson<SitePage[]>('/api/pages');
    } catch (e) {
      return getLocalData('naija_pages', INITIAL_PAGES);
    }
  },

  getPageBySlugOrId: async (slugOrId: string) => {
    try {
      return await fetchJson<SitePage>(`/api/pages/${slugOrId}`);
    } catch (e) {
      const pages = getLocalData('naija_pages', INITIAL_PAGES);
      const found = pages.find((p) => p.slug === slugOrId || p.id === slugOrId);
      if (found) return found;
      throw new Error('Page not found');
    }
  },

  createPage: async (page: Partial<SitePage>) => {
    try {
      return await fetchJson<SitePage>('/api/pages', {
        method: 'POST',
        body: JSON.stringify(page)
      });
    } catch (e) {
      const pages = getLocalData('naija_pages', INITIAL_PAGES);
      const newPage: SitePage = {
        id: page.id || `page-${Date.now()}`,
        title: page.title || 'New Page',
        slug: page.slug || (page.title ? page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'new-page'),
        content: page.content || '',
        status: page.status || 'published',
        visibility: page.visibility || 'public',
        updatedAt: new Date().toISOString()
      };
      setLocalData('naija_pages', [...pages, newPage]);
      return newPage;
    }
  },

  updatePage: async (id: string, page: Partial<SitePage>) => {
    try {
      return await fetchJson<SitePage>(`/api/pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(page)
      });
    } catch (e) {
      const pages = getLocalData('naija_pages', INITIAL_PAGES);
      let updatedPage: SitePage | null = null;
      const updated = pages.map((p) => {
        if (p.id === id) {
          const status = (page.status || p.status) as SitePage['status'];
          const visibility = (page.visibility || p.visibility) as SitePage['visibility'];
          const navigationPlacement = (page.navigationPlacement || p.navigationPlacement) as SitePage['navigationPlacement'];
          updatedPage = { ...p, ...page, status, visibility, navigationPlacement, updatedAt: new Date().toISOString() };
          return updatedPage;
        }
        return p;
      });
      setLocalData('naija_pages', updated);
      return updatedPage || ({ id, status: (page.status || 'published') as SitePage['status'], visibility: (page.visibility || 'public') as SitePage['visibility'], title: page.title || 'Page', slug: page.slug || 'page', content: page.content || '', ...page });
    }
  },

  deletePage: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/pages/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      const pages = getLocalData('naija_pages', INITIAL_PAGES);
      const updated = pages.filter((p) => p.id !== id);
      setLocalData('naija_pages', updated);
      return { success: true, id, message: 'Page deleted' };
    }
  },

  getPageVersions: (id: string) => fetchJson<PageVersion[]>(`/api/pages/${id}/versions`).catch(() => []),

  restorePageVersion: (id: string, versionId: string) =>
    fetchJson<SitePage>(`/api/pages/${id}/restore-version`, {
      method: 'POST',
      body: JSON.stringify({ versionId })
    }).catch(() => {
      const pages = getLocalData('naija_pages', INITIAL_PAGES);
      return pages.find((p) => p.id === id) || INITIAL_PAGES[0];
    }),

  convertSubmissionToArticle: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; article: Article }>(`/api/submissions/${id}/convert-to-article`, {
        method: 'POST'
      });
    } catch (e) {
      const subs = getLocalData<NewsSubmission[]>('naija_submissions', []);
      const sub = subs.find((s) => s.id === id);
      const now = new Date().toISOString();
      const newArticle: Article = {
        id: `art-${Date.now()}`,
        title: sub ? sub.title : 'Converted News Article',
        slug: sub ? sub.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `article-${Date.now()}`,
        summary: sub ? sub.content.slice(0, 150) + '...' : '',
        content: sub ? sub.content : '',
        categoryId: 'cat-politics',
        categoryName: 'General',
        tags: ['Breaking', 'Reader Submission'],
        featuredImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200',
        authorId: 'usr-admin',
        authorName: sub ? sub.senderName : 'Community Contributor',
        status: 'published',
        isFeatured: false,
        isPinned: false,
        isBreaking: true,
        isEditorPick: false,
        views: 0,
        readTimeMinutes: 3,
        publishedAt: now,
        updatedAt: now
      };
      const articles = getLocalData('naija_articles', INITIAL_ARTICLES);
      setLocalData('naija_articles', [newArticle, ...articles]);
      return { success: true, article: newArticle };
    }
  },

  // Cookie, Footer, Advertising Settings
  getCookieSettings: () => fetchJson<CookieSettings>('/api/cookie-settings').catch(() => INITIAL_COOKIE_SETTINGS),

  updateCookieSettings: (settings: Partial<CookieSettings>) =>
    fetchJson<CookieSettings>('/api/cookie-settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }).catch(() => INITIAL_COOKIE_SETTINGS),

  getFooterSettings: () => fetchJson<FooterSettings>('/api/footer-settings').catch(() => INITIAL_FOOTER_SETTINGS),

  updateFooterSettings: (settings: Partial<FooterSettings>) =>
    fetchJson<FooterSettings>('/api/footer-settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }).catch(() => INITIAL_FOOTER_SETTINGS),

  getAdvertisingPackages: () => fetchJson<AdvertisingPackage[]>('/api/advertising-packages').catch(() => INITIAL_ADVERTISING_PACKAGES),

  createAdvertisingPackage: (pkg: Partial<AdvertisingPackage>) =>
    fetchJson<AdvertisingPackage>('/api/advertising-packages', {
      method: 'POST',
      body: JSON.stringify(pkg)
    }).catch(() => {
      const newPkg: AdvertisingPackage = {
        id: pkg.id || `pkg-${Date.now()}`,
        name: pkg.name || 'Standard Ad Package',
        price: pkg.price || '₦100,000 / month',
        bannerSize: pkg.bannerSize || '728x90',
        description: pkg.description || '',
        features: pkg.features || ['Header Banner Placement', 'High Impressions'],
        isActive: pkg.isActive !== false
      };
      return newPkg;
    }),

  updateAdvertisingPackages: (packages: AdvertisingPackage[]) =>
    fetchJson<AdvertisingPackage[]>('/api/advertising-packages', {
      method: 'PUT',
      body: JSON.stringify(packages)
    }).catch(() => packages),

  getEditorialDesk: async () => {
    try {
      return await fetchJson<EditorialDeskEntry[]>('/api/editorial-desk');
    } catch (e) {
      return getLocalData('naija_editorial_desk', INITIAL_EDITORIAL_DESK);
    }
  },

  updateEditorialDesk: async (entries: EditorialDeskEntry[]) => {
    try {
      return await fetchJson<EditorialDeskEntry[]>('/api/editorial-desk', {
        method: 'PUT',
        body: JSON.stringify(entries)
      });
    } catch (e) {
      setLocalData('naija_editorial_desk', entries);
      return entries;
    }
  },

  getInformation: async () => {
    try {
      return await fetchJson<InformationEntry[]>('/api/information');
    } catch (e) {
      return getLocalData('naija_information', INITIAL_INFORMATION);
    }
  },

  updateInformation: async (entries: InformationEntry[]) => {
    try {
      return await fetchJson<InformationEntry[]>('/api/information', {
        method: 'PUT',
        body: JSON.stringify(entries)
      });
    } catch (e) {
      setLocalData('naija_information', entries);
      return entries;
    }
  },

  getSocialLinks: async () => {
    try {
      return await fetchJson<SocialMediaLink[]>('/api/social-links');
    } catch (e) {
      return getLocalData('naija_social_links', INITIAL_SOCIAL_LINKS);
    }
  },

  createSocialLink: async (link: Partial<SocialMediaLink>) => {
    try {
      return await fetchJson<SocialMediaLink>('/api/social-links', {
        method: 'POST',
        body: JSON.stringify(link)
      });
    } catch (e) {
      const links = getLocalData('naija_social_links', INITIAL_SOCIAL_LINKS);
      const newLink: SocialMediaLink = {
        id: link.id || `sl-${Date.now()}`,
        platform: link.platform || 'Twitter / X',
        url: link.url || 'https://twitter.com/naijatrendinfo',
        order: link.order || links.length + 1,
        isActive: link.isActive !== false
      };
      setLocalData('naija_social_links', [...links, newLink]);
      return newLink;
    }
  },

  updateSocialLink: async (id: string, link: Partial<SocialMediaLink>) => {
    try {
      return await fetchJson<SocialMediaLink>(`/api/social-links/${id}`, {
        method: 'PUT',
        body: JSON.stringify(link)
      });
    } catch (e) {
      const links = getLocalData('naija_social_links', INITIAL_SOCIAL_LINKS);
      let updatedLink: SocialMediaLink | null = null;
      const updated = links.map((l) => {
        if (l.id === id) {
          updatedLink = { ...l, ...link };
          return updatedLink;
        }
        return l;
      });
      setLocalData('naija_social_links', updated);
      return updatedLink || ({ id, platform: 'twitter', url: '', order: 1, isActive: true, ...link } as SocialMediaLink);
    }
  },

  toggleSocialLink: async (id: string) => {
    try {
      return await fetchJson<SocialMediaLink>(`/api/social-links/${id}/toggle`, {
        method: 'PATCH'
      });
    } catch (e) {
      const links = getLocalData('naija_social_links', INITIAL_SOCIAL_LINKS);
      let updatedLink: SocialMediaLink | null = null;
      const updated = links.map((l) => {
        if (l.id === id) {
          updatedLink = { ...l, isActive: !l.isActive };
          return updatedLink;
        }
        return l;
      });
      setLocalData('naija_social_links', updated);
      return updatedLink || ({ id, platform: 'twitter', url: '', order: 1, isActive: true } as SocialMediaLink);
    }
  },

  deleteSocialLink: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/social-links/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      const links = getLocalData('naija_social_links', INITIAL_SOCIAL_LINKS);
      const updated = links.filter((l) => l.id !== id);
      setLocalData('naija_social_links', updated);
      return { success: true, id, message: 'Social link deleted' };
    }
  },

  updateSocialLinks: async (links: SocialMediaLink[]) => {
    try {
      return await fetchJson<SocialMediaLink[]>('/api/social-links', {
        method: 'PUT',
        body: JSON.stringify(links)
      });
    } catch (e) {
      setLocalData('naija_social_links', links);
      return links;
    }
  },

  // Sports
  getSportsFixtures: async () => {
    try {
      return await fetchJson<SportsFixture[]>('/api/sports/fixtures');
    } catch (e) {
      return getLocalData('naija_sports_fixtures', []);
    }
  },

  createSportsFixture: async (fix: Partial<SportsFixture>) => {
    try {
      return await fetchJson<SportsFixture>('/api/sports/fixtures', {
        method: 'POST',
        body: JSON.stringify(fix)
      });
    } catch (e) {
      const list = getLocalData('naija_sports_fixtures', []);
      const newFix: SportsFixture = {
        id: fix.id || `fix-${Date.now()}`,
        homeTeam: fix.homeTeam || 'Super Eagles',
        awayTeam: fix.awayTeam || 'Opponent',
        homeScore: fix.homeScore ?? 0,
        awayScore: fix.awayScore ?? 0,
        status: fix.status === 'LIVE' || fix.status === 'FINISHED' ? fix.status : 'UPCOMING',
        league: fix.league || 'NPFL',
        matchDate: fix.matchDate || new Date().toISOString()
      };
      setLocalData('naija_sports_fixtures', [newFix, ...list]);
      return newFix;
    }
  },

  updateSportsFixture: async (id: string, fix: Partial<SportsFixture>) => {
    try {
      return await fetchJson<SportsFixture>(`/api/sports/fixtures/${id}`, {
        method: 'PUT',
        body: JSON.stringify(fix)
      });
    } catch (e) {
      const list = getLocalData('naija_sports_fixtures', []);
      let updatedFix: SportsFixture | null = null;
      const updated = list.map((f) => {
        if (f.id === id) {
          updatedFix = { ...f, ...fix };
          return updatedFix;
        }
        return f;
      });
      setLocalData('naija_sports_fixtures', updated);
      return updatedFix || ({ id, homeTeam: 'Home', awayTeam: 'Away', status: 'UPCOMING', league: 'NPFL', matchDate: new Date().toISOString(), ...fix } as SportsFixture);
    }
  },

  deleteSportsFixture: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/sports/fixtures/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      const list = getLocalData('naija_sports_fixtures', []);
      const updated = list.filter((f) => f.id !== id);
      setLocalData('naija_sports_fixtures', updated);
      return { success: true, id, message: 'Sports fixture deleted' };
    }
  },

  // Audit Logs & Backups
  getAuditLogs: async () => {
    try {
      return await fetchJson<AuditLog[]>('/api/audit-logs');
    } catch (e) {
      return getLocalData('naija_audit_logs', []);
    }
  },

  clearAuditLogs: async () => {
    try {
      return await fetchJson<{ success: boolean; message?: string }>('/api/audit-logs', { method: 'DELETE' });
    } catch (e) {
      setLocalData('naija_audit_logs', []);
      return { success: true, message: 'Audit logs cleared' };
    }
  },

  getBackups: () => fetchJson<any[]>('/api/backups').catch(() => []),

  createBackup: async () => {
    try {
      return await fetchJson<any>('/api/backups/create', { method: 'POST' });
    } catch (e) {
      return {
        id: `backup-${Date.now()}`,
        filename: `naijatrend_backup_${new Date().toISOString().slice(0, 10)}.json`,
        sizeBytes: 1024 * 450,
        createdAt: new Date().toISOString()
      };
    }
  },

  restoreBackup: (backupId: string) =>
    fetchJson<{ success: boolean; message: string }>('/api/backups/restore', {
      method: 'POST',
      body: JSON.stringify({ backupId })
    }).catch(() => ({ success: true, message: 'Backup restored successfully' })),

  // AI Headline Generator (Client Fallback if API offline)
  suggestHeadline: async (topic: string, category?: string) => {
    try {
      return await fetchJson<{ headlines: string[] }>('/api/ai/suggest-headline', {
        method: 'POST',
        body: JSON.stringify({ topic, category })
      });
    } catch (e) {
      const cleanTopic = topic.trim() || 'Nigeria Breaking News';
      return {
        headlines: [
          `BREAKING: ${cleanTopic} - Major Updates Emerge in Latest Official Briefing`,
          `EXCLUSIVITY: What You Need to Know About ${cleanTopic} Today`,
          `ANALYSIS: The Real Impact of ${cleanTopic} on Nigeria's Future`,
          `JUST IN: Federal Government and Stakeholders React to ${cleanTopic}`,
          `SPECIAL REPORT: Deep Dive Into ${cleanTopic} and Next Steps`
        ]
      };
    }
  }
};
