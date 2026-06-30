import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Gauge,
} from "lucide-react";
import { products, type Product, type ProductOption } from "@/data/products";
import { formatPrice, useShop } from "@/lib/store";
import { api } from "@/lib/api";
import { brand } from "@/config/site";
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

  // Pull DB product to read its custom options (durations/variants)
  const dbProduct = useQuery({
    queryKey: ["product", product.id],
    queryFn: () => api.getProduct(product.id),
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  const usdToBdt = brand.usdToBdt || 120;
  const options = useMemo<ProductOption[]>(() => {
    const dbOpts = dbProduct.data?.options ?? [];
    if (dbOpts.length > 0) {
      return dbOpts.map((o) => ({
        label: o.label,
        price: (Number(o.price_bdt) || 0) / usdToBdt,
        outOfStock: !!o.out_of_stock,
      }));
    }
    return defaultOptions(product);
  }, [dbProduct.data, product, usdToBdt]);
  const firstAvailable = options.findIndex((o) => !o.outOfStock);
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    setSelected(firstAvailable >= 0 ? firstAvailable : 0);
  }, [firstAvailable, options.length]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"description" | "reviews">("description");
  const [readMore, setReadMore] = useState(false);

  const opt = options[selected];
  const totalPrice = opt.price * qty;
  const dbStock = Number(dbProduct.data?.stock ?? 0);
  const showStockCount = !!dbProduct.data?.show_stock_count;
  const stock = dbStock > 0 ? dbStock : (product.stock ?? 30);
  const inStock = options.some((o) => !o.outOfStock);
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
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-muted-foreground/60">
        <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3 opacity-60" />
        <Link to="/shop" className="transition-colors hover:text-foreground">Shop</Link>
        <ChevronRight className="h-3 w-3 opacity-60" />
        <span className="font-semibold text-foreground/80">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* IMAGE */}
        <div className="self-start lg:sticky lg:top-24">
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
          <h1 className="font-display text-4xl capitalize leading-[0.95] tracking-wide sm:text-5xl" style={{ fontWeight: 720 }}>
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

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/30 px-3 py-1.5 text-xs animate-border-pulse">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
            <span className="font-semibold text-primary">1</span>
            <Eye className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span className="text-muted-foreground/80">viewing now</span>
          </div>

          {/* Price */}
          <div className="mt-6 overflow-hidden rounded-2xl bg-card/50 p-6">
            <div
              key={`${selected}-${qty}`}
              className="font-display text-5xl text-foreground animate-price-pop"
              style={{ fontWeight: 650 }}
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
                      "group/opt relative overflow-hidden rounded-2xl border bg-card px-4 py-4 text-center transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                      active
                        ? "border-primary scale-[1.04] shadow-[0_15px_45px_-15px_var(--color-primary),inset_0_0_30px_-10px_var(--color-primary)]"
                        : "border-border hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_10px_30px_-15px_var(--color-primary)]",
                      o.outOfStock && "cursor-not-allowed opacity-60 hover:translate-y-0 hover:border-border",
                    )}
                  >
                    {/* gradient bg slide */}
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent transition-opacity duration-500",
                        active ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {/* shimmer sweep on select */}
                    {active && !o.outOfStock && (
                      <span
                        key={`shimmer-${i}-${selected}`}
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-opt-shimmer"
                      />
                    )}
                    {/* indicator dot + ripple */}
                    {active && !o.outOfStock && (
                      <>
                        <span
                          key={`dot-${i}-${selected}`}
                          className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_var(--color-primary)] animate-opt-pop"
                        />
                        <span
                          key={`ring-${i}-${selected}`}
                          aria-hidden
                          className="absolute right-3 top-3 h-2 w-2 rounded-full border border-primary animate-opt-ring"
                        />
                      </>
                    )}
                    <div
                      className={cn(
                        "relative font-bold transition-all duration-500",
                        active && !o.outOfStock && "text-foreground",
                        o.outOfStock && "line-through text-muted-foreground",
                      )}
                    >
                      {o.label}
                    </div>
                    <div
                      className={cn(
                        "relative mt-1 text-xs transition-colors duration-500",
                        o.outOfStock
                          ? "font-bold uppercase tracking-wider text-primary"
                          : active
                            ? "font-bold text-primary"
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
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Qty</span>
              <div className="flex items-center overflow-hidden rounded-xl border border-border bg-card">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-11 w-11 place-items-center text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  aria-label="Decrease"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="grid h-11 min-w-12 place-items-center border-x border-border px-3 text-base font-bold">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(stock, q + 1))}
                  className="grid h-11 w-11 place-items-center text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  aria-label="Increase"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            {inStock && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_var(--color-success)]" />
                {showStockCount ? `${stock} in stock` : "In Stock"}
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="mt-5 flex items-stretch gap-3">
            <button
              onClick={() => {
                for (let i = 0; i < qty; i++) add(product);
                navigate({ to: "/checkout" });
              }}
              className="group/buy relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-6 py-4 font-display text-lg uppercase tracking-wider text-primary-foreground glow-red transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-[1400ms] ease-out group-hover/buy:translate-x-full"
              />
              <Zap className="relative h-5 w-5 fill-current transition-transform duration-700 ease-out group-hover/buy:-translate-x-0.5 group-hover/buy:scale-105" strokeWidth={0} />
              <span className="relative">Buy Now</span>
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
      <div className="mt-16 overflow-hidden rounded-3xl border border-border bg-card/30">
        <div className="grid grid-cols-2 border-b border-border">
          <TabBtn active={tab === "description"} onClick={() => setTab("description")}>
            Description
          </TabBtn>
          <TabBtn active={tab === "reviews"} onClick={() => setTab("reviews")}>
            Reviews ({reviews})
          </TabBtn>
        </div>
        <div className="p-8">
          {tab === "description" ? (
            <div className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground animate-fade-in">
              {readMore ? description : `${short}${description.length > short.length ? "…" : ""}`}
              {description.length > short.length && (
                <div className="mt-5">
                  <button
                    onClick={() => setReadMore((v) => !v)}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {readMore ? "Read less ←" : "Read more →"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
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
      </div>

      {/* RECOMMENDED */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">— Recommended</span>
            <h2 className="mt-2 font-display text-4xl uppercase sm:text-5xl">You May Also Like</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 pl-3 text-[10px] font-bold uppercase tracking-wider">
              <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
              {(["slow", "normal", "fast"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cn(
                    "rounded-full px-3 py-1.5 uppercase transition",
                    speed === s
                      ? "bg-primary text-primary-foreground glow-red"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                const half = halfRef.current;
                if (!half) return;
                offsetRef.current = (offsetRef.current - 280 + half) % half;
                if (trackRef.current) {
                  trackRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
                }
                setProgress((offsetRef.current / half) * 100);
              }}
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:border-primary"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const half = halfRef.current;
                if (!half) return;
                offsetRef.current = (offsetRef.current + 280) % half;
                if (trackRef.current) {
                  trackRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
                }
                setProgress((offsetRef.current / half) * 100);
              }}
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:border-primary"
              aria-label="Next"
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
        "relative w-full py-5 text-center text-base font-semibold transition",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      {active && (
        <span className="absolute -bottom-px left-1/2 h-0.5 w-2/3 -translate-x-1/2 rounded-full bg-primary" />
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