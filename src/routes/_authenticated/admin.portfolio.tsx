import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, StatusPill } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/_authenticated/admin/portfolio")({
  component: () => (
    <CrudManager
      table="portfolio"
      title="Portfolio"
      sortable
      autoSlugFrom="title"
      defaults={{ title: "", slug: "", technologies: [], gallery_images: [], published: true, featured: false }}
      fields={[
        { name: "title", label: "Judul", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text", required: true },
        { name: "category", label: "Kategori", type: "text" },
        { name: "client", label: "Client", type: "text" },
        { name: "project_url", label: "URL project", type: "text", full: true },
        { name: "thumbnail_url", label: "Thumbnail", type: "image", full: true },
        { name: "description", label: "Deskripsi singkat", type: "textarea" },
        { name: "content", label: "Detail (## judul, - daftar)", type: "markdown" },
        { name: "technologies", label: "Teknologi", type: "list", help: "Satu per baris" },
        { name: "gallery_images", label: "Galeri", type: "images" },
        { name: "featured", label: "Featured", type: "boolean" },
        { name: "published", label: "Published", type: "boolean" },
      ]}
      columns={[
        { key: "title", label: "Judul", render: (r) => <span className="font-medium">{r.title}</span> },
        { key: "category", label: "Kategori", className: "hidden md:table-cell" },
        { key: "published", label: "Status", render: (r) => <StatusPill on={r.published} onLabel="Published" offLabel="Draft" /> },
      ]}
    />
  ),
});
