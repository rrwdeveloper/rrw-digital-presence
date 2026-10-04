import { createFileRoute } from "@tanstack/react-router";
import { SingletonEditor } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/_authenticated/admin/about")({
  component: () => (
    <SingletonEditor
      table="about_content"
      title="About"
      fields={[
        { name: "heading", label: "Heading", type: "text", required: true, full: true },
        { name: "intro", label: "Intro", type: "textarea" },
        { name: "body", label: "Isi (mendukung ## judul dan - daftar)", type: "markdown" },
        { name: "highlights", label: "Highlights", type: "pairs", help: "Satu per baris: Judul | Deskripsi" },
      ]}
    />
  ),
});
