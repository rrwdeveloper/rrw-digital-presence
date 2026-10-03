import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero, Reveal } from "@/components/site/Reveal";
import { CtaBand, Markdown } from "@/components/site/Blocks";
import { siteQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/format";

export const Route = createFileRoute("/_site/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQuery),
  head: () =>
    pageMeta({
      title: "Tentang RRW — Web Development Studio",
      description: "RRW membantu bisnis dan organisasi membangun kehadiran digital modern melalui website profesional dan aplikasi web custom.",
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  const { data } = useSuspenseQuery(siteQuery);
  const a = data.about;
  return (
    <>
      <PageHero eyebrow="About" title={a?.heading ?? "About RRW"} description={a?.intro} />
      <section className="container-x grid gap-14 py-20 md:py-24 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <Markdown content={a?.body} />
        </Reveal>
        <ul className="grid gap-4 sm:grid-cols-2">
          {a?.highlights.map((h, i) => (
            <Reveal as="li" key={h.title} delay={i * 60} className="rounded-2xl border bg-card p-6 shadow-soft">
              <span className="font-display text-sm font-semibold text-primary">0{i + 1}</span>
              <h2 className="mt-4 text-lg font-semibold">{h.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{h.description}</p>
            </Reveal>
          ))}
        </ul>
      </section>
      <CtaBand whatsapp={data.settings?.whatsapp} />
    </>
  );
}
