import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { products as ALL, type Category } from "@/data/products";

export function CategorySection({
  category,
  title,
  Icon,
  accent = "text-primary",
}: {
  category: Category;
  title: string;
  Icon: LucideIcon;
  accent?: string;
}) {
  const items = ALL.filter((p) => p.category === category).slice(0, 4);
  if (items.length === 0) return null;
  return (
    <section className="container-wide py-10">
      <div className="mb-6 flex items-end justify-between">
        <h3 className="flex items-center gap-3 font-display text-3xl uppercase">
          <Icon className={`h-7 w-7 ${accent}`} /> {title}
        </h3>
        <Link
          to="/shop"
          hash={category}
          className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}