-- =========================================================================
-- NAIJATRENDIINFO SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Website: https://www.naijatrendinfo.com.ng/
-- 
-- Single Source of Truth for Articles, Categories, Settings, Users & Media
-- =========================================================================

-- 1. ARTICLES TABLE
CREATE TABLE IF NOT EXISTS public.articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT DEFAULT '',
    content TEXT DEFAULT '',
    category_id TEXT,
    category_name TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    featured_image TEXT,
    image_caption TEXT DEFAULT '',
    image_credit TEXT DEFAULT '',
    gallery_images JSONB DEFAULT '[]'::jsonb,
    author_id TEXT,
    author_name TEXT,
    author_avatar TEXT,
    status TEXT DEFAULT 'published',
    is_featured BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_breaking BOOLEAN DEFAULT false,
    is_editor_pick BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    read_time_minutes INTEGER DEFAULT 3,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON public.articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_articles_breaking ON public.articles(is_breaking);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    icon TEXT DEFAULT 'Flag',
    color TEXT DEFAULT '#10b981',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories(display_order);

-- 3. BREAKING NEWS TABLE
CREATE TABLE IF NOT EXISTS public.breaking_news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT DEFAULT '',
    article_id TEXT,
    category TEXT DEFAULT 'National',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_breaking_news_active ON public.breaking_news(is_active);

-- 4. USERS & EDITORIAL STAFF TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    role TEXT DEFAULT 'Author',
    avatar TEXT,
    bio TEXT DEFAULT '',
    last_password_changed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 5. SITE SETTINGS TABLE (Branding, SEO, AdSense, Economics)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QUICK LINKS TABLE
