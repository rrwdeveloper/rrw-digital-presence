import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Globe, Server, Wrench, Puzzle, Plug } from "lucide-react";
import { PageHero, Reveal, SectionHeading } from "@/components/site/Reveal";
import { ServiceCard } from "@/components/site/Cards";
import { CtaBand } from "@/components/site/Blocks";
import { servicesQuery, siteQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/format";

export const Route = createFileRoute("/_site/services/")({
  loader: ({ context: { queryClient: q } }) => Promise.all([q.ensureQueryData(servicesQuery), q.ensureQueryData(siteQuery)]),
  head: () =>
    pageMeta({
      title: "Layanan & Harga — RRW",
      description: "Landing page, company profile, CMS, toko online, dan aplikasi web custom. Lihat harga mulai dari dan fitur setiap layanan RRW.",
      path: "/services",
    }),
  component: ServicesPage,
});

const ADDONS = [
  { icon: Globe, title: "Domain", text: "Pendaftaran dan pengelolaan nama domain." },
  { icon: Server, title: "Hosting", text: "Hosting yang cepat dan stabil sesuai kebutuhan." },
  { icon: Wrench, title: "Maintenance", text: "Pembaruan, perbaikan, dan dukungan teknis berkala." },
  { icon: Puzzle, title: "Fitur Tambahan", text: "Fitur di luar scope paket sesuai kebutuhan." },
  { icon: Plug, title: "Integrasi Custom", text: "Payment gateway, API pihak ketiga, dan lainnya." },
];

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: site } = useSuspenseQuery(siteQuery);
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
      <section className="border-t bg-surface">
        <div className="container-x py-20 md:py-24">
          <SectionHeading
            eyebrow="Add-ons"
            title="Layanan tambahan (opsional)."
            description="Domain dan hosting tidak otomatis termasuk dalam paket, dan dapat ditambahkan sesuai kebutuhan."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ADDONS.map((a, i) => (
              <Reveal key={a.title} delay={i * 60} className="rounded-2xl border bg-card p-6">
                <a.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-semibold">{a.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{a.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CtaBand whatsapp={site.settings?.whatsapp} />
    </>
  );
}
