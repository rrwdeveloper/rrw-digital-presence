import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Instagram, Mail, MessageCircle, MapPin } from "lucide-react";
import { PageHero, Reveal } from "@/components/site/Reveal";
import { InquiryForm } from "@/components/site/InquiryForm";
import { siteQuery } from "@/lib/queries";
import { pageMeta, waLink } from "@/lib/format";

export const Route = createFileRoute("/_site/contact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQuery),
  head: () =>
    pageMeta({
      title: "Kontak & Konsultasi Gratis — RRW",
      description: "Have a project in mind? Hubungi RRW via WhatsApp, email, atau kirim inquiry project untuk konsultasi gratis.",
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  const { data } = useSuspenseQuery(siteQuery);
  const s = data.settings;
  const items = [
    s?.whatsapp && { icon: MessageCircle, label: "WhatsApp", value: "+" + s.whatsapp.replace(/\D/g, ""), href: waLink(s.whatsapp, "Halo RRW, saya ingin konsultasi project.") },
    s?.email && { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
    s?.instagram && { icon: Instagram, label: "Instagram", value: "@" + s.instagram.replace("@", ""), href: `https://instagram.com/${s.instagram.replace("@", "")}` },
    s?.address && { icon: MapPin, label: "Lokasi", value: s.address, href: undefined },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];

  return (
    <>
      <PageHero eyebrow="Contact" title="Have a project in mind?" description="Let's build something great together. Konsultasi awal gratis, tanpa komitmen." />
      <section className="container-x grid gap-10 py-16 md:py-20 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-3">
          {items.map((it, i) => (
            <Reveal key={it.label} delay={i * 60}>
              {it.href ? (
                <a href={it.href} target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary"><it.icon className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{it.label}</p>
                    <p className="truncate font-semibold group-hover:text-primary">{it.value}</p>
                  </div>
                </a>
              ) : (
                <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary"><it.icon className="h-5 w-5" /></span>
                  <div><p className="text-xs text-muted-foreground">{it.label}</p><p className="font-semibold">{it.value}</p></div>
                </div>
              )}
            </Reveal>
          ))}
          {s?.pricing_note && <p className="pt-3 text-sm text-muted-foreground">{s.pricing_note}</p>}
        </div>
        <Reveal>
          <InquiryForm />
        </Reveal>
      </section>
    </>
  );
}
