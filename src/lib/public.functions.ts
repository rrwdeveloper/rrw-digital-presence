import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function db() {
  return createClient<Database>(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export const getSiteData = createServerFn({ method: "GET" }).handler(async () => {
  const c = db();
  const [settings, hero, about] = await Promise.all([
    c.from("site_settings").select("*").limit(1).maybeSingle(),
    c.from("hero_content").select("*").limit(1).maybeSingle(),
    c.from("about_content").select("*").limit(1).maybeSingle(),
  ]);
  return {
    settings: check(settings),
    hero: check(hero),
    about: check(about) as (Database["public"]["Tables"]["about_content"]["Row"] & {
      highlights: { title: string; description: string }[];
    }) | null,
  };
});

export const getServices = createServerFn({ method: "GET" }).handler(async () =>
  check(await db().from("services").select("*").eq("active", true).order("sort_order")),
);

export const getServiceBySlug = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }) =>
    check(await db().from("services").select("*").eq("slug", data.slug).eq("active", true).maybeSingle()),
  );

export const getPortfolio = createServerFn({ method: "GET" }).handler(async () =>
  check(
    await db()
      .from("portfolio")
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .order("created_at", { ascending: false }),
  ),
);

export const getPortfolioBySlug = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }) =>
    check(await db().from("portfolio").select("*").eq("slug", data.slug).eq("published", true).maybeSingle()),
  );

export const getProcessSteps = createServerFn({ method: "GET" }).handler(async () =>
  check(await db().from("process_steps").select("*").eq("active", true).order("sort_order")),
);

export const getFaqs = createServerFn({ method: "GET" }).handler(async () =>
  check(await db().from("faqs").select("*").eq("active", true).order("sort_order")),
);

export const getBlogPosts = createServerFn({ method: "GET" }).handler(async () =>
  check(
    await db()
      .from("blog_posts")
      .select("id,title,slug,excerpt,thumbnail_url,published_at,author,tags,blog_categories(name,slug)")
      .eq("published", true)
      .order("published_at", { ascending: false }),
  ),
);

export const getBlogPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }) =>
    check(
      await db()
        .from("blog_posts")
        .select("*,blog_categories(name,slug)")
        .eq("slug", data.slug)
        .eq("published", true)
        .maybeSingle(),
    ),
  );

const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  whatsapp: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^[+0-9\s-]+$/),
  project_type: z.string().trim().max(60),
  budget_range: z.string().trim().max(60),
  description: z.string().trim().min(10).max(2000),
});

export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator((d) => inquirySchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await db().from("inquiries").insert({ ...data, status: "new" });
    if (error) {
      console.error("inquiry insert failed", error.message);
      throw new Error("Gagal mengirim pesan. Silakan coba lagi.");
    }
    return { ok: true };
  });
