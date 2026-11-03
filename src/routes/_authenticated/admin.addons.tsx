import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, StatusPill } from "@/components/admin/CrudManager";
import { SERVICE_ICONS } from "@/components/site/ServiceIcon";
import { formatRupiah } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/addons")({
  component: () => (
    <CrudManager
      table="addons"
      title="Add-ons"
      description="Layanan tambahan (domain, hosting, maintenance, dll.) yang tampil di halaman Layanan."
      sortable
      defaults={{ name: "", description: "", price: 0, price_label: "Mulai dari", icon: "Puzzle", active: true }}
      fields={[
        { name: "name", label: "Nama", type: "text", required: true },
        { name: "icon", label: "Ikon", type: "select", required: true, options: Object.keys(SERVICE_ICONS).map((k) => ({ value: k, label: k })) },
        { name: "price", label: "Harga mulai (Rp)", type: "number", help: "Isi 0 jika tidak ingin menampilkan harga" },
        { name: "price_label", label: "Label harga", type: "text", required: true },
        { name: "price_suffix", label: "Suffix harga", type: "text", help: "Contoh: / tahun" },
        { name: "description", label: "Deskripsi", type: "textarea" },
        { name: "active", label: "Aktif", type: "boolean" },
      ]}
      columns={[
        { key: "name", label: "Nama", render: (r) => <span className="font-medium">{r.name}</span> },
        {
          key: "price",
          label: "Harga",
          render: (r) => (r.price > 0 ? `${formatRupiah(r.price)}${r.price_suffix ? " " + r.price_suffix : ""}` : "—"),
        },
        { key: "active", label: "Status", render: (r) => <StatusPill on={r.active} /> },
      ]}
    />
  ),
});
