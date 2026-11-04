import { Link } from "@tanstack/react-router";
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
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b bg-background/85 backdrop-blur-xl" : "bg-transparent",
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
          className="grid h-10 w-10 place-items-center rounded-full border bg-card lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 animate-in fade-in bg-background lg:hidden">
          <nav className="container-x flex flex-col py-6" aria-label="Mobile">
            {NAV.map((n, i) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                className="flex items-center justify-between border-b py-4 font-display text-2xl font-semibold text-foreground/80 transition-all"
                activeProps={{ className: "!text-primary !border-primary pl-2 font-bold" }}
                style={{ animation: `fade-up .5s ${i * 40}ms both` }}
              >
                {n.label}
              </Link>
            ))}
            <Button asChild variant="hero" size="xl" className="mt-8">
              <Link to="/contact" onClick={() => setOpen(false)}>
                Konsultasi Gratis
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
