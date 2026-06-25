import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Zap, ShoppingBag, Gamepad2, Tv, Gift, User, Joystick, Globe, ShieldCheck, Tag, Package, Users, Award } from "lucide-react";
import { products } from "@/data/products";
import { formatPrice, useShop } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { NewArrivals } from "@/components/NewArrivals";
import { CategorySection } from "@/components/CategorySection";
import { Reviews } from "@/components/Reviews";
import { WhyUs } from "@/components/WhyUs";
import { Partners } from "@/components/Partners";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VintageStore — Digital Marketplace for Gamers" },
      { name: "description", content: "Instant delivery on gaming top-ups, subscriptions and gift cards. Pay with bKash, Nagad, Rocket, Upay & Binance." },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = products.filter((p) => p.featured);
  const [idx, setIdx] = useState(0);
  const currency = useShop((s) => s.currency);
  const add = useShop((s) => s.add);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % featured.length), 6000);
    return () => clearInterval(t);
  }, [featured.length]);

  const hero = featured[idx];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="absolute inset-0 opacity-30 transition-all duration-1000"
          style={{
            backgroundImage: `url(${hero.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(40px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="container-wide relative grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-[1.4fr_1fr] lg:py-24">
          {/* Left */}
          <div key={`text-${idx}`} className="min-w-0">
            <span className="hero-rise inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary" style={{ animationDelay: "0ms" }}>
              <Zap className="h-3 w-3 fill-current" strokeWidth={0} /> {hero.badge ?? "Featured"}
            </span>
            <h1 className="hero-rise mt-5 font-display text-5xl uppercase leading-[0.95] tracking-wide sm:text-6xl lg:text-7xl xl:text-8xl" style={{ animationDelay: "100ms" }}>
              {hero.name}
            </h1>
            <p className="hero-rise mt-5 max-w-xl text-base text-muted-foreground" style={{ animationDelay: "220ms" }}>{hero.tagline}</p>
            <div className="hero-rise mt-7 flex flex-wrap gap-3" style={{ animationDelay: "320ms" }}>
              <button
                onClick={() => add(hero)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-display text-base uppercase tracking-wider text-primary-foreground glow-red transition hover:brightness-110"
              >
                Buy Now <Zap className="h-4 w-4 fill-current" strokeWidth={0} />
              </button>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-7 py-3.5 font-display text-base uppercase tracking-wider transition hover:border-primary"
              >
                <ShoppingBag className="h-4 w-4" /> Game Top-Up
              </Link>
            </div>
            <div className="hero-rise mt-7 flex items-center gap-4" style={{ animationDelay: "420ms" }}>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Starting at</span>
              <span className="font-display text-2xl text-gold">{formatPrice(hero.price, currency)}</span>
            </div>

            {/* dots */}
            <div className="mt-10 flex items-center gap-3">
              <button
                onClick={() => setIdx((i) => (i - 1 + featured.length) % featured.length)}
                className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card hover:border-primary"
              ><ChevronLeft className="h-4 w-4" /></button>
              <div className="flex items-center gap-2">
                {featured.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === idx ? "w-10 bg-primary" : "w-6 bg-border"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setIdx((i) => (i + 1) % featured.length)}
                className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card hover:border-primary"
              ><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Right product card preview */}
          <div key={`card-${idx}`} className="relative">
            <div className="hero-slide-in overflow-hidden rounded-3xl border border-border bg-card glow-red">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={hero.image} alt={hero.name} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-3 p-5">
                <h3 className="font-display text-xl">{hero.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl text-primary">{formatPrice(hero.price, currency)}</span>
                  <span className="flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" /> In Stock
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP — features row */}
      <section className="border-b border-border/60 bg-card/20">
        <div className="container-wide flex flex-wrap items-center justify-center gap-x-12 gap-y-4 py-5">
          {[
            { Icon: Zap, t: "Instant Delivery", d: "Get codes in seconds" },
            { Icon: ShieldCheck, t: "Secure Payments", d: "bKash, Nagad & more" },
            { Icon: Tag, t: "Best Prices in Worldwide", d: "Guaranteed Full Support" },
          ].map((f) => (
            <div key={f.t} className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                <f.Icon className="h-3.5 w-3.5" fill={f.Icon === Zap ? "currentColor" : "none"} strokeWidth={f.Icon === Zap ? 0 : 2} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold leading-tight">{f.t}</div>
                <div className="text-[11px] text-muted-foreground">{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS — trusted by gamers */}
      <section className="container-wide py-14">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-border" />
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Trusted by Gamers Worldwide
          </span>
          <span className="h-px w-10 bg-border" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { n: 53, suffix: "+", label: "Orders Delivered", Icon: Package },
            { n: 31, suffix: "+now", label: "Happy Gamers", Icon: Users },
            { n: 74, suffix: "+", label: "Products Available", Icon: Zap, fill: true },
            { n: 26, suffix: "+", label: "5-Star Reviews", Icon: Award },
          ].map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* POPULAR */}
      {/* BROWSE BY CATEGORY */}
      <section className="container-wide py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-4xl uppercase sm:text-5xl">
            Browse by <span className="text-primary">Category</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Find exactly what you're looking for</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { id: "top-up", label: "Top-Up", Icon: Gamepad2, color: "from-purple-500/30 to-purple-600/10", icon: "text-purple-400" },
            { id: "subscriptions", label: "Subscriptions", Icon: Tv, color: "from-blue-500/30 to-blue-600/10", icon: "text-blue-400" },
            { id: "gift-cards", label: "Gift Cards", Icon: Gift, color: "from-orange-500/30 to-orange-600/10", icon: "text-orange-400" },
            { id: "accounts", label: "Accounts", Icon: User, color: "from-violet-500/30 to-violet-600/10", icon: "text-violet-300" },
            { id: "games", label: "Games", Icon: Joystick, color: "from-pink-500/30 to-pink-600/10", icon: "text-pink-400" },
            { id: "region-change", label: "Region Change", Icon: Globe, color: "from-cyan-500/30 to-cyan-600/10", icon: "text-cyan-400" },
          ].map((c) => (
            <Link
              key={c.id}
              to="/shop"
              hash={c.id}
              className="group relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/70 hover:shadow-[0_10px_40px_-10px_var(--color-primary)]"
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:from-primary/15 group-hover:to-primary/0 group-hover:opacity-100" />
              <span className={`relative grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br ${c.color} transition-transform duration-300 group-hover:scale-110`}>
                <c.Icon className={`h-7 w-7 ${c.icon} transition-colors duration-300 group-hover:text-primary`} strokeWidth={2} />
              </span>
              <span className="relative font-display text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <NewArrivals products={products.slice(0, 10)} />

      {/* POPULAR */}
      <section className="container-wide py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">⚡ Popular Right Now</span>
            <h2 className="mt-2 font-display text-4xl uppercase sm:text-5xl">Top Picks</h2>
          </div>
          <Link to="/shop" className="hidden text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary md:block">
            Browse all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {products.slice(0, 10).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* CATEGORY SECTIONS */}
      <CategorySection category="top-up" title="Top-Up" Icon={Gamepad2} accent="text-purple-400" />
      <CategorySection category="subscriptions" title="Subscriptions" Icon={Tv} accent="text-blue-400" />
      <CategorySection category="gift-cards" title="Gift Cards" Icon={Gift} accent="text-orange-400" />
      <CategorySection category="region-change" title="Region Change" Icon={Globe} accent="text-cyan-400" />

      {/* WHY US */}
      <WhyUs />

      {/* REVIEWS */}
      <Reviews />

      {/* PARTNERS */}
      <Partners />
    </div>
  );
}

// suppress TS unused
const t = "t";

function StatCard({
  n,
  suffix,
  label,
  Icon,
  fill,
}: {
  n: number;
  suffix: string;
  label: string;
  Icon: typeof Zap;
  fill?: boolean;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const start = performance.now();
      const dur = 1600;
      let raf = 0;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(n * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            run();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [n]);
  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/70 hover:shadow-[0_15px_50px_-15px_var(--color-primary)]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/0 to-primary/0 transition-all duration-500 group-hover:from-primary/10 group-hover:to-primary/0"
      />
      <div className="relative">
        <span className="relative mx-auto grid h-11 w-11 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-all duration-500 ease-out group-hover:scale-125 group-hover:border-primary group-hover:bg-primary/20 group-hover:text-primary group-hover:shadow-[0_0_25px_var(--color-primary),inset_0_0_15px_oklch(0.62_0.22_25_/_0.4)]">
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:animate-pulse group-hover:opacity-100 group-hover:bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)]" />
          <Icon className="relative h-5 w-5 transition-transform duration-500 group-hover:scale-110" fill={fill ? "currentColor" : "none"} strokeWidth={fill ? 0 : 2} />
        </span>
        <div className="mt-4 font-display text-4xl text-foreground">
          {val}
          <span className="text-primary">{suffix}</span>
        </div>
        <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}
