import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Zap, ShoppingBag, Gamepad2, Tv, Gift, User, Joystick, Globe, Laptop, ShieldCheck, Tag, Package, Users, Award } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api, type ApiProduct } from "@/lib/api";
import { products, type Product } from "@/data/products";
import { formatPrice, useShop } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { NewArrivals } from "@/components/NewArrivals";
import { CategorySection } from "@/components/CategorySection";
import { Reviews } from "@/components/Reviews";
import { WhyUs } from "@/components/WhyUs";
import { Partners } from "@/components/Partners";
import { FlashDeals } from "@/components/FlashDeals";
import { TrendingNow } from "@/components/TrendingNow";

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
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: api.listProducts });
  const all = productsQuery.data ?? [];
  const featuredFromDb = all.filter((p) =>
    (p.badge || "").toLowerCase().includes("featured"),
  );
  const hotFromDb = all.filter((p) =>
    (p.badge || "").toLowerCase().includes("hot"),
  );
  const heroFromDb = [...featuredFromDb, ...hotFromDb];
  const featured: ApiProduct[] =
    heroFromDb.length > 0 ? heroFromDb : all.slice(0, 3);
  const [idx, setIdx] = useState(0);
  const currency = useShop((s) => s.currency);
  const add = useShop((s) => s.add);

  useEffect(() => {
    if (featured.length === 0) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % featured.length), 6000);
    return () => clearInterval(t);
  }, [featured.length]);

  const hero = featured[idx % Math.max(1, featured.length)];

  if (!hero) {
    return (
      <div className="container-wide py-32 text-center text-muted-foreground">
        Loading featured products…
      </div>
    );
  }

  const heroAsProduct: Product = {
    id: hero.id,
    name: hero.name,
    category: (hero.category_slug as Product["category"]) ?? "top-up",
    price: hero.price_usd ?? 0,
    image: hero.image_url,
    badge: hero.badge || undefined,
    tagline: hero.tagline || undefined,
    delivery: hero.delivery || undefined,
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${idx}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${hero.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(40px)",
            }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="container-wide relative grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-[1.4fr_1fr] lg:py-24">
          {/* Left */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${idx}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08 }}
              >
                <motion.span
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary"
                >
                  <Zap className="h-3 w-3 fill-current" strokeWidth={0} /> {hero.badge ?? "Featured"}
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                  className="mt-5 font-display font-[750] text-3xl uppercase leading-[0.95] tracking-wide sm:text-4xl lg:text-5xl xl:text-6xl"
                >
                  {hero.name}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                  className="mt-5 max-w-xl text-base text-muted-foreground"
                >
                  {hero.tagline}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
                  className="mt-7 flex flex-wrap gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={() => add(heroAsProduct)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-display text-base font-medium uppercase tracking-wider text-primary-foreground glow-red transition hover:brightness-110"
                  >
                    Buy Now <Zap className="h-4 w-4 fill-current" strokeWidth={0} />
                  </motion.button>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-7 py-3.5 font-display text-base font-medium uppercase tracking-wider transition hover:border-primary"
                  >
                    <ShoppingBag className="h-4 w-4" /> Game Top-Up
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
                  className="mt-7 flex items-center gap-4"
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Starting at</span>
                  <span className="font-display text-2xl font-bold text-gold">{formatPrice(hero.price_usd ?? 0, currency)}</span>
                </motion.div>
              </motion.div>
            </AnimatePresence>

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
          <div className="relative mx-auto w-full max-w-sm lg:max-w-[22rem]" style={{ perspective: 1000 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`card-${idx}`}
                initial={{ opacity: 0, x: 60, rotateY: -8 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -40, rotateY: 8 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Ambient pulsing glow ring */}
                <motion.div
                  className="pointer-events-none absolute -inset-1.5 rounded-[1.4rem] bg-primary/20 blur-2xl"
                  animate={{ opacity: [0.25, 0.55, 0.25], scale: [0.96, 1.04, 0.96] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  whileHover={{ scale: 1.03, rotateY: 5, rotateX: -2 }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  className="relative"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative overflow-hidden rounded-3xl border border-border bg-card glow-red"
                  >
                  <div className="aspect-[4/3] overflow-hidden">
                    <motion.img
                      src={hero.image_url}
                      alt={hero.name}
                      className="h-full w-full object-cover"
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="space-y-2.5 p-4">
                    <h3 className="font-display text-lg font-bold">{hero.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xl font-bold text-gold">{formatPrice(hero.price_usd ?? 0, currency)}</span>
                      <span className="flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" /> In Stock
                      </span>
                    </div>
                  </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* TRUST STRIP — features row */}
      <section className="relative bg-card/20">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,oklch(0.62_0.22_25_/_0.35),transparent)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(to_right,transparent,oklch(0.62_0.22_25_/_0.35),transparent)]" />
        <div className="container-wide flex flex-wrap items-center justify-center gap-x-12 gap-y-4 py-5">
          {[
            { Icon: Zap, t: "Instant Delivery", d: "Get codes in seconds" },
            { Icon: ShieldCheck, t: "Secure Payments", d: "bKash, Nagad & more" },
            { Icon: Tag, t: "Best Prices in Worldwide", d: "Guaranteed Full Support" },
          ].map((f) => (
            <div key={f.t} className="group flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary transition-transform duration-300 ease-out group-hover:scale-125 group-hover:shadow-[0_0_20px_-2px_var(--color-primary)]">
                <f.Icon className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:rotate-6" fill={f.Icon === Zap ? "currentColor" : "none"} strokeWidth={f.Icon === Zap ? 0 : 2} />
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
      <FlashDeals />
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
            { id: "software", label: "Software", Icon: Laptop, color: "from-cyan-500/30 to-cyan-600/10", icon: "text-cyan-400" },
          ].map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ cat: c.id as "top-up" | "subscriptions" | "gift-cards" | "accounts" | "games" | "software" }}
              className="group relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/70 hover:shadow-[0_10px_40px_-10px_var(--color-primary)]"
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:from-primary/15 group-hover:to-primary/0 group-hover:opacity-100" />
              <span className={`relative grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br ${c.color} transition-transform duration-300 group-hover:scale-110`}>
                <c.Icon className={`h-7 w-7 ${c.icon} transition-colors duration-300 group-hover:text-primary`} strokeWidth={2} />
              </span>
              <span className="relative font-display font-medium text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {(() => {
        const news = all.filter((p) =>
          (p.badge || "").toLowerCase().includes("new"),
        );
        const source = news.length > 0 ? news : all.slice(0, 10);
        const mapped: Product[] = source.slice(0, 10).map((p) => ({
          id: p.slug,
          name: p.name,
          category: (p.category_slug as Product["category"]) ?? "top-up",
          price: Number(p.price_usd ?? 0),
          image: p.image_url,
          badge: p.badge || undefined,
          delivery: p.delivery || undefined,
        }));
        return mapped.length > 0 ? <NewArrivals products={mapped} /> : null;
      })()}

      {/* POPULAR */}
      <TrendingNow />

      {/* CATEGORY SECTIONS */}
      <CategorySection category="top-up" title="Top-Up" Icon={Gamepad2} accent="text-purple-400" />
      <CategorySection category="subscriptions" title="Subscriptions" Icon={Tv} accent="text-blue-400" />
      <CategorySection category="gift-cards" title="Gift Cards" Icon={Gift} accent="text-orange-400" />
      <CategorySection category="software" title="Software" Icon={Globe} accent="text-cyan-400" />

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
      className="stat-card group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 text-center transition-all duration-500 ease-out hover:-translate-y-2 hover:border-primary/70 hover:shadow-[0_25px_70px_-20px_var(--color-primary)]"
    >
      {/* Animated conic gradient border on hover */}
      <span aria-hidden className="stat-conic pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {/* Radial glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-primary)/0.18,transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      {/* Shimmer sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/15 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
      />
      {/* Top accent line */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary to-transparent transition-transform duration-500 group-hover:scale-x-100"
      />
      <div className="relative">
        <span className="relative mx-auto grid h-12 w-12 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-all duration-500 group-hover:scale-110 group-hover:border-primary group-hover:bg-primary/20 group-hover:shadow-[0_0_30px_-4px_var(--color-primary)]">
          <span aria-hidden className="absolute inset-0 rounded-xl bg-primary/30 opacity-0 transition-opacity duration-500 group-hover:animate-ping group-hover:opacity-40" />
          <Icon className="relative h-5 w-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" fill={fill ? "currentColor" : "none"} strokeWidth={fill ? 0 : 2} />
        </span>
        <div className="mt-4 font-display text-4xl text-foreground transition-transform duration-500 group-hover:scale-105">
          {val}
          <span className="text-primary">{suffix}</span>
        </div>
        <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}
