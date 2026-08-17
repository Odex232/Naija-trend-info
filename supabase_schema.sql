-- =========================================================================
-- NAIJATRENDIINFO SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Website: https://naijatrendinfo.com.ng/
-- Project: nfstbjsvhbrcyeyjbxzd.supabase.co
-- =========================================================================

-- 1. Articles Table
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

-- 2. Categories Table
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

-- 3. Breaking News Table
CREATE TABLE IF NOT EXISTS public.breaking_news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT DEFAULT '',
    article_id TEXT,
    category TEXT DEFAULT 'National',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Users Table
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

-- 5. Site Pages Table (About Us, Contact, Privacy Policy, Terms)
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

-- 6. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Quick Links Table
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

-- 8. High Resilience Document Store (Universal Cloud JSON Backup for all collections)
CREATE TABLE IF NOT EXISTS public.supabase_document_store (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breaking_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supabase_document_store ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for Global Web Access
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public Read Articles" ON public.articles;
    CREATE POLICY "Public Read Articles" ON public.articles FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
    CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public Read Breaking" ON public.breaking_news;
    CREATE POLICY "Public Read Breaking" ON public.breaking_news FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public Read Settings" ON public.site_settings;
    CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public Read Pages" ON public.site_pages;
    CREATE POLICY "Public Read Pages" ON public.site_pages FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public Read DocStore" ON public.supabase_document_store;
    CREATE POLICY "Public Read DocStore" ON public.supabase_document_store FOR SELECT USING (true);
END $$;
