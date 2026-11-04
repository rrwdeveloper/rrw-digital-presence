import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, SingletonEditor, StatusPill } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/_authenticated/admin/team")({
  component: AdminTeamPage,
});

function AdminTeamPage() {
  return (
    <div className="space-y-12">
      <SingletonEditor
        table="about_content"
        title="Halaman Team"
        description="Judul, cerita, dan perjalanan yang tampil di halaman Team."
        fields={[
          { name: "team_heading", label: "Judul", type: "text", required: true, full: true },
          { name: "team_intro", label: "Intro", type: "textarea" },
          { name: "team_story", label: "Cerita (mendukung ## judul dan - daftar)", type: "markdown" },
          { name: "team_milestones", label: "Perjalanan", type: "pairs", help: "Satu per baris: Judul | Deskripsi" },
        ]}
      />
      <CrudManager
        table="team_members"
        title="Anggota Tim"
        sortable
        defaults={{ name: "", initial: "", role: "", bio: "", photo_url: null, instagram: "", active: true }}
        fields={[
          { name: "name", label: "Nama", type: "text", required: true },
          { name: "initial", label: "Huruf (untuk singkatan RRW)", type: "text", required: true },
          { name: "role", label: "Peran", type: "text" },
          { name: "instagram", label: "Instagram", type: "text", help: "Contoh: @username" },
          { name: "bio", label: "Bio singkat", type: "textarea" },
          { name: "photo_url", label: "Foto", type: "image" },
          { name: "active", label: "Tampilkan", type: "boolean" },
        ]}
        columns={[
          { key: "initial", label: "Huruf", render: (r) => <span className="font-display text-lg font-bold text-primary">{r.initial}</span> },
          { key: "name", label: "Nama", render: (r) => <span className="font-medium">{r.name}</span> },
          { key: "role", label: "Peran", render: (r) => r.role },
          { key: "active", label: "Status", render: (r) => <StatusPill on={r.active} /> },
        ]}
      />
    </div>
  );
}
