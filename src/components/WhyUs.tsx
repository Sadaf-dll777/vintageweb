import { Zap, ShieldCheck, CreditCard, Headphones, Clock, Award } from "lucide-react";
import { whyUs } from "@/config/site";

const ICONS = { Zap, ShieldCheck, CreditCard, Headphones, Clock, Award };
const ITEMS = whyUs.map((i) => ({ Icon: ICONS[i.icon], title: i.title, desc: i.desc }));

export function WhyUs() {
  return (
    <section className="relative overflow-hidden border-y border-border/60 py-20">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(60deg, transparent 0 40px, color-mix(in oklab, var(--color-primary) 8%, transparent) 40px 41px), repeating-linear-gradient(-60deg, transparent 0 40px, color-mix(in oklab, var(--color-primary) 8%, transparent) 40px 41px)",
        }}
      />
      <div className="container-wide relative">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
            ⚡ Why Us
          </span>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">
            Why Choose <span className="text-primary">VintageStore</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Built for gamers, by gamers</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it) => (
            <div
              key={it.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:glow-red"
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                <span className="absolute left-1/2 top-1/2 h-[260%] w-[40%] -translate-x-[160%] -translate-y-1/2 rotate-45 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-[1600ms] ease-out group-hover:translate-x-[60%] group-hover:opacity-100" />
              </span>
              <div className="relative flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/25 group-hover:shadow-[0_0_24px_-2px_var(--color-primary)]">
                  <it.Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-bold tracking-wide transition-colors duration-300 group-hover:text-primary">{it.title}</h3>
              </div>
              <p className="relative mt-3 text-sm text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}