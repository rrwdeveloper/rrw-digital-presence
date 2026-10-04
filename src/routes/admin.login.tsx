import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Header";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — RRW CMS" },
      { name: "description", content: "Login administrator RRW CMS." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setBusy(false);
      return setError("Email atau password salah.");
    }
    const { data: ok } = await supabase.rpc("claim_admin");
    if (!ok) {
      await supabase.auth.signOut();
      setBusy(false);
      return setError("Akun ini tidak memiliki akses administrator.");
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-hero px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex justify-center"><Logo /></Link>
        <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-7 shadow-elevated">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary"><Lock className="h-4 w-4" /></span>
            <div>
              <h1 className="text-lg font-semibold">Admin CMS</h1>
              <p className="text-xs text-muted-foreground">Khusus administrator</p>
            </div>
          </div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" className="mb-4 mt-2 h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" autoComplete="current-password" className="mt-2 h-11" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <Button type="submit" className="mt-6 h-11 w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Masuk
          </Button>
        </form>
      </div>
    </div>
  );
}
