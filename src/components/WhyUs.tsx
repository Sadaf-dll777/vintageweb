import { Zap, ShieldCheck, CreditCard, Headphones, Clock, Award } from "lucide-react";

const ITEMS = [
  { Icon: Zap, title: "Instant Delivery", desc: "Get your codes, keys & accounts within seconds of payment — no waiting, no delays." },
  { Icon: ShieldCheck, title: "100% Secure", desc: "Every transaction is encrypted and verified. Your payment data never touches our servers." },
  { Icon: CreditCard, title: "Easy Payments", desc: "Pay with bKash, Nagad, Rocket, Upay or card — whatever works for you." },
  { Icon: Headphones, title: "24/7 Support", desc: "Our support team is always online via live chat. Got an issue? We'll fix it fast." },
  { Icon: Clock, title: "Always Available", desc: "Shop anytime — our store runs 24/7 with automated delivery around the clock." },
  { Icon: Award, title: "Best Prices", desc: "We guarantee the lowest prices for digital products. Find cheaper? We'll match it." },
];

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
          <h2 className="mt-3 font-display text-4xl uppercase sm:text-5xl">
            Why Choose <span className="text-primary">VintageStore</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Built for gamers, by gamers</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it) => (
            <div
              key={it.title}
              className="group rounded-2xl border border-border bg-card/80 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/60 hover:glow-red"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary transition group-hover:scale-110">
                <it.Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-xl tracking-wide">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}