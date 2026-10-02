import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitInquiry } from "@/lib/public.functions";
import { BUDGET_RANGES, PROJECT_TYPES } from "@/lib/format";

const schema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().email("Email tidak valid").max(255),
  whatsapp: z
    .string()
    .trim()
    .min(8, "Nomor WhatsApp tidak valid")
    .max(20)
    .regex(/^[+0-9\s-]+$/, "Hanya angka, spasi, + atau -"),
  project_type: z.string().min(1, "Pilih jenis project"),
  budget_range: z.string().min(1, "Pilih kisaran budget"),
  description: z.string().trim().min(10, "Ceritakan project Anda (min. 10 karakter)").max(2000),
});
type Form = z.infer<typeof schema>;
const empty: Form = { name: "", email: "", whatsapp: "", project_type: "", budget_range: "", description: "" };

export function InquiryForm({ defaultType }: { defaultType?: string }) {
  const send = useServerFn(submitInquiry);
  const [form, setForm] = useState<Form>({ ...empty, project_type: defaultType ?? "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Partial<Record<keyof Form, string>> = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as keyof Form] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      await send({ data: parsed.data });
      setStatus("done");
      setForm(empty);
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center rounded-2xl border bg-card p-10 text-center shadow-soft">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-5 text-2xl font-semibold">Terima kasih!</h3>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Pesan Anda sudah kami terima. Tim RRW akan menghubungi Anda dalam 1×24 jam kerja.
        </p>
        <Button variant="heroOutline" className="mt-6" onClick={() => setStatus("idle")}>
          Kirim pesan lain
        </Button>
      </div>
    );
  }

  const Err = ({ k }: { k: keyof Form }) =>
    errors[k] ? <p className="mt-1.5 text-xs text-destructive">{errors[k]}</p> : null;

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border bg-card p-6 shadow-soft md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Nama</Label>
          <Input id="name" className="mt-2 h-11" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={100} />
          <Err k="name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="mt-2 h-11" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={255} />
          <Err k="email" />
        </div>
        <div>
          <Label htmlFor="wa">WhatsApp</Label>
          <Input id="wa" inputMode="tel" placeholder="08xx xxxx xxxx" className="mt-2 h-11" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} maxLength={20} />
          <Err k="whatsapp" />
        </div>
        <div>
          <Label>Jenis Project</Label>
          <Select value={form.project_type} onValueChange={(v) => set("project_type", v)}>
            <SelectTrigger className="mt-2 h-11"><SelectValue placeholder="Pilih jenis project" /></SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Err k="project_type" />
        </div>
        <div className="md:col-span-2">
          <Label>Kisaran Budget</Label>
          <Select value={form.budget_range} onValueChange={(v) => set("budget_range", v)}>
            <SelectTrigger className="mt-2 h-11"><SelectValue placeholder="Pilih kisaran budget" /></SelectTrigger>
            <SelectContent>
              {BUDGET_RANGES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Err k="budget_range" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="desc">Deskripsi Project</Label>
          <Textarea id="desc" rows={5} className="mt-2" value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={2000} placeholder="Ceritakan kebutuhan, tujuan, dan fitur yang Anda inginkan." />
          <Err k="description" />
        </div>
      </div>
      {status === "error" && (
        <p className="mt-4 text-sm text-destructive">Gagal mengirim pesan. Silakan coba lagi atau hubungi kami via WhatsApp.</p>
      )}
      <Button type="submit" variant="hero" size="xl" className="mt-6 w-full md:w-auto" disabled={status === "sending"}>
        {status === "sending" ? <Loader2 className="animate-spin" /> : <Send />} Kirim Inquiry
      </Button>
    </form>
  );
}
