-- ==============================================================================
-- RRW DIGITAL PRESENCE - COMPLETE SUPABASE SCHEMA & INITIAL SEED DATA
-- ==============================================================================
-- Jalankan seluruh script ini di Supabase SQL Editor (pada project Supabase baru Anda).
-- Script ini mencakup:
-- 1. Custom Types & Helper Functions (Admin Role Management, Auto Timestamp)
-- 2. Tables & Schema Definitions
-- 3. Row Level Security (RLS) Policies
-- 4. Storage Bucket ('media') & Storage RLS Policies
-- 5. Initial Seed Content (Settings, Hero, Services, Addons, Team, Portfolio, FAQ, etc.)
-- ==============================================================================

-- 1. ROLES & ADMIN HELPER FUNCTIONS
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'own roles readable'
  ) THEN
    CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE existing int;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT count(*) INTO existing FROM public.user_roles WHERE role = 'admin';
  IF existing > 0 THEN RETURN public.has_role(auth.uid(), 'admin'); END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- 2. CORE TABLES DEFINITION
-- ------------------------------------------------------------------------------

-- Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text NOT NULL DEFAULT 'RRW',
  tagline text NOT NULL DEFAULT 'We Build Your Digital Presence',
  whatsapp text,
  email text,
  instagram text,
  address text,
  pricing_note text,
  meta_description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Hero Content
CREATE TABLE IF NOT EXISTS public.hero_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow text,
  headline text NOT NULL,
  subheadline text,
  primary_cta_label text,
  primary_cta_url text,
  secondary_cta_label text,
  secondary_cta_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hero_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hero_content TO authenticated;
GRANT ALL ON public.hero_content TO service_role;
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;

-- About Content
CREATE TABLE IF NOT EXISTS public.about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  heading text NOT NULL,
  intro text,
  body text,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  team_heading text,
  team_intro text,
  team_story text,
  team_milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.about_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.about_content TO authenticated;
GRANT ALL ON public.about_content TO service_role;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text,
  full_description text,
  starting_price bigint NOT NULL DEFAULT 0,
  price_label text NOT NULL DEFAULT 'Mulai dari',
  price_suffix text,
  icon text NOT NULL DEFAULT 'Layers',
  features text[] NOT NULL DEFAULT '{}',
  suitable_for text[] NOT NULL DEFAULT '{}',
  benefits text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Addons
CREATE TABLE IF NOT EXISTS public.addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price bigint NOT NULL DEFAULT 0,
  price_label text NOT NULL DEFAULT 'Mulai dari',
  price_suffix text,
  icon text NOT NULL DEFAULT 'Puzzle',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.addons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.addons TO authenticated;
GRANT ALL ON public.addons TO service_role;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;

-- Team Members
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  initial text NOT NULL DEFAULT '',
  role text,
  bio text,
  photo_url text,
  instagram text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_members TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Portfolio
CREATE TABLE IF NOT EXISTS public.portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  content text,
  category text,
  client text,
  thumbnail_url text,
  gallery_images text[] NOT NULL DEFAULT '{}',
  technologies text[] NOT NULL DEFAULT '{}',
  project_url text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.portfolio TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.portfolio TO authenticated;
GRANT ALL ON public.portfolio TO service_role;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

-- Process Steps
CREATE TABLE IF NOT EXISTS public.process_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number text NOT NULL,
  title text NOT NULL,
  description text,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.process_steps TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.process_steps TO authenticated;
GRANT ALL ON public.process_steps TO service_role;
ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;

-- Blog Categories
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
GRANT ALL ON public.blog_categories TO service_role;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  thumbnail_url text,
  excerpt text,
  content text,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  author text NOT NULL DEFAULT 'RRW',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- FAQs
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Inquiries (Contact Form Submissions)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  whatsapp text,
  project_type text,
  budget_range text,
  description text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;


