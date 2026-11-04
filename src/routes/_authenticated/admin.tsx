import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BookOpen,
  Building2,
  ExternalLink,
  FolderKanban,
  HelpCircle,
  Home,
  Inbox,
  LayoutDashboard,
  Layers,
  ListOrdered,
  LogOut,
  Menu,
  Puzzle,
  Settings,
  Sparkles,
  Tag,
  User,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Header";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "RRW CMS" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminLayout,
});

const GROUPS = [
  { label: "", items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  {
    label: "Website Content",
    items: [
      { to: "/admin/settings", label: "General & Contact", icon: Settings },
      { to: "/admin/hero", label: "Hero", icon: Sparkles },
      { to: "/admin/about", label: "About", icon: Building2 },
      { to: "/admin/team", label: "Team", icon: Users },
      { to: "/admin/services", label: "Services", icon: Layers },
      { to: "/admin/addons", label: "Add-ons", icon: Puzzle },
      { to: "/admin/portfolio", label: "Portfolio", icon: FolderKanban },
      { to: "/admin/process", label: "Process", icon: ListOrdered },
      { to: "/admin/faq", label: "FAQ", icon: HelpCircle },
    ],
  },
  {
    label: "Blog",
    items: [
      { to: "/admin/blog", label: "Articles", icon: BookOpen },
      { to: "/admin/categories", label: "Categories", icon: Tag },
    ],
  },
  { label: "Leads", items: [{ to: "/admin/inquiries", label: "Inquiries", icon: Inbox, badge: true }] },
  { label: "Settings", items: [{ to: "/admin/profile", label: "Admin Profile", icon: User }] },
] as const;

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: newCount = 0 } = useQuery({
    queryKey: ["admin-stats", "new-inquiries"],
    queryFn: async () => {
      const { count } = await supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new");
      return count ?? 0;
    },
  });

  async function logout() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
      {GROUPS.map((g) => (
        <div key={g.label}>
          {g.label && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{g.label}</p>}
          <ul className="space-y-0.5">
            {g.items.map((it) => (
              <li key={it.to}>
                <Link
                  to={it.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: "exact" in it }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                  activeProps={{ className: "bg-sidebar-accent !text-sidebar-accent-foreground font-medium" }}
                >
                  <it.icon className="h-4 w-4" />
                  <span className="flex-1">{it.label}</span>
                  {"badge" in it && newCount > 0 && (
                    <span className="rounded-full bg-primary px-2 text-[11px] font-semibold text-primary-foreground">{newCount}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="mt-auto space-y-0.5 border-t pt-4">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent">
          <Home className="h-4 w-4" /> Lihat website <ExternalLink className="ml-auto h-3 w-3" />
        </a>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b px-6"><Logo /></div>
        {nav}
      </aside>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} aria-label="Menu" className="grid h-9 w-9 place-items-center rounded-lg border"><Menu className="h-4 w-4" /></button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar shadow-elevated">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="Tutup"><X className="h-5 w-5" /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}
      <main className={cn("lg:pl-64")}>
        <div className="mx-auto max-w-6xl p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
