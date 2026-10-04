import { createFileRoute } from "@tanstack/react-router";
import { SingletonEditor } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: () => (
    <SingletonEditor
      table="site_settings"
      title="General Settings & Contact"
      description="Nama brand, tagline, kontak, dan media sosial."
      fields={[
        { name: "brand_name", label: "Brand name", type: "text", required: true },
        { name: "tagline", label: "Tagline", type: "text", required: true },
        { name: "whatsapp", label: "WhatsApp", type: "text", help: "Format internasional, contoh 6281234567890" },
        { name: "email", label: "Email", type: "text" },
        { name: "instagram", label: "Instagram username", type: "text" },
        { name: "address", label: "Alamat / lokasi", type: "text" },
        { name: "pricing_note", label: "Catatan harga", type: "textarea" },
        { name: "meta_description", label: "Meta description default", type: "textarea" },
      ]}
    />
  ),
});