-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- site_settings
DROP POLICY IF EXISTS "settings public read" ON public.site_settings;
CREATE POLICY "settings public read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "settings admin write" ON public.site_settings;
CREATE POLICY "settings admin write" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- hero_content
DROP POLICY IF EXISTS "hero public read" ON public.hero_content;
CREATE POLICY "hero public read" ON public.hero_content FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "hero admin write" ON public.hero_content;
CREATE POLICY "hero admin write" ON public.hero_content FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- about_content
DROP POLICY IF EXISTS "about public read" ON public.about_content;
CREATE POLICY "about public read" ON public.about_content FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "about admin write" ON public.about_content;
CREATE POLICY "about admin write" ON public.about_content FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- services
DROP POLICY IF EXISTS "services public read" ON public.services;
CREATE POLICY "services public read" ON public.services FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "services admin read" ON public.services;
CREATE POLICY "services admin read" ON public.services FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "services admin write" ON public.services;
CREATE POLICY "services admin write" ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- addons
DROP POLICY IF EXISTS "addons public read" ON public.addons;
CREATE POLICY "addons public read" ON public.addons FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "addons admin read" ON public.addons;
CREATE POLICY "addons admin read" ON public.addons FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "addons admin write" ON public.addons;
CREATE POLICY "addons admin write" ON public.addons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- team_members
DROP POLICY IF EXISTS "team public read" ON public.team_members;
CREATE POLICY "team public read" ON public.team_members FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "team admin read" ON public.team_members;
CREATE POLICY "team admin read" ON public.team_members FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "team admin write" ON public.team_members;
CREATE POLICY "team admin write" ON public.team_members FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- portfolio
DROP POLICY IF EXISTS "portfolio public read" ON public.portfolio;
CREATE POLICY "portfolio public read" ON public.portfolio FOR SELECT TO anon, authenticated USING (published = true);
DROP POLICY IF EXISTS "portfolio admin read" ON public.portfolio;
CREATE POLICY "portfolio admin read" ON public.portfolio FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "portfolio admin write" ON public.portfolio;
CREATE POLICY "portfolio admin write" ON public.portfolio FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- process_steps
DROP POLICY IF EXISTS "process public read" ON public.process_steps;
CREATE POLICY "process public read" ON public.process_steps FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "process admin read" ON public.process_steps;
CREATE POLICY "process admin read" ON public.process_steps FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "process admin write" ON public.process_steps;
CREATE POLICY "process admin write" ON public.process_steps FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- blog_categories
DROP POLICY IF EXISTS "blogcat public read" ON public.blog_categories;
CREATE POLICY "blogcat public read" ON public.blog_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "blogcat admin write" ON public.blog_categories;
CREATE POLICY "blogcat admin write" ON public.blog_categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- blog_posts
DROP POLICY IF EXISTS "blog public read" ON public.blog_posts;
CREATE POLICY "blog public read" ON public.blog_posts FOR SELECT TO anon, authenticated USING (published = true);
DROP POLICY IF EXISTS "blog admin read" ON public.blog_posts;
CREATE POLICY "blog admin read" ON public.blog_posts FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "blog admin write" ON public.blog_posts;
CREATE POLICY "blog admin write" ON public.blog_posts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- faqs
DROP POLICY IF EXISTS "faq public read" ON public.faqs;
CREATE POLICY "faq public read" ON public.faqs FOR SELECT TO anon, authenticated USING (active = true);
DROP POLICY IF EXISTS "faq admin read" ON public.faqs;
CREATE POLICY "faq admin read" ON public.faqs FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "faq admin write" ON public.faqs;
CREATE POLICY "faq admin write" ON public.faqs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- inquiries
DROP POLICY IF EXISTS "inquiry public insert" ON public.inquiries;
CREATE POLICY "inquiry public insert" ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "inquiry admin read" ON public.inquiries;
CREATE POLICY "inquiry admin read" ON public.inquiries FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "inquiry admin write" ON public.inquiries;
CREATE POLICY "inquiry admin write" ON public.inquiries FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- 4. TRIGGERS FOR AUTO UPDATED_AT
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS t_site_settings ON public.site_settings;
CREATE TRIGGER t_site_settings BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS t_hero ON public.hero_content;
CREATE TRIGGER t_hero BEFORE UPDATE ON public.hero_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS t_about ON public.about_content;
CREATE TRIGGER t_about BEFORE UPDATE ON public.about_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS t_services ON public.services;
CREATE TRIGGER t_services BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS t_addons ON public.addons;
CREATE TRIGGER t_addons BEFORE UPDATE ON public.addons FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS t_team ON public.team_members;
CREATE TRIGGER t_team BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS t_portfolio ON public.portfolio;
CREATE TRIGGER t_portfolio BEFORE UPDATE ON public.portfolio FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS t_process ON public.process_steps;
CREATE TRIGGER t_process BEFORE UPDATE ON public.process_steps FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS t_blog ON public.blog_posts;
CREATE TRIGGER t_blog BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS t_faqs ON public.faqs;
CREATE TRIGGER t_faqs BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS t_inq ON public.inquiries;
CREATE TRIGGER t_inq BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


