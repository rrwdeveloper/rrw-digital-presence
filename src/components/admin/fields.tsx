import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadImage } from "@/lib/media";

export type FieldType =
  | "text"
  | "textarea"
  | "markdown"
  | "number"
  | "boolean"
  | "list"
  | "pairs"
  | "image"
  | "images"
  | "select"
  | "datetime";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  full?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Values = Record<string, any>;

function ImageInput({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="mt-2 flex items-center gap-4">
      {value ? (
        <div className="relative h-24 w-36 overflow-hidden rounded-lg border">
          <img src={value} alt="" className="h-full w-full object-cover" />
          <button type="button" onClick={() => onChange(null)} className="absolute right-1 top-1 rounded-full bg-card p-1 shadow" aria-label="Hapus gambar">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}
      <label className="flex h-24 w-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground hover:border-primary hover:text-primary">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
        Upload
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            try {
              onChange(await uploadImage(f));
            } catch (err) {
              toast.error((err as Error).message);
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
    </div>
  );
}

function ImagesInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="mt-2 flex flex-wrap gap-3">
      {value.map((src) => (
        <div key={src} className="relative h-20 w-28 overflow-hidden rounded-lg border">
          <img src={src} alt="" className="h-full w-full object-cover" />
          <button type="button" onClick={() => onChange(value.filter((v) => v !== src))} className="absolute right-1 top-1 rounded-full bg-card p-1 shadow" aria-label="Hapus">
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <label className="flex h-20 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground hover:border-primary">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        Tambah
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            setBusy(true);
            try {
              const urls: string[] = [];
              for (const f of files) urls.push(await uploadImage(f, "gallery"));
              onChange([...value, ...urls]);
            } catch (err) {
              toast.error((err as Error).message);
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
    </div>
  );
}

export function FieldInput({ field, values, set }: { field: Field; values: Values; set: (k: string, v: unknown) => void }) {
  const v = values[field.name];
  const id = `f-${field.name}`;
  let input: React.ReactNode;
  switch (field.type) {
    case "textarea":
      input = <Textarea id={id} rows={3} className="mt-2" value={v ?? ""} onChange={(e) => set(field.name, e.target.value)} />;
      break;
    case "markdown":
      input = <Textarea id={id} rows={14} className="mt-2 font-mono text-sm" value={v ?? ""} onChange={(e) => set(field.name, e.target.value)} />;
      break;
    case "number":
      input = <Input id={id} type="number" className="mt-2" value={v ?? 0} onChange={(e) => set(field.name, Number(e.target.value))} />;
      break;
    case "boolean":
      return (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor={id}>{field.label}</Label>
          <Switch id={id} checked={!!v} onCheckedChange={(c) => set(field.name, c)} />
        </div>
      );
    case "list":
      input = (
        <Textarea
          id={id}
          rows={5}
          className="mt-2"
          value={(v ?? []).join("\n")}
          onChange={(e) => set(field.name, e.target.value.split("\n"))}
        />
      );
      break;
    case "pairs":
      input = (
        <Textarea
          id={id}
          rows={6}
          className="mt-2"
          value={(v ?? []).map((p: { title: string; description: string }) => `${p.title} | ${p.description}`).join("\n")}
          onChange={(e) =>
            set(
              field.name,
              e.target.value.split("\n").map((l) => {
                const [title, ...rest] = l.split("|");
                return { title: (title ?? "").trim(), description: rest.join("|").trim() };
              }),
            )
          }
        />
      );
      break;
    case "image":
      input = <ImageInput value={v ?? null} onChange={(x) => set(field.name, x)} />;
      break;
    case "images":
      input = <ImagesInput value={v ?? []} onChange={(x) => set(field.name, x)} />;
      break;
    case "select":
      input = (
        <Select value={v ?? "__none"} onValueChange={(x) => set(field.name, x === "__none" ? null : x)}>
          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            {!field.required && <SelectItem value="__none">—</SelectItem>}
            {field.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      );
      break;
    case "datetime":
      input = (
        <Input
          id={id}
          type="datetime-local"
          className="mt-2"
          value={v ? new Date(v).toISOString().slice(0, 16) : ""}
          onChange={(e) => set(field.name, e.target.value ? new Date(e.target.value).toISOString() : null)}
        />
      );
      break;
    default:
      input = <Input id={id} className="mt-2" value={v ?? ""} onChange={(e) => set(field.name, e.target.value)} />;
  }
  return (
    <div>
      <Label htmlFor={id}>
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </Label>
      {input}
      {field.help && <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}

/** Normalises list fields (drop blanks) before saving. */
export function cleanValues(fields: Field[], values: Values) {
  const out: Values = { ...values };
  for (const f of fields) {
    if (f.type === "list") out[f.name] = (out[f.name] ?? []).map((s: string) => s.trim()).filter(Boolean);
    if (f.type === "pairs") out[f.name] = (out[f.name] ?? []).filter((p: { title: string }) => p.title);
    if (f.type === "text" && typeof out[f.name] === "string") out[f.name] = out[f.name].trim();
  }
  return out;
}

export function validate(fields: Field[], values: Values) {
  for (const f of fields) {
    if (f.required && (values[f.name] === undefined || values[f.name] === null || values[f.name] === "")) {
      return `${f.label} wajib diisi`;
    }
  }
  if ("slug" in values && values.slug && !/^[a-z0-9-]+$/.test(values.slug)) return "Slug hanya huruf kecil, angka, dan tanda -";
  return null;
}
