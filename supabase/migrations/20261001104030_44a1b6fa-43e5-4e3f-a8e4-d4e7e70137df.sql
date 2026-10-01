
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

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
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.site_settings (
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
CREATE POLICY "settings public read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings admin write" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER t_site_settings BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.hero_content (
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
CREATE POLICY "hero public read" ON public.hero_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "hero admin write" ON public.hero_content FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER t_hero BEFORE UPDATE ON public.hero_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  heading text NOT NULL,
  intro text,
  body text,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.about_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.about_content TO authenticated;
GRANT ALL ON public.about_content TO service_role;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "about public read" ON public.about_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "about admin write" ON public.about_content FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER t_about BEFORE UPDATE ON public.about_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.services (
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
CREATE POLICY "services public read" ON public.services FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "services admin read" ON public.services FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "services admin write" ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER t_services BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.portfolio (
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
CREATE POLICY "portfolio public read" ON public.portfolio FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "portfolio admin read" ON public.portfolio FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "portfolio admin write" ON public.portfolio FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER t_portfolio BEFORE UPDATE ON public.portfolio FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.process_steps (
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
CREATE POLICY "process public read" ON public.process_steps FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "process admin read" ON public.process_steps FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "process admin write" ON public.process_steps FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER t_process BEFORE UPDATE ON public.process_steps FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
GRANT ALL ON public.blog_categories TO service_role;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blogcat public read" ON public.blog_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "blogcat admin write" ON public.blog_categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.blog_posts (
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
CREATE POLICY "blog public read" ON public.blog_posts FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "blog admin read" ON public.blog_posts FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "blog admin write" ON public.blog_posts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER t_blog BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.faqs (
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
CREATE POLICY "faq public read" ON public.faqs FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "faq admin read" ON public.faqs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "faq admin write" ON public.faqs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER t_faqs BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.inquiries (
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
CREATE POLICY "inquiry public insert" ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "inquiry admin read" ON public.inquiries FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "inquiry admin write" ON public.inquiries FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER t_inq BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "media admin read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "media anon read" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'media');
CREATE POLICY "media admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "media admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "media admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_admin());

INSERT INTO public.site_settings (brand_name, tagline, whatsapp, email, instagram, address, pricing_note, meta_description)
VALUES ('RRW','We Build Your Digital Presence','6281234567890','hello@rrw.studio','rrw.studio','Indonesia',
'Harga akhir dapat disesuaikan berdasarkan kebutuhan dan kompleksitas project.',
'RRW membangun website profesional dan aplikasi web custom untuk bisnis, organisasi, sekolah, dan komunitas.');

INSERT INTO public.hero_content (eyebrow, headline, subheadline, primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url)
VALUES ('Web Development Studio','Build Your Digital Presence.',
'Website profesional yang dirancang untuk membantu bisnis Anda tampil lebih kredibel, menjangkau lebih banyak pelanggan, dan berkembang secara digital.',
'Konsultasi Gratis','/contact','Lihat Layanan','/services');

INSERT INTO public.about_content (heading, intro, body, highlights)
VALUES ('We don''t just build websites. We build digital experiences.',
'RRW membantu bisnis dan organisasi membangun kehadiran digital modern melalui website profesional dan aplikasi web custom.',
'Kami bekerja dengan proses yang terstruktur: memahami kebutuhan, merancang arsitektur, mendesain antarmuka, membangun, menguji, dan meluncurkan. Setiap project dibangun dengan standar kode yang rapi, performa yang baik, dan arsitektur yang siap berkembang.',
'[{"title":"Modern Design","description":"Desain bersih, elegan, dan sesuai standar visual terkini."},{"title":"Responsive Development","description":"Tampil optimal di mobile, tablet, dan desktop."},{"title":"Custom Solutions","description":"Fitur dibangun mengikuti kebutuhan bisnis, bukan template."},{"title":"Scalable Architecture","description":"Struktur yang siap tumbuh bersama bisnis Anda."},{"title":"Professional Process","description":"Alur kerja yang jelas dari diskusi hingga serah terima."}]'::jsonb);

INSERT INTO public.services (name, slug, short_description, full_description, starting_price, price_suffix, icon, features, suitable_for, benefits, featured, sort_order) VALUES
('Landing Page','landing-page','Satu halaman fokus konversi untuk produk, jasa, atau campaign.','Landing page satu halaman yang dirancang untuk memperkenalkan produk, jasa, atau campaign Anda secara ringkas dan meyakinkan, lengkap dengan jalur kontak langsung ke WhatsApp.',500000,NULL,'Rocket',
ARRAY['Website satu halaman','Desain modern','Responsive HP & Desktop','Tombol WhatsApp','Integrasi media sosial','Google Maps','Form kontak','SEO dasar','2 kali revisi'],
ARRAY['UMKM','Produk','Jasa','Personal brand','Event','Campaign'],
ARRAY['Cepat online','Biaya terjangkau','Fokus pada satu tujuan konversi'],true,1),
('Company Profile','company-profile','Website profil perusahaan multi-halaman yang kredibel.','Website company profile dengan struktur halaman lengkap untuk menampilkan identitas, layanan, dan portofolio organisasi Anda secara profesional.',2000000,NULL,'Building2',
ARRAY['6-8 halaman','Home','About','Services','Portfolio','Gallery','Contact','Desain responsive','Integrasi WhatsApp','Google Maps','Integrasi media sosial','SEO dasar','3 kali revisi'],
ARRAY['Perusahaan','Sekolah','Organisasi','Yayasan','Agency','Bisnis profesional'],
ARRAY['Meningkatkan kredibilitas','Informasi lengkap dan terstruktur','Mudah ditemukan di pencarian'],true,2),
('Company Profile + CMS','company-profile-cms','Company profile dengan dashboard admin untuk kelola konten sendiri.','Website company profile profesional yang dilengkapi admin dashboard sehingga tim Anda dapat mengelola konten website tanpa menyentuh kode sumber.',4500000,NULL,'LayoutDashboard',
ARRAY['Seluruh fitur Company Profile','Admin Dashboard','Login admin','Kelola About','Kelola Services','Kelola Portfolio','Kelola Gallery','Kelola Blog / Artikel','Upload gambar','Kelola informasi kontak','Content Management System','Dashboard admin responsive','Keamanan dasar','Pelatihan CMS','3 kali revisi'],
ARRAY['Perusahaan','Sekolah','Organisasi','Bisnis yang rutin update konten'],
ARRAY['Konten bisa diperbarui kapan saja','Tidak tergantung developer untuk update','Hemat biaya jangka panjang'],true,3),
('Online Store','online-store','Toko online dengan katalog produk, keranjang, dan order WhatsApp.','Website toko online dengan katalog produk, kategori, keranjang belanja, checkout, serta dashboard admin untuk mengelola produk dan pesanan.',4000000,NULL,'ShoppingBag',
ARRAY['Katalog produk','Kategori produk','Halaman detail produk','Keranjang belanja','Checkout','Order via WhatsApp','Admin dashboard','Manajemen produk','Manajemen kategori','Manajemen pesanan','Upload gambar produk','Desain responsive','SEO dasar'],
ARRAY['Bisnis retail','UMKM','Brand produk','Reseller'],
ARRAY['Jualan online 24 jam','Pengelolaan produk terpusat','Integrasi payment gateway tersedia sebagai fitur tambahan'],false,4),
('Web Application','web-application','Sistem bisnis custom dengan login, dashboard, dan database.','Aplikasi web custom untuk kebutuhan operasional bisnis seperti sistem informasi, inventory, point of sales, booking, membership, atau sistem manajemen lainnya.',6000000,NULL,'AppWindow',
ARRAY['Autentikasi','Login','Role & permission','Admin dashboard','Database','CRUD data','Laporan','Export data','Integrasi API','Custom workflow'],
ARRAY['Sistem informasi','Inventory','Point of Sales','Booking','Membership','Sistem manajemen','Dashboard','Sistem sekolah','Sistem bisnis'],
ARRAY['Proses kerja lebih efisien','Data terpusat dan rapi','Dibangun sesuai alur bisnis Anda'],false,5),
('Custom Web Application','custom-web-application','Aplikasi kompleks dan terintegrasi untuk kebutuhan skala besar.','Pengembangan aplikasi web kompleks dengan kebutuhan yang sangat spesifik, seperti ERP, CRM, sistem multi-cabang, hingga integrasi dengan layanan pihak ketiga.',10000000,'+','Boxes',
ARRAY['ERP','CRM','Sistem manajemen multi-cabang','Aplikasi bisnis kompleks','Aplikasi enterprise','Integrasi API pihak ketiga','Advanced workflow','Role & permission lanjutan','Reporting lanjutan'],
ARRAY['Perusahaan skala menengah','Perusahaan multi-cabang','Enterprise'],
ARRAY['Sepenuhnya disesuaikan','Siap untuk skala besar','Terintegrasi dengan sistem lain'],false,6);

INSERT INTO public.process_steps (step_number, title, description, sort_order) VALUES
('01','Discover','Memahami kebutuhan klien dan tujuan bisnis.',1),
('02','Plan','Menentukan struktur, fitur, scope, dan teknologi.',2),
('03','Design','Menyusun arah UI/UX dan sistem visual.',3),
('04','Develop','Membangun website atau aplikasi web.',4),
('05','Test','Menguji fungsionalitas, responsivitas, usability, dan performa.',5),
('06','Launch','Deploy project dan serah terima hasil akhir.',6);

INSERT INTO public.faqs (question, answer, sort_order) VALUES
('Berapa lama proses pembuatan website?','Landing page umumnya 3-7 hari kerja, company profile 2-3 minggu, dan aplikasi web menyesuaikan kompleksitas. Estimasi pasti diberikan setelah scope disepakati.',1),
('Apakah domain dan hosting termasuk?','Domain dan hosting tidak otomatis termasuk dalam paket. Keduanya tersedia sebagai layanan tambahan yang dapat kami bantu siapkan dan kelola.',2),
('Apakah website bisa dikelola sendiri?','Bisa, untuk paket yang dilengkapi CMS. Anda mendapatkan dashboard admin beserta pelatihan singkat penggunaannya.',3),
('Apakah tersedia maintenance?','Tersedia sebagai layanan tambahan, mencakup pembaruan, perbaikan, dan dukungan teknis berkala.',4),
('Apakah bisa request fitur custom?','Bisa. Fitur di luar scope paket dapat ditambahkan dengan penyesuaian biaya sesuai kebutuhan.',5),
('Apakah bisa dibuatkan sistem sesuai kebutuhan bisnis?','Bisa. Kami membangun aplikasi web custom mulai dari sistem informasi sederhana hingga aplikasi bisnis kompleks.',6),
('Berapa kali revisi yang didapat?','Jumlah revisi mengikuti paket yang dipilih, yaitu 2 hingga 3 kali revisi. Revisi tambahan dapat didiskusikan.',7);

INSERT INTO public.blog_categories (name, slug) VALUES ('Insight','insight'), ('Development','development'), ('Bisnis Digital','bisnis-digital');

INSERT INTO public.blog_posts (title, slug, excerpt, content, category_id, tags, author, published, published_at, seo_title, seo_description)
VALUES ('Kenapa Bisnis Perlu Website Profesional','kenapa-bisnis-perlu-website-profesional',
'Website bukan sekadar pelengkap. Ia adalah aset digital yang bekerja setiap hari untuk membangun kepercayaan calon pelanggan.',
'Banyak bisnis masih mengandalkan media sosial sebagai satu-satunya kanal digital. Media sosial efektif untuk jangkauan, namun website adalah rumah digital yang sepenuhnya Anda kendalikan.

## Kredibilitas
Calon pelanggan hampir selalu mencari informasi sebelum memutuskan. Website yang rapi dan informatif memberi sinyal bahwa bisnis Anda serius dan dapat dipercaya.

## Kontrol penuh
Struktur halaman, konten, dan alur konversi sepenuhnya ditentukan oleh Anda, bukan oleh algoritma platform.

## Aset jangka panjang
Konten di website terus dapat ditemukan melalui pencarian, sehingga nilainya bertambah seiring waktu.

Mulailah dari yang sederhana: satu landing page yang jelas sering kali sudah cukup untuk memulai.',
(SELECT id FROM public.blog_categories WHERE slug = 'bisnis-digital'),
ARRAY['website','bisnis','digital'],'RRW',true, now(),
'Kenapa Bisnis Perlu Website Profesional',
'Alasan utama bisnis membutuhkan website profesional: kredibilitas, kontrol penuh, dan aset digital jangka panjang.');

INSERT INTO public.portfolio (title, slug, description, content, category, client, technologies, featured, published, sort_order) VALUES
('Sistem Informasi Sekolah','sistem-informasi-sekolah','Portal informasi dan sistem pengelolaan data untuk sekolah menengah.','Portal sekolah dengan halaman profil, pengumuman, galeri kegiatan, serta dashboard admin untuk mengelola konten dan data siswa.','Web Application','SMA Harapan Bangsa',ARRAY['React','TypeScript','Tailwind CSS','PostgreSQL'],true,true,1),
('Company Profile Konstruksi','company-profile-konstruksi','Website profil perusahaan konstruksi dengan galeri proyek.','Website company profile multi-halaman yang menampilkan layanan, galeri proyek, dan jalur kontak langsung untuk calon klien.','Company Profile','CV Bangun Selaras',ARRAY['React','Tailwind CSS','CMS'],true,true,2),
('Katalog Toko Online','katalog-toko-online','Toko online dengan katalog produk dan order via WhatsApp.','Toko online dengan katalog produk berkategori, halaman detail, keranjang, dan checkout yang terhubung ke WhatsApp.','Online Store','Rumah Kopi Nusantara',ARRAY['React','TypeScript','Tailwind CSS'],false,true,3);