-- 5. STORAGE BUCKET & POLICIES ('media')
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "media admin read" ON storage.objects;
CREATE POLICY "media admin read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "media anon read" ON storage.objects;
CREATE POLICY "media anon read" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media admin insert" ON storage.objects;
CREATE POLICY "media admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "media admin update" ON storage.objects;
CREATE POLICY "media admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "media admin delete" ON storage.objects;
CREATE POLICY "media admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_admin());


-- 6. INITIAL SEED DATA
-- ------------------------------------------------------------------------------

-- Settings
INSERT INTO public.site_settings (brand_name, tagline, whatsapp, email, instagram, address, pricing_note, meta_description)
SELECT
  'RRW',
  'We Build Your Digital Presence',
  '6281384514320',
  'rrw.dev@gmail.com',
  'rrw.dev',
  'Indonesia',
  'Harga akhir dapat disesuaikan berdasarkan kebutuhan dan kompleksitas project.',
  'RRW membangun website profesional dan aplikasi web custom untuk bisnis, organisasi, sekolah, dan komunitas.'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- Hero Content
INSERT INTO public.hero_content (eyebrow, headline, subheadline, primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url)
SELECT
  'Jasa Pembuatan Website',
  'Dari Ide Menjadi Website Berkualitas.',
  'Solusi website profesional untuk mengembangkan bisnis, organisasi, dan kebutuhan digital Anda.',
  'Konsultasi Gratis',
  '/contact',
  'Lihat Layanan',
  '/services'
WHERE NOT EXISTS (SELECT 1 FROM public.hero_content);

-- About Content
INSERT INTO public.about_content (heading, intro, body, highlights, team_heading, team_intro, team_story, team_milestones)
SELECT
  'We don''t just build websites. We build digital experiences.',
  'RRW membantu bisnis dan organisasi membangun kehadiran digital modern melalui website profesional dan aplikasi web custom.',
  'Kami bekerja dengan proses yang terstruktur: memahami kebutuhan, merancang arsitektur, mendesain antarmuka, membangun, menguji, dan meluncurkan. Setiap project dibangun dengan standar kode yang rapi, performa yang baik, dan arsitektur yang siap berkembang.',
  '[{"title":"Modern Design","description":"Desain bersih, elegan, dan sesuai standar visual terkini."},{"title":"Responsive Development","description":"Tampil optimal di mobile, tablet, dan desktop."},{"title":"Custom Solutions","description":"Fitur dibangun mengikuti kebutuhan bisnis, bukan template."},{"title":"Scalable Architecture","description":"Struktur yang siap tumbuh bersama bisnis Anda."},{"title":"Professional Process","description":"Alur kerja yang jelas dari diskusi hingga serah terima."}]'::jsonb,
  'Tiga sahabat kecil di balik RRW.',
  'RRW adalah singkatan dari Reyvanzi, Rifki, dan Wira — tiga teman yang tumbuh bersama sejak sekolah dasar dan kini membangun website untuk bisnis Anda.',
  E'## Berawal dari bangku sekolah dasar\nReyvanzi, Rifki, dan Wira sudah berteman sejak duduk di bangku sekolah dasar. Pertemanan itu terus berjalan dari tahun ke tahun, dan masih bertahan sampai hari ini.\n\n## Kini sama-sama di Universitas Gunadarma\nKetiganya kini menempuh perkuliahan di Universitas Gunadarma. Dari kebiasaan belajar dan mengerjakan banyak hal bersama, lahirlah RRW — nama yang diambil dari huruf depan nama kami bertiga.\n\n## Kenapa ini penting untuk Anda\nTim yang sudah saling kenal sejak kecil bekerja dengan komunikasi yang cepat, saling percaya, dan tanggung jawab bersama atas setiap project yang dikerjakan.',
  '[{"title":"Sekolah Dasar","description":"Reyvanzi, Rifki, dan Wira pertama kali bertemu dan mulai berteman."},{"title":"Tumbuh bersama","description":"Pertemanan terus berlanjut melewati sekolah hingga hari ini."},{"title":"Universitas Gunadarma","description":"Ketiganya sama-sama menempuh perkuliahan di Universitas Gunadarma."},{"title":"Lahirnya RRW","description":"Huruf depan nama kami menjadi nama studio: R, R, W."}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.about_content);

