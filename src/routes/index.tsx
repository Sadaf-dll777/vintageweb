import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Zap, ShoppingBag, Gamepad2, Tv, Gift, User, Joystick, Globe } from "lucide-react";
import { products } from "@/data/products";
import { formatPrice, useShop } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";

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
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
              <Zap className="h-3 w-3 fill-current" strokeWidth={0} /> {hero.badge ?? "Featured"}
            </span>
            <h1 className="mt-5 font-display text-5xl uppercase leading-[0.95] tracking-wide sm:text-6xl lg:text-7xl xl:text-8xl">
              {hero.name}
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">{hero.tagline}</p>
            <div className="mt-7 flex flex-wrap gap-3">
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
            <div className="mt-7 flex items-center gap-4">
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
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border bg-card glow-red">
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

      {/* TRUST STRIP */}
      <section className="border-b border-border/60 bg-card/30">
        <div className="container-wide grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {[
            { t: "Instant Delivery", d: "Most orders within minutes" },
            { t: "Secure Payment", d: "bKash, Nagad, Rocket, Binance" },
            { t: "24/7 Support", d: "We're here whenever you need" },
            { t: "Trusted by Thousands", d: "Bangladesh's go-to digital shop" },
          ].map((f) => (
            <div key={t} className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                <Zap className="h-4 w-4 fill-current" strokeWidth={0} />
              </span>
              <div className="min-w-0">
                <div className="font-display text-base tracking-wide">{f.t}</div>
                <div className="text-xs text-muted-foreground">{f.d}</div>
              </div>
            </div>
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
    </div>
  );
}

// suppress TS unused
const t = "t";
