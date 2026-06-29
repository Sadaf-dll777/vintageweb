import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Clock, Sparkles, Zap } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice, useShop } from "@/lib/store";

export function NewArrivals({ products }: { products: Product[] }) {
  const currency = useShop((s) => s.currency);
  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, align: "center", containScroll: false },
    [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })],
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

  return (
    <section className="container-wide py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold">
            <Sparkles className="h-3 w-3" /> Just Arrived
          </span>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">
            New <span className="text-gold">Arrivals</span>
          </h2>
        </div>
        <Link
          to="/shop"
          className="hidden rounded-full border border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:border-gold hover:text-gold md:inline-flex"
        >
          View All →
        </Link>
      </div>

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {products.map((p, i) => {
              const isActive = i === selected;
              return (
                <div
                  key={p.id}
                  className="min-w-0 shrink-0 grow-0 basis-2/3 px-2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.id }}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-500 ${
                      isActive
                        ? "scale-105 border-primary/70 shadow-[0_20px_60px_-15px_var(--color-primary)]"
                        : "scale-95 border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-gold/40 bg-background/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold backdrop-blur">
                        <Clock className="h-3 w-3" /> {p.delivery ?? "Instant"}
                      </div>
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
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <h3
                        className={`font-display font-medium text-base leading-tight tracking-wide transition-colors ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {p.name}
                      </h3>
                      <div className="mt-auto flex items-end justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price</div>
                          <div className="font-display text-lg font-medium text-primary">{formatPrice(p.price, currency)}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            useShop.getState().add(p);
                          }}
                          className={`inline-flex items-center justify-center gap-1 rounded-full bg-primary px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-primary-foreground transition-all hover:brightness-110 ${
                            isActive ? "glow-red" : ""
                          }`}
                        >
                          <Zap className="h-3 w-3 fill-current" strokeWidth={0} /> Buy Now
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
    </section>
  );
}