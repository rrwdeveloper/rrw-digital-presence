import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/Reveal";
import { CtaBand, ProcessGrid } from "@/components/site/Blocks";
import { processQuery, siteQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/format";

export const Route = createFileRoute("/_site/process")({
  loader: ({ context: { queryClient: q } }) => Promise.all([q.ensureQueryData(processQuery), q.ensureQueryData(siteQuery)]),
  head: () =>
    pageMeta({
      title: "Proses Pengembangan — RRW",
      description: "Discover, Plan, Design, Develop, Test, Launch — alur kerja terstruktur RRW dalam membangun website dan aplikasi web.",
      path: "/process",
    }),
  component: ProcessPage,
});

function ProcessPage() {
  const { data: steps } = useSuspenseQuery(processQuery);
  const { data: site } = useSuspenseQuery(siteQuery);
  return (
    <>
      <PageHero eyebrow="Process" title="Dari ide hingga online, langkah demi langkah." description="Proses yang transparan membuat Anda selalu tahu posisi project dan apa yang terjadi berikutnya." />
      <section className="container-x py-20 md:py-24">
        <ProcessGrid steps={steps} />
      </section>
      <CtaBand whatsapp={site.settings?.whatsapp} />
    </>
  );
}
