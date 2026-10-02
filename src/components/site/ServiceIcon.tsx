import {
  AppWindow,
  Boxes,
  Building2,
  Code2,
  Globe,
  Layers,
  LayoutDashboard,
  Rocket,
  ShoppingBag,
  Smartphone,
  Sparkles,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  Rocket,
  Building2,
  LayoutDashboard,
  ShoppingBag,
  AppWindow,
  Boxes,
  Layers,
  Globe,
  Code2,
  Smartphone,
  Sparkles,
  ShieldCheck,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = SERVICE_ICONS[name] ?? Layers;
  return <Icon className={className} aria-hidden="true" />;
}