-- Services
INSERT INTO public.services (name, slug, short_description, full_description, starting_price, price_label, price_suffix, icon, features, suitable_for, benefits, featured, sort_order) VALUES
('Landing Page', 'landing-page', 'Untuk UMKM, produk, jasa, event, dan campaign.', 'Landing page satu halaman yang dirancang untuk memperkenalkan produk, jasa, atau campaign Anda secara ringkas dan meyakinkan, lengkap dengan jalur kontak langsung ke WhatsApp.', 1500000, 'Mulai dari', NULL, 'Rocket',
  ARRAY['1 halaman','Desain modern','Responsive HP & desktop','Tombol WhatsApp','Form kontak','Basic SEO','2 kali revisi'],
  ARRAY['UMKM','Produk','Jasa','Personal brand','Event','Campaign'],
  ARRAY['Cepat online','Biaya terjangkau','Fokus pada satu tujuan konversi'], true, 1),
('Company Profile', 'company-profile', 'Untuk perusahaan, sekolah, organisasi, yayasan, dan agency.', 'Website company profile dengan struktur halaman lengkap untuk menampilkan identitas, layanan, dan portofolio organisasi Anda secara profesional.', 6000000, 'Mulai dari', NULL, 'Building2',
  ARRAY['Hingga 6–8 halaman','Home, About, Services','Portfolio / Gallery / Contact','Responsive','WhatsApp & Google Maps','Basic SEO','3 kali revisi'],
  ARRAY['Perusahaan','Sekolah','Organisasi','Yayasan','Agency','Bisnis profesional'],
  ARRAY['Meningkatkan kredibilitas','Informasi lengkap dan terstruktur','Mudah ditemukan di pencarian'], true, 2),
('Company Profile + CMS', 'company-profile-cms', 'Kelola website sendiri dengan mudah.', 'Website company profile profesional yang dilengkapi admin dashboard sehingga tim Anda dapat mengelola konten website tanpa menyentuh kode sumber.', 13500000, 'Mulai dari', NULL, 'LayoutDashboard',
  ARRAY['Semua fitur Company Profile','Admin dashboard','Kelola profil, layanan, portfolio','Kelola artikel / blog','Upload gambar & dokumen','CMS + basic security','3 kali revisi'],
  ARRAY['Perusahaan','Sekolah','Organisasi','Bisnis yang rutin update konten'],
  ARRAY['Konten bisa diperbarui kapan saja','Tidak tergantung developer untuk update','Hemat biaya jangka panjang'], true, 3),
('Online Store', 'online-store', 'Untuk bisnis yang ingin jualan online.', 'Website toko online dengan katalog produk, kategori, keranjang belanja, checkout, serta dashboard admin untuk mengelola produk dan pesanan.', 12000000, 'Mulai dari', NULL, 'ShoppingBag',
  ARRAY['Katalog produk','Keranjang & checkout','Upload produk','Kelola pesanan','Dashboard admin','Basic SEO'],
  ARRAY['Bisnis retail','UMKM','Brand produk','Reseller'],
  ARRAY['Jualan online 24 jam','Pengelolaan produk terpusat','Integrasi payment gateway tersedia sebagai fitur tambahan'], false, 4),
('Web Application', 'web-application', 'Untuk bisnis yang membutuhkan sistem khusus.', 'Aplikasi web custom untuk kebutuhan operasional bisnis seperti sistem informasi, inventory, point of sales, booking, membership, atau sistem manajemen lainnya.', 18000000, 'Mulai dari', NULL, 'AppWindow',
  ARRAY['Sistem informasi','Inventory / POS / booking','Membership','Dashboard admin','Login & role permission','Database & API integration'],
  ARRAY['Sistem informasi','Inventory','Point of Sales','Booking','Membership','Sistem manajemen','Dashboard','Sistem sekolah','Sistem bisnis'],
  ARRAY['Proses kerja lebih efisien','Data terpusat dan rapi','Dibangun sesuai alur bisnis Anda'], false, 5),
