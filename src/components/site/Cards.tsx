import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { ServiceIcon } from "./ServiceIcon";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Service = Database["public"]["Tables"]["services"]["Row"];
type Project = Database["public"]["Tables"]["portfolio"]["Row"];

export function PriceTag({ s, large }: { s: Pick<Service, "price_label" | "starting_price" | "price_suffix">; large?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.price_label}</p>
      <p className={cn("font-display font-semibold text-foreground", large ? "text-4xl" : "text-2xl")}>
        {formatRupiah(s.starting_price)}
        {s.price_suffix}
      </p>
    </div>
  );
}

export function ServiceCard({ s }: { s: Service }) {
  return (
    <Link
      to="/services/$slug"
      params={{ slug: s.slug }}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated",
      )}
    >
      {s.featured && (
        <span className="absolute right-6 top-6 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
          Populer
        </span>
      )}
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <ServiceIcon name={s.icon} className="h-5 w-5" />
      </span>
      <h3 className="mt-6 text-xl font-semibold">{s.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.short_description}</p>
      <ul className="mt-5 space-y-2 text-sm">
        {s.features.slice(0, 4).map((f) => (
          <li key={f} className="flex items-start gap-2 text-foreground/80">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-end justify-between border-t pt-5 [margin-top:max(1.5rem,auto)]">
        <PriceTag s={s} />
        <span className="grid h-10 w-10 place-items-center rounded-full border transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export function ProjectThumb({ p, className }: { p: Pick<Project, "thumbnail_url" | "title" | "category">; className?: string }) {
  if (p.thumbnail_url) {
    return (
      <img
        src={p.thumbnail_url}
        alt={p.title}
        loading="lazy"
        decoding="async"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  return (
    <div className={cn("relative grid h-full w-full place-items-center overflow-hidden bg-ink-gradient", className)}>
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative w-3/4 rounded-lg border border-ink-foreground/10 bg-ink-foreground/5 p-3 backdrop-blur">
        <span className="block h-2 w-10 rounded-full bg-primary" />
        <span className="mt-2 block h-3 w-full rounded bg-ink-foreground/70" />
        <span className="mt-1.5 block h-3 w-2/3 rounded bg-ink-foreground/70" />
        <span className="mt-3 block h-1.5 w-full rounded-full bg-ink-foreground/20" />
        <span className="mt-1 block h-1.5 w-4/5 rounded-full bg-ink-foreground/20" />
      </div>
      <span className="absolute bottom-3 left-4 text-[11px] font-medium uppercase tracking-widest text-ink-muted">
        {p.category}
      </span>
    </div>
  );
}

export function PortfolioCard({ p }: { p: Project }) {
  return (
    <Link to="/portfolio/$slug" params={{ slug: p.slug }} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted">
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
          <ProjectThumb p={p} />
        </div>
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/80 via-ink/10 to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground">
            View Project <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{p.category}</p>
        <h3 className="mt-2 text-xl font-semibold transition-colors group-hover:text-primary">{p.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.technologies.slice(0, 4).map((t) => (
            <span key={t} className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
