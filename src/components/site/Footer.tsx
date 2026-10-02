import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { waLink } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Settings = Database["public"]["Tables"]["site_settings"]["Row"] | null;

export function Footer({ settings }: { settings: Settings }) {
  const brand = settings?.brand_name ?? "RRW";
  return (
    <footer className="bg-ink-gradient text-ink-foreground">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <p className="font-display text-2xl font-bold">
            {brand}
            <span className="text-primary">.</span>
          </p>
          <p className="mt-3 max-w-sm text-ink-muted">{settings?.tagline}</p>
          <div className="mt-6 flex gap-3">
            {settings?.whatsapp && (
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center rounded-full border border-ink-foreground/15 transition-colors hover:border-primary hover:text-primary">
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
            {settings?.email && (
              <a href={`mailto:${settings.email}`} aria-label="Email" className="grid h-10 w-10 place-items-center rounded-full border border-ink-foreground/15 transition-colors hover:border-primary hover:text-primary">
                <Mail className="h-4 w-4" />
              </a>
            )}
            {settings?.instagram && (
              <a href={`https://instagram.com/${settings.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-ink-foreground/15 transition-colors hover:border-primary hover:text-primary">
                <Instagram className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 md:col-span-7 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold">Studio</p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
              <li><Link to="/about" className="hover:text-ink-foreground">About</Link></li>
              <li><Link to="/process" className="hover:text-ink-foreground">Process</Link></li>
              <li><Link to="/portfolio" className="hover:text-ink-foreground">Portfolio</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Layanan</p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
              <li><Link to="/services" className="hover:text-ink-foreground">Semua Layanan</Link></li>
              <li><Link to="/blog" className="hover:text-ink-foreground">Blog</Link></li>
              <li><Link to="/faq" className="hover:text-ink-foreground">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Kontak</p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
              {settings?.email && <li className="break-all">{settings.email}</li>}
              {settings?.address && <li>{settings.address}</li>}
              <li><Link to="/contact" className="hover:text-ink-foreground">Mulai project</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10">
        <div className="container-x flex flex-col justify-between gap-2 py-6 text-xs text-ink-muted md:flex-row">
          <p>© {new Date().getFullYear()} {brand}. All rights reserved.</p>
          <p>{settings?.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
