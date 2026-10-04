import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, StatusPill } from "@/components/admin/CrudManager";
import { SERVICE_ICONS } from "@/components/site/ServiceIcon";
import { formatRupiah } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/services")({
  component: () => (
    <CrudManager
      table="services"
      title="Services"
      description="Layanan, harga mulai dari, dan fitur yang tampil di website."
      sortable
      autoSlugFrom="name"
      defaults={{ name: "", slug: "", price_label: "Mulai dari", starting_price: 0, icon: "Layers", features: [], suitable_for: [], benefits: [], active: true, featured: false }}
      fields={[
        { name: "name", label: "Nama", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text", required: true },
        { name: "starting_price", label: "Harga mulai (Rp)", type: "number", required: true },
        { name: "price_label", label: "Label harga", type: "text", required: true },
        { name: "price_suffix", label: "Suffix harga", type: "text", help: "Contoh: +" },
        { name: "icon", label: "Ikon", type: "select", required: true, options: Object.keys(SERVICE_ICONS).map((k) => ({ value: k, label: k })) },
        { name: "short_description", label: "Deskripsi singkat", type: "textarea" },
        { name: "full_description", label: "Deskripsi lengkap", type: "textarea" },
        { name: "features", label: "Fitur", type: "list", help: "Satu fitur per baris" },
        { name: "suitable_for", label: "Cocok untuk", type: "list", help: "Satu per baris" },
        { name: "benefits", label: "Manfaat", type: "list", help: "Satu per baris" },
        { name: "featured", label: "Featured", type: "boolean" },
        { name: "active", label: "Aktif", type: "boolean" },
      ]}
      columns={[
        { key: "name", label: "Nama", render: (r) => <span className="font-medium">{r.name}</span> },
        { key: "starting_price", label: "Harga", render: (r) => formatRupiah(r.starting_price) + (r.price_suffix ?? "") },
        { key: "featured", label: "Featured", render: (r) => (r.featured ? "★" : ""), className: "hidden md:table-cell" },
        { key: "active", label: "Status", render: (r) => <StatusPill on={r.active} /> },
      ]}
    />
  ),
});
