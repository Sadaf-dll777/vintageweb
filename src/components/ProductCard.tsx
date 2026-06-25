import { Link } from "@tanstack/react-router";
import { Clock, Zap } from "lucide-react";
import { useRef } from "react";
import type { Product } from "@/data/products";
import { formatPrice, useShop } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const currency = useShop((s) => s.currency);
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;
    const rx = (py - 0.5) * -10; // rotateX
    const ry = (px - 0.5) * 12;  // rotateY
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };

  return (
    <Link
      ref={cardRef}
      to="/product/$slug"
      params={{ slug: product.id }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform:
          "perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
        transformStyle: "preserve-3d",
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[transform,border-color,box-shadow] duration-300 ease-out hover:border-primary hover:shadow-[0_20px_50px_-20px_var(--color-primary)] will-change-transform"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(380px circle at var(--mx,50%) var(--my,50%), oklch(0.62 0.22 25 / 0.10), transparent 50%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          padding: "1px",
          background:
            "radial-gradient(180px circle at var(--mx,50%) var(--my,50%), oklch(0.85 0.18 30 / 0.9), transparent 70%)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
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
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 h-[260%] w-[40%] -translate-x-[260%] -translate-y-1/2 rotate-45 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-[1600ms] ease-out group-hover:translate-x-[160%] group-hover:opacity-100" />
        </div>
      </div>
      <div className="border-t border-border" />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base leading-tight tracking-wide text-foreground transition-colors duration-300 group-hover:text-primary">
          {product.name}
        </h3>
        <div className="my-4 border-t border-border" />
        <div className="mt-auto flex items-end justify-between gap-3">
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
            className="group/btn inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all duration-300 ease-out hover:scale-[1.03] hover:brightness-110 active:scale-[0.98]"
          >
            <Zap className="h-3 w-3 fill-current transition-transform duration-300 group-hover/btn:-rotate-12" strokeWidth={0} /> Buy Now
          </button>
        </div>
      </div>
    </Link>
  );
}
