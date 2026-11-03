import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero, Reveal, SectionHeading } from "@/components/site/Reveal";
import { ServiceCard } from "@/components/site/Cards";
import { CtaBand } from "@/components/site/Blocks";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { addonsQuery, servicesQuery, siteQuery } from "@/lib/queries";
import { formatRupiah, pageMeta } from "@/lib/format";

export const Route = createFileRoute("/_site/services/")({
  loader: ({ context: { queryClient: q } }) =>
    Promise.all([q.ensureQueryData(servicesQuery), q.ensureQueryData(siteQuery), q.ensureQueryData(addonsQuery)]),
  head: () =>
    pageMeta({
      title: "Layanan & Harga — RRW",
      description: "Landing page, company profile, CMS, toko online, dan aplikasi web custom. Lihat harga mulai dari dan fitur setiap layanan RRW.",
      path: "/services",
    }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: site } = useSuspenseQuery(siteQuery);
  const { data: addons } = useSuspenseQuery(addonsQuery);
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Layanan yang dirancang untuk bertumbuh bersama bisnis Anda."
        description="Setiap harga adalah harga mulai dari. Harga akhir menyesuaikan scope dan kebutuhan project Anda."
      />
      <section className="container-x py-20 md:py-24">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 80} className="h-full">
              <ServiceCard s={s} />
            </Reveal>
          ))}
        </div>
        {site.settings?.pricing_note && (
          <div className="mt-10 rounded-2xl border bg-accent/50 p-5 text-sm text-accent-foreground">
            <strong>Catatan:</strong> {site.settings.pricing_note} Untuk fitur custom di luar paket, silakan konsultasikan dengan kami.
          </div>
        )}
      </section>
      {addons.length > 0 && (
        <section className="border-t bg-surface">
          <div className="container-x py-20 md:py-24">
            <SectionHeading
              eyebrow="Add-ons"
              title="Layanan tambahan (opsional)."
              description="Domain dan hosting tidak otomatis termasuk dalam paket, dan dapat ditambahkan sesuai kebutuhan."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {addons.map((a, i) => (
                <Reveal key={a.id} delay={i * 60} className="flex flex-col rounded-2xl border bg-card p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
                    <ServiceIcon name={a.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{a.name}</h3>
                  {a.description && <p className="mt-1.5 text-sm text-muted-foreground">{a.description}</p>}
                  {a.price > 0 && (
                    <p className="mt-auto pt-4 text-sm">
                      <span className="text-muted-foreground">{a.price_label} </span>
                      <span className="font-semibold text-foreground">{formatRupiah(a.price)}</span>
                      {a.price_suffix && <span className="text-muted-foreground"> {a.price_suffix}</span>}
                    </p>
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand whatsapp={site.settings?.whatsapp} />
    </>
  );
}
