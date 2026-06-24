import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { products, categories, type Category } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — VintageStore" },
      { name: "description", content: "Browse top-ups, subscriptions, gift cards & more. Instant delivery." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const [cat, setCat] = useState<Category | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const inCat = cat === "all" || p.category === cat;
      const inQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
      return inCat && inQ;
    });
  }, [cat, q]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    products.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, []);

  return (
    <div className="container-wide py-12">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
        ⚡ Digital Marketplace
      </span>
      <h1 className="mt-3 font-display text-5xl uppercase leading-none sm:text-6xl">
        Browse <span className="text-primary">Products</span>
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Best prices for gaming top-ups, gift cards, subscriptions & accounts with instant delivery.
      </p>

      {/* Search row */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            placeholder="Search products..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
        <button className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold">
          Most popular <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Category chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        {categories.map((c) => {
          const active = cat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition",
                active
                  ? "border-primary bg-primary/10 text-primary glow-red"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <span>{c.emoji}</span>
              {c.label}
              <span className={cn(
                "ml-1 rounded-full px-2 py-0.5 text-[10px]",
                active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
              )}>{counts[c.id] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        <span className="font-bold text-foreground">{filtered.length}</span> products found
      </p>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
