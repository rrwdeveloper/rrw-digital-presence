import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CrudManager, StatusPill } from "@/components/admin/CrudManager";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  component: BlogAdmin,
});

function BlogAdmin() {
  const { data: cats = [] } = useQuery({
    queryKey: ["admin", "blog_categories"],
    queryFn: async () => (await supabase.from("blog_categories").select("*").order("name")).data ?? [],
  });
  return (
    <CrudManager
      table="blog_posts"
      title="Articles"
      orderBy="created_at"
      ascending={false}
      select="*,blog_categories(name)"
      autoSlugFrom="title"
      defaults={{ title: "", slug: "", tags: [], author: "RRW", published: false }}
      onBeforeSave={(v) => (v.published && !v.published_at ? { ...v, published_at: new Date().toISOString() } : v)}
      fields={[
        { name: "title", label: "Judul", type: "text", required: true, full: true },
        { name: "slug", label: "Slug", type: "text", required: true },
        { name: "category_id", label: "Kategori", type: "select", options: cats.map((c) => ({ value: c.id, label: c.name })) },
        { name: "author", label: "Author", type: "text", required: true },
        { name: "published_at", label: "Tanggal publish", type: "datetime" },
        { name: "thumbnail_url", label: "Thumbnail", type: "image", full: true },
        { name: "excerpt", label: "Excerpt", type: "textarea" },
        { name: "content", label: "Konten (## judul, ### sub-judul, - daftar)", type: "markdown" },
        { name: "tags", label: "Tags", type: "list", help: "Satu tag per baris" },
        { name: "seo_title", label: "SEO title", type: "text" },
        { name: "seo_description", label: "SEO description", type: "text" },
        { name: "published", label: "Published", type: "boolean" },
      ]}
      columns={[
        { key: "title", label: "Judul", render: (r) => <span className="font-medium">{r.title}</span> },
        { key: "category", label: "Kategori", render: (r) => r.blog_categories?.name ?? "—", className: "hidden md:table-cell" },
        { key: "published_at", label: "Tanggal", render: (r) => formatDate(r.published_at), className: "hidden md:table-cell" },
        { key: "published", label: "Status", render: (r) => <StatusPill on={r.published} onLabel="Published" offLabel="Draft" /> },
      ]}
    />
  );
}
