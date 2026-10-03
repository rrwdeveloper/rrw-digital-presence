import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectThumb } from "@/components/site/Cards";
import { CtaBand, Markdown } from "@/components/site/Blocks";
import { Reveal } from "@/components/site/Reveal";
import { portfolioItemQuery, siteQuery } from "@/lib/queries";
import { formatDate, pageMeta } from "@/lib/format";

export const Route = createFileRoute("/_site/portfolio/$slug")({
  loader: async ({ context: { queryClient: q }, params }) => {
    const p = await q.ensureQueryData(portfolioItemQuery(params.slug));
    if (!p) throw notFound();
    await q.ensureQueryData(siteQuery);
    return { title: p.title, desc: p.description, image: p.thumbnail_url };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? pageMeta({
          title: `${loaderData.title} — Portfolio RRW`,
          description: loaderData.desc ?? loaderData.title,
          path: `/portfolio/${params.slug}`,
          image: loaderData.image,
        })
      : { meta: [{ title: "Project tidak ditemukan — RRW" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: () => (
    <div className="container-x py-40 text-center">
      <h1 className="text-3xl font-semibold">Project tidak ditemukan</h1>
      <Link to="/portfolio" className="mt-4 inline-block text-primary">Kembali ke portfolio</Link>
    </div>
  ),
  errorComponent: () => <div className="container-x py-40 text-center">Gagal memuat project.</div>,
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(portfolioItemQuery(slug));
  const { data: site } = useSuspenseQuery(siteQuery);
  if (!p) return null;
  return (
    <>
      <section className="container-x pt-28 md:pt-36">
        <Link to="/portfolio" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Portfolio
        </Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">{p.category}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">{p.title}</h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{p.description}</p>
          </div>
          <dl className="grid grid-cols-2 gap-6 rounded-2xl border bg-card p-6 text-sm">
            {p.client && (<div><dt className="text-muted-foreground">Client</dt><dd className="mt-1 font-semibold">{p.client}</dd></div>)}
            <div><dt className="text-muted-foreground">Tanggal</dt><dd className="mt-1 font-semibold">{formatDate(p.created_at)}</dd></div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Teknologi</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {p.technologies.map((t) => <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{t}</span>)}
              </dd>
            </div>
            {p.project_url && (
              <div className="col-span-2">
                <Button asChild variant="hero" className="w-full">
                  <a href={p.project_url} target="_blank" rel="noreferrer">Kunjungi website <ArrowUpRight /></a>
                </Button>
              </div>
            )}
          </dl>
        </div>
        <div className="mt-12 aspect-[16/9] overflow-hidden rounded-3xl border">
          <ProjectThumb p={p} />
        </div>
      </section>
      <section className="container-x max-w-3xl py-16">
        <Markdown content={p.content} />
      </section>
      {p.gallery_images.length > 0 && (
        <section className="container-x grid gap-5 pb-10 md:grid-cols-2">
          {p.gallery_images.map((src, i) => (
            <Reveal key={src} delay={(i % 2) * 80} className="overflow-hidden rounded-2xl border">
              <img src={src} alt={`${p.title} — gambar ${i + 1}`} loading="lazy" className="w-full object-cover" />
            </Reveal>
          ))}
        </section>
      )}
      <CtaBand whatsapp={site.settings?.whatsapp} />
    </>
  );
}
