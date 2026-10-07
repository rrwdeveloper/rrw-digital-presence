import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FieldInput, cleanValues, validate, type Field } from "./fields";
import { slugify } from "@/lib/format";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export type Column = { key: string; label: string; render?: (r: Row) => React.ReactNode; className?: string };

export function AdminPageHeader({ title, description, action }: { title: string; description?: string | undefined; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusPill({ on, onLabel = "Aktif", offLabel = "Nonaktif" }: { on: boolean; onLabel?: string; offLabel?: string }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", on ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
      {on ? onLabel : offLabel}
    </span>
  );
}

export function CrudManager({
  table,
  title,
  description,
  fields,
  columns,
  defaults,
  orderBy = "sort_order",
  ascending = true,
  sortable = false,
  select = "*",
  autoSlugFrom,
  onBeforeSave,
}: {
  table: string;
  title: string;
  description?: string | undefined;
  fields: Field[];
  columns: Column[];
  defaults: any;
  orderBy?: string;
  ascending?: boolean;
  sortable?: boolean;
  select?: string;
  autoSlugFrom?: string;
  onBeforeSave?: (v: any) => any;
}) {
  const qc = useQueryClient();
  const key = ["admin", table];
  const { data: rows = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from(table as any) as any).select(select).order(orderBy, { ascending });
      if (error) throw error;
      return data as Row[];
    },
  });
  const [editing, setEditing] = useState<Row | any | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<any>({});

  useEffect(() => {
    if (editing) setValues({ ...editing });
  }, [editing]);

  const isNew = editing && !("id" in editing);
  const set = (k: string, v: unknown) =>
    setValues((prev) => {
      const next = { ...prev, [k]: v };
      if (autoSlugFrom && k === autoSlugFrom && isNew) next.slug = slugify(String(v ?? ""));
      return next;
    });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  async function save() {
    let v = cleanValues(fields, values);
    const err = validate(fields, v);
    if (err) { toast.error(err); return; }
    if (onBeforeSave) v = onBeforeSave(v);
    const payload: any = {};
    for (const f of fields) payload[f.name] = v[f.name];
    if (sortable && isNew) payload.sort_order = (rows.at(-1)?.sort_order ?? 0) + 1;
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = supabase.from(table as any) as any;
    const { error } = isNew ? await q.insert(payload) : await q.update(payload).eq("id", (editing as Row).id);
    setSaving(false);
    if (error) { toast.error(error.message.includes("duplicate") ? "Slug sudah digunakan" : error.message); return; }
    toast.success("Tersimpan");
    setEditing(null);
    refresh();
  }

  async function remove() {
    if (!deleting) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from(table as any) as any).delete().eq("id", deleting.id);
    if (error) toast.error(error.message);
    else toast.success("Dihapus");
    setDeleting(null);
    refresh();
  }

  async function move(i: number, dir: -1 | 1) {
    const a = rows[i];
    const b = rows[i + dir];
    if (!a || !b) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = () => supabase.from(table as any) as any;
    await Promise.all([q().update({ sort_order: b.sort_order }).eq("id", a.id), q().update({ sort_order: a.sort_order }).eq("id", b.id)]);
    refresh();
  }

  return (
    <div>
      <AdminPageHeader
        title={title}
        description={description}
        action={
          <Button onClick={() => setEditing({ ...defaults })}>
            <Plus /> Tambah
          </Button>
        }
      />
      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="grid place-items-center p-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : rows.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">Belum ada data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  {sortable && <th className="w-16 px-4 py-3" />}
                  {columns.map((c) => <th key={c.key} className={cn("px-4 py-3 font-medium", c.className)}>{c.label}</th>)}
                  <th className="w-28 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    {sortable && (
                      <td className="px-2 py-2">
                        <div className="flex">
                          <Button size="icon" variant="ghost" className="h-7 w-7" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Naik"><ArrowUp /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" disabled={i === rows.length - 1} onClick={() => move(i, 1)} aria-label="Turun"><ArrowDown /></Button>
                        </div>
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.key} className={cn("px-4 py-3", c.className)}>{c.render ? c.render(r) : String(r[c.key] ?? "")}</td>
                    ))}
                    <td className="px-4 py-2 text-right">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(r)} aria-label="Edit"><Pencil /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleting(r)} aria-label="Hapus" className="text-destructive"><Trash2 /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? `Tambah ${title}` : `Edit ${title}`}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={cn((f.full || ["textarea", "markdown", "list", "pairs", "images"].includes(f.type)) && "md:col-span-2")}>
                <FieldInput field={f} values={values} set={set} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Batal</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="animate-spin" />} Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data ini?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak bisa dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Edits the single row of a one-row content table (settings, hero, about). */
export function SingletonEditor({ table, title, description, fields }: { table: string; title: string; description?: string | undefined; fields: Field[] }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from(table as any) as any).select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data as Row | null;
    },
  });
  const [values, setValues] = useState<any>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  async function save() {
    const v = cleanValues(fields, values);
    const err = validate(fields, v);
    if (err) { toast.error(err); return; }
    const payload: any = {};
    for (const f of fields) payload[f.name] = v[f.name];
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = supabase.from(table as any) as any;
    const { error } = data ? await q.update(payload).eq("id", data.id) : await q.insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Perubahan disimpan");
    qc.invalidateQueries({ queryKey: ["admin", table] });
    qc.invalidateQueries({ queryKey: ["site"] });
  }

  if (isLoading) return <Loader2 className="animate-spin text-muted-foreground" />;
  return (
    <div>
      <AdminPageHeader title={title} description={description} />
      <div className="grid gap-5 rounded-xl border bg-card p-6 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={cn((f.full || ["textarea", "markdown", "list", "pairs"].includes(f.type)) && "md:col-span-2")}>
            <FieldInput field={f} values={values} set={(k, v) => setValues((p) => ({ ...p, [k]: v }))} />
          </div>
        ))}
        <div className="md:col-span-2">
          <Button onClick={save} disabled={saving}>{saving && <Loader2 className="animate-spin" />} Simpan perubahan</Button>
        </div>
      </div>
    </div>
  );
}
