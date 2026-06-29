import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Clock, Flame, Sparkles, TrendingUp, Zap } from "lucide-react";
import { products as allProducts, type Product } from "@/data/products";
import { formatPrice, useShop } from "@/lib/store";

type TabKey = "top" | "recommended" | "new";

const TABS: { key: TabKey; label: string; Icon: typeof Flame }[] = [
  { key: "top", label: "Top Selling", Icon: Flame },
  { key: "recommended", label: "Recommended", Icon: Sparkles },
  { key: "new", label: "New Arrivals", Icon: TrendingUp },
];

function pickProducts(tab: TabKey): Product[] {
  if (tab === "recommended") {
    const list = allProducts.filter((p) => p.featured);
    return (list.length >= 5 ? list : allProducts).slice(0, 10);
  }
  if (tab === "new") {
    const list = allProducts.filter((p) => (p.badge || "").toLowerCase().includes("new"));
    return (list.length >= 5 ? list : allProducts.slice().reverse()).slice(0, 10);
  }
  return allProducts.slice(0, 10);
}

export function TrendingNow() {
  const [tab, setTab] = useState<TabKey>("top");
  const list = useMemo(() => pickProducts(tab), [tab]);
  const currency = useShop((s) => s.currency);
  const navigate = useNavigate();

  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, align: "center", containScroll: false },
    [Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })],
  );
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    setSnaps(embla.scrollSnapList());
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
    onSelect();
  }, [embla, onSelect]);

  useEffect(() => {
    if (!embla) return;
    embla.reInit();
    embla.scrollTo(0);
  }, [tab, embla]);

  return (
    <section className="container-wide py-16">
      {/* Heading row */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/70" />
              <span className="relative h-2 w-2 rounded-full bg-primary" />
            </span>
            Live Market
          </span>
          <h2 className="mt-3 font-display text-4xl tracking-wide">
            Trending <span className="text-primary">Now</span>
          </h2>
        </div>

        {/* Tab pills */}
        <div className="inline-flex items-center gap-1 self-start rounded-full border border-border bg-card/60 p-1 backdrop-blur sm:self-auto">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_var(--color-primary)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.Icon className={`h-3.5 w-3.5 ${active ? "fill-current" : ""}`} strokeWidth={active ? 0 : 2} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div className="overflow-hidden px-2" ref={emblaRef}>
          <div className="flex">
            {list.map((p, i) => {
              const isActive = i === selected;
              const badge = (p.badge || "").toUpperCase();
              const isFlash = badge.includes("FLASH");
              const isHot = badge.includes("HOT");
              return (
                <div
                  key={p.id}
                  className="min-w-0 shrink-0 grow-0 basis-2/3 px-2 sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
                >
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.id }}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-500 ${
                      isActive
                        ? "scale-[1.06] border-primary/70 shadow-[0_25px_70px_-15px_var(--color-primary)]"
                        : "scale-95 border-border opacity-60 hover:opacity-90"
                    }`}
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-secondary">
                      {/* Delivery pill */}
                      <div
                        className={`absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur ${
                          isActive ? "border-gold/60 text-gold" : "border-gold/30 text-gold/80"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {(p.delivery ?? "30min - 360mins").toUpperCase()}
                      </div>
                      {/* Flash / Hot badge */}
                      {(isFlash || isHot) && (
                        <div
                          className={`absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground ${
                            isFlash ? "bg-primary" : "bg-gold text-background"
                          }`}
                        >
                          {isFlash ? <Zap className="h-3 w-3 fill-current" strokeWidth={0} /> : <Flame className="h-3 w-3 fill-current" strokeWidth={0} />}
                          {badge}
                        </div>
                      )}
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 h-[260%] w-[40%] -translate-x-[260%] -translate-y-1/2 rotate-45 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-[1600ms] ease-out group-hover:translate-x-[160%] group-hover:opacity-100" />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <h3
                        className={`font-display text-base font-medium leading-tight tracking-wide transition-colors ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {p.name}
                      </h3>
                      {p.sold ? (
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gold/90">
                          <Flame className="h-3 w-3 fill-current" strokeWidth={0} /> {p.sold} sold recently
                        </div>
                      ) : null}
                      <div className="mt-auto flex items-end justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price</div>
                          <div className="font-display text-xl font-medium text-primary">{formatPrice(p.price, currency)}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            useShop.getState().add(p);
                            navigate({ to: "/checkout" });
                          }}
                          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-bold uppercase leading-tight tracking-wider text-primary-foreground transition-all duration-300 hover:brightness-110 active:scale-[0.97] ${
                            isActive ? "glow-red" : ""
                          }`}
                        >
                          <Zap className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                          <span className="flex flex-col items-center gap-0.5 leading-none">
                            <span>Buy</span>
                            <span>Now</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={() => embla?.scrollPrev()}
          aria-label="Previous"
          className="absolute left-0 top-1/2 z-10 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-card/90 backdrop-blur transition hover:border-primary hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => embla?.scrollNext()}
          aria-label="Next"
          className="absolute right-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full border border-border bg-card/90 backdrop-blur transition hover:border-primary hover:text-primary"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Dots */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {snaps.map((_, i) => (
          <button
            key={i}
            onClick={() => embla?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === selected ? "w-10 bg-primary" : "w-2 bg-border hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>

      {/* View all */}
      <div className="mt-10 flex justify-center">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-3 font-display text-sm font-medium uppercase tracking-widest text-foreground transition hover:border-primary hover:text-primary"
        >
          View All Products →
        </Link>
      </div>
    </section>
  );
}
