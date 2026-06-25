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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:border-primary hover:shadow-[0_20px_50px_-15px_var(--color-primary)] hover:[transform:translateY(-8px)_scale(1.02)]"
    >
      {/* Animated conic glow border on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          padding: "1px",
          background:
            "conic-gradient(from 0deg, transparent 0deg, var(--color-primary) 90deg, transparent 180deg, var(--color-primary) 270deg, transparent 360deg)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          animation: "stat-spin 4s linear infinite",
        }}
      />
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
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.15] group-hover:rotate-[0.5deg]"
          loading="lazy"
        />
        {/* Vignette glow on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 h-[260%] w-[40%] -translate-x-[260%] -translate-y-1/2 rotate-45 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-[1600ms] ease-out group-hover:translate-x-[160%] group-hover:opacity-100" />
        </div>
      </div>
      <div className="relative z-[1] flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-display text-lg leading-tight tracking-wide transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5">
          {product.name}
        </h3>
        <div className="mt-auto space-y-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price</div>
            <div className="font-display text-xl text-primary transition-transform duration-300 group-hover:scale-105 origin-left">{formatPrice(product.price, currency)}</div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              useShop.getState().add(product);
            }}
            className="group/btn relative inline-flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all duration-300 hover:brightness-110 group-hover:shadow-[0_8px_24px_-8px_var(--color-primary)]"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
            <Zap className="h-3 w-3 fill-current transition-transform duration-300 group-hover:scale-125 group-hover/btn:-rotate-12" strokeWidth={0} /> Buy Now
          </button>
        </div>
      </div>
    </Link>
  );
}