('Custom Web Application', 'custom-web-application', 'Untuk kebutuhan yang lebih kompleks.', 'Pengembangan aplikasi web kompleks dengan kebutuhan yang sangat spesifik, seperti ERP, CRM, sistem multi-cabang, hingga integrasi dengan layanan pihak ketiga.', 30000000, 'Mulai dari', '+', 'Boxes',
  ARRAY['ERP / CRM','Sistem multi-cabang','Management system','Integrasi API','Enterprise application','Multi-role / user'],
  ARRAY['Perusahaan skala menengah','Perusahaan multi-cabang','Enterprise'],
  ARRAY['Sepenuhnya disesuaikan','Siap untuk skala besar','Terintegrasi dengan sistem lain'], false, 6)
ON CONFLICT (slug) DO NOTHING;

-- Addons
INSERT INTO public.addons (name, description, price, price_label, price_suffix, icon, sort_order)
SELECT name, description, price, price_label, price_suffix, icon, sort_order
FROM (VALUES
  ('Domain & Hosting', 'Pendaftaran domain dan hosting yang cepat serta stabil.', 450000, 'Mulai dari', '/ tahun', 'Globe', 1),
  ('Maintenance', 'Pembaruan, perbaikan, dan dukungan teknis berkala.', 1500000, 'Mulai dari', '/ tahun', 'Wrench', 2),
  ('Add-On Fitur', 'Fitur di luar paket, termasuk payment gateway dan integrasi custom.', 450000, 'Mulai dari', NULL, 'Puzzle', 3),
  ('Keamanan & Backup', 'Website lebih aman dengan perlindungan dan backup data.', 0, 'Mulai dari', NULL, 'ShieldCheck', 4)
) AS v(name, description, price, price_label, price_suffix, icon, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.addons);

-- Team Members
INSERT INTO public.team_members (name, initial, role, bio, sort_order)
SELECT name, initial, role, bio, sort_order
FROM (VALUES
  ('Reyvanzi', 'R', 'Co-Founder', 'Sahabat Rifki dan Wira sejak sekolah dasar, kini mahasiswa Universitas Gunadarma.', 1),
  ('Rifki', 'R', 'Co-Founder', 'Sahabat Reyvanzi dan Wira sejak sekolah dasar, kini mahasiswa Universitas Gunadarma.', 2),
  ('Wira', 'W', 'Co-Founder', 'Sahabat Reyvanzi dan Rifki sejak sekolah dasar, kini mahasiswa Universitas Gunadarma.', 3)
) AS v(name, initial, role, bio, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.team_members);

-- Process Steps
INSERT INTO public.process_steps (step_number, title, description, sort_order)
SELECT step_number, title, description, sort_order
FROM (VALUES
  ('01', 'Discover', 'Memahami kebutuhan klien dan tujuan bisnis.', 1),
  ('02', 'Plan', 'Menentukan struktur, fitur, scope, dan teknologi.', 2),
  ('03', 'Design', 'Menyusun arah UI/UX dan sistem visual.', 3),
  ('04', 'Develop', 'Membangun website atau aplikasi web.', 4),
  ('05', 'Test', 'Menguji fungsionalitas, responsivitas, usability, dan performa.', 5),
  ('06', 'Launch', 'Deploy project dan serah terima hasil akhir.', 6)
) AS v(step_number, title, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.process_steps);

