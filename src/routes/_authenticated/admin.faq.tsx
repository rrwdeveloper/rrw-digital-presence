import { createFileRoute } from "@tanstack/react-router";
import { CrudManager, StatusPill } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/_authenticated/admin/faq")({
  component: () => (
    <CrudManager
      table="faqs"
      title="FAQ"
      sortable
      defaults={{ question: "", answer: "", active: true }}
      fields={[
        { name: "question", label: "Pertanyaan", type: "text", required: true, full: true },
        { name: "answer", label: "Jawaban", type: "textarea", required: true },
        { name: "active", label: "Aktif", type: "boolean" },
      ]}
      columns={[
        { key: "question", label: "Pertanyaan", render: (r) => <span className="font-medium">{r.question}</span> },
        { key: "active", label: "Status", render: (r) => <StatusPill on={r.active} /> },
      ]}
    />
  ),
});
