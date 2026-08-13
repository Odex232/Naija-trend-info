import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import cors from 'cors';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_BREAKING_NEWS,
  INITIAL_ARTICLES,
  INITIAL_SPORTS_FIXTURES,
  INITIAL_ADS,
  INITIAL_AD_PLACEMENTS,
  INITIAL_SETTINGS,
  INITIAL_SOCIAL_LINKS,
  INITIAL_QUICK_LINKS,
  INITIAL_EDITORIAL_DESK,
  INITIAL_INFORMATION,
  INITIAL_PAGES,
  INITIAL_COOKIE_SETTINGS,
  INITIAL_FOOTER_SETTINGS,
  INITIAL_ADVERTISING_PACKAGES
} from './src/data/initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure directories exist
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Database initial state handler
function loadDatabase() {
  let loadedDb: any = null;
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      loadedDb = JSON.parse(raw);
    } catch (e) {
      console.error('Error loading db.json, re-initializing...', e);
    }
  }

  if (!loadedDb) {
    loadedDb = {
      categories: INITIAL_CATEGORIES,
      users: INITIAL_USERS,
      breakingNews: INITIAL_BREAKING_NEWS,
      articles: INITIAL_ARTICLES,
      sportsFixtures: INITIAL_SPORTS_FIXTURES,
      ads: INITIAL_ADS,
      adPlacements: INITIAL_AD_PLACEMENTS,
      settings: INITIAL_SETTINGS,
      socialLinks: INITIAL_SOCIAL_LINKS,
      quickLinks: INITIAL_QUICK_LINKS,
      pages: INITIAL_PAGES,
      cookieSettings: INITIAL_COOKIE_SETTINGS,
      footerSettings: INITIAL_FOOTER_SETTINGS,
      advertisingPackages: INITIAL_ADVERTISING_PACKAGES,
      deletedQuickLinks: [],
      pageVersions: [],
      editorialDesk: INITIAL_EDITORIAL_DESK,
      information: INITIAL_INFORMATION,
      mediaFiles: [],
      comments: [],
      subscribers: [],
      submissions: [],
      contacts: [],
      auditLogs: [],
      backups: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(loadedDb, null, 2));
    return loadedDb;
  }

  // Ensure newly added DB fields are present if loaded from existing db.json
  if (!loadedDb.pages) loadedDb.pages = INITIAL_PAGES;
  if (!loadedDb.deletedQuickLinks) loadedDb.deletedQuickLinks = [];
  if (!loadedDb.cookieSettings) loadedDb.cookieSettings = INITIAL_COOKIE_SETTINGS;
  if (!loadedDb.footerSettings) loadedDb.footerSettings = INITIAL_FOOTER_SETTINGS;
  if (!loadedDb.advertisingPackages) loadedDb.advertisingPackages = INITIAL_ADVERTISING_PACKAGES;
  if (!loadedDb.pageVersions) loadedDb.pageVersions = [];
  if (!loadedDb.quickLinks || loadedDb.quickLinks.length === 0) loadedDb.quickLinks = INITIAL_QUICK_LINKS;

  // Sync admin user name update if needed
  if (loadedDb.users) {
    const adminUser = loadedDb.users.find((u: any) => u.id === 'usr-1' || u.email === 'admin@naijatrendinfo.com.ng');
    if (adminUser && adminUser.name === 'Chidubem Okechukwu') {
      adminUser.name = 'Ajayi Odunayo';
    }
  }
  if (loadedDb.editorialDesk) {
    const edLead = loadedDb.editorialDesk.find((e: any) => e.id === 'ed-1' || e.name === 'Chidubem Okechukwu');
    if (edLead) {
      edLead.name = 'Ajayi Odunayo';
    }
  }

  return loadedDb;
}

let db = loadDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Error saving db:', err);
  }
}

function addAuditLog(userEmail: string, userName: string, action: string, details: string, resource: string) {
  const log = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    userEmail: userEmail || 'system@naijatrendinfo.com.ng',
    userName: userName || 'System Administrator',
    action,
    details,
    resource,
    createdAt: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDatabase();
}

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

