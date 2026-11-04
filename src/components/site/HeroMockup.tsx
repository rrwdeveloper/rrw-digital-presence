import { CheckCircle2, TrendingUp } from "lucide-react";

/** Pure-CSS device mockups — crisp at any size, no image weight. */
export function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] animate-device-in" aria-hidden="true">
      {/* Laptop / browser */}
      <div className="relative rounded-2xl border bg-card p-2 shadow-elevated">
        <div className="flex items-center gap-1.5 px-2 pb-2 pt-1">
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="ml-3 h-5 flex-1 rounded-md bg-muted" />
        </div>
        <div className="overflow-hidden rounded-xl border bg-surface">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="h-2.5 w-14 rounded-full bg-foreground/80" />
            <div className="flex gap-2">
              <span className="h-2 w-8 rounded-full bg-muted-foreground/30" />
              <span className="h-2 w-8 rounded-full bg-muted-foreground/30" />
              <span className="h-2 w-8 rounded-full bg-muted-foreground/30" />
              <span className="h-2 w-10 rounded-full bg-primary" />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4 p-5">
            <div className="col-span-3 space-y-2.5 pt-2">
              <span className="block h-2 w-16 rounded-full bg-primary/60" />
              <span className="block h-4 w-full rounded-md bg-foreground/85" />
              <span className="block h-4 w-4/5 rounded-md bg-foreground/85" />
              <span className="block h-2 w-full rounded-full bg-muted-foreground/25" />
              <span className="block h-2 w-3/4 rounded-full bg-muted-foreground/25" />
              <div className="flex gap-2 pt-2">
                <span className="h-6 w-20 rounded-full bg-primary" />
                <span className="h-6 w-16 rounded-full border bg-card" />
              </div>
            </div>
            <div className="col-span-2 rounded-lg bg-primary-gradient p-3">
              <div className="h-full rounded-md bg-card/15" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 px-5 pb-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-3">
                <span className="mb-2 block h-5 w-5 rounded-md bg-accent" />
                <span className="block h-2 w-3/4 rounded-full bg-foreground/70" />
                <span className="mt-1.5 block h-1.5 w-full rounded-full bg-muted-foreground/20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phone */}
      <div className="absolute -bottom-10 -left-4 w-[34%] rounded-[1.6rem] border bg-ink p-1.5 shadow-elevated md:-left-10">
        <div className="overflow-hidden rounded-[1.25rem] bg-card">
          <div className="mx-auto mt-1.5 h-1.5 w-10 rounded-full bg-border" />
          <div className="space-y-2 p-3">
            <span className="block h-2 w-10 rounded-full bg-primary/60" />
            <span className="block h-3 w-full rounded bg-foreground/85" />
            <span className="block h-3 w-2/3 rounded bg-foreground/85" />
            <div className="mt-2 aspect-[4/3] rounded-lg bg-primary-gradient" />
            <span className="block h-1.5 w-full rounded-full bg-muted-foreground/25" />
            <span className="block h-1.5 w-4/5 rounded-full bg-muted-foreground/25" />
            <span className="mt-2 block h-5 w-full rounded-full bg-primary" />
          </div>
        </div>
      </div>


      <div
        className="absolute -bottom-6 right-6 animate-float rounded-xl border bg-card px-4 py-3 shadow-elevated"
        style={{ animationDelay: "1.5s" }}
      >
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-success/15 text-success">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] text-muted-foreground">Responsive</p>
            <p className="flex items-center gap-1 font-display text-sm font-semibold">
              All devices <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
