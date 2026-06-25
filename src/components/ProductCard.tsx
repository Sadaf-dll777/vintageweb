import { Link } from "@tanstack/react-router";
import { Clock, Zap } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice, useShop } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const currency = useShop((s) => s.currency);
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] animate-card-float hover:[animation-play-state:paused] hover:border-primary hover:shadow-[0_18px_40px_-18px_var(--color-primary)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/70" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          <Clock className="h-3 w-3 text-gold" />
          <span className="text-[10px] tracking-wider">
            {(product.delivery ?? "Instant").replace(/\s*-\s*/g, " - ").toUpperCase()}
          </span>
        </div>
        {product.badge && (
          <div className="absolute bottom-3 left-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            ⚡ {product.badge}
          </div>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 h-[260%] w-[40%] -translate-x-[260%] -translate-y-1/2 rotate-45 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-[1600ms] ease-out group-hover:translate-x-[160%] group-hover:opacity-100" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-display text-lg leading-tight tracking-wide transition-colors duration-300 group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-auto space-y-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price</div>
            <div className="font-display text-xl text-primary">{formatPrice(product.price, currency)}</div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              useShop.getState().add(product);
            }}
            className="group/btn inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all duration-300 hover:brightness-110"
          >
            <Zap className="h-3 w-3 fill-current transition-transform duration-300 group-hover:scale-110 group-hover/btn:-rotate-12" strokeWidth={0} /> Buy Now
          </button>
        </div>
      </div>
    </Link>
  );
}
