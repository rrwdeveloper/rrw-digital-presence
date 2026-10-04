import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: () => (
    <CrudManager
      table="blog_categories"
      title="Blog Categories"
      orderBy="name"
      autoSlugFrom="name"
      defaults={{ name: "", slug: "" }}
      fields={[
        { name: "name", label: "Nama", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text", required: true },
      ]}
      columns={[
        { key: "name", label: "Nama", render: (r) => <span className="font-medium">{r.name}</span> },
        { key: "slug", label: "Slug" },
      ]}
    />
  ),
});
