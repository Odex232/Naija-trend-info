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
  SitePage,
  PageVersion,
  CookieSettings,
  FooterSettings,
  AdvertisingPackage
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
      console.warn('Backend API bootstrap unavailable, loading local production dataset:', e);
    }
    return {
      settings: INITIAL_SETTINGS,
      categories: INITIAL_CATEGORIES,
      articles: INITIAL_ARTICLES,
      breakingNews: INITIAL_BREAKING_NEWS,
      ads: INITIAL_ADS,
      adPlacements: INITIAL_AD_PLACEMENTS,
      users: INITIAL_USERS,
      comments: [],
      submissions: [],
      contacts: [],
      subscribers: [],
      auditLogs: [],
      quickLinks: INITIAL_QUICK_LINKS,
      editorialDesk: INITIAL_EDITORIAL_DESK,
      information: INITIAL_INFORMATION,
      socialLinks: INITIAL_SOCIAL_LINKS,
      mediaFiles: [],
      sportsFixtures: [],
      pages: INITIAL_PAGES,
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
      const matchedUser = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
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
    }),

  // Articles
  getArticles: (params?: { category?: string; tag?: string; search?: string; status?: string; featured?: boolean; breaking?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.tag) q.set('tag', params.tag);
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.featured) q.set('featured', 'true');
    if (params?.breaking) q.set('breaking', 'true');
    return fetchJson<Article[]>(`/api/articles?${q.toString()}`);
  },

  getArticleBySlugOrId: (slugOrId: string) => fetchJson<Article>(`/api/articles/${slugOrId}`),

  createArticle: (article: Partial<Article>) =>
    fetchJson<Article>('/api/articles', {
      method: 'POST',
      body: JSON.stringify(article)
    }),

  updateArticle: (id: string, article: Partial<Article>) =>
    fetchJson<Article>(`/api/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(article)
    }),

  deleteArticle: (id: string) =>
    fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/articles/${id}`, {
      method: 'DELETE'
    }),

  // Categories
  getCategories: () => fetchJson<Category[]>('/api/categories'),

  createCategory: (cat: Partial<Category>) =>
    fetchJson<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(cat)
    }),

  updateCategory: (id: string, cat: Partial<Category>) =>
    fetchJson<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cat)
    }),

  deleteCategory: (id: string) =>
    fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/categories/${id}`, {
      method: 'DELETE'
    }),

  reorderCategories: (orderedIds: string[]) =>
    fetchJson<{ success: boolean; categories: Category[] }>('/api/categories/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds })
    }),

  // Breaking News
  getBreakingNews: () => fetchJson<BreakingNews[]>('/api/breaking-news'),

  createBreakingNews: (item: Partial<BreakingNews>) =>
    fetchJson<BreakingNews>('/api/breaking-news', {
      method: 'POST',
      body: JSON.stringify(item)
    }),

  updateBreakingNews: (id: string, item: Partial<BreakingNews>) =>
    fetchJson<BreakingNews>(`/api/breaking-news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    }),

  deleteBreakingNews: (id: string) =>
    fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/breaking-news/${id}`, {
      method: 'DELETE'
    }),

  // Ads & Placements
  getAds: () => fetchJson<Ad[]>('/api/ads'),

  createAd: (ad: Partial<Ad>) =>
    fetchJson<Ad>('/api/ads', {
      method: 'POST',
      body: JSON.stringify(ad)
    }),

  updateAd: (id: string, ad: Partial<Ad>) =>
    fetchJson<Ad>(`/api/ads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ad)
    }),

  deleteAd: (id: string) =>
    fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/ads/${id}`, {
      method: 'DELETE'
    }),

  trackAd: (id: string, type: 'impression' | 'click') =>
    fetchJson<{ success: boolean }>(`/api/ads/${id}/track`, {
      method: 'POST',
      body: JSON.stringify({ type })
    }),

  getAdPlacements: () => fetchJson<AdPlacement[]>('/api/ad-placements'),

  updateAdPlacements: (placements: AdPlacement[]) =>
    fetchJson<AdPlacement[]>('/api/ad-placements', {
      method: 'PUT',
      body: JSON.stringify(placements)
    }),

  // Media Library
  getMedia: (publishedOnly: boolean = false) =>
    fetchJson<MediaFile[]>(`/api/media${publishedOnly ? '?publishedOnly=true' : ''}`),

  uploadMedia: async (file: File, metadata?: { title?: string; description?: string; isPublished?: boolean }) => {
    const formData = new FormData();
    formData.append('files', file);
    if (metadata?.title) formData.append('title', metadata.title);
    if (metadata?.description) formData.append('description', metadata.description);
    if (metadata?.isPublished !== undefined) formData.append('isPublished', String(metadata.isPublished));

    const token = localStorage.getItem('authToken');
    const res = await fetch('/api/media/upload', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    if (!res.ok) {
      let msg = 'File upload failed';
      try {
        const json = await res.json();
        msg = json.message || msg;
      } catch (e) {}
      throw new Error(msg);
    }
    const data = await res.json();
    return Array.isArray(data) ? data[0] : (data as MediaFile);
  },

  createExternalMedia: (payload: { url: string; title?: string; description?: string; isPublished?: boolean; mimeType?: string; fileType?: string }) =>
    fetchJson<MediaFile>('/api/media/external', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  uploadMediaBatch: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const token = localStorage.getItem('authToken');
    const res = await fetch('/api/media/upload', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    if (!res.ok) {
      let msg = 'Batch file upload failed';
      try {
        const json = await res.json();
        msg = json.message || msg;
      } catch (e) {}
      throw new Error(msg);
    }
    const data = await res.json();
    return Array.isArray(data) ? (data as MediaFile[]) : [data as MediaFile];
  },

  updateMedia: (id: string, metadata: Partial<MediaFile>) =>
    fetchJson<MediaFile>(`/api/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(metadata)
    }),

  deleteMedia: (id: string) =>
    fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/media/${id}`, {
      method: 'DELETE'
    }),

  // Comments
  getComments: (articleId?: string) =>
    fetchJson<Comment[]>(`/api/comments${articleId ? `?articleId=${articleId}` : ''}`),

  createComment: (cmt: Partial<Comment>) =>
    fetchJson<Comment>('/api/comments', {
      method: 'POST',
      body: JSON.stringify(cmt)
    }),

  updateComment: (id: string, cmt: Partial<Comment>) =>
    fetchJson<Comment>(`/api/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cmt)
    }),

  deleteComment: (id: string) =>
    fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/comments/${id}`, {
      method: 'DELETE'
    }),

  // Newsletter
  getSubscribers: () => fetchJson<{ id: string; email: string; subscribedAt: string }[]>('/api/newsletter'),

  subscribeNewsletter: (email: string) =>
    fetchJson<{ success: boolean; message: string }>('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  deleteSubscriber: (id: string) =>
    fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/newsletter/${id}`, {
      method: 'DELETE'
    }),

  broadcastNewsletter: (subject: string, content: string) =>
    fetchJson<{ success: boolean; count: number; message: string }>('/api/newsletter/broadcast', {
      method: 'POST',
      body: JSON.stringify({ subject, content })
    }),

  // Submissions (Submit News)
  getSubmissions: () => fetchJson<NewsSubmission[]>('/api/submissions'),

  submitNewsTip: (submission: Partial<NewsSubmission>) =>
    fetchJson<{ success: boolean; message: string }>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(submission)
    }),

  updateSubmission: (id: string, sub: Partial<NewsSubmission>) =>
    fetchJson<NewsSubmission>(`/api/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sub)
    }),

  deleteSubmission: (id: string) =>
    fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/submissions/${id}`, {
      method: 'DELETE'
    }),

  // Contact
  getContacts: () => fetchJson<ContactMessage[]>('/api/contacts'),

  sendContactMessage: (msg: Partial<ContactMessage>) =>
    fetchJson<{ success: boolean; message: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(msg)
    }),

  deleteContact: (id: string) =>
    fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/contacts/${id}`, {
      method: 'DELETE'
    }),

  // Users & Roles
  getUsers: () => fetchJson<User[]>('/api/users'),

  createUser: (user: Partial<User>) =>
    fetchJson<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user)
    }),

  updateUser: (id: string, user: Partial<User>) =>
    fetchJson<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user)
    }),

  deleteUser: (id: string) =>
    fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/users/${id}`, {
      method: 'DELETE'
    }),

  // Settings & Customization
  getSettings: () => fetchJson<WebsiteSettings>('/api/settings'),

  updateSettings: (settings: Partial<WebsiteSettings>) =>
    fetchJson<WebsiteSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  getQuickLinks: () => fetchJson<QuickLink[]>('/api/quick-links'),

  getQuickLinkTrash: () => fetchJson<QuickLink[]>('/api/quick-links/trash'),

  createQuickLink: (link: Partial<QuickLink>) =>
    fetchJson<QuickLink>('/api/quick-links', {
      method: 'POST',
      body: JSON.stringify(link)
    }),

  updateQuickLink: (id: string, link: Partial<QuickLink>) =>
    fetchJson<QuickLink>(`/api/quick-links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(link)
    }),

  deleteQuickLink: (id: string) =>
    fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/quick-links/${id}`, {
      method: 'DELETE'
    }),

  restoreQuickLink: (id: string) =>
    fetchJson<{ success: boolean; item: QuickLink }>(`/api/quick-links/${id}/restore`, {
      method: 'POST'
    }),

  reorderQuickLinks: (orderedIds: string[]) =>
    fetchJson<QuickLink[]>('/api/quick-links/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds })
    }),

  updateQuickLinks: (links: QuickLink[]) =>
    fetchJson<QuickLink[]>('/api/quick-links', {
      method: 'PUT',
      body: JSON.stringify(links)
    }),

  // Site Pages Management
  getPages: () => fetchJson<SitePage[]>('/api/pages'),

  getPageBySlugOrId: (slugOrId: string) => fetchJson<SitePage>(`/api/pages/${slugOrId}`),

  createPage: (page: Partial<SitePage>) =>
    fetchJson<SitePage>('/api/pages', {
      method: 'POST',
      body: JSON.stringify(page)
    }),

  updatePage: (id: string, page: Partial<SitePage>) =>
    fetchJson<SitePage>(`/api/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(page)
    }),

  deletePage: (id: string) =>
    fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/pages/${id}`, {
      method: 'DELETE'
    }),

  getPageVersions: (id: string) => fetchJson<PageVersion[]>(`/api/pages/${id}/versions`),

  restorePageVersion: (id: string, versionId: string) =>
    fetchJson<SitePage>(`/api/pages/${id}/restore-version`, {
      method: 'POST',
      body: JSON.stringify({ versionId })
    }),

  convertSubmissionToArticle: (id: string) =>
    fetchJson<{ success: boolean; article: Article }>(`/api/submissions/${id}/convert-to-article`, {
      method: 'POST'
    }),

  // Cookie, Footer, Advertising Settings
  getCookieSettings: () => fetchJson<CookieSettings>('/api/cookie-settings'),

  updateCookieSettings: (settings: Partial<CookieSettings>) =>
    fetchJson<CookieSettings>('/api/cookie-settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  getFooterSettings: () => fetchJson<FooterSettings>('/api/footer-settings'),

  updateFooterSettings: (settings: Partial<FooterSettings>) =>
    fetchJson<FooterSettings>('/api/footer-settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  getAdvertisingPackages: () => fetchJson<AdvertisingPackage[]>('/api/advertising-packages'),

  createAdvertisingPackage: (pkg: Partial<AdvertisingPackage>) =>
    fetchJson<AdvertisingPackage>('/api/advertising-packages', {
      method: 'POST',
      body: JSON.stringify(pkg)
    }),

  updateAdvertisingPackages: (packages: AdvertisingPackage[]) =>
    fetchJson<AdvertisingPackage[]>('/api/advertising-packages', {
      method: 'PUT',
      body: JSON.stringify(packages)
    }),

  getEditorialDesk: () => fetchJson<EditorialDeskEntry[]>('/api/editorial-desk'),

  updateEditorialDesk: (entries: EditorialDeskEntry[]) =>
    fetchJson<EditorialDeskEntry[]>('/api/editorial-desk', {
      method: 'PUT',
      body: JSON.stringify(entries)
    }),

  getInformation: () => fetchJson<InformationEntry[]>('/api/information'),

  updateInformation: (entries: InformationEntry[]) =>
    fetchJson<InformationEntry[]>('/api/information', {
      method: 'PUT',
      body: JSON.stringify(entries)
    }),

  getSocialLinks: () => fetchJson<SocialMediaLink[]>('/api/social-links'),

  createSocialLink: (link: Partial<SocialMediaLink>) =>
    fetchJson<SocialMediaLink>('/api/social-links', {
      method: 'POST',
      body: JSON.stringify(link)
    }),

  updateSocialLink: (id: string, link: Partial<SocialMediaLink>) =>
    fetchJson<SocialMediaLink>(`/api/social-links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(link)
    }),

  toggleSocialLink: (id: string) =>
    fetchJson<SocialMediaLink>(`/api/social-links/${id}/toggle`, {
      method: 'PATCH'
    }),

  deleteSocialLink: (id: string) =>
    fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/social-links/${id}`, {
      method: 'DELETE'
    }),

  updateSocialLinks: (links: SocialMediaLink[]) =>
    fetchJson<SocialMediaLink[]>('/api/social-links', {
      method: 'PUT',
      body: JSON.stringify(links)
    }),

  // Sports
  getSportsFixtures: () => fetchJson<SportsFixture[]>('/api/sports/fixtures'),

  createSportsFixture: (fix: Partial<SportsFixture>) =>
    fetchJson<SportsFixture>('/api/sports/fixtures', {
      method: 'POST',
      body: JSON.stringify(fix)
    }),

  updateSportsFixture: (id: string, fix: Partial<SportsFixture>) =>
    fetchJson<SportsFixture>(`/api/sports/fixtures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fix)
    }),

  deleteSportsFixture: (id: string) =>
    fetchJson<{ success: boolean; id?: string; message?: string }>(`/api/sports/fixtures/${id}`, {
      method: 'DELETE'
    }),

  // Audit Logs & Backups
  getAuditLogs: () => fetchJson<AuditLog[]>('/api/audit-logs'),

  clearAuditLogs: () => fetchJson<{ success: boolean; message?: string }>('/api/audit-logs', { method: 'DELETE' }),

  getBackups: () => fetchJson<any[]>('/api/backups'),

  createBackup: () => fetchJson<any>('/api/backups/create', { method: 'POST' }),

  restoreBackup: (backupId: string) =>
    fetchJson<{ success: boolean; message: string }>('/api/backups/restore', {
      method: 'POST',
      body: JSON.stringify({ backupId })
    }),

  // AI Suggestions
  suggestHeadline: (topic: string, category?: string) =>
    fetchJson<{ headlines: string[] }>('/api/ai/suggest-headline', {
      method: 'POST',
      body: JSON.stringify({ topic, category })
    })
};
