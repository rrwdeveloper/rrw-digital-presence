import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, StatusPill } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/_authenticated/admin/process")({
  component: () => (
    <CrudManager
      table="process_steps"
      title="Process"
      sortable
      defaults={{ step_number: "", title: "", description: "", active: true }}
      fields={[
        { name: "step_number", label: "Nomor", type: "text", required: true },
        { name: "title", label: "Judul", type: "text", required: true },
        { name: "description", label: "Deskripsi", type: "textarea" },
        { name: "active", label: "Aktif", type: "boolean" },
      ]}
      columns={[
        { key: "step_number", label: "#" },
        { key: "title", label: "Judul", render: (r) => <span className="font-medium">{r.title}</span> },
        { key: "active", label: "Status", render: (r) => <StatusPill on={r.active} /> },
      ]}
    />
  ),
});
