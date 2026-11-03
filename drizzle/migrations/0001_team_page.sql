ALTER TABLE public.about_content
  ADD COLUMN team_heading text,
  ADD COLUMN team_intro text,
  ADD COLUMN team_story text,
  ADD COLUMN team_milestones jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.about_content SET
  team_heading = 'Tiga sahabat kecil di balik RRW.',
  team_intro = 'RRW adalah singkatan dari Reyvanzi, Rifki, dan Wira — tiga teman yang tumbuh bersama sejak sekolah dasar dan kini membangun website untuk bisnis Anda.',
  team_story = E'## Berawal dari bangku sekolah dasar\nReyvanzi, Rifki, dan Wira sudah berteman sejak duduk di bangku sekolah dasar. Pertemanan itu terus berjalan dari tahun ke tahun, dan masih bertahan sampai hari ini.\n\n## Kini sama-sama di Universitas Gunadarma\nKetiganya kini menempuh perkuliahan di Universitas Gunadarma. Dari kebiasaan belajar dan mengerjakan banyak hal bersama, lahirlah RRW — nama yang diambil dari huruf depan nama mereka bertiga.\n\n## Kenapa ini penting untuk Anda\nTim yang sudah saling kenal sejak kecil bekerja dengan komunikasi yang cepat, saling percaya, dan tanggung jawab bersama atas setiap project yang dikerjakan.',
  team_milestones = '[{"title":"Sekolah Dasar","description":"Reyvanzi, Rifki, dan Wira pertama kali bertemu dan mulai berteman."},{"title":"Tumbuh bersama","description":"Pertemanan terus berlanjut melewati sekolah hingga hari ini."},{"title":"Universitas Gunadarma","description":"Ketiganya sama-sama menempuh perkuliahan di Universitas Gunadarma."},{"title":"Lahirnya RRW","description":"Huruf depan nama mereka menjadi nama studio: R, R, W."}]'::jsonb;

CREATE TABLE public.team_members (
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
CREATE POLICY "team public read" ON public.team_members FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "team admin read" ON public.team_members FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "team admin write" ON public.team_members FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER t_team BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.team_members (name, initial, role, bio, sort_order) VALUES
  ('Reyvanzi', 'R', 'Co-Founder', 'Sahabat Rifki dan Wira sejak sekolah dasar, kini mahasiswa Universitas Gunadarma.', 1),
  ('Rifki', 'R', 'Co-Founder', 'Sahabat Reyvanzi dan Wira sejak sekolah dasar, kini mahasiswa Universitas Gunadarma.', 2),
  ('Wira', 'W', 'Co-Founder', 'Sahabat Reyvanzi dan Rifki sejak sekolah dasar, kini mahasiswa Universitas Gunadarma.', 3);