-- FAQs
INSERT INTO public.faqs (question, answer, sort_order)
SELECT question, answer, sort_order
FROM (VALUES
  ('Berapa lama proses pembuatan website?', 'Landing page umumnya 3-7 hari kerja, company profile 2-3 minggu, dan aplikasi web menyesuaikan kompleksitas. Estimasi pasti diberikan setelah scope disepakati.', 1),
  ('Apakah domain dan hosting termasuk?', 'Domain dan hosting tidak otomatis termasuk dalam paket. Keduanya tersedia sebagai layanan tambahan mulai dari Rp450.000 per tahun.', 2),
  ('Apakah website bisa dikelola sendiri?', 'Bisa, untuk paket yang dilengkapi CMS. Anda mendapatkan dashboard admin beserta pelatihan singkat penggunaannya.', 3),
  ('Apakah tersedia maintenance?', 'Tersedia sebagai layanan tambahan mulai dari Rp1.500.000 per tahun, mencakup pembaruan, perbaikan, dan dukungan teknis berkala.', 4),
  ('Apakah bisa request fitur custom?', 'Bisa. Fitur di luar scope paket dapat ditambahkan dengan penyesuaian biaya sesuai kebutuhan.', 5),
  ('Apakah bisa dibuatkan sistem sesuai kebutuhan bisnis?', 'Bisa. Kami membangun aplikasi web custom mulai dari sistem informasi sederhana hingga aplikasi bisnis kompleks.', 6),
  ('Berapa kali revisi yang didapat?', 'Jumlah revisi mengikuti paket yang dipilih, yaitu 2 hingga 3 kali revisi. Revisi tambahan dapat didiskusikan.', 7)
) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.faqs);

-- Blog Categories
INSERT INTO public.blog_categories (name, slug) VALUES
('Insight', 'insight'),
('Development', 'development'),
('Bisnis Digital', 'bisnis-digital')
ON CONFLICT (slug) DO NOTHING;

-- Sample Blog Post
INSERT INTO public.blog_posts (title, slug, excerpt, content, category_id, tags, author, published, published_at, seo_title, seo_description)
SELECT
  'Kenapa Bisnis Perlu Website Profesional',
  'kenapa-bisnis-perlu-website-profesional',
  'Website bukan sekadar pelengkap. Ia adalah aset digital yang bekerja setiap hari untuk membangun kepercayaan calon pelanggan.',
  E'Banyak bisnis masih mengandalkan media sosial sebagai satu-satunya kanal digital. Media sosial efektif untuk jangkauan, namun website adalah rumah digital yang sepenuhnya Anda kendalikan.\n\n## Kredibilitas\nCalon pelanggan hampir selalu mencari informasi sebelum memutuskan. Website yang rapi dan informatif memberi sinyal bahwa bisnis Anda serius dan dapat dipercaya.\n\n## Kontrol penuh\nStruktur halaman, konten, dan alur konversi sepenuhnya ditentukan oleh Anda, bukan oleh algoritma platform.\n\n## Aset jangka panjang\nKonten di website terus dapat ditemukan melalui pencarian, sehingga nilainya bertambah seiring waktu.\n\nMulailah dari yang sederhana: satu landing page yang jelas sering kali sudah cukup untuk memulai.',
  (SELECT id FROM public.blog_categories WHERE slug = 'bisnis-digital' LIMIT 1),
  ARRAY['website','bisnis','digital'],
  'RRW',
  true,
  now(),
  'Kenapa Bisnis Perlu Website Profesional',
  'Alasan utama bisnis membutuhkan website profesional: kredibilitas, kontrol penuh, dan aset digital jangka panjang.'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'kenapa-bisnis-perlu-website-profesional');

-- Sample Portfolio
INSERT INTO public.portfolio (title, slug, description, content, category, client, technologies, featured, published, sort_order) VALUES
('Sistem Informasi Sekolah', 'sistem-informasi-sekolah', 'Portal informasi dan sistem pengelolaan data untuk sekolah menengah.', 'Portal sekolah dengan halaman profil, pengumuman, galeri kegiatan, serta dashboard admin untuk mengelola konten dan data siswa.', 'Web Application', 'SMA Harapan Bangsa', ARRAY['React','TypeScript','Tailwind CSS','PostgreSQL'], true, true, 1),
('Company Profile Konstruksi', 'company-profile-konstruksi', 'Website profil perusahaan konstruksi dengan galeri proyek.', 'Website company profile multi-halaman yang menampilkan layanan, galeri proyek, dan jalur kontak langsung untuk calon klien.', 'Company Profile', 'CV Bangun Selaras', ARRAY['React','Tailwind CSS','CMS'], true, true, 2),
('Katalog Toko Online', 'katalog-toko-online', 'Toko online dengan katalog produk dan order via WhatsApp.', 'Toko online dengan katalog produk berkategori, halaman detail, keranjang, dan checkout yang terhubung ke WhatsApp.', 'Online Store', 'Rumah Kopi Nusantara', ARRAY['React','TypeScript','Tailwind CSS'], false, true, 3)
ON CONFLICT (slug) DO NOTHING;
