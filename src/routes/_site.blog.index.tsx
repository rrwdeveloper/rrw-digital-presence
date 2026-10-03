import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHero, Reveal } from "@/components/site/Reveal";
import { ProjectThumb } from "@/components/site/Cards";
import { blogQuery } from "@/lib/queries";
import { formatDate, pageMeta } from "@/lib/format";

export const Route = createFileRoute("/_site/blog/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(blogQuery),
  head: () =>
    pageMeta({
      title: "Blog — Insight Website & Bisnis Digital | RRW",
      description: "Artikel seputar website, pengembangan aplikasi web, dan strategi bisnis digital dari tim RRW.",
      path: "/blog",
    }),
  component: BlogPage,
});

function BlogPage() {
  const { data: posts } = useSuspenseQuery(blogQuery);
  return (
    <>
      <PageHero eyebrow="Blog" title="Insight seputar website & bisnis digital." />
      <section className="container-x py-16 md:py-20">
        {posts.length === 0 && <p className="py-20 text-center text-muted-foreground">Belum ada artikel.</p>}
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal as="article" key={p.id} delay={(i % 3) * 80}>
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="group block">
                <div className="aspect-[16/10] overflow-hidden rounded-2xl border">
                  <div className="h-full transition-transform duration-700 group-hover:scale-[1.04]">
                    <ProjectThumb p={{ thumbnail_url: p.thumbnail_url, title: p.title, category: p.blog_categories?.name ?? "Artikel" }} />
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
                  {p.blog_categories && <span className="font-semibold uppercase tracking-widest text-primary">{p.blog_categories.name}</span>}
                  <span>{formatDate(p.published_at)}</span>
                </div>
                <h2 className="mt-2 text-xl font-semibold leading-snug transition-colors group-hover:text-primary">{p.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
