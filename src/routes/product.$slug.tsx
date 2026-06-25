import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import {
  Star,
  Flame,
  Eye,
  Minus,
  Plus,
  Zap,
  ShoppingCart,
  ShieldCheck,
  Headphones,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { products, type Product, type ProductOption } from "@/data/products";
import { formatPrice, useShop } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = products.find((p) => p.id === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — GoldenBumps` },
          { name: "description", content: loaderData.product.tagline ?? loaderData.product.name },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: loaderData.product.tagline ?? loaderData.product.name },
          { property: "og:image", content: loaderData.product.image },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:image", content: loaderData.product.image },
        ]
      : [],
  }),
  component: ProductPage,
});

function defaultOptions(p: Product): ProductOption[] {
  return (
    p.options ?? [
      { label: "1 Month", price: p.price * 0.7, outOfStock: true },
      { label: "3 Months", price: p.price * 2, outOfStock: false },
      { label: "6 Months", price: p.price * 3, outOfStock: false },
      { label: "12 Months", price: p.price * 5, outOfStock: false },
    ]
  );
}

function ProductPage() {
  const { product } = Route.useLoaderData();
  const currency = useShop((s) => s.currency);
  const add = useShop((s) => s.add);
  const navigate = useNavigate();

  const options = useMemo(() => defaultOptions(product), [product]);
  const firstAvailable = options.findIndex((o) => !o.outOfStock);
  const [selected, setSelected] = useState(firstAvailable >= 0 ? firstAvailable : 0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"description" | "reviews">("description");
  const [readMore, setReadMore] = useState(false);

  const opt = options[selected];
  const totalPrice = opt.price * qty;
  const stock = product.stock ?? 30;
  const sold = product.sold ?? 7;
  const rating = product.rating ?? 5.0;
  const reviews = product.reviews ?? 1;

  const recs = useMemo(
    () => products.filter((p) => p.id !== product.id).slice(0, 10),
    [product.id],
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const offsetRef = useRef(0);
  const halfRef = useRef(0);
  const speedPxPerSec = speed === "slow" ? 30 : speed === "normal" ? 70 : 140;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    const measure = () => {
      halfRef.current = el.scrollWidth / 2;
    };
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused && halfRef.current > 0) {
        offsetRef.current = (offsetRef.current + speedPxPerSec * dt) % halfRef.current;
        el.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
        setProgress((offsetRef.current / halfRef.current) * 100);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [paused, speedPxPerSec]);

  const description =
    product.description ??
    `${product.name} is a premium digital product delivered instantly to your account. ${product.tagline ?? ""} This membership ensures you stay ahead with unique cosmetics and continuous content updates that are not available anywhere else. Enjoy peace of mind with our money-back guarantee and 24/7 dedicated customer support.`;

  const short = description.slice(0, 140);

  return (
    <div className="container-wide py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary">Shop</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* IMAGE */}
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
            <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-gold/40 bg-background/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold backdrop-blur">
              <Flame className="h-3 w-3" /> {product.delivery ?? "Instant"}
            </div>
            {product.badge && (
              <div className="absolute right-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                ⚡ {product.badge}
              </div>
            )}
            <img
              src={product.image}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          {/* Trust badges */}
          <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card/40 p-4 text-center">
            <TrustItem icon={<ShieldCheck className="h-4 w-4" />} label="Secure & Verified" />
            <TrustItem icon={<Headphones className="h-4 w-4" />} label="24/7 Support" />
            <TrustItem icon={<BadgeCheck className="h-4 w-4" />} label="Genuine Product" />
          </div>
        </div>

        {/* DETAILS */}
        <div>
          <h1 className="font-display text-4xl uppercase leading-[0.95] tracking-wide sm:text-5xl">
            {product.name}
          </h1>

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i <= Math.round(rating) ? "fill-gold text-gold" : "text-muted-foreground",
                  )}
                />
              ))}
              <span className="ml-1.5 font-bold">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviews} reviews)</span>
            </div>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-primary" /> {sold} sold
            </span>
          </div>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <Eye className="h-3 w-3" /> 1 viewing now
          </div>

          {/* Price */}
          <div className="mt-6 overflow-hidden rounded-2xl bg-card/50 p-6">
            <div
              key={`${selected}-${qty}`}
              className="font-display text-5xl text-foreground animate-price-pop"
            >
              {formatPrice(totalPrice, currency)}
            </div>
            {qty > 1 && (
              <div
                key={`sub-${selected}-${qty}`}
                className="mt-1 text-xs text-muted-foreground animate-fade-in"
              >
                {formatPrice(opt.price, currency)} per unit × {qty}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="mt-6">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Select Option</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {options.map((o, i) => {
                const active = i === selected;
                return (
                  <button
                    key={o.label}
                    onClick={() => !o.outOfStock && setSelected(i)}
                    disabled={o.outOfStock}
                    className={cn(
                      "relative rounded-2xl border bg-card px-4 py-4 text-center transition-all duration-300 ease-out",
                      active
                        ? "border-primary glow-red scale-[1.02]"
                        : "border-border hover:-translate-y-0.5 hover:border-primary/60",
                      o.outOfStock && "cursor-not-allowed opacity-60",
                    )}
                  >
                    {active && !o.outOfStock && (
                      <span className="absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                    )}
                    <div
                      className={cn(
                        "font-bold",
                        o.outOfStock && "line-through text-muted-foreground",
                      )}
                    >
                      {o.label}
                    </div>
                    <div
                      className={cn(
                        "mt-1 text-xs",
                        o.outOfStock
                          ? "font-bold uppercase tracking-wider text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      {o.outOfStock ? "Out of Stock" : formatPrice(o.price, currency)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* QTY row */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Qty</span>
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-1.5 py-1.5">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                  aria-label="Decrease"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-6 text-center font-bold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(stock, q + 1))}
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                  aria-label="Increase"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success" /> {stock} in stock
            </span>
          </div>

          {/* CTA */}
          <div className="mt-5 flex items-stretch gap-3">
            <button
              onClick={() => {
                for (let i = 0; i < qty; i++) add(product);
                navigate({ to: "/checkout" });
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-display text-lg uppercase tracking-wider text-primary-foreground glow-red transition hover:brightness-110"
            >
              <Zap className="h-5 w-5 fill-current" strokeWidth={0} /> Buy Now
            </button>
            <button
              onClick={() => add(product)}
              aria-label="Add to cart"
              className="grid h-auto w-14 place-items-center rounded-full border border-border bg-card hover:border-primary"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-success" /> Genuine product
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> Money-back guarantee
            </span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mt-16 border-b border-border">
        <div className="flex gap-10">
          <TabBtn active={tab === "description"} onClick={() => setTab("description")}>
            Description
          </TabBtn>
          <TabBtn active={tab === "reviews"} onClick={() => setTab("reviews")}>
            Reviews ({reviews})
          </TabBtn>
        </div>
      </div>
      <div className="py-8">
        {tab === "description" ? (
          <div className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {readMore ? description : `${short}${description.length > short.length ? "…" : ""}`}
            {description.length > short.length && (
              <button
                onClick={() => setReadMore((v) => !v)}
                className="ml-2 font-bold uppercase tracking-wider text-primary hover:underline"
              >
                {readMore ? "Read less ←" : "Read more →"}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Verified buyer</span>
              </div>
              <p className="mt-2 text-sm">Delivered super fast. Working perfectly!</p>
            </div>
          </div>
        )}
      </div>

      {/* RECOMMENDED */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">— Recommended</span>
            <h2 className="mt-2 font-display text-4xl uppercase sm:text-5xl">You May Also Like</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-[10px] font-bold uppercase tracking-wider">
              {(["slow", "normal", "fast"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cn(
                    "rounded-full px-3 py-1.5 transition",
                    speed === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPaused((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:border-primary"
              aria-label={paused ? "Play" : "Pause"}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPaused((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:border-primary"
              aria-label={paused ? "Play" : "Pause"}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className="mt-6 overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            className="flex gap-5 will-change-transform"
            style={{ width: "max-content" }}
          >
            {[...recs, ...recs].map((p, i) => (
              <div key={`${p.id}-${i}`} className="w-[260px] shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-card">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold via-primary to-gold transition-[width] duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative pb-3 font-display text-base uppercase tracking-wider transition",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      {active && (
        <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-primary" />
      )}
    </button>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-xs">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-success/15 text-success">
        {icon}
      </span>
      <span className="font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}