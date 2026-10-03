import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { PriceTag } from "@/components/site/Cards";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { CtaBand, FaqList, ProcessGrid } from "@/components/site/Blocks";
import { faqQuery, processQuery, serviceQuery, siteQuery } from "@/lib/queries";
import { formatRupiah, pageMeta } from "@/lib/format";

export const Route = createFileRoute("/_site/services/$slug")({
  loader: async ({ context: { queryClient: q }, params }) => {
    const s = await q.ensureQueryData(serviceQuery(params.slug));
    if (!s) throw notFound();
    await Promise.all([q.ensureQueryData(processQuery), q.ensureQueryData(faqQuery), q.ensureQueryData(siteQuery)]);
    return { name: s.name, desc: s.short_description, price: s.starting_price, suffix: s.price_suffix };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Layanan tidak ditemukan — RRW" }, { name: "robots", content: "noindex" }] };
    const base = pageMeta({
      title: `${loaderData.name} — Mulai ${formatRupiah(loaderData.price)}${loaderData.suffix ?? ""} | RRW`,
      description: loaderData.desc ?? `Layanan ${loaderData.name} dari RRW.`,
      path: `/services/${params.slug}`,
    });
    return {
      ...base,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: loaderData.name,
            provider: { "@type": "Organization", name: "RRW" },
            offers: { "@type": "Offer", priceCurrency: "IDR", price: loaderData.price },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-x py-40 text-center">
      <h1 className="text-3xl font-semibold">Layanan tidak ditemukan</h1>
      <Link to="/services" className="mt-4 inline-block text-primary">Lihat semua layanan</Link>
    </div>
  ),
  errorComponent: () => <div className="container-x py-40 text-center">Gagal memuat layanan.</div>,
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { data: s } = useSuspenseQuery(serviceQuery(slug));
  const { data: steps } = useSuspenseQuery(processQuery);
  const { data: faqs } = useSuspenseQuery(faqQuery);
  const { data: site } = useSuspenseQuery(siteQuery);
  if (!s) return null;

  return (
    <>
      <section className="relative overflow-hidden border-b bg-hero">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="container-x relative grid gap-12 pb-16 pt-28 md:pt-36 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <Link to="/services" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Semua layanan
            </Link>
            <span className="mt-8 grid h-14 w-14 animate-fade-up place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <ServiceIcon name={s.icon} className="h-6 w-6" />
            </span>
            <h1 className="mt-6 animate-fade-up text-4xl font-semibold leading-tight md:text-6xl">{s.name}</h1>
            <p className="mt-5 max-w-2xl animate-fade-up text-lg leading-relaxed text-muted-foreground">{s.full_description}</p>
          </div>
          <div className="animate-fade-up rounded-2xl border bg-card p-7 shadow-elevated">
            <PriceTag s={s} large />
            <p className="mt-3 text-sm text-muted-foreground">{site.settings?.pricing_note}</p>
            <Button asChild variant="hero" size="xl" className="mt-6 w-full">
              <Link to="/contact">Konsultasikan Project Anda <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-12 py-20 md:py-24 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <h2 className="text-2xl font-semibold md:text-3xl">Yang Anda dapatkan</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {s.features.map((f) => (
              <li key={f} className="flex items-start gap-3 rounded-xl border bg-card p-4 text-sm">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-primary">
                  <Check className="h-3 w-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </Reveal>
        <div className="space-y-6">
          {s.suitable_for.length > 0 && (
            <Reveal className="rounded-2xl border bg-card p-7">
              <h2 className="text-lg font-semibold">Cocok untuk</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.suitable_for.map((x) => (
                  <span key={x} className="rounded-full bg-secondary px-3 py-1 text-sm">{x}</span>
                ))}
              </div>
            </Reveal>
          )}
          {s.benefits.length > 0 && (
            <Reveal delay={80} className="rounded-2xl bg-ink-gradient p-7 text-ink-foreground">
              <h2 className="text-lg font-semibold">Manfaat</h2>
              <ul className="mt-4 space-y-3">
                {s.benefits.map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-ink-muted">
                    <Sparkles className="h-4 w-4 shrink-0 text-primary" /> {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </section>

      <section className="border-t bg-surface">
        <div className="container-x py-20 md:py-24">
          <h2 className="text-2xl font-semibold md:text-3xl">Proses pengembangan</h2>
          <div className="mt-10"><ProcessGrid steps={steps} /></div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="container-x max-w-4xl py-20 md:py-24">
          <h2 className="mb-8 text-2xl font-semibold md:text-3xl">FAQ</h2>
          <FaqList faqs={faqs} />
        </section>
      )}

      <CtaBand whatsapp={site.settings?.whatsapp} title="Konsultasikan project Anda." />
    </>
  );
}
