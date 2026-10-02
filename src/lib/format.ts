export function formatRupiah(value: number) {
  return "Rp" + new Intl.NumberFormat("id-ID").format(value);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(value),
  );
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function waLink(number: string | null | undefined, text?: string) {
  const n = (number ?? "").replace(/\D/g, "");
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export const SITE_URL = "https://project--d054dd12-a642-48b1-95cf-7f29cff6eca4.lovable.app";

export function pageMeta(opts: { title: string; description: string; path: string; image?: string | null; type?: string }) {
  const meta: Array<Record<string, string>> = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: opts.type ?? "website" },
    { property: "og:url", content: SITE_URL + opts.path },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
  ];
  if (opts.image && opts.image.startsWith("https://")) {
    meta.push({ property: "og:image", content: opts.image }, { name: "twitter:image", content: opts.image });
  }
  return { meta, links: [{ rel: "canonical", href: SITE_URL + opts.path }] };
}

export const PROJECT_TYPES = [
  "Landing Page",
  "Company Profile",
  "Company Profile + CMS",
  "Online Store",
  "Web Application",
  "Custom Web Application",
  "Other",
];

export const BUDGET_RANGES = [
  "< Rp1.000.000",
  "Rp1.000.000 – Rp3.000.000",
  "Rp3.000.000 – Rp6.000.000",
  "Rp6.000.000 – Rp10.000.000",
  "> Rp10.000.000",
  "Belum tahu / perlu diskusi",
];

export const INQUIRY_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "discussion", label: "Discussion" },
  { value: "proposal", label: "Proposal" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];
