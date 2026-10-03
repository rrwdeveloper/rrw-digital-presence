import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/Reveal";
import { CtaBand, FaqList } from "@/components/site/Blocks";
import { faqQuery, siteQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/format";

export const Route = createFileRoute("/_site/faq")({
  loader: ({ context: { queryClient: q } }) => Promise.all([q.ensureQueryData(faqQuery), q.ensureQueryData(siteQuery)]),
  head: ({ loaderData }) => ({
    ...pageMeta({
      title: "FAQ — Pertanyaan Seputar Jasa Website RRW",
      description: "Jawaban atas pertanyaan umum: durasi pengerjaan, domain & hosting, CMS, maintenance, dan fitur custom.",
      path: "/faq",
    }),
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: loaderData[0].map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            }),
          },
        ]
      : [],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { data: faqs } = useSuspenseQuery(faqQuery);
  const { data: site } = useSuspenseQuery(siteQuery);
  return (
    <>
      <PageHero eyebrow="FAQ" title="Pertanyaan yang sering diajukan." />
      <section className="container-x max-w-4xl py-16 md:py-20">
        <FaqList faqs={faqs} />
      </section>
      <CtaBand whatsapp={site.settings?.whatsapp} />
    </>
  );
}