CREATE TABLE IF NOT EXISTS public.quick_links (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    target_tab TEXT DEFAULT '_self',
    status TEXT DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quick_links_order ON public.quick_links(display_order);

-- 7. SITE PAGES TABLE (About, Privacy, Terms, Contact, Advertise)
CREATE TABLE IF NOT EXISTS public.site_pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT DEFAULT '',
    status TEXT DEFAULT 'published',
    visibility TEXT DEFAULT 'public',
    navigation_placement TEXT DEFAULT 'footer',
    meta_title TEXT DEFAULT '',
    meta_description TEXT DEFAULT '',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_pages_slug ON public.site_pages(slug);

-- 8. PAGE VERSIONS TABLE
CREATE TABLE IF NOT EXISTS public.page_versions (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    updated_by TEXT DEFAULT 'Admin Desk',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON public.page_versions(page_id);

-- 9. EDITORIAL DESK TABLE
CREATE TABLE IF NOT EXISTS public.editorial_desk (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SOCIAL MEDIA LINKS TABLE
CREATE TABLE IF NOT EXISTS public.social_links (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    display_name TEXT DEFAULT '',
    url TEXT NOT NULL,
    icon TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_links_order ON public.social_links(display_order);

-- 11. INFORMATION ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.information_entries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    icon TEXT DEFAULT '',
    url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ADVERTISEMENTS & CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.advertisements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    placement TEXT DEFAULT 'leaderboard_top',
    type TEXT DEFAULT 'banner',
    image_url TEXT DEFAULT '',
    destination_url TEXT DEFAULT '',
    ad_code TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AD PLACEMENTS CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.ad_placements (
    id TEXT PRIMARY KEY DEFAULT 'default',
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ADVERTISING PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.advertising_packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    duration TEXT NOT NULL,
    description TEXT DEFAULT '',
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. COOKIE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.cookie_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. FOOTER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.footer_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. SPORTS FIXTURES & RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.sports_fixtures (
    id TEXT PRIMARY KEY,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    competition TEXT DEFAULT 'NPFL',
    status TEXT DEFAULT 'Scheduled',
    match_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. MEDIA FILES & DIGITAL ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.media_files (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT DEFAULT 'application/octet-stream',
    size BIGINT DEFAULT 0,
    file_type TEXT DEFAULT 'image',
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    alt_text TEXT DEFAULT '',
    caption TEXT DEFAULT '',
    uploaded_by TEXT DEFAULT 'Admin',
    is_published BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. ARTICLE COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT DEFAULT '',
    content TEXT NOT NULL,
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);

-- 20. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);

-- 21. NEWS SUBMISSIONS (EYEWITNESS TIPS) TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY,
    title TEXT DEFAULT '',
    content TEXT DEFAULT '',
    media_url TEXT DEFAULT '',
    sender_name TEXT DEFAULT '',
    sender_email TEXT DEFAULT '',
    sender_phone TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT DEFAULT '',
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. SECURITY AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_email TEXT DEFAULT '',
    user_name TEXT DEFAULT '',
    action TEXT NOT NULL,
    details TEXT DEFAULT '',
    resource TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 24. DATABASE BACKUP SNAPSHOTS TABLE
CREATE TABLE IF NOT EXISTS public.backups (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    size BIGINT DEFAULT 0,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. SITE ANALYTICS & TELEMETRY TABLE
CREATE TABLE IF NOT EXISTS public.site_analytics (
    id TEXT PRIMARY KEY DEFAULT 'default',
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. MASTER DOCUMENT STORE (High-Resilience Key-Value Store)
CREATE TABLE IF NOT EXISTS public.supabase_document_store (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS across all tables
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breaking_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_desk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.information_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertising_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supabase_document_store ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC READ POLICIES (Allow public reading of published news & settings)
DO $$ 
BEGIN
    -- Public Read for Articles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Public Read Articles') THEN
        CREATE POLICY "Public Read Articles" ON public.articles FOR SELECT USING (true);
    END IF;
    
    -- Public Read for Categories
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Public Read Categories') THEN
        CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
    END IF;

    -- Public Read for Breaking News
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'breaking_news' AND policyname = 'Public Read Breaking News') THEN
        CREATE POLICY "Public Read Breaking News" ON public.breaking_news FOR SELECT USING (true);
    END IF;

    -- Public Read for Settings
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Public Read Settings') THEN
        CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);
    END IF;

    -- Public Read for Quick Links
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quick_links' AND policyname = 'Public Read Quick Links') THEN
        CREATE POLICY "Public Read Quick Links" ON public.quick_links FOR SELECT USING (true);
    END IF;

    -- Public Read for Pages
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_pages' AND policyname = 'Public Read Pages') THEN
        CREATE POLICY "Public Read Pages" ON public.site_pages FOR SELECT USING (true);
    END IF;

    -- Public Read for Editorial Desk
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'editorial_desk' AND policyname = 'Public Read Editorial') THEN
        CREATE POLICY "Public Read Editorial" ON public.editorial_desk FOR SELECT USING (true);
    END IF;

    -- Public Read for Social Links
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'social_links' AND policyname = 'Public Read Social') THEN
        CREATE POLICY "Public Read Social" ON public.social_links FOR SELECT USING (true);
    END IF;

    -- Public Read for Information
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'information_entries' AND policyname = 'Public Read Info') THEN
        CREATE POLICY "Public Read Info" ON public.information_entries FOR SELECT USING (true);
    END IF;

    -- Public Read for Ads
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'advertisements' AND policyname = 'Public Read Ads') THEN
        CREATE POLICY "Public Read Ads" ON public.advertisements FOR SELECT USING (true);
    END IF;

    -- Public Read for Ad Placements
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ad_placements' AND policyname = 'Public Read Placements') THEN
        CREATE POLICY "Public Read Placements" ON public.ad_placements FOR SELECT USING (true);
    END IF;

    -- Public Read for Advertising Packages
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'advertising_packages' AND policyname = 'Public Read Packages') THEN
        CREATE POLICY "Public Read Packages" ON public.advertising_packages FOR SELECT USING (true);
    END IF;

    -- Public Read for Cookie Settings
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cookie_settings' AND policyname = 'Public Read Cookies') THEN
        CREATE POLICY "Public Read Cookies" ON public.cookie_settings FOR SELECT USING (true);
    END IF;

    -- Public Read for Footer Settings
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'footer_settings' AND policyname = 'Public Read Footer') THEN
        CREATE POLICY "Public Read Footer" ON public.footer_settings FOR SELECT USING (true);
    END IF;

    -- Public Read for Sports Fixtures
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sports_fixtures' AND policyname = 'Public Read Sports') THEN
        CREATE POLICY "Public Read Sports" ON public.sports_fixtures FOR SELECT USING (true);
    END IF;

    -- Public Read for Media
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_files' AND policyname = 'Public Read Media') THEN
        CREATE POLICY "Public Read Media" ON public.media_files FOR SELECT USING (true);
    END IF;

    -- Public Read for Comments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Public Read Comments') THEN
        CREATE POLICY "Public Read Comments" ON public.comments FOR SELECT USING (status = 'approved');
    END IF;

    -- Public Insert for Contact Form
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Public Insert Contacts') THEN
        CREATE POLICY "Public Insert Contacts" ON public.contacts FOR INSERT WITH CHECK (true);
    END IF;

    -- Public Insert for News Submissions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'submissions' AND policyname = 'Public Insert Submissions') THEN
        CREATE POLICY "Public Insert Submissions" ON public.submissions FOR INSERT WITH CHECK (true);
    END IF;

    -- Public Insert for Newsletter Subscription
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'Public Insert Subscribers') THEN
        CREATE POLICY "Public Insert Subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);
    END IF;

    -- Public Insert for Article Comments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Public Insert Comments') THEN
        CREATE POLICY "Public Insert Comments" ON public.comments FOR INSERT WITH CHECK (true);
    END IF;

    -- Public Read for Document Store
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'supabase_document_store' AND policyname = 'Public Read Doc Store') THEN
        CREATE POLICY "Public Read Doc Store" ON public.supabase_document_store FOR SELECT USING (true);
    END IF;
END $$;

-- 2. SERVICE ROLE & ADMIN FULL ACCESS POLICIES (Backend Cloud Run Node API has full CRUD)
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'articles', 'categories', 'breaking_news', 'users', 'site_settings',
        'quick_links', 'site_pages', 'page_versions', 'editorial_desk',
        'social_links', 'information_entries', 'advertisements', 'ad_placements',
        'advertising_packages', 'cookie_settings', 'footer_settings',
        'sports_fixtures', 'media_files', 'comments', 'subscribers',
        'submissions', 'contacts', 'audit_logs', 'backups', 'site_analytics',
        'supabase_document_store'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('
            DO $inner$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies 
                    WHERE tablename = %L AND policyname = %L
                ) THEN
                    CREATE POLICY "Service Role Full Access" ON public.%I 
                    FOR ALL 
                    USING (auth.role() = %L OR current_user = %L OR current_setting(%L, true) = %L)
                    WITH CHECK (auth.role() = %L OR current_user = %L OR current_setting(%L, true) = %L);
                END IF;
            END $inner$;
        ', t, 'Service Role Full Access', t, 'service_role', 'postgres', 'role', 'service_role', 'service_role', 'postgres', 'role', 'service_role');
    END LOOP;
END $$;
