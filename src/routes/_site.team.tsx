import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Instagram } from "lucide-react";
import { PageHero, Reveal, SectionHeading } from "@/components/site/Reveal";
import { CtaBand, Markdown } from "@/components/site/Blocks";
import { siteQuery, teamQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/format";

export const Route = createFileRoute("/_site/team")({
  loader: ({ context: { queryClient: q } }) => Promise.all([q.ensureQueryData(teamQuery), q.ensureQueryData(siteQuery)]),
  head: () =>
    pageMeta({
      title: "Tim di Balik RRW — Reyvanzi, Rifki & Wira",
      description:
        "RRW adalah singkatan dari nama kami: Reyvanzi, Rifki, dan Wira — sahabat sejak sekolah dasar yang kini sama-sama kuliah di Universitas Gunadarma.",
      path: "/team",
    }),
  component: TeamPage,
});

function TeamPage() {
  const { data: team } = useSuspenseQuery(teamQuery);
  const { data: site } = useSuspenseQuery(siteQuery);
  const a = site.about;
  const milestones = a?.team_milestones ?? [];

  return (
    <>
      <PageHero eyebrow="Team" title={a?.team_heading ?? "Tim di balik RRW"} description={a?.team_intro} />

      {/* Acronym: each member is one letter of the brand */}
      <section className="container-x py-20 md:py-24">
        <ul className="grid gap-px overflow-hidden rounded-3xl border bg-border md:grid-cols-3">
          {team.map((m, i) => (
            <Reveal as="li" key={m.id} delay={i * 80} className="group relative flex flex-col bg-card p-8 md:p-10">
              <div className="flex items-start justify-between gap-4">
                <span
                  aria-hidden
                  className="font-display text-[7rem] font-bold italic leading-none tracking-tighter text-primary transition-transform duration-500 group-hover:-translate-y-1 md:text-[9rem]"
                >
                  {m.initial}
                </span>
                {m.photo_url && (
                  <img
                    src={m.photo_url}
                    alt={m.name}
                    width={96}
                    height={96}
                    loading="lazy"
                    className="h-20 w-20 rounded-2xl border object-cover shadow-soft md:h-24 md:w-24"
                  />
                )}
              </div>
              <h2 className="mt-8 text-2xl font-semibold md:text-3xl">{m.name}</h2>
              {m.role && <p className="mt-1 text-sm font-medium uppercase tracking-widest text-muted-foreground">{m.role}</p>}
              {m.bio && <p className="mt-4 leading-relaxed text-muted-foreground">{m.bio}</p>}
              {m.instagram && (
                <a
                  href={`https://instagram.com/${m.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  <Instagram className="h-4 w-4" /> {m.instagram.startsWith("@") ? m.instagram : `@${m.instagram}`}
                </a>
              )}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Story + timeline */}
      <section className="border-y bg-muted/40">
        <div className="container-x grid gap-14 py-20 md:py-24 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <Markdown content={a?.team_story} />
          </Reveal>
          {milestones.length > 0 && (
            <div>
              <SectionHeading eyebrow="Perjalanan" title="Dari teman kecil jadi satu tim." />
              <ol className="relative mt-10 space-y-8 border-l pl-8">
                {milestones.map((ms, i) => (
                  <Reveal as="li" key={ms.title} delay={i * 70} className="relative">
                    <span className="absolute -left-[41px] top-1 grid h-5 w-5 place-items-center rounded-full border-2 border-primary bg-background">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    <h3 className="font-display text-lg font-semibold">{ms.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{ms.description}</p>
                  </Reveal>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      <CtaBand whatsapp={site.settings?.whatsapp} title="Siap bekerja sama dengan kami?" />
    </>
  );
}
