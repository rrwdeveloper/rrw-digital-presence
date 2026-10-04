import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FolderKanban, Inbox, Layers, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/CrudManager";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

async function count(table: "services" | "portfolio" | "blog_posts" | "inquiries", status?: string) {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (status) q = q.eq("status", status);
  const { count } = await q;
  return count ?? 0;
}

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats", "overview"],
    queryFn: async () => {
      const [services, portfolio, posts, inquiries] = await Promise.all([
        count("services"),
        count("portfolio"),
        count("blog_posts"),
        count("inquiries", "new"),
      ]);
      const { data: latest } = await supabase.from("inquiries").select("id,name,project_type,created_at,status").order("created_at", { ascending: false }).limit(5);
      return { services, portfolio, posts, inquiries, latest: latest ?? [] };
    },
  });
  const cards = [
    { label: "Total Services", value: data?.services, icon: Layers, to: "/admin/services" },
    { label: "Total Portfolio", value: data?.portfolio, icon: FolderKanban, to: "/admin/portfolio" },
    { label: "Total Blog Posts", value: data?.posts, icon: BookOpen, to: "/admin/blog" },
    { label: "New Inquiries", value: data?.inquiries, icon: Inbox, to: "/admin/inquiries", highlight: true },
  ] as const;

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="Ringkasan konten dan inquiry website RRW." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className={`rounded-xl border p-5 transition-shadow hover:shadow-soft ${"highlight" in c ? "bg-primary text-primary-foreground" : "bg-card"}`}>
            <c.icon className="h-5 w-5 opacity-80" />
            <p className="mt-4 font-display text-3xl font-semibold">{c.value ?? "–"}</p>
            <p className="mt-1 text-sm opacity-80">{c.label}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Quick actions</h2>
          <div className="mt-4 grid gap-2">
            <Button asChild variant="outline" className="justify-start"><Link to="/admin/services"><Plus /> Add Service</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link to="/admin/portfolio"><Plus /> Add Portfolio</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link to="/admin/blog"><Plus /> Add Blog Post</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link to="/admin/inquiries"><Inbox /> View Inquiries</Link></Button>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Inquiry terbaru</h2>
          <ul className="mt-4 divide-y">
            {data?.latest.length === 0 && <li className="py-6 text-sm text-muted-foreground">Belum ada inquiry.</li>}
            {data?.latest.map((i) => (
              <li key={i.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{i.project_type} · {formatDate(i.created_at)}</p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs capitalize">{i.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