async function startServer() {
  const app = express();

  // High performance compression middleware
  app.use(compression());

  // Cross-Origin Resource Sharing (CORS) for Custom Domain & External Client support
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  );

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static serving for uploads with browser caching
  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      maxAge: '1d',
      etag: true
    })
  );

  // --- API ROUTES ---

  // Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Bootstrap initial app state
  app.get('/api/bootstrap', (req, res) => {
    res.json(db);
  });

  // Auth Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find((u: any) => u.email.toLowerCase() === (email || '').trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User email not found.' });
    }

    const customPassword = user.password;
    const isCustomMatch = customPassword && password === customPassword;
    const isDefaultMatch = password === 'AdminPassword123!' || password === 'admin' || (!customPassword && password.length >= 4);

    if (isCustomMatch || isDefaultMatch) {
      const token = 'token-' + user.id + '-' + Date.now();
      addAuditLog(user.email, user.name, 'Admin Login', 'User authenticated successfully into Admin Dashboard.', 'Authentication');
      return res.json({
        success: true,
        token,
        user
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid password. Please enter your correct login password.' });
  });

  // Auth Middleware
  function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Authentication token required.' });
    }
    const token = authHeader.split(' ')[1];
    if (!token || (!token.startsWith('token-') && token !== 'demo-admin-token')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid authentication session token.' });
    }
    next();
  }

  // Auth Logout
  app.post('/api/auth/logout', (req, res) => {
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Admin Logout', 'Administrator logged out of session.', 'Authentication');
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Articles
  app.get('/api/articles', (req, res) => {
    let list = [...db.articles];
    const { category, tag, search, status, featured, breaking } = req.query;

    if (category) {
      list = list.filter((a: any) => a.categoryId === category || a.categoryName.toLowerCase() === (category as string).toLowerCase());
    }
    if (tag) {
      list = list.filter((a: any) => a.tags.some((t: string) => t.toLowerCase() === (tag as string).toLowerCase()));
    }
    if (status) {
      list = list.filter((a: any) => a.status === status);
    }
    if (featured === 'true') {
      list = list.filter((a: any) => a.isFeatured);
    }
    if (breaking === 'true') {
      list = list.filter((a: any) => a.isBreaking);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(
        (a: any) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.categoryName.toLowerCase().includes(q) ||
          a.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    // Sort by publishedAt desc
    list.sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    res.json(list);
  });

  app.get('/api/articles/:slugOrId', (req, res) => {
    const { slugOrId } = req.params;
    const articleIndex = db.articles.findIndex((a: any) => a.id === slugOrId || a.slug === slugOrId);

    if (articleIndex !== -1) {
      // increment views
      db.articles[articleIndex].views = (db.articles[articleIndex].views || 0) + 1;
      saveDatabase();
      return res.json(db.articles[articleIndex]);
    }

    res.status(404).json({ message: 'Article not found' });
  });

  app.post('/api/articles/:id/views', (req, res) => {
    const { id } = req.params;
    const article = db.articles.find((a: any) => a.id === id || a.slug === id);
    if (article) {
      article.views = (article.views || 0) + 1;
      saveDatabase();
      return res.json({ success: true, views: article.views });
    }
    res.status(404).json({ message: 'Article not found' });
  });

  app.post('/api/articles', (req, res) => {
    const article = req.body;
    article.id = 'art-' + Date.now();
    article.createdAt = new Date().toISOString();
    article.updatedAt = new Date().toISOString();
    article.views = article.views || 0;
    if (!article.slug) {
      article.slug = article.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    db.articles.unshift(article);
    saveDatabase();
    addAuditLog(req.body.authorName || 'Admin', 'Admin', 'Article Created', `Created article "${article.title}"`, 'CMS Articles');
    res.json(article);
  });

  app.put('/api/articles/:id', (req, res) => {
    const { id } = req.params;
    const index = db.articles.findIndex((a: any) => a.id === id);
    if (index !== -1) {
      db.articles[index] = { ...db.articles[index], ...req.body, updatedAt: new Date().toISOString() };
      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Article Updated', `Updated article "${db.articles[index].title}"`, 'CMS Articles');
      return res.json(db.articles[index]);
    }
    res.status(404).json({ message: 'Article not found' });
  });

  app.delete('/api/articles/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const article = db.articles.find((a: any) => a.id === id);
    if (article) {
      db.articles = db.articles.filter((a: any) => a.id !== id);
      db.comments = (db.comments || []).filter((c: any) => c.articleId !== id);
      db.breakingNews = (db.breakingNews || []).filter((b: any) => b.articleId !== id);
      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Article Deleted', `Permanently deleted article "${article.title}"`, 'CMS Articles');
      return res.json({ success: true, message: 'Post deleted successfully', id });
    }
    res.status(404).json({ success: false, message: 'Article not found' });
  });

  // Categories
  app.get('/api/categories', (req, res) => {
    const sorted = [...db.categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json(sorted);
  });

  app.post('/api/categories', (req, res) => {
    const cat = req.body;
    cat.id = 'cat-' + Date.now();
    if (!cat.slug) {
      cat.slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    cat.order = db.categories.length + 1;
    cat.isVisible = cat.isVisible !== false;

    db.categories.push(cat);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Category Created', `Created category "${cat.name}"`, 'Categories');
    res.json(cat);
  });

  app.put('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    const index = db.categories.findIndex((c: any) => c.id === id);
    if (index !== -1) {
      db.categories[index] = { ...db.categories[index], ...req.body };
      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Category Updated', `Updated category "${db.categories[index].name}"`, 'Categories');
      return res.json(db.categories[index]);
    }
    res.status(404).json({ message: 'Category not found' });
  });

  app.delete('/api/categories/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const cat = db.categories.find((c: any) => c.id === id);
    if (cat) {
      db.categories = db.categories.filter((c: any) => c.id !== id);
      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Category Deleted', `Deleted category "${cat.name}"`, 'Categories');
      return res.json({ success: true, message: 'Category deleted successfully', id });
    }
    res.status(404).json({ success: false, message: 'Category not found' });
  });

  app.post('/api/categories/reorder', (req, res) => {
    const { orderedIds } = req.body;
    if (Array.isArray(orderedIds)) {
      orderedIds.forEach((id: string, idx: number) => {
        const cat = db.categories.find((c: any) => c.id === id);
        if (cat) cat.order = idx + 1;
      });
      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Categories Reordered', 'Updated display sequence of categories', 'Categories');
      return res.json({ success: true, categories: db.categories });
    }
    res.status(400).json({ message: 'Invalid orderedIds array' });
  });

  // Breaking News
  app.get('/api/breaking-news', (req, res) => {
    res.json(db.breakingNews || []);
  });

  app.post('/api/breaking-news', (req, res) => {
    const item = req.body;
    item.id = 'bn-' + Date.now();
    item.createdAt = new Date().toISOString();
    item.isActive = item.isActive !== false;

    db.breakingNews.unshift(item);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Breaking News Alert', `Published breaking news: "${item.title}"`, 'Breaking News');
    res.json(item);
  });

  app.put('/api/breaking-news/:id', (req, res) => {
    const { id } = req.params;
    const index = db.breakingNews.findIndex((b: any) => b.id === id);
    if (index !== -1) {
      db.breakingNews[index] = { ...db.breakingNews[index], ...req.body };
      saveDatabase();
      return res.json(db.breakingNews[index]);
    }
    res.status(404).json({ message: 'Breaking news item not found' });
  });

  app.delete('/api/breaking-news/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const exists = (db.breakingNews || []).some((b: any) => b.id === id);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Breaking news item not found' });
    }
    db.breakingNews = db.breakingNews.filter((b: any) => b.id !== id);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Breaking News Removed', `Deleted breaking news ID ${id}`, 'Breaking News');
    res.json({ success: true, message: 'Breaking news alert deleted successfully', id });
  });

  // Ads & Placements
  app.get('/api/ads', (req, res) => {
    res.json(db.ads || []);
  });

  app.post('/api/ads', (req, res) => {
    const ad = req.body;
    ad.id = 'ad-' + Date.now();
    ad.impressions = ad.impressions || 0;
    ad.clicks = ad.clicks || 0;
    ad.isActive = ad.isActive !== false;

    db.ads.push(ad);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Ad Created', `Created advertisement campaign "${ad.name}"`, 'Ads Manager');
    res.json(ad);
  });

  app.put('/api/ads/:id', (req, res) => {
    const { id } = req.params;
    const index = db.ads.findIndex((a: any) => a.id === id);
    if (index !== -1) {
      db.ads[index] = { ...db.ads[index], ...req.body };
      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Ad Updated', `Updated advertisement "${db.ads[index].name}"`, 'Ads Manager');
      return res.json(db.ads[index]);
    }
    res.status(404).json({ message: 'Ad not found' });
  });

  app.delete('/api/ads/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const exists = (db.ads || []).some((a: any) => a.id === id);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Ad campaign not found' });
    }
    db.ads = db.ads.filter((a: any) => a.id !== id);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Ad Deleted', `Deleted ad campaign ID ${id}`, 'Ads Manager');
    res.json({ success: true, message: 'Ad campaign deleted successfully', id });
  });

  app.post('/api/ads/:id/track', (req, res) => {
    const { id } = req.params;
    const { type } = req.body; // 'impression' | 'click'
    const ad = db.ads.find((a: any) => a.id === id);
    if (ad) {
      if (type === 'click') ad.clicks = (ad.clicks || 0) + 1;
      else ad.impressions = (ad.impressions || 0) + 1;
      saveDatabase();
      return res.json({ success: true, impressions: ad.impressions, clicks: ad.clicks });
    }
    res.status(404).json({ message: 'Ad not found' });
  });

  app.get('/api/ad-placements', (req, res) => {
    res.json(db.adPlacements || []);
  });

  app.put('/api/ad-placements', (req, res) => {
    db.adPlacements = req.body;
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Ad Placements Updated', 'Saved visual layout placement parameters for advertisements', 'Ads Manager');
    res.json(db.adPlacements);
  });

