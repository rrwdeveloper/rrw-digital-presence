import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SITE_URL } from "@/lib/format";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
        const c = createClient<Database>(url!, key!, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const [s, p, b] = await Promise.all([
          c.from("services").select("slug,updated_at").eq("active", true),
          c.from("portfolio").select("slug,updated_at").eq("published", true),
          c.from("blog_posts").select("slug,updated_at").eq("published", true),
        ]);
        const urls = [
          ...["/", "/services", "/portfolio", "/about", "/team", "/process", "/blog", "/faq", "/contact"].map((u) => ({ loc: u })),
          ...(s.data ?? []).map((r) => ({ loc: `/services/${r.slug}`, lastmod: r.updated_at })),
          ...(p.data ?? []).map((r) => ({ loc: `/portfolio/${r.slug}`, lastmod: r.updated_at })),
          ...(b.data ?? []).map((r) => ({ loc: `/blog/${r.slug}`, lastmod: r.updated_at })),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u) => `  <url><loc>${SITE_URL}${u.loc}</loc>${"lastmod" in u && u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`)
          .join("\n")}\n</urlset>`;
        return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
      },
    },
  },
});
