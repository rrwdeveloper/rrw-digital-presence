import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { CtaBand, Markdown } from "@/components/site/Blocks";
import { blogPostQuery, siteQuery } from "@/lib/queries";
import { formatDate, pageMeta } from "@/lib/format";

export const Route = createFileRoute("/_site/blog/$slug")({
  loader: async ({ context: { queryClient: q }, params }) => {
    const p = await q.ensureQueryData(blogPostQuery(params.slug));
    if (!p) throw notFound();
    await q.ensureQueryData(siteQuery);
    return {
      title: p.seo_title || p.title,
      desc: p.seo_description || p.excerpt || p.title,
      image: p.thumbnail_url,
      date: p.published_at,
      author: p.author,
      headline: p.title,
    };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Artikel tidak ditemukan — RRW" }, { name: "robots", content: "noindex" }] };
    return {
      ...pageMeta({ title: `${loaderData.title} | RRW Blog`, description: loaderData.desc, path: `/blog/${params.slug}`, image: loaderData.image, type: "article" }),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: loaderData.headline,
            datePublished: loaderData.date,
            author: { "@type": "Organization", name: loaderData.author },
            ...(loaderData.image ? { image: loaderData.image } : {}),
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-x py-40 text-center">
      <h1 className="text-3xl font-semibold">Artikel tidak ditemukan</h1>
      <Link to="/blog" className="mt-4 inline-block text-primary">Kembali ke blog</Link>
    </div>
  ),
  errorComponent: () => <div className="container-x py-40 text-center">Gagal memuat artikel.</div>,
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(blogPostQuery(slug));
  const { data: site } = useSuspenseQuery(siteQuery);
  if (!p) return null;
  return (
    <>
      <article className="container-x max-w-3xl pb-10 pt-28 md:pt-36">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Blog
        </Link>
        <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
          {p.blog_categories && <span className="font-semibold uppercase tracking-widest text-primary">{p.blog_categories.name}</span>}
          <span>{formatDate(p.published_at)}</span>
          <span>· {p.author}</span>
        </div>
        <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">{p.title}</h1>
        {p.excerpt && <p className="mt-5 text-xl leading-relaxed text-muted-foreground">{p.excerpt}</p>}
        {p.thumbnail_url && (
          <img src={p.thumbnail_url} alt={p.title} className="mt-10 w-full rounded-2xl border object-cover" />
        )}
        <div className="mt-10">
          <Markdown content={p.content} />
        </div>
        {p.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t pt-6">
            {p.tags.map((t) => <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs">#{t}</span>)}
          </div>
        )}
      </article>
      <CtaBand whatsapp={site.settings?.whatsapp} />
    </>
  );
}
