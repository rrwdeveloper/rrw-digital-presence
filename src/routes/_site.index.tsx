import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, Headphones, LayoutTemplate, Smartphone, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroMockup } from "@/components/site/HeroMockup";
import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { PortfolioCard, ServiceCard } from "@/components/site/Cards";
import { CtaBand, FaqList, ProcessGrid } from "@/components/site/Blocks";
import { faqQuery, portfolioQuery, processQuery, servicesQuery, siteQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/format";

export const Route = createFileRoute("/_site/")({
  loader: ({ context: { queryClient: q } }) =>
    Promise.all([
      q.ensureQueryData(siteQuery),
      q.ensureQueryData(servicesQuery),
      q.ensureQueryData(portfolioQuery),
      q.ensureQueryData(processQuery),
      q.ensureQueryData(faqQuery),
    ]),
  head: () => ({
    ...pageMeta({
      title: "RRW — Jasa Pembuatan Website & Aplikasi Web Profesional",
      description:
        "RRW membangun website profesional, company profile, toko online, dan aplikasi web custom untuk bisnis, sekolah, dan organisasi.",
      path: "/",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "RRW",
          slogan: "We Build Your Digital Presence",
          areaServed: "Indonesia",
        }),
      },
    ],
  }),
  component: Home,
});

const VALUES = [
  { icon: LayoutTemplate, title: "Desain Modern", text: "Desain bersih yang membangun kepercayaan sejak kesan pertama." },
  { icon: Smartphone, title: "Responsive HP & Desktop", text: "Tampil optimal di HP, tablet, hingga layar desktop lebar." },
  { icon: Zap, title: "Proses Cepat & Terpercaya", text: "Alur kerja jelas, tepat waktu, dan transparan." },
  { icon: Headphones, title: "Support & Revisi", text: "Revisi sesuai paket dan dukungan setelah website online." },
];

function Home() {
  const { data: site } = useSuspenseQuery(siteQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: portfolio } = useSuspenseQuery(portfolioQuery);
  const { data: steps } = useSuspenseQuery(processQuery);
  const { data: faqs } = useSuspenseQuery(faqQuery);
  const hero = site.hero;
  const about = site.about;

  const displayServices = (() => {
    const featured = services.filter((s) => s.featured);
    return featured.length > 0 ? featured.slice(0, 3) : services.slice(0, 3);
  })();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-70 [mask-image:radial-gradient(ellipse_at_70%_20%,black,transparent_65%)]" />
        <div className="container-x relative grid items-center gap-16 pb-24 pt-32 md:pt-40 lg:grid-cols-[1.05fr_1fr] lg:pb-32">
          <div>
            {hero?.eyebrow && (
              <p className="inline-flex animate-fade-up items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {hero.eyebrow}
              </p>
            )}
            <h1
              className="mt-6 animate-fade-up text-[2.75rem] font-semibold leading-[1.02] sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "80ms" }}
            >
              {hero?.headline}
            </h1>
            <p
              className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-muted-foreground"
              style={{ animationDelay: "160ms" }}
            >
              {hero?.subheadline}
            </p>
            <div className="mt-9 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
              {hero?.primary_cta_label && (
                <Button asChild variant="hero" size="xl">
                  <a href={hero.primary_cta_url ?? "/contact"}>
                    {hero.primary_cta_label} <ArrowRight />
                  </a>
                </Button>
              )}
              {hero?.secondary_cta_label && (
                <Button asChild variant="heroOutline" size="xl">
                  <a href={hero.secondary_cta_url ?? "/services"}>{hero.secondary_cta_label}</a>
                </Button>
              )}
            </div>
            <dl className="mt-12 grid max-w-md animate-fade-up grid-cols-3 gap-6 border-t pt-6" style={{ animationDelay: "320ms" }}>
              <div>
                <dt className="text-xs text-muted-foreground">Layanan</dt>
                <dd className="font-display text-2xl font-semibold">{services.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Tahapan kerja</dt>
                <dd className="font-display text-2xl font-semibold">{steps.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Responsive</dt>
                <dd className="font-display text-2xl font-semibold">100%</dd>
              </div>
            </dl>
          </div>
          <div className="pb-10 lg:pb-0">
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="border-y bg-card">
        <div className="container-x grid gap-px sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 80} className="py-10 sm:px-6 lg:py-12">
              <v.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-5 text-lg font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="container-x py-24 md:py-32">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Services"
            title="Solusi digital untuk setiap tahap bisnis Anda."
            description="Dari landing page sederhana hingga aplikasi web kompleks — pilih titik awal yang paling sesuai."
          />
          <Button asChild variant="heroOutline" size="xl" className="self-start md:self-auto">
            <Link to="/services">Semua layanan <ArrowUpRight /></Link>
          </Button>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {displayServices.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 80} className="h-full">
              <ServiceCard s={s} />
            </Reveal>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center">
          <Button asChild variant="hero" size="xl">
            <Link to="/services">
              Lihat Seluruh Layanan & Paket <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Menampilkan {displayServices.length} dari {services.length} layanan yang tersedia
          </p>
        </div>
        {site.settings?.pricing_note && (
          <p className="mt-8 text-center text-sm text-muted-foreground">* {site.settings.pricing_note}</p>
        )}
      </section>

      {/* ABOUT */}
      {about && (
        <section className="bg-ink-gradient text-ink-foreground">
          <div className="container-x grid gap-14 py-24 md:py-32 lg:grid-cols-2">
            <Reveal>
              <p className="eyebrow">About RRW</p>
              <h2 className="mt-5 text-3xl font-semibold leading-tight md:text-5xl">{about.heading}</h2>
              <p className="mt-6 text-lg leading-relaxed text-ink-muted">{about.intro}</p>
              <Button asChild variant="hero" size="xl" className="mt-8">
                <Link to="/about">Tentang kami <ArrowRight /></Link>
              </Button>
            </Reveal>
            <ul className="grid gap-px overflow-hidden rounded-2xl border border-ink-foreground/10 bg-ink-foreground/10">
              {about.highlights.map((h, i) => (
                <Reveal as="li" key={h.title} delay={i * 60} className="flex gap-5 bg-ink p-6">
                  <span className="font-display text-sm text-primary">0{i + 1}</span>
                  <div>
                    <h3 className="font-semibold">{h.title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{h.description}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* PORTFOLIO */}
      {portfolio.length > 0 && (
        <section className="container-x py-24 md:py-32">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Portfolio" title="Project pilihan." description="Beberapa karya yang telah kami bangun bersama klien." />
            <Button asChild variant="heroOutline" size="xl" className="self-start md:self-auto">
              <Link to="/portfolio">Lihat semua <ArrowUpRight /></Link>
            </Button>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {portfolio.slice(0, 3).map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <PortfolioCard p={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* PROCESS */}
      <section className="border-t bg-surface">
        <div className="container-x py-24 md:py-32">
          <SectionHeading eyebrow="Process" title="Proses yang jelas, hasil yang terukur." description="Enam tahapan terstruktur dari diskusi pertama hingga website Anda online." />
          <div className="mt-14">
            <ProcessGrid steps={steps} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x grid gap-12 py-24 md:py-32 lg:grid-cols-[1fr_1.5fr]">
        <SectionHeading eyebrow="FAQ" title="Pertanyaan yang sering diajukan." description="Belum menemukan jawaban? Hubungi kami langsung." />
        <Reveal>
          <FaqList faqs={faqs.slice(0, 6)} />
        </Reveal>
      </section>

      <CtaBand whatsapp={site.settings?.whatsapp} />
    </>
  );
}
