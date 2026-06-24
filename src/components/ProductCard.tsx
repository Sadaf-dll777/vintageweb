import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice, useShop } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const currency = useShop((s) => s.currency);
  return (
    <Link
      to="/cart"
      onClick={(e) => {
        e.preventDefault();
        useShop.getState().add(product);
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/60 hover:glow-red"
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
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-display text-lg leading-tight tracking-wide">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-display text-xl text-primary">{formatPrice(product.price, currency)}</span>
          <span className="flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> In Stock
          </span>
        </div>
      </div>
    </Link>
  );
}
