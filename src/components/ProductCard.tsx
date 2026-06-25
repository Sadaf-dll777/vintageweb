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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-primary hover:shadow-[0_10px_30px_-18px_var(--color-primary)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-gold/40 bg-background/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold backdrop-blur">
          <Clock className="h-3 w-3" /> {product.delivery ?? "Instant"}
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
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
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
