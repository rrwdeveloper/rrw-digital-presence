import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/rrw-logo.png";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "About" },
  { to: "/team", label: "Team" },
  { to: "/process", label: "Process" },
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo({ brand = "RRW", className }: { brand?: string | undefined; className?: string }) {
  return <img src={logoUrl} alt={brand} width={480} height={127} className={cn("h-7 w-auto", className)} />;
}

export function Header({ brand }: { brand?: string | undefined }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Auto-close menu when route changes
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        open
          ? "border-b border-border bg-background shadow-sm"
          : scrolled
            ? "border-b border-border/80 bg-background/90 backdrop-blur-xl shadow-xs"
            : "border-b border-border/40 bg-background/85 backdrop-blur-md lg:border-transparent lg:bg-transparent lg:backdrop-blur-none",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        <Link to="/" aria-label="RRW home" onClick={() => setOpen(false)}>
          <Logo brand={brand} />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground"
              activeProps={{ className: "!bg-primary/12 !text-primary font-semibold shadow-xs" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Button asChild variant="hero" size="default" className="h-10 px-5">
            <Link to="/contact">
              Konsultasi Gratis <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <button
          type="button"
          className={cn(
            "relative z-50 grid h-10 w-10 place-items-center rounded-xl border transition-all duration-200 lg:hidden",
            open
              ? "border-primary/40 bg-primary/10 text-primary shadow-xs"
              : "border-border bg-card text-foreground shadow-xs hover:bg-accent hover:text-primary active:scale-95",
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-background/98 p-6 backdrop-blur-2xl lg:hidden">
          <nav className="flex flex-1 flex-col justify-start gap-1 pb-6" aria-label="Mobile">
            {NAV.map((n, i) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 font-display text-lg font-semibold text-foreground/85 transition-all hover:bg-accent hover:text-primary"
                activeProps={{ className: "!bg-primary/10 !text-primary !font-bold" }}
                style={{ animation: `fade-up .25s ${i * 25}ms both` }}
              >
                <span>{n.label}</span>
                <span className="text-xs text-muted-foreground/60">→</span>
              </Link>
            ))}
            <div className="mt-4 border-t border-border/80 pt-5">
              <Button asChild variant="hero" size="xl" className="w-full">
                <Link to="/contact" onClick={() => setOpen(false)}>
                  Konsultasi Gratis <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
