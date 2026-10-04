import { createFileRoute } from "@tanstack/react-router";
import { SingletonEditor } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/_authenticated/admin/hero")({
  component: () => (
    <SingletonEditor
      table="hero_content"
      title="Hero"
      description="Bagian utama di halaman beranda."
      fields={[
        { name: "eyebrow", label: "Label kecil", type: "text" },
        { name: "headline", label: "Headline", type: "text", required: true },
        { name: "subheadline", label: "Supporting text", type: "textarea" },
        { name: "primary_cta_label", label: "Tombol utama — teks", type: "text" },
        { name: "primary_cta_url", label: "Tombol utama — link", type: "text" },
        { name: "secondary_cta_label", label: "Tombol kedua — teks", type: "text" },
        { name: "secondary_cta_url", label: "Tombol kedua — link", type: "text" },
      ]}
    />
  ),
});
