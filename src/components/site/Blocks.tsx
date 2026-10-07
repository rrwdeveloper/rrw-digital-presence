import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";
import { waLink } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Step = Database["public"]["Tables"]["process_steps"]["Row"];
type Faq = Database["public"]["Tables"]["faqs"]["Row"];

export function ProcessGrid({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((s, i) => (
        <Reveal as="li" key={s.id} delay={i * 60} className="group relative bg-card p-7 md:p-9">
          <span className="font-display text-sm font-semibold text-primary">{s.step_number}</span>
          <h3 className="mt-6 text-2xl font-semibold uppercase tracking-tight">{s.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
          <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
        </Reveal>
      ))}
    </ol>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <Accordion type="single" collapsible className="divide-y rounded-2xl border bg-card px-6 md:px-8">
      {faqs.map((f) => (
        <AccordionItem key={f.id} value={f.id} className="border-0">
          <AccordionTrigger className="py-5 text-left font-display text-base font-semibold hover:no-underline md:text-lg">
            {f.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{f.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function CtaBand({ whatsapp, title = "Have a project in mind?" }: { whatsapp?: string | null | undefined; title?: string }) {
  return (
    <section className="container-x py-20 md:py-28">
      <Reveal className="relative overflow-hidden rounded-3xl bg-ink-gradient px-6 py-14 text-ink-foreground md:px-16 md:py-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold leading-tight md:text-5xl">{title}</h2>
            <p className="mt-4 text-lg text-ink-muted">Let's build something great together.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/contact">
                Konsultasikan Project Anda <ArrowRight />
              </Link>
            </Button>
            {whatsapp && (
              <Button asChild variant="heroOutline" size="xl">
                <a href={waLink(whatsapp, "Halo RRW, saya ingin konsultasi project website.")} target="_blank" rel="noreferrer">
                  <MessageCircle /> WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/** Minimal, safe markdown: ## / ### headings, "- " lists, paragraphs. Renders text only. */
export function Markdown({ content }: { content: string | null | undefined }) {
  if (!content) return null;
  const blocks = content.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className="prose-rrw">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{l.trim().slice(2)}</li>
              ))}
            </ul>
          );
        }
        return lines.map((l, j) => {
          const k = `${i}-${j}`;
          if (l.startsWith("### ")) return <h3 key={k}>{l.slice(4)}</h3>;
          if (l.startsWith("## ")) return <h2 key={k}>{l.slice(3)}</h2>;
          if (!l.trim()) return null;
          return <p key={k}>{l}</p>;
        });
      })}
    </div>
  );
}
