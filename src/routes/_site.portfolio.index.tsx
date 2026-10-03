import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHero, Reveal } from "@/components/site/Reveal";
import { PortfolioCard } from "@/components/site/Cards";
import { CtaBand } from "@/components/site/Blocks";
import { portfolioQuery, siteQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/portfolio/")({
  loader: ({ context: { queryClient: q } }) => Promise.all([q.ensureQueryData(portfolioQuery), q.ensureQueryData(siteQuery)]),
  head: () =>
    pageMeta({
      title: "Portfolio — Karya RRW",
      description: "Kumpulan project website dan aplikasi web yang telah dibangun oleh RRW.",
      path: "/portfolio",
    }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { data } = useSuspenseQuery(portfolioQuery);
  const { data: site } = useSuspenseQuery(siteQuery);
  const cats = useMemo(() => ["Semua", ...Array.from(new Set(data.map((p) => p.category).filter(Boolean) as string[]))], [data]);
  const [cat, setCat] = useState("Semua");
  const list = cat === "Semua" ? data : data.filter((p) => p.category === cat);
  return (
    <>
      <PageHero eyebrow="Portfolio" title="Karya yang kami bangun." description="Website dan aplikasi yang membantu klien tampil lebih profesional dan bekerja lebih efisien." />
      <section className="container-x py-16 md:py-20">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                cat === c ? "border-foreground bg-foreground text-background" : "bg-card hover:border-foreground/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 80}>
              <PortfolioCard p={p} />
            </Reveal>
          ))}
        </div>
        {list.length === 0 && <p className="py-20 text-center text-muted-foreground">Belum ada project.</p>}
      </section>
      <CtaBand whatsapp={site.settings?.whatsapp} />
    </>
  );
}
