import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/CrudManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/profile")({
  component: Profile,
});

function Profile() {
  const { user } = Route.useRouteContext();
  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  async function change(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Password minimal 8 karakter");
    if (pw !== pw2) return toast.error("Konfirmasi password tidak cocok");
    setBusy(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.auth.updateUser({ password: pw, current_password: current } as any);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password diperbarui");
    setCurrent(""); setPw(""); setPw2("");
  }

  return (
    <div>
      <AdminPageHeader title="Admin Profile" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="mt-1 font-semibold">{user.email}</p>
          <p className="mt-4 text-sm text-muted-foreground">Role</p>
          <p className="mt-1 font-semibold">Administrator</p>
        </div>
        <form onSubmit={change} className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Ganti password</h2>
          <div><Label htmlFor="cur">Password saat ini</Label><Input id="cur" type="password" className="mt-2" value={current} onChange={(e) => setCurrent(e.target.value)} /></div>
          <div><Label htmlFor="pw">Password baru</Label><Input id="pw" type="password" className="mt-2" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
          <div><Label htmlFor="pw2">Konfirmasi</Label><Input id="pw2" type="password" className="mt-2" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
          <Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Simpan</Button>
        </form>
      </div>
    </div>
  );
}
