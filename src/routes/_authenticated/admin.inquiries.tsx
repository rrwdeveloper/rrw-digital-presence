import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Mail, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/CrudManager";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INQUIRY_STATUSES, formatDate, waLink } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  component: Inquiries,
});

function Inquiries() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const list = filter === "all" ? data : data.filter((i) => i.status === filter);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status diperbarui");
    qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  }
  async function remove(id: string) {
    if (!confirm("Hapus inquiry ini?")) return;
    await supabase.from("inquiries").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  }

  return (
    <div>
      <AdminPageHeader title="Inquiries" description="Permintaan project yang masuk dari formulir kontak." />
      <div className="mb-5 flex flex-wrap gap-2">
        {[{ value: "all", label: "Semua" }, ...INQUIRY_STATUSES].map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={cn("rounded-full border px-3 py-1 text-xs font-medium", filter === s.value ? "border-primary bg-primary text-primary-foreground" : "bg-card")}
          >
            {s.label} {s.value !== "all" && `(${data.filter((i) => i.status === s.value).length})`}
          </button>
        ))}
      </div>
      {isLoading && <Loader2 className="animate-spin text-muted-foreground" />}
      {!isLoading && list.length === 0 && <p className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">Tidak ada inquiry.</p>}
      <div className="space-y-3">
        {list.map((i) => (
          <article key={i.id} className="rounded-xl border bg-card p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{i.name}</h2>
                  {i.status === "new" && <span className="rounded-full bg-primary px-2 text-[11px] font-semibold text-primary-foreground">NEW</span>}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(i.created_at)} · {i.project_type} · {i.budget_range}</p>
                <p className="mt-3 whitespace-pre-line text-sm">{i.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 hover:border-primary"><Mail className="h-3 w-3" /> {i.email}</a>
                  {i.whatsapp && <a href={waLink(i.whatsapp)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 hover:border-primary"><MessageCircle className="h-3 w-3" /> {i.whatsapp}</a>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Select value={i.status} onValueChange={(v) => setStatus(i.id, v)}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>{INQUIRY_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(i.id)} aria-label="Hapus"><Trash2 /></Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