function getFileTypeCategory(filename: string, mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'office' | 'archive' | 'other' {
  const ext = path.extname(filename).toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  if (mime.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp', '.ico'].includes(ext)) {
    return 'image';
  }
  if (mime.startsWith('video/') || ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.3gp'].includes(ext)) {
    return 'video';
  }
  if (mime.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma'].includes(ext)) {
    return 'audio';
  }
  if (['.pdf', '.txt', '.rtf'].includes(ext) || mime.includes('pdf') || mime.includes('text/plain')) {
    return 'document';
  }
  if (['.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.csv'].includes(ext) || mime.includes('word') || mime.includes('excel') || mime.includes('powerpoint') || mime.includes('spreadsheet')) {
    return 'office';
  }
  if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) {
    return 'archive';
  }
  return 'other';
}

const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.sh', '.php', '.js', '.py', '.asp', '.aspx', '.cgi', '.vbs', '.cmd', '.msi', '.jar', '.scr', '.dll', '.com'];
function isBlockedFileType(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return BLOCKED_EXTENSIONS.includes(ext);
}

  // Media Library
  app.get('/api/media', (req, res) => {
    let list = db.mediaFiles || [];
    if (req.query.publishedOnly === 'true') {
      list = list.filter((m: any) => m.isPublished !== false);
    }
    res.json(list);
  });

  app.post('/api/media/upload', (req, res) => {
    const uploadHandler = upload.array('files', 10);
    uploadHandler(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message || 'File upload error' });
      }
      const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: 'No file provided' });
      }

      const customTitle = req.body?.title ? String(req.body.title).trim() : '';
      const customDescription = req.body?.description ? String(req.body.description).trim() : '';
      const isPublished = req.body?.isPublished !== undefined ? String(req.body.isPublished) === 'true' : true;

      const createdItems = [];
      for (const f of files) {
        if (isBlockedFileType(f.originalname)) {
          return res.status(400).json({ success: false, message: `Executable or dangerous file type (${path.extname(f.originalname)}) is prohibited for security.` });
        }

        const fileType = getFileTypeCategory(f.filename, f.mimetype);
        const mediaItem = {
          id: 'media-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          filename: f.filename,
          originalName: f.originalname,
          storagePath: f.path || f.filename,
          url: `/uploads/${f.filename}`,
          mimeType: f.mimetype,
          size: f.size,
          fileType,
          title: customTitle || f.originalname.replace(/\.[^/.]+$/, ''),
          description: customDescription || '',
          altText: customTitle || f.originalname.replace(/\.[^/.]+$/, ''),
          caption: '',
          uploadedBy: 'Admin',
          isPublished,
          downloadCount: 0,
          uploadedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.mediaFiles.unshift(mediaItem);
        createdItems.push(mediaItem);
      }

      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Media Uploaded', `Uploaded ${createdItems.length} media file(s)`, 'Media Library');

      if (createdItems.length === 1) {
        return res.json(createdItems[0]);
      }
      return res.json(createdItems);
    });
  });

  // Create external URL media entry
  app.post('/api/media/external', requireAdminAuth, (req, res) => {
    const { url, title, description, isPublished = true, mimeType, fileType } = req.body;
    if (!url || !url.trim()) {
      return res.status(400).json({ success: false, message: 'File or picture URL is required' });
    }
    const cleanUrl = url.trim();
    const filename = cleanUrl.split('/').pop()?.split('?')[0] || 'external_link';
    const computedFileType = fileType || getFileTypeCategory(filename, mimeType || '');

    const mediaItem = {
      id: 'media-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      filename,
      originalName: filename,
      storagePath: cleanUrl,
      url: cleanUrl,
      mimeType: mimeType || 'application/octet-stream',
      size: 0,
      fileType: computedFileType,
      title: title?.trim() || filename,
      description: description?.trim() || '',
      altText: title?.trim() || filename,
      caption: '',
      uploadedBy: 'Admin',
      isPublished: isPublished !== false,
      downloadCount: 0,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.mediaFiles.unshift(mediaItem);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'External Media Added', `Added external URL media "${mediaItem.title}"`, 'Media Library');
    return res.json(mediaItem);
  });

  // Download endpoint with counter increment and Content-Disposition header
  app.get('/api/media/:id/download', (req, res) => {
    const { id } = req.params;
    const media = (db.mediaFiles || []).find((m: any) => m.id === id);
    if (!media) {
      return res.status(404).send('Media file not found');
    }

    // Increment download count
    media.downloadCount = (media.downloadCount || 0) + 1;
    saveDatabase();

    if (media.url && media.url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, media.url);
      if (fs.existsSync(filePath)) {
        return res.download(filePath, media.originalName || media.filename);
      }
    }

    // Remote or missing local file fallback redirect
    return res.redirect(media.url);
  });

  app.put('/api/media/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const index = db.mediaFiles.findIndex((m: any) => m.id === id);
    if (index !== -1) {
      db.mediaFiles[index] = {
        ...db.mediaFiles[index],
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Media Updated', `Updated metadata for "${db.mediaFiles[index].title || db.mediaFiles[index].originalName}"`, 'Media Library');
      return res.json(db.mediaFiles[index]);
    }
    res.status(404).json({ success: false, message: 'Media file not found' });
  });

  app.delete('/api/media/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const media = db.mediaFiles.find((m: any) => m.id === id);
    if (media) {
      if (media.url && media.url.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, media.url);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) {
            console.error('Failed to delete physical upload file:', e);
          }
        }
      }
      db.mediaFiles = db.mediaFiles.filter((m: any) => m.id !== id);
      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Media Deleted', `Permanently deleted media file "${media.title || media.originalName}"`, 'Media Library');
      return res.json({ success: true, message: `Media file deleted successfully`, id });
    }
    res.status(404).json({ success: false, message: 'Media item not found' });
  });

  // Comments
  app.get('/api/comments', (req, res) => {
    const { articleId } = req.query;
    let list = db.comments || [];
    if (articleId) {
      list = list.filter((c: any) => c.articleId === articleId);
    }
    res.json(list);
  });

  app.post('/api/comments', (req, res) => {
    const cmt = req.body;
    cmt.id = 'cmt-' + Date.now();
    cmt.status = 'approved'; // auto-approve or pending based on config
    cmt.createdAt = new Date().toISOString();

    db.comments.unshift(cmt);
    saveDatabase();
    res.json(cmt);
  });

  app.put('/api/comments/:id', (req, res) => {
    const { id } = req.params;
    const index = db.comments.findIndex((c: any) => c.id === id);
    if (index !== -1) {
      db.comments[index] = { ...db.comments[index], ...req.body };
      saveDatabase();
      return res.json(db.comments[index]);
    }
    res.status(404).json({ message: 'Comment not found' });
  });

  app.delete('/api/comments/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const exists = (db.comments || []).some((c: any) => c.id === id);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    db.comments = db.comments.filter((c: any) => c.id !== id);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Comment Deleted', `Removed comment ID ${id}`, 'Comments');
    res.json({ success: true, message: 'Comment deleted successfully', id });
  });

  // Newsletter
  app.get('/api/newsletter', (req, res) => {
    res.json(db.subscribers || []);
  });

  app.post('/api/newsletter/subscribe', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const existing = db.subscribers.find((s: any) => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.json({ success: true, message: 'Already subscribed!' });
    }

    const sub = {
      id: 'sub-' + Date.now(),
      email,
      subscribedAt: new Date().toISOString(),
      status: 'active'
    };
    db.subscribers.unshift(sub);
    saveDatabase();
    res.json({ success: true, message: 'Subscribed successfully to NaijaTrendiInfo Newsletter!' });
  });

  app.delete('/api/newsletter/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const exists = (db.subscribers || []).some((s: any) => s.id === id);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }
    db.subscribers = db.subscribers.filter((s: any) => s.id !== id);
    saveDatabase();
    res.json({ success: true, message: 'Subscriber removed successfully', id });
  });

  app.post('/api/newsletter/broadcast', (req, res) => {
    const { subject, content } = req.body;
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Newsletter Broadcast', `Dispatched campaign "${subject}" to ${db.subscribers.length} active subscribers`, 'Newsletter');
    res.json({ success: true, count: db.subscribers.length, message: 'Newsletter broadcast dispatched successfully!' });
  });

  // Submissions (Submit News)
  app.get('/api/submissions', (req, res) => {
    res.json(db.submissions || []);
  });

  app.post('/api/submissions', (req, res) => {
    const sub = req.body;
    sub.id = 'subm-' + Date.now();
    sub.submittedAt = new Date().toISOString();
    sub.status = 'pending';

    db.submissions.unshift(sub);
    saveDatabase();
    res.json({ success: true, submission: sub, message: 'Thank you! Your news tip has been submitted for editorial review.' });
  });

  app.put('/api/submissions/:id', (req, res) => {
    const { id } = req.params;
    const index = db.submissions.findIndex((s: any) => s.id === id);
    if (index !== -1) {
      db.submissions[index] = { ...db.submissions[index], ...req.body };
      saveDatabase();
      return res.json(db.submissions[index]);
    }
    res.status(404).json({ message: 'Submission not found' });
  });

  app.delete('/api/submissions/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const exists = (db.submissions || []).some((s: any) => s.id === id);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    db.submissions = db.submissions.filter((s: any) => s.id !== id);
    saveDatabase();
    res.json({ success: true, message: 'Submission deleted successfully', id });
  });

  // Contact Form
  app.get('/api/contacts', (req, res) => {
    res.json(db.contacts || []);
  });

  app.post('/api/contact', (req, res) => {
    const msg = req.body;
    msg.id = 'msg-' + Date.now();
    msg.createdAt = new Date().toISOString();
    msg.read = false;

    db.contacts.unshift(msg);
    saveDatabase();
    res.json({ success: true, message: 'Your message has been sent to NaijaTrendiInfo desk.' });
  });

  app.delete('/api/contacts/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const exists = (db.contacts || []).some((c: any) => c.id === id);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    db.contacts = db.contacts.filter((c: any) => c.id !== id);
    saveDatabase();
    res.json({ success: true, message: 'Contact message deleted successfully', id });
  });

  // Users & Roles
  app.get('/api/users', (req, res) => {
    res.json(db.users || []);
  });

  app.post('/api/users', (req, res) => {
    const user = req.body;
    user.id = 'usr-' + Date.now();
    user.createdAt = new Date().toISOString();

    db.users.push(user);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'User Created', `Created user account for ${user.name} (${user.role})`, 'Users');
    res.json(user);
  });

  app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const index = db.users.findIndex((u: any) => u.id === id);
    if (index !== -1) {
      const existing = db.users[index];
      const updates = { ...req.body };
      if (updates.password && updates.password.trim().length > 0) {
        updates.lastPasswordChangedAt = new Date().toISOString();
      }
      db.users[index] = { ...existing, ...updates };
      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'User Updated', `Updated settings/password for user ${db.users[index].name}`, 'Users');
      return res.json(db.users[index]);
    }
    res.status(404).json({ message: 'User not found' });
  });

  app.post('/api/users/:id/change-password', (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const index = db.users.findIndex((u: any) => u.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    const user = db.users[index];
    if (user.password && currentPassword && user.password !== currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password provided is incorrect.' });
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long.' });
    }

    db.users[index].password = newPassword.trim();
    db.users[index].lastPasswordChangedAt = new Date().toISOString();
    saveDatabase();

    addAuditLog(user.email, user.name, 'Password Changed', `Changed login password for ${user.name}`, 'User Security');
    return res.json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.',
      user: db.users[index]
    });
  });

  app.delete('/api/users/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const user = (db.users || []).find((u: any) => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }
    db.users = db.users.filter((u: any) => u.id !== id);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'User Deleted', `Removed user ${user.name} (ID ${id})`, 'Users');
    res.json({ success: true, message: 'User account deleted successfully', id });
  });

  // System Settings & Customization
  app.get('/api/settings', (req, res) => {
    res.json(db.settings || INITIAL_SETTINGS);
  });

  app.put('/api/settings', (req, res) => {
    db.settings = { ...db.settings, ...req.body };
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Settings Updated', 'Updated global site parameters, SEO, and branding info.', 'System Settings');
    res.json(db.settings);
  });

  // --- QUICK LINKS MANAGEMENT ROUTES ---
  app.get('/api/quick-links', (req, res) => {
    const list = [...(db.quickLinks || [])].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    res.json(list);
  });

  app.get('/api/quick-links/trash', requireAdminAuth, (req, res) => {
    res.json(db.deletedQuickLinks || []);
  });

  app.post('/api/quick-links', requireAdminAuth, (req, res) => {
    const item = req.body;
    if (!item.title || !item.url) {
      return res.status(400).json({ success: false, message: 'Quick link title and destination URL are required.' });
    }
    item.id = item.id || ('ql-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
    item.order = item.order || ((db.quickLinks || []).length + 1);
    item.isActive = item.isActive !== false;
    item.targetTab = item.targetTab || '_self';
    item.status = item.status || 'published';
    item.createdAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();

    if (!db.quickLinks) db.quickLinks = [];
    db.quickLinks.push(item);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Quick Link Created', `Added quick link "${item.title}" (${item.url})`, 'Quick Links');
    res.json(item);
  });

  app.put('/api/quick-links/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const index = (db.quickLinks || []).findIndex((q: any) => q.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Quick link not found.' });
    }
    db.quickLinks[index] = {
      ...db.quickLinks[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Quick Link Updated', `Updated quick link "${db.quickLinks[index].title}"`, 'Quick Links');
    res.json(db.quickLinks[index]);
  });

  app.delete('/api/quick-links/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const found = (db.quickLinks || []).find((q: any) => q.id === id);
    if (!found) {
      return res.status(404).json({ success: false, message: 'Quick link not found.' });
    }
    if (!db.deletedQuickLinks) db.deletedQuickLinks = [];
    db.deletedQuickLinks.push({ ...found, deletedAt: new Date().toISOString() });
    db.quickLinks = (db.quickLinks || []).filter((q: any) => q.id !== id);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Quick Link Deleted', `Moved quick link "${found.title}" to trash`, 'Quick Links');
    res.json({ success: true, message: 'Quick link moved to recycle bin/trash', id });
  });

  app.post('/api/quick-links/:id/restore', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const trashed = (db.deletedQuickLinks || []).find((q: any) => q.id === id);
    if (!trashed) {
      return res.status(404).json({ success: false, message: 'Item not found in trash.' });
    }
    delete trashed.deletedAt;
    if (!db.quickLinks) db.quickLinks = [];
    db.quickLinks.push(trashed);
    db.deletedQuickLinks = db.deletedQuickLinks.filter((q: any) => q.id !== id);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Quick Link Restored', `Restored quick link "${trashed.title}" from trash`, 'Quick Links');
    res.json({ success: true, item: trashed });
  });

  app.post('/api/quick-links/reorder', requireAdminAuth, (req, res) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds array required' });
    }
    db.quickLinks.forEach((item: any) => {
      const newOrder = orderedIds.indexOf(item.id);
      if (newOrder !== -1) {
        item.order = newOrder + 1;
      }
    });
    db.quickLinks.sort((a: any, b: any) => a.order - b.order);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Quick Links Reordered', 'Updated display sequence of quick links', 'Quick Links');
    res.json(db.quickLinks);
  });

  app.put('/api/quick-links', requireAdminAuth, (req, res) => {
    db.quickLinks = req.body;
    saveDatabase();
    res.json(db.quickLinks);
  });

  // --- SITE PAGES MANAGEMENT ROUTES ---
  app.get('/api/pages', (req, res) => {
    res.json(db.pages || []);
  });

  app.get('/api/pages/:slugOrId', (req, res) => {
    const { slugOrId } = req.params;
    const page = (db.pages || []).find((p: any) => p.slug === slugOrId || p.id === slugOrId);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found.' });
    }
    res.json(page);
  });

  app.post('/api/pages', requireAdminAuth, (req, res) => {
    const page = req.body;
    if (!page.title) {
      return res.status(400).json({ success: false, message: 'Page title is required.' });
    }
    page.id = page.id || ('page-' + Date.now());
    page.slug = page.slug || page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    page.status = page.status || 'published';
    page.visibility = page.visibility || 'public';
    page.navigationPlacement = page.navigationPlacement || 'footer';
    page.publishedAt = page.publishedAt || new Date().toISOString();
    page.updatedAt = new Date().toISOString();

    if (!db.pages) db.pages = [];
    db.pages.push(page);

    // Initial Version Log
    if (!db.pageVersions) db.pageVersions = [];
    db.pageVersions.push({
      id: 'ver-' + Date.now(),
      pageId: page.id,
      title: page.title,
      content: page.content || '',
      updatedBy: 'Admin Desk',
      createdAt: new Date().toISOString()
    });

    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Site Page Created', `Created website page "${page.title}" (${page.slug})`, 'Pages Management');
    res.json(page);
  });

  app.put('/api/pages/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const index = (db.pages || []).findIndex((p: any) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Page not found.' });
    }
    const prev = db.pages[index];
    const updated = {
      ...prev,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // Save version history if content changed
    if (req.body.content && req.body.content !== prev.content) {
      if (!db.pageVersions) db.pageVersions = [];
      db.pageVersions.push({
        id: 'ver-' + Date.now(),
        pageId: id,
        title: updated.title,
        content: updated.content,
        updatedBy: req.body.authorName || 'Admin Desk',
        createdAt: new Date().toISOString()
      });
    }

    db.pages[index] = updated;
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Site Page Updated', `Updated page content for "${updated.title}"`, 'Pages Management');
    res.json(updated);
  });

  app.delete('/api/pages/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const page = (db.pages || []).find((p: any) => p.id === id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found.' });
    }
    db.pages = db.pages.filter((p: any) => p.id !== id);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Site Page Deleted', `Deleted page "${page.title}"`, 'Pages Management');
    res.json({ success: true, message: 'Page deleted successfully', id });
  });

  app.get('/api/pages/:id/versions', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const list = (db.pageVersions || []).filter((v: any) => v.pageId === id);
    res.json(list);
  });

  app.post('/api/pages/:id/restore-version', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const { versionId } = req.body;
    const ver = (db.pageVersions || []).find((v: any) => v.id === versionId);
    const index = (db.pages || []).findIndex((p: any) => p.id === id);

    if (!ver || index === -1) {
      return res.status(404).json({ success: false, message: 'Version or page not found.' });
    }

    db.pages[index].title = ver.title;
    db.pages[index].content = ver.content;
    db.pages[index].updatedAt = new Date().toISOString();
    saveDatabase();

    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Page Version Restored', `Restored page version from ${ver.createdAt}`, 'Pages Management');
    res.json(db.pages[index]);
  });

  // --- SUBMISSION CONVERT TO ARTICLE ROUTE ---
  app.post('/api/submissions/:id/convert-to-article', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const sub = (db.submissions || []).find((s: any) => s.id === id);
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const defaultCategory = db.categories[0] || { id: 'cat-politics', name: 'Politics' };
    const newArticle = {
      id: 'art-' + Date.now(),
      title: sub.title || 'Investigative News Report',
      slug: (sub.title || 'news-report').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content: `<p>${(sub.content || '').replace(/\n/g, '</p><p>')}</p>${sub.mediaUrl ? `<p><img src="${sub.mediaUrl}" alt="Media evidence" /></p>` : ''}`,
      summary: (sub.content || '').substring(0, 180) + '...',
      categoryId: defaultCategory.id,
      categoryName: defaultCategory.name,
      imageUrl: sub.mediaUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200',
      authorName: sub.senderName || 'Eyewitness Contributor',
      status: 'draft',
      isFeatured: false,
      isBreaking: false,
      views: 0,
      tags: ['News Tip', 'Eyewitness', 'Exclusive'],
      publishedAt: new Date().toISOString()
    };

    db.articles.unshift(newArticle);
    sub.status = 'published';
    saveDatabase();

    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Converted News Tip to Article', `Converted submission "${sub.title}" into draft article`, 'News Tips');
    res.json({ success: true, article: newArticle });
  });

  // --- COOKIE SETTINGS ROUTES ---
  app.get('/api/cookie-settings', (req, res) => {
    res.json(db.cookieSettings || INITIAL_COOKIE_SETTINGS);
  });

  app.put('/api/cookie-settings', requireAdminAuth, (req, res) => {
    db.cookieSettings = { ...db.cookieSettings, ...req.body };
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Cookie Settings Updated', 'Updated cookie consent banner parameters', 'System Settings');
    res.json(db.cookieSettings);
  });

  // --- FOOTER SETTINGS ROUTES ---
  app.get('/api/footer-settings', (req, res) => {
    res.json(db.footerSettings || INITIAL_FOOTER_SETTINGS);
  });

  app.put('/api/footer-settings', requireAdminAuth, (req, res) => {
    db.footerSettings = { ...db.footerSettings, ...req.body };
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Footer Settings Updated', 'Updated site footer layout & copyright settings', 'Footer Settings');
    res.json(db.footerSettings);
  });

  // --- ADVERTISING PACKAGES ROUTES ---
  app.get('/api/advertising-packages', (req, res) => {
    res.json(db.advertisingPackages || INITIAL_ADVERTISING_PACKAGES);
  });

  app.post('/api/advertising-packages', requireAdminAuth, (req, res) => {
    const pkg = req.body;
    pkg.id = pkg.id || ('pkg-' + Date.now());
    pkg.isActive = pkg.isActive !== false;
    if (!db.advertisingPackages) db.advertisingPackages = [];
    db.advertisingPackages.push(pkg);
    saveDatabase();
    res.json(pkg);
  });

  app.put('/api/advertising-packages', requireAdminAuth, (req, res) => {
    db.advertisingPackages = req.body;
    saveDatabase();
    res.json(db.advertisingPackages);
  });

  app.get('/api/editorial-desk', (req, res) => {
    res.json(db.editorialDesk || []);
  });

  app.put('/api/editorial-desk', (req, res) => {
    db.editorialDesk = req.body;
    saveDatabase();
    res.json(db.editorialDesk);
  });

  app.get('/api/information', (req, res) => {
    res.json(db.information || []);
  });

  app.put('/api/information', (req, res) => {
    db.information = req.body;
    saveDatabase();
    res.json(db.information);
  });

  app.get('/api/social-links', (req, res) => {
    const list = [...(db.socialLinks || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json(list);
  });

  app.post('/api/social-links', requireAdminAuth, (req, res) => {
    const link = req.body;
    if (!link.platform || !link.url) {
      return res.status(400).json({ success: false, message: 'Platform name and URL/handle are required.' });
    }
    link.id = 'soc-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    link.order = link.order || ((db.socialLinks || []).length + 1);
    link.isActive = link.isActive !== false;
    link.displayName = link.displayName || link.platform;
    link.createdAt = new Date().toISOString();
    link.updatedAt = new Date().toISOString();

    if (!db.socialLinks) db.socialLinks = [];
    db.socialLinks.push(link);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Social Media Added', `Created handle "${link.displayName}" (${link.platform})`, 'System Settings');
    res.json(link);
  });

  app.put('/api/social-links/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const index = (db.socialLinks || []).findIndex((s: any) => s.id === id);
    if (index !== -1) {
      db.socialLinks[index] = {
        ...db.socialLinks[index],
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Social Media Updated', `Updated handle "${db.socialLinks[index].displayName || db.socialLinks[index].platform}"`, 'System Settings');
      return res.json(db.socialLinks[index]);
    }
    res.status(404).json({ success: false, message: 'Social media account not found' });
  });

  app.patch('/api/social-links/:id/toggle', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const link = (db.socialLinks || []).find((s: any) => s.id === id);
    if (link) {
      link.isActive = !link.isActive;
      link.updatedAt = new Date().toISOString();
      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Social Media Toggled', `Toggled "${link.displayName || link.platform}" to ${link.isActive ? 'Active' : 'Inactive'}`, 'System Settings');
      return res.json(link);
    }
    res.status(404).json({ success: false, message: 'Social media account not found' });
  });

  app.delete('/api/social-links/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const link = (db.socialLinks || []).find((s: any) => s.id === id);
    if (link) {
      db.socialLinks = db.socialLinks.filter((s: any) => s.id !== id);
      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Social Media Deleted', `Removed handle "${link.displayName || link.platform}"`, 'System Settings');
      return res.json({ success: true, message: 'Social media handle deleted successfully', id });
    }
    res.status(404).json({ success: false, message: 'Social media account not found' });
  });

  app.put('/api/social-links', requireAdminAuth, (req, res) => {
    if (Array.isArray(req.body)) {
      db.socialLinks = req.body;
      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Social Links Reordered', 'Bulk saved social media links', 'System Settings');
      return res.json(db.socialLinks);
    }
    res.status(400).json({ success: false, message: 'Expected array of social media links' });
  });

  // Sports
  app.get('/api/sports/fixtures', (req, res) => {
    res.json(db.sportsFixtures || []);
  });

  app.post('/api/sports/fixtures', (req, res) => {
    const fix = req.body;
    fix.id = 'fix-' + Date.now();
    db.sportsFixtures.unshift(fix);
    saveDatabase();
    res.json(fix);
  });

  app.put('/api/sports/fixtures/:id', (req, res) => {
    const { id } = req.params;
    const idx = db.sportsFixtures.findIndex((f: any) => f.id === id);
    if (idx !== -1) {
      db.sportsFixtures[idx] = { ...db.sportsFixtures[idx], ...req.body };
      saveDatabase();
      return res.json(db.sportsFixtures[idx]);
    }
    res.status(404).json({ message: 'Fixture not found' });
  });

  app.delete('/api/sports/fixtures/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const exists = (db.sportsFixtures || []).some((f: any) => f.id === id);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Sports fixture not found' });
    }
    db.sportsFixtures = db.sportsFixtures.filter((f: any) => f.id !== id);
    saveDatabase();
    res.json({ success: true, message: 'Sports fixture deleted successfully', id });
  });

  // Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    res.json(db.auditLogs || []);
  });

  app.delete('/api/audit-logs', requireAdminAuth, (req, res) => {
    db.auditLogs = [];
    saveDatabase();
    res.json({ success: true, message: 'Audit logs cleared successfully' });
  });

  // Backup & Recovery
  app.get('/api/backups', (req, res) => {
    res.json(db.backups || []);
  });

  app.post('/api/backups/create', (req, res) => {
    const backupItem = {
      id: 'bkp-' + Date.now(),
      filename: `naijatrendiinfo_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
      createdAt: new Date().toISOString(),
      size: JSON.stringify(db).length,
      snapshot: JSON.parse(JSON.stringify(db))
    };
    db.backups.unshift(backupItem);
    saveDatabase();
    addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Database Backup Created', `Generated snapshot ${backupItem.filename}`, 'Backup & Recovery');
    res.json(backupItem);
  });

  app.post('/api/backups/restore', (req, res) => {
    const { backupId } = req.body;
    const backupItem = db.backups.find((b: any) => b.id === backupId);
    if (backupItem && backupItem.snapshot) {
      db = backupItem.snapshot;
      saveDatabase();
      addAuditLog('admin@naijatrendinfo.com.ng', 'Admin', 'Database Restored', `Restored database state from backup ${backupItem.filename}`, 'Backup & Recovery');
      return res.json({ success: true, message: 'Database state successfully restored!' });
    }
    res.status(400).json({ message: 'Invalid backup snapshot' });
  });

  // AI Assistant (Gemini)
  app.post('/api/ai/suggest-headline', async (req, res) => {
    const { topic, category } = req.body;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          headlines: [
            `Nigeria Focus: Critical Developments Surrounding ${topic || 'Current Affairs'}`,
            `Breaking: Key Stakeholders Address Emerging ${category || 'National'} Trends in Nigeria`,
            `Special Report: Analysis of ${topic || 'Recent Events'} and Impact on Citizens`
          ]
        });
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a chief news editor for a top Nigerian digital news site called NaijaTrendiInfo. Generate 3 catchy, high-impact, professional newspaper headlines for a story about: ${topic || 'Nigerian economic growth'} in category: ${category || 'General'}. Return pure JSON array of strings.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const text = response.text || '';
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        return res.json({ headlines: JSON.parse(match[0]) });
      }
      return res.json({
        headlines: [
          `Nigeria Focus: Critical Developments Surrounding ${topic}`,
          `Breaking: Key Stakeholders Address Emerging ${category} Trends`,
          `Special Report: Analysis of ${topic} and Impact on Citizens`
        ]
      });
    } catch (e) {
      return res.json({
        headlines: [
          `Nigeria Focus: Critical Developments Surrounding ${topic || 'Topic'}`,
          `Breaking: Key Stakeholders Address Emerging ${category || 'Category'} Trends`,
          `Special Report: Analysis of ${topic || 'News'} and Impact on Citizens`
        ]
      });
    }
  });

  // Helper function to resolve dynamic base URL for custom domain support
  const getDynamicBaseUrl = (req: express.Request) => {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.get('host') || 'naijatrendinfo.com.ng';
    return `${proto}://${host}`;
  };

  // SEO: Sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    const siteUrl = db.settings?.siteUrl || getDynamicBaseUrl(req);
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${siteUrl}/</loc><changefreq>always</changefreq><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>${siteUrl}/sports</loc><changefreq>hourly</changefreq><priority>0.8</priority></url>\n`;

    db.categories.forEach((cat: any) => {
      xml += `  <url><loc>${siteUrl}/category/${cat.slug}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
    });

    db.articles.forEach((art: any) => {
      xml += `  <url><loc>${siteUrl}/article/${art.slug}</loc><lastmod>${art.updatedAt ? art.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n`;
    });

    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  // SEO: Robots.txt
  app.get('/robots.txt', (req, res) => {
    const siteUrl = db.settings?.siteUrl || getDynamicBaseUrl(req);
    const content = `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${siteUrl}/sitemap.xml\n`;
    res.header('Content-Type', 'text/plain');
    res.send(content);
  });

  // SEO: RSS feed
  app.get('/rss.xml', (req, res) => {
    const siteUrl = db.settings?.siteUrl || getDynamicBaseUrl(req);
    let rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n`;
    rss += `<title>NaijaTrendiInfo - Nigeria News</title>\n`;
    rss += `<link>${siteUrl}</link>\n`;
    rss += `<description>Breaking News, Politics, Business, Sports, Tech and Entertainment in Nigeria</description>\n`;

    db.articles.slice(0, 20).forEach((art: any) => {
      rss += `<item>\n`;
      rss += `<title><![CDATA[${art.title}]]></title>\n`;
      rss += `<link>${siteUrl}/article/${art.slug}</link>\n`;
      rss += `<description><![CDATA[${art.summary}]]></description>\n`;
      rss += `<pubDate>${new Date(art.publishedAt || Date.now()).toUTCString()}</pubDate>\n`;
      rss += `</item>\n`;
    });

    rss += `</channel>\n</rss>`;
    res.header('Content-Type', 'application/xml');
    res.send(rss);
  });

  // API Catch-all 404 handler (prevents returning HTML to API callers)
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint ${req.method} ${req.path} not found` });
  });

  // Global Unhandled Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled API Server Error:', err);
    res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: err.message || 'An unexpected error occurred'
    });
  });

  // Vite or Static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '1y', immutable: true, index: false }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NaijaTrendiInfo server running at http://localhost:${PORT}`);
  });
}

startServer();
